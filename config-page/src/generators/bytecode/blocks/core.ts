import * as ops from '../ops'
import { BlockCompiler, VarID, VmInstruction } from '..'
import { VmOp } from '../opcodes'

export const compilers: Record<string, BlockCompiler> = {
  controls_if: (compiler, block) => {
    const ifBlock = block.getInputTargetBlock('CONDITION')!
    const ifBytecode = compiler.compile(ifBlock)
    const doBlock = block.getInputTargetBlock('DO')
    const doBytecode = doBlock == null ? [] : compiler.compile(doBlock)
    return [...ifBytecode, ...ops.jmp(doBytecode.length, 'onFalse'), ...doBytecode]
  },
  controls_if_else: (compiler, block) => {
    const ifBlock = block.getInputTargetBlock('CONDITION')!
    const ifBytecode = compiler.compile(ifBlock)
    const doBlock = block.getInputTargetBlock('DO')
    const doBytecode = doBlock == null ? [] : compiler.compile(doBlock)
    const elBlock = block.getInputTargetBlock('ELSE')
    const elBytecode = elBlock == null ? [] : compiler.compile(elBlock)
    return [
      ...ifBytecode,
      ...ops.jmp(doBytecode.length + elBytecode.length + 2, 'onFalse'),
      ...doBytecode,
      ...ops.jmp(elBytecode.length),
      ...elBytecode,
    ]
  },
  controls_atomically: (compiler, block) =>
    compiler.atomically(() => compiler.compile(block.getInputTargetBlock('DO')!)),
  logic_boolean: (_compiler, block) => ops.bool(block.getFieldValue('BOOL') == 'TRUE'),
  logic_boolean_yellow: (_compiler, block) => ops.bool(block.getFieldValue('BOOL') == 'TRUE'),
  logic_compare: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      EQ: VmOp.Eq,
      NEQ: VmOp.Neq,
      LT: VmOp.Lt,
      LTE: VmOp.Lte,
      GT: VmOp.Gt,
      GTE: VmOp.Gte,
    }
    const aBlock = block.getInputTargetBlock('A')
    const bBlock = block.getInputTargetBlock('B')
    if (aBlock == null || bBlock == null) {
      return ops.op(VmOp.Fals)
    }
    const op = block.getFieldValue('OP')
    return [...compiler.compile(aBlock), ...compiler.compile(bBlock), ...ops.op(OPS[op])]
  },
  logic_operation: (compiler, block) => {
    const OPS: Record<string, VmOp> = {
      AND: VmOp.And,
      OR: VmOp.Or,
    }
    const op = block.getFieldValue('OP') as string
    const aBlock = block.getInputTargetBlock('A')
    const bBlock = block.getInputTargetBlock('B')
    const aBytecode = aBlock == null ? ops.bool(false) : compiler.compile(aBlock)
    const bBytecode = bBlock == null ? ops.bool(false) : compiler.compile(bBlock)
    return [...aBytecode, ...bBytecode, ...ops.op(OPS[op])]
  },
  logic_negate: (compiler, block) => {
    const bool = block.getInputTargetBlock('BOOL')
    const bytecode = bool == null ? ops.bool(false) : compiler.compile(bool)
    return [...bytecode, ...ops.op(VmOp.Neg)]
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
    return ops.str(block.getFieldValue('TEXT'))
  },
  text_join: (compiler, block) => {
    if (block.getInput('EMPTY') != null) {
      return [...ops.str('')]
    }
    const r: VmInstruction[] = []
    for (let i = 0; ; i++) {
      const inputName = `ADD${i}`
      if (block.getInput(inputName) == null) {
        break
      }
      const input = block.getInputTargetBlock(inputName)
      if (input == null) {
        r.push(...ops.str(''))
      } else {
        r.push(...compiler.compile(input))
      }
      if (i > 0) {
        r.push(...ops.op(VmOp.Cat))
      }
    }
    return r
  },
  text_length: (compiler, block) => [...compiler.compile(block.getInputTargetBlock('VALUE')!), ...ops.op(VmOp.Len)],
  text_find: (compiler, block) => [
    ...compiler.compile(block.getInputTargetBlock('WHAT')!),
    ...compiler.compile(block.getInputTargetBlock('SUBJECT')!),
    ...ops.op(VmOp.Find),
  ],
  text_replace: (compiler, block) => [
    ...compiler.compile(block.getInputTargetBlock('FROM')!),
    ...compiler.compile(block.getInputTargetBlock('TO')!),
    ...compiler.compile(block.getInputTargetBlock('TEXT')!),
    ...ops.op(VmOp.Subst),
  ],
  math_number: (_compiler, block) => ops.num(block.getFieldValue('NUM')),
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
    return [...compiler.compile(a), ...compiler.compile(b), ...ops.op(op)]
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
    return [...compiler.compile(num), ...ops.op(OPS[block.getFieldValue('TYPE')])]
  },
  math_clamp: (compiler, block) => [
    ...compiler.compile(block.getInputTargetBlock('VAL')!),
    ...compiler.compile(block.getInputTargetBlock('MIN')!),
    ...compiler.compile(block.getInputTargetBlock('MAX')!),
    ...ops.op(VmOp.Clamp),
  ],
  variables_get: (compiler, block) => {
    const varID: VarID = block.getFieldValue('VAR')
    return ops.load(compiler.variableRefFor(varID))
  },
  variables_set: (compiler, block) => {
    const varID: VarID = block.getFieldValue('VAR')
    const value = block.getInputTargetBlock('VALUE')
    if (value == null) {
      return []
    }
    const ref = compiler.variableRefFor(varID)
    return [...compiler.compile(value), ...ops.stor(ref)]
  },
}
