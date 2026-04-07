/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core'

const events_main = {
  type: 'events_main',
  message0: 'Main %1 %2',
  args0: [
    {
      type: 'input_dummy',
      name: 'NAME',
    },
    {
      type: 'input_statement',
      name: 'CONTENT',
    },
  ],
  colour: 160,
}

const constant = {
  type: 'constant',
  message0: '%1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'TYPE',
      options: [
        ['π', 'PI'],
        ['2π', '2PI'],
        ['e', 'E'],
        ['sqrt(2)', 'SQRT_2'],
      ],
    },
  ],
  output: null,
  inputsInline: true,
  color: 330,
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

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([events_main, constant, text_find])
