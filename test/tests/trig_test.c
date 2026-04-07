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

void trig_test_atan() {
  VmInstruction instructions[] = {
      MK_OP_NUM(10.0),
      MK_OP_NUM(5.0),
      MK_OP(OP_AT2),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(is_equal_approx(FLOAT_AS_NUM(63.3434), STACK(0).num));
}

void trig_test_atan_large() {
  VmInstruction instructions[] = {
      MK_OP_NUM(1000.0),
      MK_OP_NUM(500.0),
      MK_OP(OP_AT2),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT(is_equal_approx(FLOAT_AS_NUM(63.3434), STACK(0).num));
}
