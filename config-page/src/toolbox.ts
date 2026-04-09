/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolboxDefinition } from 'blockly/core/utils/toolbox'

/*
This toolbox contains nearly every single built-in block that Blockly offers,
in addition to the custom block 'add_text' this sample app adds.
You probably don't need every single block, and should consider either rewriting
your toolbox from scratch, or carefully choosing whether you need each block
listed here.
*/

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
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_if',
        },
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
        {
          kind: 'block',
          type: 'controls_repeat_ext',
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
          type: 'controls_whileUntil',
          inputs: {
            BOOL: {
              shadow: {
                type: 'logic_boolean',
                fields: {
                  BOOL: 'TRUE',
                },
              },
            },
          },
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
          type: 'text_indexOf',
          inputs: {
            VALUE: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'abc',
                },
              },
            },
            FIND: {
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
              },
            },
            TO: {
              shadow: {
                type: 'text',
              },
            },
            TEXT: {
              shadow: {
                type: 'text',
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
      categorystyle: 'variable_category',
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
