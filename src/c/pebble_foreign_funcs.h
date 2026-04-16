#ifndef __SRC_C_PEBBLE_FOREIGN_FUNCS_H
#define __SRC_C_PEBBLE_FOREIGN_FUNCS_H

typedef struct VmState VmState;

typedef struct GContext GContext;

void set_local_gcontext(GContext *ctx);
void clear_local_gcontext();

extern void (*const handlers[])(VmState *state);

#endif
