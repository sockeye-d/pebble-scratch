import { BlockCompiler, VmInstruction } from '..'
import { PebbleForeignFunc } from '../ffi'
import * as ops from '../ops'

type ForeignBlockCompiler = {
  fn?: PebbleForeignFunc | null
  args?: (
    | { field: string; op: (value: any) => VmInstruction[] }
    | { input: string; default?: VmInstruction[]; op?: (value: VmInstruction[]) => VmInstruction[] }
  )[]
  generator?: BlockCompiler
}

const internal: Record<string, ForeignBlockCompiler | undefined> = {
  graphics_color: {
    fn: null,
    generator: (_compiler, block) => ops.raw(block.getFieldValue('COLOR')),
  },
  graphics_set_fill_color: {
    args: [{ input: 'COLOR' }],
  },
  graphics_set_stroke_color: {
    args: [{ input: 'COLOR' }],
  },
  graphics_set_stroke_width: {
    args: [{ input: 'WIDTH' }],
  },
  events_main: undefined,
  events_on_button_pressed: undefined,
  events_on_tapped: undefined,
  events_on_time_change: undefined,
  controls_wait: {
    args: [{ input: 'SECONDS' }],
  },
  sensors_accelerometer: {
    args: [{ field: 'AXIS', op: (axis: any) => ops.raw(axis == 'Z' ? 2 : axis == 'Y' ? 1 : 0) }],
  },
  sensors_battery: {},
  sensors_battery_state: { args: [{ field: 'STATE', op: (state: any) => ops.raw(state == 'CHARGING' ? 0 : 1) }] },
  sensors_phone_connected: {},
  sensors_current_watch_model: {},
  sensors_watch_model: {
    generator: (_compiler, block) => {
      enum WatchModel {
        'UNKNOWN',
        'PEBBLE_ORIGINAL',
        'PEBBLE_STEEL',
        'PEBBLE_TIME',
        'PEBBLE_TIME_STEEL',
        'PEBBLE_TIME_ROUND_14',
        'PEBBLE_TIME_ROUND_20',
        'PEBBLE_2_HR',
        'PEBBLE_2_SE',
        'PEBBLE_TIME_2',
        'COREDEVICES_C2D',
        'COREDEVICES_CT2',
      }
      const model = WatchModel[block.getFieldValue('MODEL')! as keyof typeof WatchModel]
      return ops.num(model)
    },
  },
  sensors_current_watch_color: {},
  sensors_watch_color: {
    generator: (_compiler, block) => {
      enum WatchColor {
        'WATCH_INFO_COLOR_UNKNOWN',
        'WATCH_INFO_COLOR_BLACK',
        'WATCH_INFO_COLOR_WHITE',
        'WATCH_INFO_COLOR_RED',
        'WATCH_INFO_COLOR_ORANGE',
        'WATCH_INFO_COLOR_GRAY',
        'WATCH_INFO_COLOR_STAINLESS_STEEL',
        'WATCH_INFO_COLOR_MATTE_BLACK',
        'WATCH_INFO_COLOR_BLUE',
        'WATCH_INFO_COLOR_GREEN',
        'WATCH_INFO_COLOR_PINK',
        'WATCH_INFO_COLOR_TIME_WHITE',
        'WATCH_INFO_COLOR_TIME_BLACK',
        'WATCH_INFO_COLOR_TIME_RED',
        'WATCH_INFO_COLOR_TIME_STEEL_SILVER',
        'WATCH_INFO_COLOR_TIME_STEEL_BLACK',
        'WATCH_INFO_COLOR_TIME_STEEL_GOLD',
        'WATCH_INFO_COLOR_TIME_ROUND_SILVER_14',
        'WATCH_INFO_COLOR_TIME_ROUND_BLACK_14',
        'WATCH_INFO_COLOR_TIME_ROUND_SILVER_20',
        'WATCH_INFO_COLOR_TIME_ROUND_BLACK_20',
        'WATCH_INFO_COLOR_TIME_ROUND_ROSE_GOLD_14',
        'WATCH_INFO_COLOR_PEBBLE_2_HR_BLACK',
        'WATCH_INFO_COLOR_PEBBLE_2_HR_LIME',
        'WATCH_INFO_COLOR_PEBBLE_2_HR_FLAME',
        'WATCH_INFO_COLOR_PEBBLE_2_HR_WHITE',
        'WATCH_INFO_COLOR_PEBBLE_2_HR_AQUA',
        'WATCH_INFO_COLOR_PEBBLE_2_SE_BLACK',
        'WATCH_INFO_COLOR_PEBBLE_2_SE_WHITE',
        'WATCH_INFO_COLOR_PEBBLE_TIME_2_BLACK',
        'WATCH_INFO_COLOR_PEBBLE_TIME_2_SILVER',
        'WATCH_INFO_COLOR_PEBBLE_TIME_2_GOLD',
        'WATCH_INFO_COLOR_COREDEVICES_C2D_BLACK',
        'WATCH_INFO_COLOR_COREDEVICES_C2D_WHITE',
        'WATCH_INFO_COLOR_COREDEVICES_CT2_BLACK',
      }
      const model = WatchColor[block.getFieldValue('COLOR')! as keyof typeof WatchColor]
      return ops.num(model)
    },
  },
  time_wall_time: {},
  time_time_24h: {},
  time_time: {
    args: [
      {
        field: 'UNIT',
        op: (unit: any) => {
          enum TimeUnit {
            'SECOND',
            'MINUTE',
            'HOUR',
            'DAY',
            'MONTH',
            'YEAR',
          }
          return ops.raw(TimeUnit[unit as keyof typeof TimeUnit])
        },
      },
    ],
  },
}

export const compilers = (() => {
  let obj: Record<string, BlockCompiler> = {}
  for (const [name, value] of Object.entries(internal)) {
    if (value === undefined) {
      continue
    }
    obj[name] =
      value.generator ??
      ((compiler, block) => {
        const bytecode: VmInstruction[] = []
        for (const arg of value.args ?? []) {
          if ('field' in arg) {
            bytecode.push(...arg.op(block.getFieldValue(arg.field)))
          } else if ('input' in arg) {
            const inner = block.getInputTargetBlock(arg.input)
            bytecode.push(...(inner === null ? (arg.default ?? []) : compiler.compile(inner)))
          }
        }
        let fn = value.fn
        if (fn === undefined) {
          fn =
            PebbleForeignFunc[
              name
                .split('_')
                .map((e) => e.slice(0, 1).toUpperCase() + e.slice(1))
                .join('') as keyof typeof PebbleForeignFunc
            ]
        }
        if (fn !== null) {
          bytecode.push(...ops.call(fn))
        }
        return bytecode
      })
  }
  return obj
})()
