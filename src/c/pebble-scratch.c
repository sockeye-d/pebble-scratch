// clang-format off
#include <pebble.h>
// clang-format on
#include "message_keys.auto.h"
#include "pebble_foreign_funcs.h"
#include "vm.h"
#include "vm_minimal.h"

static Window *s_window;
static Layer *main_layer;

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
  EventType event;
  int32_t block_stack;
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

void print_error(const char *str) { APP_LOG(APP_LOG_LEVEL_ERROR, "%s", str); }

BlockStack *active_stack = NULL;
bool instant = false;

static void tick_vm(void *data) {
  BlockStack *stack = (BlockStack *)data;
  printf("Resuming %d:%d", stack->event, stack->block_stack);
  stack->resume_timer = NULL;
  active_stack = stack;
  VmState *state = &stack->state;
  while (true) {
    printf("pc: %d", state->pc);
    VmInstruction current_instruction = state->instructions[state->pc];
    printf("%s", vm_print_instruction(current_instruction));
    const VmStepResult result = vm_step(state);
    active_stack = NULL;
    if (result == STEP_RESULT_DONE) {
      if (stack->resume_timer) {
        app_timer_cancel(stack->resume_timer);
      }
      break;
    } else if (result == STEP_RESULT_PAUSE) {
      break;
    } else if (result == STEP_RESULT_SUSPEND && !instant) {
      printf("Suspending %d:%d", stack->event, stack->block_stack);
      stack->resume_timer = app_timer_register(100, tick_vm, stack);
      break;
    }
  }
}

VmStepResult controls_wait(VmState *state) {
  VmValue _1 = POP();
  VmNum duration = COERCE_NUM(_1);
  printf("Waiting %d:%d", active_stack->event, active_stack->block_stack);
  active_stack->resume_timer =
      app_timer_register(duration * 1000 / VM_NUM_RATIO, tick_vm, active_stack);
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

VmStepResult graphics_bind_redraw(VmState *state) {
  layer_mark_dirty(main_layer);
  return STEP_RESULT_CONTINUE;
}

void execute_event(EventType event) {
  for (int32_t i = 0; i < block_stacks[event].count; i++) {
    printf("Executing event %d stack %d", event, i);
    BlockStack *stack = &block_stacks[event].items[i];
    if (stack->resume_timer) {
      app_timer_cancel(stack->resume_timer);
    }
    vm_reset(&stack->state);
    tick_vm(stack);
  }
}

static void prv_select_click_handler(ClickRecognizerRef recognizer,
                                     void *context) {
  execute_event(EVENT_BTN_MIDDLE);
}

static void prv_up_click_handler(ClickRecognizerRef recognizer, void *context) {
  execute_event(EVENT_BTN_TOP);
}

static void prv_down_click_handler(ClickRecognizerRef recognizer,
                                   void *context) {
  execute_event(EVENT_BTN_BOTTOM);
}

static void main_layer_draw_handler(Layer *layer, GContext *ctx) {
  instant = true;
  set_local_gcontext(ctx);
  execute_event(EVENT_LAYER_REDRAW);
  clear_local_gcontext();
  instant = false;
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  if (units_changed & SECOND_UNIT) {
    execute_event(EVENT_TIME_SECOND);
  }
  if (units_changed & MINUTE_UNIT) {
    execute_event(EVENT_TIME_MINUTE);
  }
  if (units_changed & HOUR_UNIT) {
    execute_event(EVENT_TIME_HOUR);
  }
  if (units_changed & DAY_UNIT) {
    execute_event(EVENT_TIME_DAY);
  }
  if (units_changed & MONTH_UNIT) {
    execute_event(EVENT_TIME_MONTH);
  }
  if (units_changed & YEAR_UNIT) {
    execute_event(EVENT_TIME_YEAR);
  }
}

static void tap_handler(AccelAxisType axis, int32_t direction) {
  execute_event(EVENT_TAPPED);
}

static void prv_click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, prv_select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, prv_up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, prv_down_click_handler);
}

static void prv_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  main_layer = layer_create(GRect(0, 0, bounds.size.w, bounds.size.h));
  layer_set_update_proc(main_layer, main_layer_draw_handler);
  layer_add_child(window_layer, main_layer);
}

static void prv_window_unload(Window *window) { layer_destroy(main_layer); }

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
        printf("%d = %s", instruction_length,
               vm_print_instruction(reinterpret.instruction));
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
        int32_t stack_index = block_stacks[event_type].count - 1;
        block_stacks[event_type].items[stack_index].event = event_type;
        block_stacks[event_type].items[stack_index].block_stack = stack_index;

        printf("Initializing VM…");
        VmState *state = &block_stacks[event_type].items[stack_index].state;
        vm_init(state, &instructions[event_pc]);
        state->call_handler = pebble_foreign_func_call_handler;
        state->vars = vars;
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
  tick_timer_service_subscribe(SECOND_UNIT | MINUTE_UNIT | HOUR_UNIT |
                                   DAY_UNIT | MONTH_UNIT | YEAR_UNIT,
                               tick_handler);
  accel_tap_service_subscribe(tap_handler);
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
