#ifndef __SRC_C_PEBBLE_FOREIGN_FUNCS_H
#define __SRC_C_PEBBLE_FOREIGN_FUNCS_H

#include "vm.h"
#include <stdint.h>

typedef struct VmState VmState;

typedef struct GContext GContext;

void set_local_gcontext(GContext *ctx);
void clear_local_gcontext();

VmStepResult pebble_foreign_func_call_handler(VmState *state, int32_t call_id);

#endif
