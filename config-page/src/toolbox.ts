import { ToolboxDefinition } from 'blockly/core/utils/toolbox'

export const toolbox: ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Events',
      categorystyle: 'events_category',
      contents: [
        {
          kind: 'block',
          type: 'events_main',
        },
        {
          kind: 'block',
          type: 'events_on_button_pressed',
        },
        {
          kind: 'block',
          type: 'events_on_tapped',
        },
        {
          kind: 'block',
          type: 'events_on_time_change',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Controls',
      categorystyle: 'controls_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_if',
          inputs: {
            CONDITION: {
              shadow: {
                type: 'logic_boolean_yellow',
                fields: {
                  BOOL: 'FALSE',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_if_else',
          inputs: {
            CONDITION: {
              shadow: {
                type: 'logic_boolean_yellow',
                fields: {
                  BOOL: 'FALSE',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_repeat',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 67,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_while',
          inputs: {
            BOOL: {
              shadow: {
                type: 'logic_boolean_yellow',
                fields: {
                  BOOL: 'TRUE',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_wait',
          inputs: {
            SECONDS: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: '67',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_atomically',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'logic_compare',
        },
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
          kind: 'block',
          type: 'logic_negate',
        },
        {
          kind: 'block',
          type: 'logic_boolean',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      categorystyle: 'math_category',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
          fields: {
            NUM: 67,
          },
        },
        {
          kind: 'block',
          type: 'math_binary',
          fields: { TYPE: 'ADD' },
          inputs: {
            A: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 6,
                },
              },
            },
            B: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 7,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'math_unary',
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 67,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'constant',
          fields: {
            TYPE: 'SIX_SEEEVEN',
          },
        },
        {
          kind: 'block',
          type: 'math_clamp',
          inputs: {
            VAL: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 6.7,
                },
              },
            },
            MIN: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 6,
                },
              },
            },
            MAX: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 7,
                },
              },
            },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Text',
      categorystyle: 'text_category',
      contents: [
        {
          kind: 'block',
          type: 'text',
        },
        {
          kind: 'block',
          type: 'text_join',
        },
        {
          kind: 'block',
          type: 'text_length',
          inputs: {
            VALUE: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'abc',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'text_find',
          inputs: {
            SUBJECT: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'pebble time 2',
                },
              },
            },
            WHAT: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'time',
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'text_replace',
          inputs: {
            FROM: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'core',
                },
              },
            },
            TO: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'pebble',
                },
              },
            },
            TEXT: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'core time 2*',
                },
              },
            },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Time',
      categorystyle: 'time_category',
      contents: [
        {
          kind: 'block',
          type: 'time_wall_time',
        },
        {
          kind: 'block',
          type: 'time_time_24h',
        },
        {
          kind: 'block',
          type: 'time_time',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Sensors',
      categorystyle: 'sensors_category',
      contents: [
        {
          kind: 'block',
          type: 'sensors_accelerometer',
        },
        {
          kind: 'block',
          type: 'sensors_battery',
        },
        {
          kind: 'block',
          type: 'sensors_battery_state',
        },
        {
          kind: 'block',
          type: 'sensors_phone_connected',
        },
        {
          kind: 'block',
          type: 'sensors_current_watch_model',
        },
        {
          kind: 'block',
          type: 'sensors_watch_model',
          fields: {
            MODEL: 'PEBBLE_TIME',
          },
        },
        {
          kind: 'block',
          type: 'sensors_current_watch_color',
        },
        {
          kind: 'block',
          type: 'sensors_watch_color',
          fields: {
            COLOR: 'WATCH_INFO_COLOR_TIME_STEEL_GOLD',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Graphics',
      categorystyle: 'graphics_category',
      contents: [
        {
          kind: 'block',
          type: 'graphics_color',
        },
        {
          kind: 'block',
          type: 'graphics_set_fill_color',
          inputs: {
            COLOR: {
              shadow: {
                type: 'graphics_color',
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'graphics_set_stroke_color',
          inputs: {
            COLOR: {
              shadow: {
                type: 'graphics_color',
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'graphics_set_stroke_width',
          inputs: {
            WIDTH: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 6.7,
                },
              },
            },
          },
        },
      ],
    },
    {
      kind: 'sep',
    },
    {
      kind: 'category',
      name: 'Variables',
      categorystyle: 'variable_category',
      custom: 'VARIABLE',
    },
    {
      kind: 'category',
      name: 'Layers',
      categorystyle: 'layers_category',
      custom: 'LAYER',
    },
    {
      kind: 'category',
      name: 'Functions',
      categorystyle: 'procedure_category',
      custom: 'PROCEDURE',
    },
  ],
}
