import * as blockly from 'blockly'
import { ISerializer } from 'blockly/core/serialization'
import { PebbleLayer } from './PebbleLayer'

export let layers: PebbleLayer[] = []

type LayerSerializer = {
  layers: PebbleLayer[]
}

export const serializer: ISerializer = {
  priority: 10000,
  save(_workspace: blockly.Workspace): LayerSerializer | null {
    return layers.length == 0 ? null : { layers }
  },
  load(state: LayerSerializer, _workspace: blockly.Workspace): void {
    layers = state.layers ?? []
  },
  clear(_workspace: blockly.Workspace): void {
    layers.length = 0
  },
}

function getLayerOptions() {
  return layers.length == 0 ? [['none', 'NONE']] : layers.map((e) => [e.name, e.name])
}

const layer_on_draw = {
  type: 'layer_on_draw',
  message0: 'On layer %2 draw %1 %3',
  args0: [
    { type: 'input_dummy' },
    {
      type: 'field_dropdown',
      name: 'BUTTON',
      options: getLayerOptions,
    },
    {
      type: 'input_statement',
      name: 'CONTENT',
    },
  ],
  colour: 5,
}

const layer_draw = {
  type: 'layer_draw',
  message0: 'Redraw layer %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'BUTTON',
      options: getLayerOptions,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 5,
}

export const blocks = blockly.common.createBlockDefinitionsFromJsonArray([layer_draw, layer_on_draw])
