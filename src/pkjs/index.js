console.log('hi')

const watchToken = encodeURIComponent(Pebble.getWatchToken())

Pebble.addEventListener('showConfiguration', () => {
  console.log(`Watch token is ${watchToken}`)
  Pebble.openURL(`https://fishies.dev/pebble-scratch?token=${watchToken}`)
  // Pebble.openURL(`https://localhost:8080/`)
})
