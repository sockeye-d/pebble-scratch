// clang-format off
#include <pebble.h>
// clang-format on
#include "message_keys.auto.h"
#include "pebble_foreign_funcs.h"
#include "vm.h"

static Window *s_window;
static TextLayer *s_text_layer;

typedef enum {
  EVENT_MAIN,
  EVENT_BTN_BACK,
  EVENT_BTN_TOP,
  EVENT_BTN_MIDDLE,
  EVENT_BTN_BOTTOM,
  EVENT_TAPPED,
  EVENT_TIME_SECOND,
  EVENT_TIME_MINUTE,
  EVENT_TIME_HOUR,
  EVENT_TIME_DAY,
  EVENT_TIME_MONTH,
  EVENT_TIME_YEAR,
  EVENT_LAYER_REDRAW,
  EVENT_MAX,
} EventType;

Layer *layers;

typedef struct {
  EventType type;
  int32_t pc;
} Handler;

typedef struct {
  AppTimer *resume_timer;
  VmState state;
} BlockStack;

typedef struct {
  int32_t count;
  int32_t capacity;
  BlockStack *items;
} BlockStacks;

BlockStacks block_stacks[EVENT_MAX] = {};
VmInstruction *instructions = NULL;
int32_t instruction_capacity = 0;
int32_t instruction_length = 0;

VmValue vars[256] = {};

void print(const char *fmt, ...) {}

static void tick_vm(void *data) {
  VmState *state = (VmState *)data;
  while (true) {
    printf("pc: %d", state->pc);
    VmInstruction current_instruction = state->instructions[state->pc];
    printf("%s", vm_print_instruction(current_instruction));
    const VmStepResult result = vm_step(state);
    if (result == STEP_RESULT_DONE || result == STEP_RESULT_PAUSE) {
      break;
    } else if (result == STEP_RESULT_SUSPEND) {
      app_timer_register(100, tick_vm, state);
    }
  }
}

VmStepResult controls_wait(VmState *state) {
  VmValue _1 = POP();
  VmNum duration = COERCE_NUM(_1);
  app_timer_register(duration * 1000 / VM_NUM_RATIO, tick_vm, state);
  cleanup_val(state, _1);
  return STEP_RESULT_PAUSE;
}

VmStepResult sensors_print(VmState *state) {
  VmValue _1 = POP();
  VmString *string = COERCE_STR(_1);
  app_log(APP_LOG_LEVEL_INFO, "pebble-scratch-logging", 0, "%s", string->value);
  cleanup_val_str(state, string);
  return STEP_RESULT_CONTINUE;
}

void execute_event(EventType event) {
  printf("Executing event %d", event);
  for (int32_t i = 0; i < block_stacks[event].count; i++) {
    printf("Executing stack %d", i);
    BlockStack *stack = &block_stacks[event].items[i];
    if (stack->resume_timer) {
      app_timer_cancel(stack->resume_timer);
    }
    tick_vm(&stack->state);
  }
}

static void prv_select_click_handler(ClickRecognizerRef recognizer,
                                     void *context) {
  text_layer_set_text(s_text_layer, "Select");
}

static void prv_up_click_handler(ClickRecognizerRef recognizer, void *context) {
  text_layer_set_text(s_text_layer, "Up");
}

static void prv_down_click_handler(ClickRecognizerRef recognizer,
                                   void *context) {
  text_layer_set_text(s_text_layer, "Down");
}

static void prv_click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, prv_select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, prv_up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, prv_down_click_handler);
}

static void prv_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_text_layer = text_layer_create(GRect(0, 72, bounds.size.w, 20));
  text_layer_set_text(s_text_layer, "Press a button");
  text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_text_layer));
}

static void prv_window_unload(Window *window) {
  text_layer_destroy(s_text_layer);
}

static void inbox_received_handler(DictionaryIterator *iter, void *ctx) {
  {
    Tuple *bytecode_header_tuple = dict_find(iter, MESSAGE_KEY_BytecodeHeader);
    if (bytecode_header_tuple) {
      instruction_length = 0;
      instruction_capacity =
          bytecode_header_tuple->value->int32 / sizeof(VmInstruction);
      printf("Header received. Byte length = %d", instruction_capacity);
      if (instructions != NULL) {
        for (int32_t event_i = 0; event_i < EVENT_MAX; event_i++) {
          for (int32_t stack_i = 0; stack_i < block_stacks[event_i].count;
               stack_i++) {
            AppTimer *timer = block_stacks[event_i].items[stack_i].resume_timer;
            if (timer) {
              app_timer_cancel(timer);
            }
          }

          DA_FREE(block_stacks[event_i]);
        }
        instructions =
            realloc(instructions, instruction_capacity * sizeof(VmInstruction));
      } else {
        instructions = malloc(instruction_capacity * sizeof(VmInstruction));
      }
      printf("Allocated %d bytes. Heap free: %d",
             instruction_capacity * sizeof(VmInstruction), heap_bytes_free());
    }
  }
  {
    Tuple *bytecode_tuple = dict_find(iter, MESSAGE_KEY_Bytecode);
    if (bytecode_tuple) {
      uint8_t *bytecode = bytecode_tuple->value->data;
      printf("Bytecode chunk received, length: [%d]",
             bytecode_tuple->length / 4);
      if ((bytecode_tuple->length / 4) * 4 != bytecode_tuple->length) {
        printf("Bytecode length is not a multiple of 4");
      }
      for (uint16_t i = 0; i < bytecode_tuple->length; i += 4) {
        uint32_t data = bytecode[i] | (bytecode[i + 1] << 8) |
                        (bytecode[i + 2] << 16) | (bytecode[i + 3] << 24);
        union {
          uint32_t data;
          VmInstruction instruction;
        } reinterpret = {.data = data};
        if (instruction_length >= instruction_capacity) {
          APP_LOG(APP_LOG_LEVEL_ERROR,
                  "More instructions were given than expected (%d)!",
                  instruction_capacity);
          return;
        }
        instructions[instruction_length++] = reinterpret.instruction;
      }
      if (instruction_length == instruction_capacity) {
        printf("Loaded all instructions!");
      }
    }
  }
  {
    Tuple *handler_tuple = dict_find(iter, MESSAGE_KEY_Handlers);
    if (handler_tuple) {
      uint8_t *data = handler_tuple->value->data;
      for (uint16_t i = 0; i < handler_tuple->length; i += 5) {
        EventType event_type = data[i];
        int32_t event_pc = data[i + 1] | (data[i + 2] << 8) |
                           (data[i + 3] << 16) | (data[i + 4] << 24);
        printf("Loading handler %d (type = %d, pc = %d)", i / 5, event_type,
               event_pc);
        DA_APPEND(block_stacks[event_type], (BlockStack){});
        printf("Initializing VM…");
        VmState *stack = &block_stacks[event_type]
                              .items[block_stacks[event_type].count - 1]
                              .state;
        vm_init(stack, &instructions[event_pc]);
        stack->call_handler = pebble_foreign_func_call_handler;
        stack->vars = vars;
      }
    }
  }
  {
    Tuple *finished = dict_find(iter, MESSAGE_KEY_TransmissionComplete);
    if (finished) {
      printf("Finished!");
      execute_event(EVENT_MAIN);
    }
  }
}

static void inbox_dropped_handler(AppMessageResult result, void *ctx) {
  printf("Inbox dropped :( %d", result);
}

static void prv_init(void) {
  app_message_open(256, 8);
  app_message_register_inbox_received(inbox_received_handler);
  app_message_register_inbox_dropped(inbox_dropped_handler);
  s_window = window_create();
  window_set_click_config_provider(s_window, prv_click_config_provider);
  window_set_window_handlers(s_window, (WindowHandlers){
                                           .load = prv_window_load,
                                           .unload = prv_window_unload,
                                       });
  const bool animated = true;
  window_stack_push(s_window, animated);
}

static void prv_deinit(void) { window_destroy(s_window); }

int main(void) {
  prv_init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p",
          s_window);

  app_event_loop();
  prv_deinit();
}
