#include "pebble_foreign_funcs.h"

#include "vm.h"
#include <pebble.h>

#define PBL_BIND(m_name) void m_name(VmState *state)

static AccelData last_accel_data;

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
}
PBL_BIND(sensors_battery) {
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(battery_state_service_peek().charge_percent),
  };
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
}
PBL_BIND(sensors_phone_connected) {
  PUSH() = (VmValue){
      .type = TYPE_BOOL,
      .b = connection_service_peek_pebble_app_connection(),
  };
}
PBL_BIND(time_wall_time) {
  char *time = malloc(sizeof(char) * 8);
  MAKE_STRING(time_str, time, 8);
  clock_copy_time_string(time, 8);
  PUSH() = (VmValue){
      .type = TYPE_STRING,
      .string = time_str,
  };
}
PBL_BIND(time_time_24h) {
  PUSH() = (VmValue){
      .type = TYPE_BOOL,
      .b = clock_is_24h_style(),
  };
}
PBL_BIND(time_time) {
  const VmValue _a = POP();
  const VmNum mode = COERCE_NUM(_a);
  time_t t = time(NULL);
  tm current_time;
  localtime_r(&t, &current_time);
  int32_t time;
  switch (mode) {
  default: {
    time = current_time.tm_sec;
  } break;
  case 1: {
    time = current_time.tm_min;
  } break;
  case 2: {
    time = current_time.tm_hour;
  } break;
  case 3: {
    time = current_time.tm_wday;
  } break;
  case 4: {
    time = current_time.tm_mon;
  } break;
  case 5: {
    time = (int32_t)current_time.tm_year + 1900;
  } break;
  }
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(time),
  };
  cleanup_val(state, _a);
}
PBL_BIND(sensors_current_watch_model) {
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(watch_info_get_model()),
  };
}
PBL_BIND(sensors_current_watch_color) {
  PUSH() = (VmValue){
      .type = TYPE_NUM,
      .num = INT_AS_NUM(watch_info_get_color()),
  };
}

#if __has_include("pebble_foreign_funcs_gen") && !defined(AST_DUMP)
#include "pebble_foreign_funcs_gen"
#endif
