#include "../common.h"

void string_test() {
  VmInstruction instructions[] = {
      MK_OP_STR('a', 'b', 'c', '\0'),
      MK_OP_STR('d', 'e', 'f', '\0'),
      MK_OP(OP_CAT),
      MK_OP_STOR(0),
      MK_OP_LOAD(0),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT_STRING_EQUAL("abcdef", STACK(0).string->value);
}
