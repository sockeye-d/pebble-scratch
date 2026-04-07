#ifndef __TEST_COMMON_H
#define __TEST_COMMON_H

#include "../src/c/vm.h"

#include <CUnit/Basic.h>
#include <CUnit/CUnit.h>

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

#define MK_OP(m_op)                                                            \
  (VmInstruction) { .op = m_op }

#define RUN_VM()                                                               \
  VmState state = {                                                            \
      .pc = 0,                                                                 \
      .stack_ptr = -1,                                                         \
      .vars = {},                                                              \
      .stack = {},                                                             \
      .instructions = instructions,                                            \
  };                                                                           \
  do {                                                                         \
    /* vm_print_state(&state); */                                              \
  } while (vm_step(&state))

#define STACK(m_delta) (state.stack[state.stack_ptr - m_delta])
#define VAR(m_var_ref) (state.vars[m_var_ref])

#endif
