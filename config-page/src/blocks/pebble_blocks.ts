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

const graphics_set_fill_color = {
  type: 'graphics_set_fill_color',
  message0: 'set color to %1',
  args0: [
    {
      type: 'input_value',
      name: 'COLOR',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_set_stroke_color = {
  type: 'graphics_set_stroke_color',
  message0: 'set stroke color to %1',
  args0: [
    {
      type: 'input_value',
      name: 'COLOR',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

const graphics_set_stroke_width = {
  type: 'graphics_set_stroke_width',
  message0: 'set stroke width to %1',
  args0: [
    {
      type: 'input_value',
      name: 'WIDTH',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 80,
}

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
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
  graphics_set_fill_color,
  graphics_set_stroke_color,
  graphics_set_stroke_width,
])
