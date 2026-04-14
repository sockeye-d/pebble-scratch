#!/usr/bin/nu

def parse [path: path] {
  clang -DAST_DUMP -Xclang -ast-dump=json -fsyntax-only $path | from json
}

def generate-ops [--output-file: path] {
  let ast = parse src/c/vm.h | get inner
  let id = $ast | where name? == VmOp | get inner.0.decl.id.0
  let vm_ops = $ast | where id == $id | get inner.0.name
  let text  = $"export enum VmOp {\n($vm_ops | str substring 3.. | str pascal-case | each { '  ' + $in } | str join ",\n"),\n}"
  $text | save --force $output_file
}

def generate-ffi [--output-file: path] {
  # parse src/c/pebble_foreign_funcs.c | explore
  let funcs = parse src/c/pebble_foreign_funcs.c
      | get inner
      | where kind == FunctionDecl and loc.includedFrom? == null and storageClass? != static
      | get name
  $"export enum PebbleForeignFunc {\n($funcs | str pascal-case | each { '  ' + $in } | str join ",\n"),\n}"
      | save --force $output_file
  $"void \(*const handlers[]\)\(VmState *state\) = {\n($funcs | each { '  ' + $in } | str join ",\n")\n};"
      | save --force src/c/pebble_foreign_funcs_gen
}

export def main [--ops-output-file: path = config-page/src/generators/bytecode/opcodes.ts, --ffi-output-file: path = config-page/src/generators/bytecode/ffi.ts] {
  generate-ops --output-file $ops_output_file
  generate-ffi --output-file $ffi_output_file
}
