#!/usr/bin/nu

def analyze-file [] {
  clang -Xclang -ast-dump=json -fsyntax-only $in | from json
      | get inner | find FunctionDecl
      | where loc.includedFrom? == null and loc.expansionLoc? == null
      | get name
}


def --wrapped main [--enable: list<string> = [], ...args] {
  let symbols = ls test/tests/*.c
      | get name
      | each --flatten { analyze-file }
      | if ($enable | is-empty) {
          $in
        } else {
          where $it in $enable
        }
  let symbols_text = $symbols | each { $"void ($in)\(\);" } | str join "\n"
  let tests_text = $symbols | each { $"  ADD_TEST\(($in)\);" } | str join "\n"
  let file_contents = $"
#include <CUnit/Basic.h>
#include <CUnit/CUnit.h>

#define ADD_TEST\(m_name\) CU_add_test\(suite, #m_name, m_name\)

($symbols_text)

int main\(\) {
  CU_initialize_registry\(\);
  CU_pSuite suite = CU_add_suite\(\"AddTestSuite\", 0, 0\);
($tests_text)
  CU_basic_run_tests\(\);
  CU_cleanup_registry\(\);
  return 0;
}
"
  mkdir build/
  $file_contents | save --force build/generated_test_entry.c
  clang build/generated_test_entry.c test/*.c test/tests/*.c src/c/vm.c /usr/lib/libcunit.so ...$args -lm -o build/test_exe
}
