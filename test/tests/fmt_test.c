#include "../common.h"

void fmt_test() {
  VmInstruction instructions[] = {
      MK_OP_NUM(3),
      MK_OP_NUM(0.54),
      MK_OP(OP_FMT),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT_STRING_EQUAL("0.539", STACK(0).string->value);
}
