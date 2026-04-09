import * as blockly from 'blockly'
import { VmOp } from './opcodes'
import * as ops from './ops'

export type VmInstruction =
  | { type: 'nil'; info: string }
  | { type: 'op'; op: VmOp }
  | { type: 'num'; num: number }
  | { type: 'var'; var: VarRef }
  | { type: 'str'; chars: [number, number, number, number] }

export type VarID = string
export type VarRef = number

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
    const compilerFun = blockCompilers[block.type]
    if (compilerFun == undefined) {
      console.log(block.inputList)
      console.log([...block.getFields()])
      return ops.nil(block.type)
    }
    return compilerFun(this, block)
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
          const codepoint = e.chars.map((e) => e.toLocaleString(undefined, { minimumIntegerDigits: 3 }))
          const string = e.chars.map((e) => String.fromCharCode(e)).join('')
          return `- str ${codepoint} (${string})`
        case 'var':
          return `- var ${e.var}`
        case 'num':
          return `- num ${e.num}`
        case 'nil':
          return `- nil ${e.info}`
      }
    })
    .join('\n')
}

const blockCompilers: Record<string, ((compiler: Compiler, block: blockly.Block) => VmInstruction[]) | undefined> = {
  logic_boolean: (_compiler, block) => {
    const OPS: Record<string, VmOp> = {
      TRUE: VmOp.True,
      FALSE: VmOp.Fals,
    }
    return [
      <VmInstruction>{
        type: 'op',
        op: OPS[block.getFieldValue('BOOL')],
      },
    ]
  },
  controls_repeat_ext: (compiler, block) => {
    const times = block.getInputTargetBlock('TIMES')!
    const timesBytecode = compiler.compile(times)
    const inner = block.getInputTargetBlock('DO')
    const innerBytecode = inner == null ? [] : compiler.compile(inner)
    const bytecode = [...innerBytecode, ...ops.op(VmOp.Dec), ...ops.dup(), ...ops.num(0), ...ops.op(VmOp.Lt)]
    return [...timesBytecode, ...bytecode, ...ops.jmp(-2 - bytecode.length)]
  },
  controls_whileUntil: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      WHILE: VmOp.Jmpf,
      UNTIL: VmOp.Jmpt,
    }
    const mode = block.getFieldValue('MODE')
    const condition = block.getInputTargetBlock('BOOL')
    const inner = block.getInputTargetBlock('DO')
    const innerBytecode = inner == null ? [] : compiler.compile(inner)
    const exit: VmInstruction[] = [
      {
        type: 'op',
        op: OPS[mode],
      },
      {
        type: 'var',
        var: innerBytecode.length + 2,
      },
    ]
    const conditionBytecode = condition == null ? [] : compiler.compile(condition)
    const loop: VmInstruction[] = [
      {
        type: 'op',
        op: VmOp.Jmp,
      },
      {
        type: 'num',
        num: -innerBytecode.length - conditionBytecode.length - 2,
      },
    ]
    return [...conditionBytecode, ...exit, ...innerBytecode, ...loop]
  },
  text: (_compiler, block) => {
    const text: string = block.getFieldValue('TEXT')
    const neededLength = text.length + 1
    let result: VmInstruction[] = []
    for (let i = 0; i < neededLength; i++) {
      if (i % 4 == 0) {
        result.push({ type: 'str', chars: [0, 0, 0, 0] })
      }
      const charCode = i < text.length ? text.charCodeAt(i) : 0
      const top = result[result.length - 1]
      if (top.type != 'str') {
        continue
      }
      top.chars[i % 4] = charCode
    }
    return result
  },
  math_number: (_compiler, block) => {
    return [
      {
        type: 'num',
        num: block.getFieldValue('NUM'),
      },
    ]
  },
  math_binary: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      ADD: VmOp.Add,
      SUB: VmOp.Sub,
      MUL: VmOp.Mul,
      DIV: VmOp.Div,
      MOD: VmOp.Mod,
    }
    const a = block.getInputTargetBlock('A')!
    const b = block.getInputTargetBlock('B')!
    const op = OPS[block.getFieldValue('TYPE')]
    return [
      ...compiler.compile(b),
      ...compiler.compile(a),
      {
        type: 'op',
        op,
      },
    ]
  },
  math_unary: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      SQRT: VmOp.Sqrt,
      SIN: VmOp.Sin,
      COS: VmOp.Cos,
      LOG: VmOp.Log2,
      POW: VmOp.Pow2,
      ABS: VmOp.Abs,
      ROUND: VmOp.Rond,
      FLOOR: VmOp.Flor,
      CEIL: VmOp.Ceil,
    }
    const num = block.getInputTargetBlock('NUM')!
    const op = OPS[block.getFieldValue('TYPE')]
    return [
      ...compiler.compile(num),
      {
        type: 'op',
        op,
      },
    ]
  },
  variables_set: (compiler, block) => {
    const varID: VarID = block.getFieldValue('VAR')
    const value = block.getInputTargetBlock('VALUE')
    if (value == null) {
      return []
    }
    const ref = compiler.variableRefFor(varID)
    return [
      ...compiler.compile(value),
      {
        type: 'op',
        op: VmOp.Stor,
      },
      {
        type: 'var',
        var: ref,
      },
    ]
  },
}
