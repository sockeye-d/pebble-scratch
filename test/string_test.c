#include "common.h"
#include <CUnit/CUnit.h>

void string_test() {
  VmInstruction instructions[] = {
      MK_OP_STR('a', 'b', 'c', '\0'),
      MK_OP_STR('d', 'e', 'f', '\0'),
      MK_OP(CAT),
      (VmInstruction){
          .op = OP_EOF,
      },
  };
  RUN_VM(occupied_vars = 2);
  CU_ASSERT_STRING_EQUAL("defabc", state.stack[1].string->value);
}
