import * as Blockly from 'blockly/core'

const events_main = {
  type: 'events_main',
  message0: 'main %1 %2',
  args0: [
    { type: 'input_dummy' },
    {
      type: 'input_statement',
      name: 'CONTENT',
    },
  ],
  colour: 30,
}

const events_on_button_pressed = {
  type: 'events_on_button_pressed',
  message0: 'on %2 button pressed %1 %3',
  args0: [
    { type: 'input_dummy' },
    {
      type: 'field_dropdown',
      name: 'BUTTON',
      options: [
        ['back', 'BACK'],
        ['top', 'TOP'],
        ['middle', 'MIDDLE'],
        ['bottom', 'BOTTOM'],
      ],
    },
    {
      type: 'input_statement',
      name: 'CONTENT',
    },
  ],
  colour: 30,
}

const events_on_tapped = {
  type: 'events_on_tapped',
  message0: 'on tapped %1 %2',
  args0: [
    { type: 'input_dummy' },
    {
      type: 'input_statement',
      name: 'CONTENT',
    },
  ],
  colour: 30,
}

const events_on_time_change = {
  type: 'events_on_time_change',
  message0: 'every %1 do %2 %3',
  args0: [
    {
      type: 'field_dropdown',
      options: [
        ['second', 'SECOND'],
        ['minute', 'MINUTE'],
        ['hour', 'HOUR'],
        ['day', 'DAY'],
        ['month', 'MONTH'],
        ['year', 'YEAR'],
      ],
    },
    { type: 'input_dummy' },
    {
      type: 'input_statement',
      name: 'CONTENT',
    },
  ],
  colour: 30,
}

const controls_wait = {
  type: 'controls_wait',
  message0: 'wait for %1 seconds',
  args0: [
    {
      type: 'input_value',
      name: 'SECONDS',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 45,
}

const sensors_accelerometer = {
  type: 'sensors_accelerometer',
  message0: 'read accelerometer %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'AXIS',
      options: [
        ['x', 'X'],
        ['y', 'Y'],
        ['z', 'Z'],
      ],
    },
  ],
  output: null,
  colour: 280,
}

const sensors_battery = {
  type: 'sensors_battery',
  message0: 'battery %',
  output: 'Number',
  colour: 280,
}

const sensors_battery_state = {
  type: 'sensors_battery_state',
  message0: 'battery is %1?',
  args0: [
    {
      type: 'field_dropdown',
      name: 'STATE',
      options: [
        ['charging', 'CHARGING'],
        ['plugged', 'PLUGGED'],
      ],
    },
  ],
  output: 'Boolean',
  colour: 280,
}

const sensors_phone_connected = {
  type: 'sensors_phone_connected',
  message0: 'phone is connected?',
  output: 'Boolean',
  colour: 280,
}

const time_wall_time = {
  type: 'time_wall_time',
  message0: 'wall time',
  output: null,
  colour: 250,
}

const time_time_24h = {
  type: 'time_time_24h',
  message0: 'wall time is 24h?',
  output: 'Boolean',
  colour: 250,
}

const time_time = {
  type: 'time_time',
  message0: 'current %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'UNIT',
      options: [
        ['second', 'SECOND'],
        ['minute', 'MINUTE'],
        ['hour', 'HOUR'],
        ['day', 'DAY'],
        ['month', 'MONTH'],
        ['year', 'YEAR'],
      ],
    },
  ],
  output: 'Number',
  colour: 250,
}

const sensors_current_watch_model = {
  type: 'sensors_current_watch_model',
  message0: 'current watch model',
  output: 'Number',
  colour: 280,
}

const sensors_watch_model = {
  type: 'sensors_watch_model',
  message0: '%1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'MODEL',
      options: [
        ['unknown', 'UNKNOWN'],
        ['pebble original', 'PEBBLE_ORIGINAL'],
        ['pebble steel', 'PEBBLE_STEEL'],
        ['pebble time', 'PEBBLE_TIME'],
        ['pebble time steel', 'PEBBLE_TIME_STEEL'],
        ['pebble time round 14', 'PEBBLE_TIME_ROUND_14'],
        ['pebble time round 20', 'PEBBLE_TIME_ROUND_20'],
        ['pebble 2 hr', 'PEBBLE_2_HR'],
        ['pebble 2 se', 'PEBBLE_2_SE'],
        ['pebble time 2', 'PEBBLE_TIME_2'],
        ['core devices core 2 duo', 'COREDEVICES_C2D'],
        ['core devices core time 2*', 'COREDEVICES_CT2'],
      ],
    },
  ],
  output: 'Number',
  colour: 280,
}

const sensors_current_watch_color = {
  type: 'sensors_current_watch_color',
  message0: 'current watch color',
  output: 'Number',
  colour: 280,
}

const sensors_watch_color = {
  type: 'sensors_watch_color',
  message0: '%1 watch',
  args0: [
    {
      type: 'field_dropdown',
      name: 'COLOR',
      options: [
        ['unknown', 'WATCH_INFO_COLOR_UNKNOWN'],
        ['black', 'WATCH_INFO_COLOR_BLACK'],
        ['white', 'WATCH_INFO_COLOR_WHITE'],
        ['red', 'WATCH_INFO_COLOR_RED'],
        ['orange', 'WATCH_INFO_COLOR_ORANGE'],
        ['gray', 'WATCH_INFO_COLOR_GRAY'],
        ['stainless steel', 'WATCH_INFO_COLOR_STAINLESS_STEEL'],
        ['matte black', 'WATCH_INFO_COLOR_MATTE_BLACK'],
        ['blue', 'WATCH_INFO_COLOR_BLUE'],
        ['green', 'WATCH_INFO_COLOR_GREEN'],
        ['pink', 'WATCH_INFO_COLOR_PINK'],
        ['white time', 'WATCH_INFO_COLOR_TIME_WHITE'],
        ['black time', 'WATCH_INFO_COLOR_TIME_BLACK'],
        ['red time', 'WATCH_INFO_COLOR_TIME_RED'],
        ['silver time steel', 'WATCH_INFO_COLOR_TIME_STEEL_SILVER'],
        ['black time steel', 'WATCH_INFO_COLOR_TIME_STEEL_BLACK'],
        ['gold time steel', 'WATCH_INFO_COLOR_TIME_STEEL_GOLD'],
        ['silver time round 14', 'WATCH_INFO_COLOR_TIME_ROUND_SILVER_14'],
        ['black time round 14', 'WATCH_INFO_COLOR_TIME_ROUND_BLACK_14'],
        ['silver time round 20', 'WATCH_INFO_COLOR_TIME_ROUND_SILVER_20'],
        ['black time round 20', 'WATCH_INFO_COLOR_TIME_ROUND_BLACK_20'],
        ['rose gold time round 14', 'WATCH_INFO_COLOR_TIME_ROUND_ROSE_GOLD_14'],
        ['black pebble 2 hr', 'WATCH_INFO_COLOR_PEBBLE_2_HR_BLACK'],
        ['lime pebble 2 hr', 'WATCH_INFO_COLOR_PEBBLE_2_HR_LIME'],
        ['flame pebble 2 hr', 'WATCH_INFO_COLOR_PEBBLE_2_HR_FLAME'],
        ['white pebble 2 hr', 'WATCH_INFO_COLOR_PEBBLE_2_HR_WHITE'],
        ['aqua pebble 2 hr', 'WATCH_INFO_COLOR_PEBBLE_2_HR_AQUA'],
        ['black pebble 2 se', 'WATCH_INFO_COLOR_PEBBLE_2_SE_BLACK'],
        ['white pebble 2 se', 'WATCH_INFO_COLOR_PEBBLE_2_SE_WHITE'],
        ['black pebble time 2', 'WATCH_INFO_COLOR_PEBBLE_TIME_2_BLACK'],
        ['silver pebble time 2', 'WATCH_INFO_COLOR_PEBBLE_TIME_2_SILVER'],
        ['gold pebble time 2', 'WATCH_INFO_COLOR_PEBBLE_TIME_2_GOLD'],
        ['black core devices core 2 duo', 'WATCH_INFO_COLOR_COREDEVICES_C2D_BLACK'],
        ['white core devices core 2 duo', 'WATCH_INFO_COLOR_COREDEVICES_C2D_WHITE'],
        ['black core devices core time 2', 'WATCH_INFO_COLOR_COREDEVICES_CT2_BLACK'],
      ],
    },
  ],
  output: 'Number',
  colour: 280,
}

const graphics_color = {
  type: 'graphics_color',
  message0: '%1',
  args0: [
    {
      type: 'field_color',
      name: 'COLOR',
    },
  ],
  output: 'Number',
  colour: 80,
}

const graphics_bind_set_fill_color = {
  type: 'graphics_bind_set_fill_color',
  message0: 'set fill color to %1',
  args0: [
    {
      type: 'input_value',
      name: 'COLOR',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_set_stroke_color = {
  type: 'graphics_bind_set_stroke_color',
  message0: 'set stroke color to %1',
  args0: [
    {
      type: 'input_value',
      name: 'COLOR',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_set_stroke_width = {
  type: 'graphics_bind_set_stroke_width',
  message0: 'set stroke width to %1',
  args0: [
    {
      type: 'input_value',
      name: 'WIDTH',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_draw_arc = {
  type: 'graphics_bind_draw_arc',
  message0: 'draw arc from %1° to %2° at x: %3 y: %4 with radius: %5',
  args0: [
    {
      type: 'input_value',
      name: 'START',
    },
    {
      type: 'input_value',
      name: 'END',
    },
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
    {
      type: 'input_value',
      name: 'RADIUS',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_fill_arc = {
  type: 'graphics_bind_fill_arc',
  message0: 'fill arc from %1° to %2° at x: %3 y: %4 with radius: %5',
  args0: [
    {
      type: 'input_value',
      name: 'START',
    },
    {
      type: 'input_value',
      name: 'END',
    },
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
    {
      type: 'input_value',
      name: 'RADIUS',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_draw_circle = {
  type: 'graphics_bind_draw_circle',
  message0: 'draw circle at x: %1 y: %2 with radius: %3',
  args0: [
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
    {
      type: 'input_value',
      name: 'RADIUS',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}
const graphics_bind_fill_circle = {
  type: 'graphics_bind_fill_circle',
  message0: 'fill circle at x: %1 y: %2 with radius: %3',
  args0: [
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
    {
      type: 'input_value',
      name: 'RADIUS',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_draw_rect = {
  type: 'graphics_bind_draw_rect',
  message0: 'draw rect at x: %1 y: %2 with width: %3 height: %4',
  args0: [
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
    {
      type: 'input_value',
      name: 'W',
    },
    {
      type: 'input_value',
      name: 'H',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_fill_rect = {
  type: 'graphics_bind_fill_rect',
  message0: 'draw rect at x: %1 y: %2 with width: %3 height: %4',
  args0: [
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
    {
      type: 'input_value',
      name: 'W',
    },
    {
      type: 'input_value',
      name: 'H',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_draw_line = {
  type: 'graphics_bind_draw_line',
  message0: 'draw line from x: %1 y: %2 to x: %3 y: %4',
  args0: [
    {
      type: 'input_value',
      name: 'X1',
    },
    {
      type: 'input_value',
      name: 'Y1',
    },
    {
      type: 'input_value',
      name: 'X2',
    },
    {
      type: 'input_value',
      name: 'Y2',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_set_alignment = {
  type: 'graphics_bind_set_alignment',
  message0: 'set text alignment to %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'ALIGNMENT',
      options: [
        ['left', 'L'],
        ['center', 'C'],
        ['right', 'R'],
      ],
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_draw_text = {
  type: 'graphics_bind_draw_text',
  message0: 'write %1 in font %2 at x: %3 y: %4',
  args0: [
    {
      type: 'input_value',
      name: 'TEXT',
    },
    {
      type: 'field_dropdown',
      name: 'FONT',
      options: [
        ['gothic 18 bold', 'FONT_KEY_GOTHIC_18_BOLD'],
        ['gothic 24', 'FONT_KEY_GOTHIC_24'],
        ['gothic 09', 'FONT_KEY_GOTHIC_09'],
        ['gothic 14', 'FONT_KEY_GOTHIC_14'],
        ['gothic 14 bold', 'FONT_KEY_GOTHIC_14_BOLD'],
        ['gothic 18', 'FONT_KEY_GOTHIC_18'],
        ['gothic 24 bold', 'FONT_KEY_GOTHIC_24_BOLD'],
        ['gothic 28', 'FONT_KEY_GOTHIC_28'],
        ['gothic 28 bold', 'FONT_KEY_GOTHIC_28_BOLD'],
        ['bitham 30 black', 'FONT_KEY_BITHAM_30_BLACK'],
        ['bitham 42 bold', 'FONT_KEY_BITHAM_42_BOLD'],
        ['bitham 42 light', 'FONT_KEY_BITHAM_42_LIGHT'],
        ['bitham 42 medium numbers', 'FONT_KEY_BITHAM_42_MEDIUM_NUMBERS'],
        ['bitham 34 medium numbers', 'FONT_KEY_BITHAM_34_MEDIUM_NUMBERS'],
        ['bitham 34 light subset', 'FONT_KEY_BITHAM_34_LIGHT_SUBSET'],
        ['bitham 18 light subset', 'FONT_KEY_BITHAM_18_LIGHT_SUBSET'],
        ['roboto condensed 21', 'FONT_KEY_ROBOTO_CONDENSED_21'],
        ['roboto bold subset 49', 'FONT_KEY_ROBOTO_BOLD_SUBSET_49'],
        ['droid serif 28 bold', 'FONT_KEY_DROID_SERIF_28_BOLD'],
        ['leco 20 bold numbers', 'FONT_KEY_LECO_20_BOLD_NUMBERS'],
        ['leco 26 bold numbers am pm', 'FONT_KEY_LECO_26_BOLD_NUMBERS_AM_PM'],
        ['leco 32 bold numbers', 'FONT_KEY_LECO_32_BOLD_NUMBERS'],
        ['leco 36 bold numbers', 'FONT_KEY_LECO_36_BOLD_NUMBERS'],
        ['leco 38 bold numbers', 'FONT_KEY_LECO_38_BOLD_NUMBERS'],
        ['leco 42 numbers', 'FONT_KEY_LECO_42_NUMBERS'],
        ['leco 28 light numbers', 'FONT_KEY_LECO_28_LIGHT_NUMBERS'],
        ['fallback', 'FONT_KEY_FONT_FALLBACK'],
      ],
    },
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_bind_path_scope = {
  type: 'graphics_bind_path_scope',
  message0: 'record path %1 %2 and draw %3',
  args0: [
    {
      type: 'input_dummy',
    },
    {
      type: 'input_statement',
      name: 'DO',
    },
    {
      type: 'field_dropdown',
      name: 'MODE',
      options: [
        ['filled', 'FILLED'],
        ['outlined (closed)', 'OUTLINED'],
        ['outlined (open)', 'OUTLINED_OPEN'],
      ],
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 100,
}

const graphics_bind_path_move_to = {
  type: 'graphics_bind_path_move_to',
  message0: 'move to x: %1 y: %2',
  args0: [
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 100,
}

const graphics_bind_path_move_by = {
  type: 'graphics_bind_path_move_by',
  message0: 'move by x: %1 y: %2',
  args0: [
    {
      type: 'input_value',
      name: 'X',
    },
    {
      type: 'input_value',
      name: 'Y',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 100,
}

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  // BEGIN BLOCKS
  events_on_button_pressed,
  events_main,
  events_on_tapped,
  events_on_time_change,
  controls_wait,
  time_wall_time,
  time_time_24h,
  time_time,
  sensors_accelerometer,
  sensors_battery,
  sensors_battery_state,
  sensors_phone_connected,
  sensors_current_watch_model,
  sensors_watch_model,
  sensors_current_watch_color,
  sensors_watch_color,

  graphics_color,
  graphics_bind_set_fill_color,
  graphics_bind_set_stroke_color,
  graphics_bind_set_stroke_width,
  graphics_bind_draw_arc,
  graphics_bind_fill_arc,
  graphics_bind_draw_circle,
  graphics_bind_fill_circle,
  graphics_bind_draw_rect,
  graphics_bind_fill_rect,
  graphics_bind_draw_line,
  graphics_bind_set_alignment,
  graphics_bind_draw_text,
  graphics_bind_path_scope,
  graphics_bind_path_move_to,
  graphics_bind_path_move_by,
  // END BLOCKS
])
