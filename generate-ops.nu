#!/usr/bin/nu

def parse-c [path: path] {
  clang -DAST_DUMP -Xclang -ast-dump=json -fsyntax-only $path | from json
}

def generate-ops [--output-file: path] {
  let ast = parse-c src/c/vm.h | get inner
  let id = $ast | where name? == VmOp | get inner.0.decl.id.0
  let vm_ops = $ast | where id == $id | get inner.0.name
  let text  = $"export enum VmOp {\n($vm_ops | str substring 3.. | str pascal-case | each { '  ' + $in } | str join ",\n"),\n}"
  $text | save --force $output_file
}

def generate-ffi [--output-file: path] {
  let funcs = open src/c/pebble_foreign_funcs.c | lines | where $it =~ '^PBL_BIND' | parse --regex 'PBL_BIND\((?P<name>[a-zA-Z0-9_]+)\)' | get name
  $"export enum PebbleForeignFunc {\n($funcs | str pascal-case | each { '  ' + $in } | str join ",\n"),\n}"
      | save --force $output_file
  $"void \(*const handlers[]\)\(VmState *state\) = {\n($funcs | each { '  ' + $in } | str join ",\n")\n};"
      | save --force src/c/pebble_foreign_funcs_gen
  let bound_funcs = open config-page/src/blocks/pebble_blocks.ts | collect
      | parse --regex '(// BEGIN BLOCKS(?:.|\n)*// END BLOCKS)' | get capture0.0
      | lines | slice 1..-2
      | str trim | str trim --right --char ','
      | where $it != ''
  let unbound_funcs = $funcs | where $it not-in $bound_funcs
  if ($unbound_funcs | is-not-empty) {
    print $"(ansi yellow_bold)Unbound functions:(ansi reset)"
    $unbound_funcs | each { print $in }
  }
  return
}

export def main [--ops-output-file: path = config-page/src/generators/bytecode/opcodes.ts, --ffi-output-file: path = config-page/src/generators/bytecode/ffi.ts] {
  generate-ops --output-file $ops_output_file
  generate-ffi --output-file $ffi_output_file
}
