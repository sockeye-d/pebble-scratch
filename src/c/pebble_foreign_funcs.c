#include "pebble_foreign_funcs.h"

#include "vm.h"
#include <pebble.h>

#define PBL_BIND(m_name) VmStepResult m_name(VmState *state)

static AccelData last_accel_data;
GContext *context = NULL;

void set_local_gcontext(GContext *ctx) { context = ctx; }
void clear_local_gcontext() { context = NULL; }

#define GCTX_GUARD if (context != NULL)

PBL_BIND(graphics_bind_set_fill_color) {
  VmValue _a = POP();
  int32_t color = COERCE_RAW(_a);
  if (color < 0) {
    color = 0;
  } else if (color > 255) {
    color = 255;
  }
  GCTX_GUARD {
    graphics_context_set_fill_color(context, (GColor){.argb = color});
    graphics_context_set_text_color(context, (GColor){.argb = color});
  }
  cleanup_val(state, _a);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_set_stroke_color) {
  VmValue _a = POP();
  int32_t color = COERCE_RAW(_a);
  if (color < 0) {
    color = 0;
  } else if (color > 255) {
    color = 255;
  }
  GCTX_GUARD {
    graphics_context_set_stroke_color(context, (GColor){.argb = color});
  }
  cleanup_val(state, _a);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_set_stroke_width) {
  VmValue _a = POP();
  int32_t width = COERCE_INT(_a);
  if (width < 0) {
    width = 0;
  } else if (width > 255) {
    width = 255;
  }
  GCTX_GUARD { graphics_context_set_stroke_width(context, width); }
  cleanup_val(state, _a);
  return STEP_RESULT_CONTINUE;
}

inline static void __attribute__((__always_inline__))
graphics_bind_draw_arc_helper(VmState *state, bool fill) {
  VmValue _4 = POP();
  VmValue _3 = POP();
  VmValue _2 = POP();
  VmValue _1 = POP();
  VmValue _0 = POP();
  GCTX_GUARD {
    int32_t angle_start = NUM_DEG_AS_PBL_ANGLE(COERCE_INT(_0));
    int32_t angle_end = NUM_DEG_AS_PBL_ANGLE(COERCE_INT(_1));
    int32_t x = COERCE_INT(_2);
    int32_t y = COERCE_INT(_3);
    int32_t radius = COERCE_INT(_4);
    if (fill) {
      graphics_fill_radial(
          context, GRect(x - radius, y - radius, radius * 2, radius * 2),
          GOvalScaleModeFitCircle, 0, angle_start, angle_end);
    } else {
      graphics_draw_arc(context,
                        GRect(x - radius, y - radius, radius * 2, radius * 2),
                        GOvalScaleModeFitCircle, angle_start, angle_end);
    }
  }
  cleanup_val(state, _4);
  cleanup_val(state, _3);
  cleanup_val(state, _2);
  cleanup_val(state, _1);
  cleanup_val(state, _0);
}

PBL_BIND(graphics_bind_draw_arc) {
  graphics_bind_draw_arc_helper(state, false);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_fill_arc) {
  graphics_bind_draw_arc_helper(state, true);
  return STEP_RESULT_CONTINUE;
}

inline static void __attribute((__always_inline__))
graphics_bind_circle(VmState *state, bool fill) {
  VmValue _3 = POP();
  VmValue _2 = POP();
  VmValue _1 = POP();
  GCTX_GUARD {
    int32_t x = COERCE_INT(_1);
    int32_t y = COERCE_INT(_2);
    int32_t radius = COERCE_INT(_3);
    if (fill) {
      graphics_fill_circle(context, GPoint(x, y), radius);
    } else {
      graphics_draw_circle(context, GPoint(x, y), radius);
    }
  }
  cleanup_val(state, _3);
  cleanup_val(state, _2);
  cleanup_val(state, _1);
}

PBL_BIND(graphics_bind_draw_circle) {
  graphics_bind_circle(state, false);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_fill_circle) {
  graphics_bind_circle(state, true);
  return STEP_RESULT_CONTINUE;
}

inline static void __attribute((__always_inline__))
graphics_bind_rect(VmState *state, bool fill) {
  VmValue _b = POP();
  VmValue _c = POP();
  VmValue _d = POP();
  VmValue _e = POP();
  GCTX_GUARD {
    int32_t x = COERCE_INT(_e);
    int32_t y = COERCE_INT(_d);
    int32_t width = COERCE_INT(_c);
    int32_t height = COERCE_INT(_b);
    if (fill) {
      graphics_fill_rect(context, GRect(x, y, width, height), 0, GCornerNone);
    } else {
      graphics_draw_rect(context, GRect(x, y, width, height));
    }
  }
  cleanup_val(state, _b);
  cleanup_val(state, _c);
  cleanup_val(state, _d);
  cleanup_val(state, _e);
}

PBL_BIND(graphics_bind_draw_rect) {
  graphics_bind_rect(state, false);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_fill_rect) {
  graphics_bind_rect(state, true);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_draw_line) {
  VmValue _b = POP();
  VmValue _c = POP();
  VmValue _d = POP();
  VmValue _e = POP();
  GCTX_GUARD {
    int32_t x1 = COERCE_INT(_e);
    int32_t y1 = COERCE_INT(_d);
    int32_t x2 = COERCE_INT(_c);
    int32_t y2 = COERCE_INT(_b);
    graphics_draw_line(context, GPoint(x1, y1), GPoint(x2, y2));
  }
  cleanup_val(state, _b);
  cleanup_val(state, _c);
  cleanup_val(state, _d);
  cleanup_val(state, _e);
  return STEP_RESULT_CONTINUE;
}

static GTextAlignment context_alignment = GTextAlignmentCenter;

const char *font_keys[] = {
    FONT_KEY_GOTHIC_18_BOLD,
    FONT_KEY_GOTHIC_24,
    FONT_KEY_GOTHIC_09,
    FONT_KEY_GOTHIC_14,
    FONT_KEY_GOTHIC_14_BOLD,
    FONT_KEY_GOTHIC_18,
    FONT_KEY_GOTHIC_24_BOLD,
    FONT_KEY_GOTHIC_28,
    FONT_KEY_GOTHIC_28_BOLD,
    FONT_KEY_BITHAM_30_BLACK,
    FONT_KEY_BITHAM_42_BOLD,
    FONT_KEY_BITHAM_42_LIGHT,
    FONT_KEY_BITHAM_42_MEDIUM_NUMBERS,
    FONT_KEY_BITHAM_34_MEDIUM_NUMBERS,
    FONT_KEY_BITHAM_34_LIGHT_SUBSET,
    FONT_KEY_BITHAM_18_LIGHT_SUBSET,
    FONT_KEY_ROBOTO_CONDENSED_21,
    FONT_KEY_ROBOTO_BOLD_SUBSET_49,
    FONT_KEY_DROID_SERIF_28_BOLD,
    FONT_KEY_LECO_20_BOLD_NUMBERS,
    FONT_KEY_LECO_26_BOLD_NUMBERS_AM_PM,
    FONT_KEY_LECO_32_BOLD_NUMBERS,
    FONT_KEY_LECO_36_BOLD_NUMBERS,
    FONT_KEY_LECO_38_BOLD_NUMBERS,
    FONT_KEY_LECO_42_NUMBERS,
    FONT_KEY_LECO_28_LIGHT_NUMBERS,
    FONT_KEY_FONT_FALLBACK,
};

PBL_BIND(graphics_bind_set_alignment) {
  VmValue _1 = POP();
  int32_t align = COERCE_INT(_1);
  context_alignment = align < 0   ? GTextAlignmentLeft
                      : align > 0 ? GTextAlignmentRight
                                  : GTextAlignmentCenter;
  cleanup_val(state, _1);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_draw_text) {
  VmValue _4 = POP();
  VmValue _3 = POP();
  VmValue _2 = POP();
  VmValue _1 = POP();
  VmString *string = COERCE_STR(_4);
  GCTX_GUARD {
    const char *cstring = string->value;
    int32_t font_index = COERCE_INT(_3);
    int32_t x = COERCE_INT(_2);
    int32_t y = COERCE_INT(_1);
    GFont font = fonts_get_system_font(font_keys[font_index]);
    GSize size = graphics_text_layout_get_content_size(
        cstring, font, GRect(0, 0, 10000, 10000), GTextOverflowModeWordWrap,
        GTextAlignmentLeft);
    switch (context_alignment) {
    case GTextAlignmentLeft:
      break;
    case GTextAlignmentCenter:
      x -= size.w;
      break;
    case GTextAlignmentRight:
      x -= size.w / 2;
      break;
    }
    graphics_draw_text(context, cstring, font, GRect(x, y, 10000, 10000),
                       GTextOverflowModeWordWrap, GTextAlignmentLeft, NULL);
  }
  cleanup_val_str(state, string);
  cleanup_val(state, _3);
  cleanup_val(state, _2);
  cleanup_val(state, _1);
  return STEP_RESULT_CONTINUE;
}

typedef struct {
  GPoint *items;
  int32_t count;
  int32_t capacity;
} PointList;

typedef struct {
  PointList points;
  VmNum last_x;
  VmNum last_y;
} PathStackItem;

static int32_t path_stack_index = -1;
static PathStackItem path_stack[16];

#define PATH_STACK_GUARD if (path_stack_index >= 0)

PBL_BIND(graphics_bind_path_scope_begin) {
  path_stack[++path_stack_index] = (PathStackItem){
      .points = {},
      .last_x = 0,
      .last_y = 0,
  };
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_path_scope_end) {
  VmValue _1 = POP();
  int32_t mode = COERCE_INT(_1);
  PathStackItem path = path_stack[path_stack_index--];
  GCTX_GUARD {
    if (path.points.count >= 2) {
      GPath gpath = (GPath){
          .num_points = path.points.count,
          .points = path.points.items,
      };
      if (mode == 0) {
        gpath_draw_filled(context, &gpath);
      } else if (mode == 1) {
        gpath_draw_outline(context, &gpath);
      } else if (mode == 2) {
        gpath_draw_outline_open(context, &gpath);
      }
    }
  }
  free(path.points.items);
  cleanup_val(state, _1);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_path_move_to) {
  VmValue _2 = POP();
  VmValue _1 = POP();
  VmNum x = COERCE_NUM(_1);
  VmNum y = COERCE_NUM(_2);
  PATH_STACK_GUARD {
    PathStackItem *path = &path_stack[path_stack_index];
    path->last_x = x;
    path->last_y = y;
    DA_APPEND(path->points,
              GPoint(NUM_AS_INT(path->last_x), NUM_AS_INT(path->last_y)));
  }
  cleanup_val(state, _2);
  cleanup_val(state, _1);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(graphics_bind_path_move_by) {
  VmValue _2 = POP();
  VmValue _1 = POP();
  VmNum x = COERCE_NUM(_1);
  VmNum y = COERCE_NUM(_2);
  PATH_STACK_GUARD {
    PathStackItem *path = &path_stack[path_stack_index];
    path->last_x += x;
    path->last_y += y;
    DA_APPEND(path->points,
              GPoint(NUM_AS_INT(path->last_x), NUM_AS_INT(path->last_y)));
  }
  cleanup_val(state, _2);
  cleanup_val(state, _1);
  return STEP_RESULT_CONTINUE;
}

PBL_BIND(controls_wait);

PBL_BIND(sensors_accelerometer) {
  const VmValue _a = POP();
  const VmNum axis = COERCE_NUM(_a);
  accel_service_peek(&last_accel_data);
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = axis == 2   ? (last_accel_data.z * VM_NUM_RATIO / 1000)
             : axis == 1 ? (last_accel_data.y * VM_NUM_RATIO / 1000)
                         : (last_accel_data.x * VM_NUM_RATIO / 1000),
  };
  cleanup_val(state, _a);
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(sensors_battery) {
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(battery_state_service_peek().charge_percent),
  };
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(sensors_battery_state) {
  const VmValue _a = POP();
  const VmNum mode = COERCE_NUM(_a);
  const BatteryChargeState battery_state = battery_state_service_peek();
  PUSH() = (VmValue){
      .type = TYPE_BOOL,
      .b = mode == 0 ? battery_state.is_charging : battery_state.is_plugged,
  };
  cleanup_val(state, _a);
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(sensors_phone_connected) {
  PUSH() = (VmValue){
      .type = TYPE_BOOL,
      .b = connection_service_peek_pebble_app_connection(),
  };
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(time_wall_time) {
  char *time = malloc(sizeof(char) * 8);
  MAKE_STRING(time_str, time, 8);
  clock_copy_time_string(time, 8);
  PUSH() = (VmValue){
      .type = TYPE_STRING,
      .string = time_str,
  };
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(time_time_24h) {
  PUSH() = (VmValue){
      .type = TYPE_BOOL,
      .b = clock_is_24h_style(),
  };
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(time_time) {
  const VmValue _a = POP();
  const VmNum mode = COERCE_NUM(_a);
  time_t t = time(NULL);
  tm *current_time = localtime(&t);
  int32_t time;
  switch (mode) {
  default: {
    time = current_time->tm_sec;
  } break;
  case 1: {
    time = current_time->tm_min;
  } break;
  case 2: {
    time = current_time->tm_hour;
  } break;
  case 3: {
    time = current_time->tm_wday;
  } break;
  case 4: {
    time = current_time->tm_mon;
  } break;
  case 5: {
    time = (int32_t)current_time->tm_year + 1900;
  } break;
  }
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(time),
  };
  cleanup_val(state, _a);
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(sensors_current_watch_model) {
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(watch_info_get_model()),
  };
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(sensors_current_watch_color) {
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(watch_info_get_color()),
  };
  return STEP_RESULT_CONTINUE;
}
PBL_BIND(sensors_print);

#if __has_include("pebble_foreign_funcs_gen") && !defined(AST_DUMP)
#include "pebble_foreign_funcs_gen"
#endif

VmStepResult pebble_foreign_func_call_handler(VmState *state, int32_t call_id) {
  return handlers[call_id](state);
}
