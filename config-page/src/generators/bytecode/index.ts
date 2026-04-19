import * as blockly from 'blockly'
import { VmOp } from './opcodes'
import * as ops from './ops'
import * as core from './blocks/core'
import * as foreign from './blocks/pebble'
import { PebbleForeignFunc } from './ffi'

export type VmInstruction = (
  | { type: 'nil'; info: string }
  | { type: 'op'; op: VmOp }
  | { type: 'num'; num: number }
  | { type: 'raw'; num: number }
  | { type: 'var'; var: VarRef }
  | { type: 'str'; chars: [number, number, number, number] }
  | { type: 'fun'; fun: number }
  | { type: 'call'; procName: string }
) & { sourceBlock?: blockly.Block }

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

  private compileSingle2(block: blockly.Block): VmInstruction[] {
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

  private compileSingle(block: blockly.Block): VmInstruction[] {
    const bytecode = this.compileSingle2(block)
    for (const e of bytecode) {
      e.sourceBlock ??= block
    }
    return bytecode
  }

  public compile(block: blockly.Block): VmInstruction[] {
    const instructions: VmInstruction[] = []
    let current: blockly.Block | null = block
    while (current != null) {
      if (instructions.length > 0 && this.useAtomic === 0) {
        instructions.push(...ops.op(VmOp.Sus))
      }
      instructions.push(...this.compileSingle(current))
      current = current.getNextBlock()
    }
    return instructions
  }

  public compileNull(block: blockly.Block | null, defaultInstructions = <VmInstruction[]>[]): VmInstruction[] {
    return block === null ? defaultInstructions : this.compile(block)
  }

  public atomically<T>(callback: () => T) {
    this.useAtomic++
    const v = callback()
    this.useAtomic--
    return v
  }
}

function unreachable(x: never): never {
  throw new Error()
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
          return `- proc '${e.procName}'`
      }
      unreachable(e)
    })
    .join('\n')
}

export function disassembleToHtml(ws: blockly.WorkspaceSvg, parent: Element, instructions: VmInstruction[]) {
  for (const e of instructions) {
    let text = ''
    switch (e.type) {
      case 'op':
        text = `${VmOp[e.op]}`
        break
      case 'str':
        const codepoint = e.chars.map((e) => `${e}`.padStart(3, ' '))
        const string = e.chars.map((e) => (e == 0 ? '⋅' : String.fromCharCode(e))).join('')
        text = `- str ${string} |${codepoint}|`
        break
      case 'var':
        text = `- var ${e.var}`
        break
      case 'num':
        text = `- num ${e.num}`
        break
      case 'raw':
        text = `- ${e.num}`
        break
      case 'nil':
        text = `Nil ${e.info}`
        break
      case 'fun':
        text = `- ${PebbleForeignFunc[e.fun]}`
        break
      case 'call':
        text = `- proc '${e.procName}'`
        break
    }
    let div = document.createElement('div')
    div.style = 'display: flex; flex-direction: row;'
    const innerText = document.createElement('span')
    innerText.innerText = text
    innerText.style = 'flex: 1 0 auto;'
    div.appendChild(innerText)
    if (e.sourceBlock) {
      const sourceBlock = e.sourceBlock
      div.onmouseenter = () => {
        ws.highlightBlock(sourceBlock.id)
      }
      div.onmouseleave = () => {
        ws.highlightBlock(null)
      }
      // const btn = document.createElement('button')
      // btn.innerText = '🔍'
      // btn.style = 'flex: 0 0;'
      // btn.onclick = () => {
      //   ws.highlightBlock(sourceBlock.id)
      // }
      // div.appendChild(btn)
    }
    parent.appendChild(div)
  }
}

const vmMaxRepresentableNum = 2 ** (31 - 8)

export function generateBinaryBytecode(instructions: VmInstruction[], resolveCallLocation: (func: string) => number) {
  const r = new Uint32Array(instructions.length)
  for (const [index, instruction] of instructions.entries()) {
    switch (instruction.type) {
      case 'op':
        {
          r[index] = instruction.op
        }
        break
      case 'str':
        {
          const chars = instruction.chars.slice()
          chars.reverse()
          const packed = chars.reduce((a, e) => (a << 8) | e, 0)
          r[index] = packed
        }
        break
      case 'var':
        {
          r[index] = instruction.var
        }
        break
      case 'num':
        {
          let num = instruction.num
          if (Math.abs(num) > vmMaxRepresentableNum) {
            num = 0
          }
          r[index] = (num * 256) | 0
        }
        break
      case 'raw':
        {
          r[index] = instruction.num | 0
        }
        break
      case 'nil':
        r[index] = VmOp.Nop
        break
      case 'fun':
        {
          r[index] = instruction.fun | 0
        }
        break
      case 'call':
        {
          // Resolve function name, then insert raw location constant
          r[index] = resolveCallLocation(instruction.procName)
        }
        break
      default:
        unreachable(instruction)
    }
  }
  return r
}
