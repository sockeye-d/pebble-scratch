#include "common.h"

#define MY_STRING 0
#define I 1

void loop_test() {
  VmInstruction instructions[] = {
      MK_OP_NUM(0),
      MK_OP_STOR(I),
      MK_OP_JMP(10, ),

      // L2.
      MK_OP_LOAD(I),
      MK_OP(OP_PRINT),
      MK_OP_LOAD(I),
      MK_OP_NUM(1),
      MK_OP(OP_ADD),
      MK_OP_STOR(I),

      // L3.
      MK_OP_NUM(10),
      MK_OP_LOAD(I),
      MK_OP(OP_LT),
      MK_OP_JMP(-17, T),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT_EQUAL(10 * VM_NUM_RATIO, VAR(I).num);
}
