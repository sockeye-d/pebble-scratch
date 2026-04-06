/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core'

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null)

forBlock['events_main'] = function (block: Blockly.Block, generator: Blockly.CodeGenerator) {
  const inner = generator.statementToCode(block, 'CONTENT')
  return inner
}
