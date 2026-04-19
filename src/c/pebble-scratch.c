#include "message_keys.auto.h"
#include "pebble_foreign_funcs.h"
#include "vm.h"
#include <pebble.h>

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
} EventType;

Layer *layers;

typedef struct {
  EventType type;
  int32_t pc;
} Handler;

typedef struct {

} BlockStack;

VmValue vars[256];

static void tick_vm(void *data) {
  VmState *state = (VmState *)data;
  while (true) {
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

VmState *init_vm(VmInstruction *instructions) {
  VmState *state = malloc(sizeof(VmState));
  state->instructions = instructions;
  state->call_handler = pebble_foreign_func_call_handler;
  state->vars = vars;
  state->pc = 0;
  state->stack_ptr = 0;
  state->call_stack_ptr = 0;
  tick_vm((void *)state);
  return state;
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
  printf("Inbox received");
  Tuple *bytecode_tuple = dict_find(iter, MESSAGE_KEY_Bytecode);
  if (bytecode_tuple) {
    // This value was stored as JS Number, which is stored here as int32_t
    uint8_t *bytecode = bytecode_tuple->value->data;
    printf("length: [%d]", bytecode_tuple->length);
    for (int16_t i = 0; i < bytecode_tuple->length; i++) {
      printf("%d", bytecode[i]);
    }
  }
}

static void prv_init(void) {
  s_window = window_create();
  app_message_open(256, 8);
  app_message_register_inbox_received(inbox_received_handler);
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
