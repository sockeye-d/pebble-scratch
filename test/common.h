#ifndef __TEST_COMMON_H
#define __TEST_COMMON_H

// #define TEST_PRINT

#include "../src/c/vm.h"

#include <CUnit/Basic.h>
#include <CUnit/CUnit.h>
#include <stdlib.h>

#define MK_OP_NUM(m_number)                                                    \
  (VmInstruction){                                                             \
      .op = OP_NUM,                                                            \
  },                                                                           \
      (VmInstruction) {                                                        \
    .num = (int32_t)((double)m_number * (double)VM_NUM_RATIO),                 \
  }

#define MK_OP_STR(...)                                                         \
  (VmInstruction){                                                             \
      .op = OP_STR,                                                            \
  },                                                                           \
      (VmInstruction) {                                                        \
    .ch = {__VA_ARGS__},                                                       \
  }

#define VSTR_CONT(...)                                                         \
  (VmInstruction) { .ch = {__VA_ARGS__}, }

#define MK_OP_STOR(m_var_ref)                                                  \
  (VmInstruction){                                                             \
      .op = OP_STOR,                                                           \
  },                                                                           \
      (VmInstruction) {                                                        \
    .var = m_var_ref,                                                          \
  }

#define MK_OP_LOAD(m_var_ref)                                                  \
  (VmInstruction){                                                             \
      .op = OP_LOAD,                                                           \
  },                                                                           \
      (VmInstruction) {                                                        \
    .var = m_var_ref,                                                          \
  }

#define MK_OP_JMP(m_delta, m_modifier)                                         \
  (VmInstruction){                                                             \
      .op = OP_JMP##m_modifier,                                                \
  },                                                                           \
      (VmInstruction) {                                                        \
    .var = m_delta,                                                            \
  }

#define MK_OP_DUP(m_count)                                                     \
  (VmInstruction){                                                             \
      .op = OP_DUP,                                                            \
  },                                                                           \
      (VmInstruction) {                                                        \
    .var = m_count,                                                            \
  }

#define MK_OP(m_op)                                                            \
  (VmInstruction) { .op = m_op }

#ifdef TEST_PRINT
#define __PRINT vm_print_state(&state);
#else
#define __PRINT
#endif

#define RUN_VM()                                                               \
  VmValue *__vars = (VmValue *)alloca(sizeof(VmValue) * MAX_VARS);             \
  VmState state = {                                                            \
      .pc = 0,                                                                 \
      .stack_ptr = -1,                                                         \
      .vars = __vars,                                                          \
      .stack = {},                                                             \
      .instructions = instructions,                                            \
  };                                                                           \
  do {                                                                         \
    __PRINT;                                                                   \
  } while (vm_step(&state))

#define STACK(m_delta) (state.stack[state.stack_ptr - m_delta])
#define STACK_ABS(m_frame) (state.stack[m_frame])
#define VAR(m_var_ref) (state.vars[m_var_ref])

inline bool __attribute__((__always_inline__)) is_equal_approx(VmNum a,
                                                               VmNum b) {
  double a_d = NUM_AS_DOUBL(a);
  double b_d = NUM_AS_DOUBL(b);
  double diff = (b_d - a_d);
  if (diff < 0.0) {
    diff = -diff;
  }
  return diff < 0.05;
}

#endif
