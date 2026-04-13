#ifndef __SRC_C_PEBBLE_FOREIGN_FUNCS_H
#define __SRC_C_PEBBLE_FOREIGN_FUNCS_H

typedef struct VmState VmState;

extern void (*const handlers[])(VmState *state);

#endif
