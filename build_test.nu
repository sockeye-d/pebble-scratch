#!/usr/bin/nu

def analyze-file [] {
  clang -Xclang -ast-dump=json -fsyntax-only $in | from json
      | get inner | find FunctionDecl
      | where loc.includedFrom? == null and loc.expansionLoc? == null
      | get name
}


def --wrapped main [--enable: list<string> = [], ...args] {
  let enable_files = $enable | where $it =~ '.*\.c'
  let enable_symbols = $enable | where $it !~ '.*\.c'
  let symbols: list<record<symbols: list<string>, file: string>> = glob test/tests/*.c | each --flatten {
      let IN
      {
        symbols: ($IN | analyze-file),
        file: ($IN | path parse | update parent '' | path join)
      }
  }
  let symbols = if ($enable | is-empty) {
    $symbols | get symbols | flatten
  } else {
    [...($symbols | where file in $enable_files | get symbols | flatten), ...($symbols | get symbols | flatten | where $it in $enable_symbols)]
  }
  let symbols_text = $symbols | each { $"void ($in)\(\);" } | str join "\n"
  let tests_text = $symbols | each { $"  ADD_TEST\(($in)\);" } | str join "\n"
  let file_contents = $"#include <CUnit/Basic.h>
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
