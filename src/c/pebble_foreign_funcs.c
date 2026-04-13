#include "pebble_foreign_funcs.h"
#include "vm.h"

void sensors_accelerometer(VmState *state);
void sensors_battery(VmState *state);

#if __has_include("pebble_foreign_funcs_gen")
#include "pebble_foreign_funcs_gen"
#endif
