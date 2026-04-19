import { Block, Workspace } from 'blockly'
import { Compiler, generateBinaryBytecode, VmInstruction } from './generators/bytecode'
import * as ops from './generators/bytecode/ops'
import { VmOp } from './generators/bytecode/opcodes'

enum EventType {
  Main,
  BtnBack,
  BtnTop,
  BtnMiddle,
  BtnBottom,
  Tapped,
  TimeSecond,
  TimeMinute,
  TimeHour,
  TimeDay,
  TimeMonth,
  TimeYear,
  LayerRedraw,
}

function throwError(message?: string): never {
  throw new Error(message)
}

export function compileAllBlocks(ws: Workspace, compiler: Compiler) {
  const functionMap: Record<string, number> = {}
  const handlers: Record<number, number[]> = {}
  const bits = <Uint32Array[]>[]
  const functionBytecode: Record<string, VmInstruction[]> = {}
  let bitsLength = 0
  for (const fn of [...ws.getBlocksByType('procedures_defnoreturn'), ...ws.getBlocksByType('procedures_defreturn')]) {
    const bytecode = [...compiler.compile(fn), ...ops.op(VmOp.Eof)]
    const fnName = fn.getFieldValue('NAME')!
    functionBytecode[fnName] = bytecode
    functionMap[fnName] = bitsLength
    bitsLength += bytecode.length
  }
  const bytecodeToBinary = (e: VmInstruction[]) => generateBinaryBytecode(e, (name) => functionMap[name])
  bits.push(...Object.entries(functionBytecode).map(([_, e]) => bytecodeToBinary(e)))
  const finalBits = new Uint32Array(bits.map((e) => e.length).reduce((a, b) => a + b))
  let currentOffset = 0
  for (const bit of bits) {
    finalBits.set(bit, currentOffset)
    currentOffset += bit.length
  }
  const generateHandlerBinary = (type: string, eventType: ((block: Block) => EventType) | EventType) => {
    for (const fn of ws.getBlocksByType(type)) {
      const input = fn.getInputTargetBlock('DO')
      if (input === null) {
        continue
      }
      const bytecode = [...compiler.compile(input), ...ops.op(VmOp.Eof)]
      const type = typeof eventType === 'function' ? eventType(input) : eventType
      if (!(type in handlers)) {
        handlers[type] = []
      }
      handlers[type].push(bitsLength)
      bits.push(bytecodeToBinary(bytecode))
      bitsLength += bytecode.length
    }
  }
  generateHandlerBinary('events_main', EventType.Main)
  generateHandlerBinary('events_on_button_pressed', (block) => {
    const btn = block.getFieldValue('BUTTON')
    if (btn === 'TOP') {
      return EventType.BtnTop
    }
    if (btn === 'MIDDLE') {
      return EventType.BtnMiddle
    }
    return EventType.BtnBottom
  })
  generateHandlerBinary('events_on_tapped', EventType.Tapped)
  generateHandlerBinary('events_on_time_change', (block) => {
    const btn = block.getFieldValue('UNIT')
    if (btn === 'SECOND') return EventType.TimeSecond
    if (btn === 'MINUTE') return EventType.TimeMinute
    if (btn === 'HOUR') return EventType.TimeHour
    if (btn === 'DAY') return EventType.TimeDay
    if (btn === 'MONTH') return EventType.TimeMonth
    if (btn === 'YEAR') return EventType.TimeYear
    return EventType.TimeSecond
  })
  generateHandlerBinary('graphics_bind_on_draw', EventType.LayerRedraw)
  return { bytecode: finalBits, handlers }
}
