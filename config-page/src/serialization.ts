/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core'

const storageKey = 'mainWorkspace'

/**
 * Saves the state of the workspace to browser's local storage.
 * @param workspace Blockly workspace to save.
 */
export function save(workspace: Blockly.Workspace): string {
  const data = Blockly.serialization.workspaces.save(workspace)
  let stringData = JSON.stringify(data)
  window.localStorage?.setItem(storageKey, stringData)
  return stringData
}

/**
 * Loads saved state from local storage into the given workspace.
 * @param workspace Blockly workspace to load into.
 */
export function load(workspace: Blockly.Workspace, workspaceJson?: string | null) {
  const data =
    workspaceJson ??
    (() => {
      console.log('Loading from local storage...')
      return window.localStorage?.getItem(storageKey)
    })()
  if (!data) {
    console.log('Failed to load data!')
    return
  }

  // Don't emit events during loading.
  Blockly.Events.disable()
  try {
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, undefined)
  } catch (e) {
    if (confirm('Something went wrong. Clear local storage?')) {
      window.localStorage.removeItem(storageKey)
    }
  } finally {
    Blockly.Events.enable()
  }
  console.log('Loading complete!')
}
