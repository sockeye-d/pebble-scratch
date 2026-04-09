import { VarRef, VmInstruction } from '.'
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
