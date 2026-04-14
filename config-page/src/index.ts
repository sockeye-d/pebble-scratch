import * as Blockly from 'blockly'
import * as core from './blocks/core_blocks'
import * as pebble from './blocks/pebble_blocks'
import { save, load } from './serialization'
import { toolbox } from './toolbox'
import './index.css'
import * as layers from './layers'
import DarkTheme from '@blockly/theme-dark'
import * as bytecode from './generators/bytecode'

Blockly.common.defineBlocks(core.blocks)
Blockly.common.defineBlocks(pebble.blocks)
Blockly.common.defineBlocks(layers.blocks)
Blockly.serialization.registry.register('layerSerializer', layers.serializer)

const theme = Blockly.Theme.defineTheme('theme', {
  name: 'theme',
  base: DarkTheme,
  categoryStyles: {
    events_category: { colour: '10' },
    controls_category: { colour: '45' },
    layers_category: { colour: '60' },
    time_category: { colour: '250' },
    sensors_category: { colour: '280' },
  },
})

console.log(theme)

// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv')!
const output = document.getElementById('generatedCode')!

const ws = Blockly.inject(blocklyDiv, { toolbox, renderer: 'zelos', theme: theme })

const body = document.querySelector('body')

if (body != null) {
  body.style.setProperty('--bg-color', theme.getComponentStyle('workspaceBackgroundColour'))
  body.style.setProperty('--text-color', theme.getComponentStyle('toolboxForegroundColour'))
}

function recompile() {
  const blocks = ws.getAllBlocks()
  if (blocks.length == 0) {
    return
  }
  const block = blocks[0]
  const compiler = new bytecode.Compiler(ws)
  const code = compiler.compile(block)
  const disassembly = bytecode.disassemble(code)
  output.innerText = disassembly
}

if (ws) {
  load(ws)

  recompile()

  ws.addChangeListener((e) => {
    if (e.isUiEvent) return
    save(ws)
  })

  ws.addChangeListener((e) => {
    if (e.type === Blockly.Events.VAR_DELETE) {
      const toolbox = ws.getToolbox()
      toolbox?.refreshSelection()
    }
    if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || ws.isDragging()) {
      return
    }
    recompile()
  })

  ws.registerToolboxCategoryCallback('LAYER', (ws) => {
    const items: Blockly.utils.toolbox.FlyoutItemInfo[] = []

    // Build whatever blocks you want to show
    items.push({
      kind: 'button',
      text: 'Create layer...',
      callbackkey: 'CREATE_LAYER',
    })

    for (const layer of layers.layers) {
      items.push({
        kind: 'button',
        text: `Delete layer '${layer.name}'`,
        callbackkey: 'DELETE_LAYER',
      })
    }

    if (layers.layers.length > 0) {
      items.push({
        kind: 'block',
        type: 'layer_on_draw',
      })
      items.push({
        kind: 'block',
        type: 'layer_draw',
      })
    }

    return items
  })

  ws.registerButtonCallback('CREATE_LAYER', (p) => {
    const result = prompt('Layer name')
    if (result == null) {
      return
    }
    layers.layers.push({ name: result })
  })

  ws.registerButtonCallback('DELETE_LAYER', (p) => {
    const name: string = p.getButtonText().slice(14, p.getButtonText().length - 1)
    if (confirm(`Delete layer '${name}'?`)) {
      const index = layers.layers.findIndex((e) => e.name == name)
      layers.layers.splice(index, 1)
    }
  })
}
