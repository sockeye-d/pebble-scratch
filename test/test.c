#include "common.h"

void test1();

int main() {
  CU_initialize_registry();
  CU_pSuite suite = CU_add_suite("AddTestSuite", 0, 0);
  CU_add_test(suite, "test1", test1);
  CU_basic_run_tests();
  CU_cleanup_registry();
  return 0;
}
