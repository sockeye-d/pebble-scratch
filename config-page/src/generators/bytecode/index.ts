import * as blockly from 'blockly'
import { VmOp } from './opcodes'
import * as ops from './ops'
import * as core from './blocks/core'
import * as foreign from './blocks/pebble'

export type VmInstruction =
  | { type: 'nil'; info: string }
  | { type: 'op'; op: VmOp }
  | { type: 'num'; num: number }
  | { type: 'var'; var: VarRef }
  | { type: 'str'; chars: [number, number, number, number] }

export type VarID = string
export type VarRef = number

export type BlockCompiler = ((compiler: Compiler, block: blockly.Block) => VmInstruction[]) | undefined

const compilers = [core.compilers, foreign.compilers]

export class Compiler {
  private nextRef: VarRef = 0
  private variables: Record<VarID, VarRef> = {}
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
    for (let compiler of compilers) {
      const c = compiler[block.type]
      if (c == undefined) continue
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
    let instructions: VmInstruction[] = []
    let current: blockly.Block | null = block
    while (current != null) {
      instructions = [...instructions, ...this.compileSingle(current)]
      current = current.getNextBlock()
    }
    return instructions
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
        case 'nil':
          return `Nil ${e.info}`
      }
    })
    .join('\n')
}
