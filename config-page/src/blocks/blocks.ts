/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core'

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
const main = {
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

// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([main])
