#include "../common.h"

void basic_dup_test() {
  VmInstruction instructions[] = {
      MK_OP_NUM(512.0),
      MK_OP_DUP(1),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
}

void string_dup_test() {
  VmInstruction instructions[] = {
      MK_OP_STR('A', 'B', 'C', '\0'),
      MK_OP_DUP(1),
      MK_OP_STR('a', 'b', 'c', '\0'),
      MK_OP(OP_CAT),
      MK_OP_DUP(2),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
  CU_ASSERT_STRING_EQUAL("ABC", STACK_ABS(0).string->value);
  CU_ASSERT_STRING_EQUAL("abcABC", STACK_ABS(1).string->value);
  CU_ASSERT_STRING_EQUAL("ABC", STACK_ABS(2).string->value);
  CU_ASSERT_STRING_EQUAL("abcABC", STACK_ABS(3).string->value);
}

void loop_with_dup_test() {
  VmInstruction instructions[] = {
      MK_OP_NUM(0),
      MK_OP_JMP(3, ),

      // L2.
      MK_OP_NUM(1),
      MK_OP(OP_ADD),

      // L3.
      MK_OP_DUP(1),
      MK_OP_NUM(10),
      MK_OP(OP_LT),
      MK_OP_JMP(-10, F),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM();
}
