#include "../src/c/vm.h"

#include <CUnit/Basic.h>
#include <CUnit/CUnit.h>

#define MK_OP_NUM(m_number)                                                    \
  (VmInstruction){                                                             \
      .op = OP_NUM,                                                            \
  },                                                                           \
      (VmInstruction) {                                                        \
    .num = m_number << VM_NUM_RATIO_L2,                                        \
  }

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

#define MK_OP(m_op)                                                            \
  (VmInstruction) { .op = OP_##m_op }

#define RUN_VM(m_occupied_vars)                                                \
  VmState state = {                                                            \
      .pc = 0,                                                                 \
      .stack_ptr = -1,                                                         \
      .m_occupied_vars,                                                        \
      .instructions = instructions,                                            \
  };                                                                           \
  do {                                                                         \
  } while (vm_step(&state))
