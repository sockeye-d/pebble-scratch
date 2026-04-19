'use strict'
var keys = require('message_keys')

/**
 * @type {'ready' | 'transmittingBytecode'}
 */
var transmissionState = 'ready'
var workspaceStorageKey = 'workspace'

Pebble.addEventListener('showConfiguration', () => {
  if (transmissionState === 'ready') {
    console.log(`Ready to open config page`)
    var savedData = localStorage.getItem(workspaceStorageKey)
    Pebble.openURL(
      `https://fishies.dev/pebble-scratch${savedData === null ? '' : `?workspace=${encodeURIComponent(savedData)}`}`
    )
  }
  // Pebble.openURL(`https://localhost:8080/`)
})

Pebble.addEventListener('webviewclosed', (e) => {
  var response = JSON.parse(e.response)
  console.log('Received response')
  localStorage.setItem(workspaceStorageKey, e.ws)
  startTransmission(response)
})

/**
 * @type {string}
 */
var bytecodeBuffer
/**
 * @type {number}
 */
var bytecodeBufferOffset = 0
function startTransmission(data) {
  bytecodeBuffer = data
  bytecodeBufferOffset = 0
  transmissionState = 'transmittingBytecode'
  transmitBytecode()
}

function transmitBytecode() {
  if (transmissionState !== 'transmittingBytecode') {
    return
  }
  var dict = { Bytecode: '' }
  var transmitted = 0
  for (; transmitted < 16; transmitted++) {
    if (bytecodeBufferOffset + transmitted > bytecodeBuffer.length) {
      transmissionState = 'ready'
      break
    }
    dict['Bytecode'] = bytecodeBuffer.charCodeAt(bytecodeBufferOffset + transmitted)
  }
  bytecodeBufferOffset += 16
  dict['Bytecode'] = activeData.bytecode
  Pebble.sendAppMessage(dict, () => {
    transmitBytecode()
  })
}
