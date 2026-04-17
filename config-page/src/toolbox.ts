import * as blockly from 'blockly'
import { ConnectionState } from 'blockly/core/serialization/blocks'
import { BlockInfo, ToolboxDefinition } from 'blockly/core/utils/toolbox'

console.log('MAKING TOOLBOX')

function makeDefaultBlock(workspace: blockly.Workspace, blockName: string): BlockInfo {
  const block = workspace.newBlock(blockName)
  if (block === undefined) {
    return {
      kind: 'block',
      type: blockName,
    }
  }

  return {
    kind: 'block',
    type: blockName,
    inputs: makeNumberInputs({}, ...block.inputList.map((e) => e.name)),
  }
}

function makeNumberInputs(
  obj: {
    [key: string]: ConnectionState
  },
  ...inputs: (string | { name: string; value: number })[]
): {
  [key: string]: ConnectionState
} {
  for (const input of inputs) {
    if (typeof input === 'object') {
      obj[input.name] = {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: input.value,
          },
        },
      }
    } else if (typeof input === 'string') {
      obj[input] = {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 0.0,
          },
        },
      }
    }
  }
  return obj
}

export const toolbox = (workspace: blockly.Workspace): ToolboxDefinition => {
  return {
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
            type: 'graphics_bind_set_fill_color',
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
            type: 'graphics_bind_set_stroke_width',
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
          {
            kind: 'block',
            type: 'graphics_bind_set_stroke_color',
            inputs: {
              COLOR: {
                shadow: {
                  type: 'graphics_color',
                },
              },
            },
          },
          makeDefaultBlock(workspace, 'graphics_bind_draw_arc'),
          makeDefaultBlock(workspace, 'graphics_bind_fill_arc'),
          makeDefaultBlock(workspace, 'graphics_bind_draw_circle'),
          makeDefaultBlock(workspace, 'graphics_bind_fill_circle'),
          makeDefaultBlock(workspace, 'graphics_bind_draw_rect'),
          makeDefaultBlock(workspace, 'graphics_bind_fill_rect'),
          makeDefaultBlock(workspace, 'graphics_bind_draw_line'),
          {
            kind: 'block',
            type: 'graphics_bind_set_alignment',
          },
          {
            kind: 'block',
            type: 'graphics_bind_draw_text',
            inputs: makeNumberInputs(
              {
                TEXT: {
                  shadow: {
                    type: 'text',
                    fields: {
                      TEXT: 'pebble :)',
                    },
                  },
                },
              },
              'X',
              'Y'
            ),
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
}
