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
  let data: any =
    workspaceJson ??
    (() => {
      console.log('Loading from local storage...')
      return window.localStorage?.getItem(storageKey)
    })()
  if (!data) {
    console.log('Failed to load data!')
    return
  }

  try {
    data = JSON.parse(data)
    if (typeof data == 'string') {
      data = JSON.parse(data)
    }
    Blockly.serialization.workspaces.load(data, workspace, { recordUndo: false })
    console.log('Loading complete!')
    console.log(`Loaded ${workspace.getAllBlocks().length} blocks`)
  } catch (e) {
    if (confirm('Something went wrong. Clear local storage?')) {
      window.localStorage.removeItem(storageKey)
    }
  }
}
