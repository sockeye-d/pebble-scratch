#include <CUnit/Basic.h>
#include <CUnit/CUnit.h>

#define ADD_TEST(m_name) CU_add_test(suite, #m_name, m_name)

void test1();
void string_test();
void fmt_test();
void loop_test();

int main() {
  CU_initialize_registry();
  CU_pSuite suite = CU_add_suite("AddTestSuite", 0, 0);
  ADD_TEST(test1);
  ADD_TEST(string_test);
  ADD_TEST(fmt_test);
  ADD_TEST(loop_test);
  CU_basic_run_tests();
  CU_cleanup_registry();
  return 0;
}
