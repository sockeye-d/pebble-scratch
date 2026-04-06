#include "common.h"
#include <CUnit/CUnit.h>

void test1() {
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
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM(occupied_vars = 2);
  CU_ASSERT_EQUAL(state.stack[0].num, (-1004) * VM_NUM_RATIO)
}
