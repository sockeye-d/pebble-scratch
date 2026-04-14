import { BlockCompiler, VmInstruction } from '..'
import { PebbleForeignFunc } from '../ffi'
import * as ops from '../ops'

type ForeignBlockCompiler = {
  fn: PebbleForeignFunc
  args: (
    | { field: string; op: (value: any) => VmInstruction[] }
    | { input: string; default?: VmInstruction[]; op?: (value: VmInstruction[]) => VmInstruction[] }
  )[]
}

const internal: Record<string, ForeignBlockCompiler | undefined> = {
  events_main: undefined,
  events_on_button_pressed: undefined,
  events_on_tapped: undefined,
  events_on_time_change: undefined,
  controls_wait: undefined,
  sensors_accelerometer: {
    fn: PebbleForeignFunc.SensorsAccelerometer,
    args: [{ field: 'AXIS', op: (axis: any) => ops.num(axis == 'Z' ? 2 : axis == 'Y' ? 1 : 0) }],
  },
  sensors_battery: undefined,
  sensors_battery_state: undefined,
  sensors_phone_connected: undefined,
  time_wall_time: undefined,
  time_time_24h: undefined,
  time_time: undefined,
  sensors_current_watch_model: undefined,
  sensors_watch_model: undefined,
  sensors_current_watch_color: undefined,
  sensors_watch_color: undefined,
  blocks: undefined,
}

export const compilers: Record<string, BlockCompiler> = (() => {
  let obj: Record<string, BlockCompiler> = {}
  for (const [key, value] of Object.entries(internal)) {
    if (value === undefined) {
      continue
    }
    obj[key] = (compiler, block) => {
      const bytecode: VmInstruction[] = []
      for (const arg of value.args) {
        if ('field' in arg) {
          bytecode.push(...arg.op(block.getFieldValue(arg.field)))
        } else if ('input' in arg) {
          const inner = block.getInputTargetBlock(arg.input)
          bytecode.push(...(inner === null ? (arg.default ?? []) : compiler.compile(inner)))
        }
      }
      bytecode.push(...ops.call(value.fn))
      return bytecode
    }
  }
  return obj
})()
