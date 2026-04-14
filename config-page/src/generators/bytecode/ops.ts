import { VarRef, VmInstruction } from '.'
import { PebbleForeignFunc } from './ffi'
import { VmOp } from './opcodes'

export function op(op: VmOp) {
  return [<VmInstruction>{ type: 'op', op }]
}

export function nil(info: string) {
  return [<VmInstruction>{ type: 'nil', info }]
}

export function num(num: number) {
  return [...op(VmOp.Num), <VmInstruction>{ type: 'num', num }]
}

export function ref(ref: number) {
  return [<VmInstruction>{ type: 'var', var: ref }]
}

export function jmp(delta: number, mode: 'onTrue' | 'onFalse' | null = null) {
  return [
    ...op(mode == 'onTrue' ? VmOp.Jmpt : mode == 'onFalse' ? VmOp.Jmpf : VmOp.Jmp),
    <VmInstruction>{ type: 'var', var: delta },
  ]
}

export function load(ref: VarRef) {
  return [...op(VmOp.Load), <VmInstruction>{ type: 'var', var: ref }]
}

export function stor(ref: VarRef) {
  return [...op(VmOp.Stor), <VmInstruction>{ type: 'var', var: ref }]
}

export function dup(count: number = 1) {
  return [...op(VmOp.Dup), <VmInstruction>{ type: 'var', var: count }]
}

export function bool(value: boolean) {
  return op(value ? VmOp.True : VmOp.Fals)
}

export function foreign(id: number) {
  return [...op(VmOp.CallForeign), ...ref(id)]
}

export function str(text: string) {
  const result: VmInstruction[] = []
  const textCodepoints = text.split('').map((e) => e.charCodeAt(0))
  textCodepoints.push(0)
  textCodepoints.reverse()
  for (let i = 0; ; i++) {
    let charCode = textCodepoints.pop()
    if (charCode === undefined) {
      break
    }
    if (charCode > 255) {
      const remainder = charCode >> 8
      charCode = charCode & 255
      textCodepoints.push(remainder)
    }
    if (i % 4 == 0) {
      result.push({ type: 'str', chars: [0, 0, 0, 0] })
    }
    const top = result[result.length - 1]
    if (top.type != 'str') {
      continue
    }
    top.chars[i % 4] = charCode
  }
  return [...op(VmOp.Str), ...result]
}

export function call(fn: PebbleForeignFunc) {
  return [...op(VmOp.CallForeign), ...ref(fn)]
}
