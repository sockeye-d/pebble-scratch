import * as blockly from 'blockly'
import { VmOp } from './opcodes'
import * as ops from './ops'
import * as core from './blocks/core'
import * as foreign from './blocks/pebble'
import { PebbleForeignFunc } from './ffi'

export type VmInstruction =
  | { type: 'nil'; info: string }
  | { type: 'op'; op: VmOp }
  | { type: 'num'; num: number }
  | { type: 'raw'; num: number }
  | { type: 'var'; var: VarRef }
  | { type: 'str'; chars: [number, number, number, number] }
  | { type: 'fun'; fun: number }
  | { type: 'call'; procName: string }

export type VarID = string
export type VarRef = number

export type BlockCompiler = ((compiler: Compiler, block: blockly.Block) => VmInstruction[]) | undefined
export type BlockCompilerGenerator = (type: string) => BlockCompiler

const compilers: BlockCompilerGenerator = (type: string) => core.compilers[type] ?? foreign.compilers[type]

export class Compiler {
  private nextRef: VarRef = 0
  private variables: Record<VarID, VarRef> = {}
  private useAtomic = 0
  public ws: blockly.Workspace

  constructor(ws: blockly.Workspace) {
    this.ws = ws
  }

  public variableRefFor(id: VarID): VarRef {
    if (id in this.variables) {
      return this.variables[id]
    }
    this.variables[id] = this.nextRef
    return this.nextRef++
  }

  private compileSingle(block: blockly.Block): VmInstruction[] {
    const c = compilers(block.type)
    if (c != undefined) {
      return c(this, block)
    }

    return ops.nil(
      `${block.type} (${block.inputList
        .map((e) => e.name)
        .filter((e) => e !== undefined && e.length > 0)
        .join(' ')}) [${[...block.getFields()]
        .map((e) => e.name)
        .filter((e) => e !== undefined && e.length > 0)
        .join(' ')}]`
    )
  }

  public compile(block: blockly.Block): VmInstruction[] {
    const instructions: VmInstruction[] = []
    let current: blockly.Block | null = block
    while (current != null) {
      if (instructions.length > 0 && this.useAtomic == 0) {
        instructions.push(...ops.op(VmOp.Sus))
      }
      instructions.push(...this.compileSingle(current))
      current = current.getNextBlock()
    }
    return instructions
  }

  public atomically<T>(callback: () => T) {
    this.useAtomic++
    const v = callback()
    this.useAtomic--
    return v
  }
}

export function disassemble(instructions: VmInstruction[]): string {
  return instructions
    .map((e) => {
      switch (e.type) {
        case 'op':
          return `${VmOp[e.op]}`
        case 'str':
          const codepoint = e.chars.map((e) => `${e}`.padStart(3, ' '))
          const string = e.chars.map((e) => (e == 0 ? '⋅' : String.fromCharCode(e))).join('')
          return `- str ${string} |${codepoint}|`
        case 'var':
          return `- var ${e.var}`
        case 'num':
          return `- num ${e.num}`
        case 'raw':
          return `- ${e.num}`
        case 'nil':
          return `Nil ${e.info}`
        case 'fun':
          return `- ${PebbleForeignFunc[e.fun]}`
        case 'call':
          return `Call ${e.procName}`
      }
    })
    .join('\n')
}
