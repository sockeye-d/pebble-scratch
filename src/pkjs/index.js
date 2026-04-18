console.log('hi')

const watchToken = encodeURIComponent(Pebble.getWatchToken())

Pebble.addEventListener('showConfiguration', () => {
  console.log(`Watch token is ${watchToken}`)
  Pebble.openURL(`https://fishies.dev/pebble-scratch?token=${watchToken}`)
})

console.log(`Opening websocket...`)
const websocket = new WebSocket(`ws://192.168.1.219:8080/to-phone/${watchToken}`)
console.log(`Opened websocket ${websocket}`)
websocket.onmessage = (ev) => {
  const data = ev.data
  console.log(data)
}
