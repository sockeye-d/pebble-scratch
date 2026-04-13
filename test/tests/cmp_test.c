#include "../common.h"

void cmp_string_test() {
  VmInstruction instructions[] = {
      MK_OP_STR('A', 'B', 'C', '\0'),
      MK_OP_STR('A', 'B', 'C', '\0'),
      MK_OP(OP_EQ),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(STACK(0).b == true)
}

void cmp_string_neq_test() {
  VmInstruction instructions[] = {
      MK_OP_STR('A', 'B', 'C', '\0'),
      MK_OP_STR('a', 'b', 'c', '\0'),
      MK_OP(OP_NEQ),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(STACK(0).b == true)
}

void cmp_string_lt_test() {
  VmInstruction instructions[] = {
      MK_OP_STR('0', '\0'),
      MK_OP_STR('9', '\0'),
      MK_OP(OP_LT),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(STACK(0).b == false)
}

void cmp_num_test() {
  VmInstruction instructions[] = {
      MK_OP_NUM(5.0),
      MK_OP_NUM(6.0),
      MK_OP(OP_GT),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(STACK(0).b == true)
}

void cmp_heterogenous_test() {
  VmInstruction instructions[] = {
      MK_OP_NUM(5.0),
      MK_OP_STR('5', '.', '0', '\0'),
      MK_OP(OP_EQ),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(STACK(0).b == true)
}
