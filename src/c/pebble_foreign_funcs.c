#include "pebble_foreign_funcs.h"

#include "vm.h"
#include <pebble.h>

#define PBL_BIND(m_name) void m_name(VmState *state)

PBL_BIND(controls_wait);
PBL_BIND(sensors_accelerometer);
PBL_BIND(sensors_battery);
PBL_BIND(sensors_battery_state);
PBL_BIND(sensors_phone_connected);
PBL_BIND(time_wall_time);
PBL_BIND(time_time_24h);
PBL_BIND(time_time);
PBL_BIND(sensors_current_watch_model);
PBL_BIND(sensors_watch_model);
PBL_BIND(sensors_current_watch_color);
PBL_BIND(sensors_watch_color);

#if __has_include("pebble_foreign_funcs_gen") && !defined(AST_DUMP)
#include "pebble_foreign_funcs_gen"
#endif
