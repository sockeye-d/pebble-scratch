import * as Blockly from 'blockly/core'

const controls_if = {
  type: 'controls_if',
  message0: 'if %1 then',
  message1: '%1',
  args0: [
    {
      type: 'input_value',
      name: 'CONDITION',
      check: 'Boolean',
    },
  ],
  args1: [
    {
      type: 'input_statement',
      name: 'DO',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 45,
}

const controls_if_else = {
  type: 'controls_if_else',
  message0: 'if %1 then',
  message1: '%1',
  message2: 'else',
  message3: '%1',
  args0: [
    {
      type: 'input_value',
      name: 'CONDITION',
      check: 'Boolean',
    },
  ],
  args1: [
    {
      type: 'input_statement',
      name: 'DO',
    },
  ],
  args3: [
    {
      type: 'input_statement',
      name: 'ELSE',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 45,
}

const controls_repeat = {
  type: 'controls_repeat',
  message0: 'repeat %1 %2',
  args0: [
    {
      type: 'input_value',
      name: 'TIMES',
    },
    {
      type: 'input_statement',
      name: 'DO',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 45,
}

const controls_while = {
  type: 'controls_while',
  message0: 'repeat %1 %2 %3',
  args0: [
    {
      type: 'field_dropdown',
      name: 'MODE',
      options: [
        ['while', 'WHILE'],
        ['until', 'UNTIL'],
      ],
      align: 'LEFT',
    },
    {
      type: 'input_value',
      name: 'BOOL',
      align: 'LEFT',
    },
    {
      type: 'input_statement',
      name: 'DO',
      align: 'LEFT',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 45,
}

const logic_boolean_yellow = {
  type: 'logic_boolean_yellow',
  message0: '%1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'BOOL',
      options: [
        ['true', 'TRUE'],
        ['false', 'FALSE'],
      ],
    },
  ],
  output: 'Boolean',
  colour: 45,
}

const math_unary = {
  type: 'math_unary',
  message0: '%1 of %2',
  args0: [
    {
      type: 'field_dropdown',
      name: 'TYPE',
      options: [
        ['sqrt', 'SQRT'],
        ['sin', 'SIN'],
        ['cos', 'COS'],
        ['log₂', 'LOG'],
        ['2^', 'POW'],
        ['abs', 'ABS'],
        ['round', 'ROUND'],
        ['floor', 'FLOOR'],
        ['ceil', 'CEIL'],
      ],
    },
    {
      type: 'input_value',
      name: 'NUM',
    },
  ],
  output: null,
  inputsInline: true,
  colour: 230,
}

const math_binary = {
  type: 'math_binary',
  message0: '%1 %2 %3',
  args0: [
    {
      type: 'input_value',
      name: 'A',
    },
    {
      type: 'field_dropdown',
      name: 'TYPE',
      options: [
        ['+', 'ADD'],
        ['-', 'SUB'],
        ['×', 'MUL'],
        ['÷', 'DIV'],
        ['%', 'MOD'],
      ],
    },
    {
      type: 'input_value',
      name: 'B',
    },
  ],
  output: null,
  inputsInline: true,
  colour: 230,
}

const math_clamp = {
  type: 'math_clamp',
  message0: 'clamp %1 between %2 and %3',
  args0: [
    {
      type: 'input_value',
      name: 'VAL',
    },
    {
      type: 'input_value',
      name: 'MIN',
    },
    {
      type: 'input_value',
      name: 'MAX',
    },
  ],
  output: null,
  inputsInline: true,
  colour: 230,
}

const math_constant = {
  type: 'constant',
  message0: '%1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'TYPE',
      options: [
        ['67', 'SIX_SEEEVEN'],
        ['π', 'PI'],
        ['2π', '2PI'],
        ['e', 'E'],
        ['sqrt(2)', 'SQRT_2'],
      ],
    },
  ],
  output: null,
  inputsInline: true,
  colour: 230,
}

const text_find = {
  type: 'text_find',
  message0: 'in text %1 find %2',
  args0: [
    {
      type: 'input_value',
      name: 'SUBJECT',
    },
    {
      type: 'input_value',
      name: 'WHAT',
    },
  ],
  output: null,
  inputsInline: true,
  colour: 160,
}

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  controls_if,
  controls_if_else,
  controls_repeat,
  controls_while,
  logic_boolean_yellow,
  math_unary,
  math_binary,
  math_constant,
  math_clamp,
  text_find,
])
