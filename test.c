#include "src/c/vm.c"

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

int main() {
  VmInstruction instructions[] = {
      MK_OP_NUM(512),
      MK_OP_NUM(512),
      MK_OP(ADD),
      MK_OP_STOR(0),
      MK_OP_NUM(10),
      MK_OP_NUM(10),
      MK_OP(ADD),
      MK_OP_STOR(1),
      MK_OP_LOAD(0),
      MK_OP_LOAD(1),
      MK_OP(SUB),
      MK_OP(PRINT),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  VmState state = {
      .pc = 0,
      .stack_ptr = 0,
      .occupied_vars = 2,
      .instructions = instructions,
  };
  do {
  } while (vm_step(&state));
}
