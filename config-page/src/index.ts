import * as Blockly from 'blockly'
import * as core from './blocks/core_blocks'
import * as pebble from './blocks/pebble_blocks'
import { save, load } from './serialization'
import { toolbox } from './toolbox'
import './index.css'
import DarkTheme from '@blockly/theme-dark'
import * as bytecode from './generators/bytecode'
import { ColorField } from './inputs/ColorInput'

Blockly.fieldRegistry.register('field_color', ColorField)
Blockly.common.defineBlocks(core.blocks)
Blockly.common.defineBlocks(pebble.blocks)

const theme = Blockly.Theme.defineTheme('theme', {
  name: 'theme',
  base: DarkTheme,
  categoryStyles: {
    events_category: { colour: '10' },
    controls_category: { colour: '45' },
    layers_category: { colour: '80' },
    time_category: { colour: '250' },
    sensors_category: { colour: '280' },
    graphics_category: { colour: '80' },
  },
})

const blocklyDiv = document.getElementById('blocklyDiv')!
const output = document.getElementById('generatedCode')!

class CompactZelosConstants extends Blockly.zelos.ConstantProvider {
  constructor() {
    super(3)
  }
}

class CompactZelosRenderer extends Blockly.zelos.Renderer {
  makeConstants_() {
    return new CompactZelosConstants()
  }
}

Blockly.blockRendering.register('compact_zelos', CompactZelosRenderer)

const ws = Blockly.inject(blocklyDiv, {
  toolbox: { kind: 'categoryToolbox', contents: [] },
  renderer: 'compact_zelos',
  theme: theme,
  zoom: {
    controls: true,
  },
})

ws.updateToolbox(toolbox(ws))

ws.getAllBlocks().forEach((e) => e.dispose(false, false))

const body = document.querySelector('body')

if (body != null) {
  body.style.setProperty('--bg-color', theme.getComponentStyle('workspaceBackgroundColour'))
  body.style.setProperty('--text-color', theme.getComponentStyle('toolboxForegroundColour'))
}

// const urlParams = new URLSearchParams(window.location.search)
// const watchToken = urlParams.get('token')
// const websocket = watchToken ? new WebSocket(`wss://192.168.1.219:8080/from-page/${watchToken}`) : null

function recompile() {
  const blocks = ws.getAllBlocks()
  if (blocks.length == 0) {
    return
  }
  output.innerText = ''
  const compiler = new bytecode.Compiler(ws)
  for (const block of blocks) {
    bytecode.disassembleToHtml(ws, output, compiler.compile(block))
    const divider = document.createTextNode('---')
    output.appendChild(divider)
  }
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
}
