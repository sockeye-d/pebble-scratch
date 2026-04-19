import { BlockCompiler, VmInstruction } from '..'
import { PebbleForeignFunc } from '../ffi'
import * as ops from '../ops'

const allFonts = [
  'FONT_KEY_GOTHIC_18_BOLD',
  'FONT_KEY_GOTHIC_24',
  'FONT_KEY_GOTHIC_09',
  'FONT_KEY_GOTHIC_14',
  'FONT_KEY_GOTHIC_14_BOLD',
  'FONT_KEY_GOTHIC_18',
  'FONT_KEY_GOTHIC_24_BOLD',
  'FONT_KEY_GOTHIC_28',
  'FONT_KEY_GOTHIC_28_BOLD',
  'FONT_KEY_BITHAM_30_BLACK',
  'FONT_KEY_BITHAM_42_BOLD',
  'FONT_KEY_BITHAM_42_LIGHT',
  'FONT_KEY_BITHAM_42_MEDIUM_NUMBERS',
  'FONT_KEY_BITHAM_34_MEDIUM_NUMBERS',
  'FONT_KEY_BITHAM_34_LIGHT_SUBSET',
  'FONT_KEY_BITHAM_18_LIGHT_SUBSET',
  'FONT_KEY_ROBOTO_CONDENSED_21',
  'FONT_KEY_ROBOTO_BOLD_SUBSET_49',
  'FONT_KEY_DROID_SERIF_28_BOLD',
  'FONT_KEY_LECO_20_BOLD_NUMBERS',
  'FONT_KEY_LECO_26_BOLD_NUMBERS_AM_PM',
  'FONT_KEY_LECO_32_BOLD_NUMBERS',
  'FONT_KEY_LECO_36_BOLD_NUMBERS',
  'FONT_KEY_LECO_38_BOLD_NUMBERS',
  'FONT_KEY_LECO_42_NUMBERS',
  'FONT_KEY_LECO_28_LIGHT_NUMBERS',
  'FONT_KEY_FONT_FALLBACK',
]

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
  graphics_bind_set_fill_color: {
    args: [{ input: 'COLOR' }],
  },
  graphics_bind_set_stroke_color: {
    args: [{ input: 'COLOR' }],
  },
  graphics_bind_set_stroke_width: {
    args: [{ input: 'WIDTH' }],
  },
  graphics_bind_draw_arc: {
    args: [{ input: 'START' }, { input: 'END' }, { input: 'X' }, { input: 'Y' }, { input: 'RADIUS' }],
  },
  graphics_bind_fill_arc: {
    args: [{ input: 'START' }, { input: 'END' }, { input: 'X' }, { input: 'Y' }, { input: 'RADIUS' }],
  },
  graphics_bind_draw_circle: {
    args: [{ input: 'X' }, { input: 'Y' }, { input: 'RADIUS' }],
  },
  graphics_bind_fill_circle: {
    args: [{ input: 'X' }, { input: 'Y' }, { input: 'RADIUS' }],
  },
  graphics_bind_draw_rect: {
    args: [{ input: 'X' }, { input: 'Y' }, { input: 'W' }, { input: 'H' }],
  },
  graphics_bind_fill_rect: {
    args: [{ input: 'X' }, { input: 'Y' }, { input: 'W' }, { input: 'H' }],
  },
  graphics_bind_draw_line: {
    args: [{ input: 'X1' }, { input: 'Y1' }, { input: 'X2' }, { input: 'Y2' }],
  },
  graphics_bind_set_alignment: {
    args: [
      {
        field: 'ALIGNMENT',
        op: (a: any) => ops.num(a == 'R' ? 1 : a == 'C' ? 0 : -1),
      },
    ],
  },
  graphics_bind_draw_text: {
    args: [
      {
        input: 'TEXT',
      },
      {
        field: 'FONT',
        op: (key: any) => ops.num(allFonts.indexOf(key)),
      },
      {
        input: 'X',
      },
      {
        input: 'Y',
      },
    ],
  },
  graphics_bind_path_scope: {
    generator: (compiler, block) => {
      enum Modes {
        FILLED,
        OUTLINED,
        OUTLINED_OPEN,
      }
      const mode = block.getFieldValue('MODE')
      const contents = block.getInputTargetBlock('DO')
      if (contents == null) {
        return []
      }
      return [
        ...ops.callForeign(PebbleForeignFunc.GraphicsBindPathScopeBegin),
        ...compiler.compile(contents),
        ...ops.num(Modes[mode as keyof typeof Modes]),
        ...ops.callForeign(PebbleForeignFunc.GraphicsBindPathScopeEnd),
      ]
    },
  },
  graphics_bind_path_move_to: {
    args: [
      {
        input: 'X',
      },
      {
        input: 'Y',
      },
    ],
  },
  graphics_bind_path_move_by: {
    args: [
      {
        input: 'X',
      },
      {
        input: 'Y',
      },
    ],
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
  sensors_print: { args: [{ input: 'MESSAGE' }] },
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
          bytecode.push(...ops.callForeign(fn))
        }
        return bytecode
      })
  }
  return obj
})()
