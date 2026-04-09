#!/usr/bin/nu

export def main [--output-file: path = config-page/src/generators/bytecode/opcodes.ts] {
  let ast = clang -Xclang -ast-dump=json src/c/vm.h | from json | get inner
  let id = $ast | where name? == VmOp | get inner.0.decl.id.0
  let vm_ops = $ast | where id == $id | get inner.0.name
  let text  = $"export enum VmOp {\n($vm_ops | str substring 3.. | str pascal-case | each { '  ' + $in } | str join ",\n"),\n}"
  $text | save --force $output_file
  print 'Successfully generated!'
}
