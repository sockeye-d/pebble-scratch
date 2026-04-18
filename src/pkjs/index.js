const watchToken = encodeURIComponent(Pebble.getWatchToken())

Pebble.addEventListener('showConfiguration', () => {
  Pebble.openURL(`https://fishies.dev/pebble-scratch?token=${watchToken}`)
})

const websocket = new WebSocket(`ws://192.168.1.219/to-phone/${watchToken}`)
websocket.onmessage = (ev) => {
  const data = ev.data
  console.log(data)
}
