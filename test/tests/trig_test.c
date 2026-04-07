#include "../common.h"

void trig_test_sin() {
  VmInstruction instructions[] = {
      MK_OP_NUM(270.0),
      MK_OP(OP_SIN),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(-1.0 == NUM_AS_FLOAT(STACK(0).num))
}

void trig_test_sin_large() {
  VmInstruction instructions[] = {
      MK_OP_NUM(720.0),
      MK_OP(OP_SIN),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(0.0 == NUM_AS_FLOAT(STACK(0).num))
}

void trig_test_cos() {
  VmInstruction instructions[] = {
      MK_OP_NUM(270.0),
      MK_OP(OP_COS),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(0.0 == NUM_AS_FLOAT(STACK(0).num))
}

void trig_test_cos_large() {
  VmInstruction instructions[] = {
      MK_OP_NUM(720.0),
      MK_OP(OP_COS),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(1.0 == NUM_AS_FLOAT(STACK(0).num))
}
