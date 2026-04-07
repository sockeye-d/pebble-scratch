import * as blockly from 'blockly'

export enum VmOp {
  Nop,
  Num,
  Str,
  Stor,
  Load,
  Jmp,
  Jmpf,
  Jmpt,
  Add,
  Sub,
  Mul,
  Div,
  Mod,
  Neq,
  Eq,
  Lt,
  Lte,
  Gt,
  Gte,
  And,
  Or,
  Not,
  Sqrt,
  Abs,
  Neg,
  Log2,
  Pow2,
  Min,
  Max,
  Clamp,
  Rond,
  Flor,
  Ceil,
  Sin,
  Cos,
  At2,
  Cat,
  Substr,
  Subst,
  Find,
  Has,
  Len,
  Fmt,
  Print,
  Call,
  True,
  Fals,
  Eof,
}

export type VmInstruction =
  | { type: 'nil'; blockType: string }
  | { type: 'op'; op: VmOp }
  | { type: 'num'; num: number }
  | { type: 'var'; var: VarRef }
  | { type: 'string'; chars: [number, number, number, number, number, number, number, number] }

type VarID = string
type VarRef = number

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
}

export function disassemble(instructions: VmInstruction[]): string {
  return instructions
    .map((e) => {
      switch (e.type) {
        case 'op':
          return `op  ${VmOp[e.op]}`
        case 'string':
          const codepointRepresentation = e.chars.map((e) => e.toLocaleString(undefined, { minimumIntegerDigits: 3 }))
          const stringRepresentation = e.chars.map((e) => String.fromCharCode(e)).join('')
          return `str ${codepointRepresentation} (${stringRepresentation})`
        case 'var':
          return `var ${e.var}`
        case 'num':
          return `num ${e.num}`
        case 'nil':
          return `nil ${e.blockType}`
      }
    })
    .join('\n')
}

const blockCompilers: Record<string, ((compiler: Compiler, block: blockly.Block) => VmInstruction[]) | undefined> = {
  logic_boolean: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      TRUE: VmOp.True,
      FALSE: VmOp.Fals,
    }
    return [
      {
        type: 'op',
        op: OPS[block.getFieldValue('BOOL')],
      },
    ]
  },
  controls_whileUntil: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      WHILE: VmOp.Jmpf,
      UNTIL: VmOp.Jmpt,
    }
    const mode = block.getFieldValue('MODE')
    const condition = block.getInputTargetBlock('BOOL')
    const inner = block.getInputTargetBlock('DO')
    const innerBytecode = inner == null ? [<VmInstruction>{ type: 'op', op: VmOp.Nop }] : compile(compiler, inner)
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
    const conditionBytecode = condition == null ? [] : compile(compiler, condition)
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
      if (i % 8 == 0) {
        result.push({ type: 'string', chars: [0, 0, 0, 0, 0, 0, 0, 0] })
      }
      const code = i < text.length ? text.charCodeAt(i) : 0
      const top = result[result.length - 1]
      if (top.type != 'string') {
        continue
      }
      top.chars[i % 8] = code
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
      ...compile(compiler, b),
      ...compile(compiler, a),
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
      ...compile(compiler, num),
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
      ...compile(compiler, value),
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

function compileSingle(compiler: Compiler, block: blockly.Block): VmInstruction[] {
  const compilerFun = blockCompilers[block.type]
  if (compilerFun == undefined) {
    return [{ type: 'nil', blockType: block.type }]
  }
  return compilerFun(compiler, block)
}

export function compile(compiler: Compiler, block: blockly.Block): VmInstruction[] {
  let instructions: VmInstruction[] = []
  let current: blockly.Block | null = block
  while (current != null) {
    instructions = [...instructions, ...compileSingle(compiler, current)]
    current = current.getNextBlock()
  }
  return instructions
}
