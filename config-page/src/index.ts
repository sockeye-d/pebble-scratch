import * as Blockly from 'blockly'
import * as core from './blocks/core_blocks'
import * as pebble from './blocks/pebble_blocks'
import { save, load } from './serialization'
import { toolbox } from './toolbox'
import './index.css'
import DarkTheme from '@blockly/theme-dark'
import * as bytecode from './generators/bytecode'
import { ColorField } from './inputs/ColorInput'
import { compileAllBlocks } from './compiler'

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
const logOutput = document.getElementById('logOutput')!
const bigGreenButton = document.getElementById('runButton')!

{
  const makeLoggerFunction =
    (base: (...args: any[]) => void, clazz: string) =>
    (...args: any[]) => {
      for (const arg of args) {
        const child = document.createElement('p')
        child.className = `output output-${clazz}`
        child.innerText = typeof arg == 'string' ? arg : JSON.stringify(arg)
        logOutput.appendChild(child)
      }
      base(...args)
    }
  console.log = makeLoggerFunction(console.log, 'log')
  console.warn = makeLoggerFunction(console.warn, 'warn')
  console.error = makeLoggerFunction(console.error, 'error')
}

console.log('This is a log')
console.warn('This is a warn')
console.error('This is an error')

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

function recompile() {
  const blocks = ws.getAllBlocks()
  if (blocks.length == 0) {
    return
  }
  output.innerText = ''
  const compiler = new bytecode.Compiler(ws)
  for (const block of blocks) {
    if (block.getParent() !== null) {
      continue
    }
    const compilationResult = compiler.compile(block)
    if (compilationResult.length === 1 && compilationResult[0].type === 'nil') {
      const attempt2 = compiler.compileNull(block.getInputTargetBlock('DO'))
      bytecode.disassembleToHtml(ws, output, attempt2)
    } else {
      bytecode.disassembleToHtml(ws, output, compilationResult)
    }
    const divider = document.createElement('div')
    divider.style = 'height: 1px; background-color: var(--text-color); margin: 1rem 0 1rem 0; opacity: 0.5;'
    output.appendChild(divider)
  }
}

function convertU32toU8(u32: number) {
  return [(u32 << 0) & 0xff, (u32 << 2) & 0xff, (u32 << 4) & 0xff, (u32 << 6) & 0xff]
}

bigGreenButton.onclick = () => {
  const compiler = new bytecode.Compiler(ws)
  const compilationResult = compileAllBlocks(ws, compiler)
  const workspaceData = save(ws)
  // let string = ''
  // for (const e of compilationResult.bytecode) {
  //   console.log(`${e}`)
  //   string += convertU32toU8(e)
  //     .map((c) => String.fromCharCode(c))
  //     .join('')
  // }
  console.log(compilationResult.bytecode)
  const data = {
    ws: workspaceData,
    bytecode: [...compilationResult.bytecode],
    handlers: compilationResult.handlers,
  }
  if (window.confirm('Close?')) {
    location.href = `pebblejs://close#${encodeURIComponent(JSON.stringify(data))}`
  }
}

if (ws) {
  const urlParams = new URLSearchParams(window.location.search)
  const workspaceString = urlParams.get('workspace')
  console.log(`Loading from workspace string \`${workspaceString}\``)
  load(ws, workspaceString)

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
