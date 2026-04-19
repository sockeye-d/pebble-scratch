const workspaceStorageKey = 'workspace'

const watchToken = encodeURIComponent(Pebble.getWatchToken())

Pebble.addEventListener('showConfiguration', () => {
  console.log(`Watch token is ${watchToken}`)
  const savedData = localStorage.getItem(workspaceStorageKey)
  Pebble.openURL(
    `https://fishies.dev/pebble-scratch${savedData === null ? '' : `?workspace=${encodeURIComponent(savedData)}`}`
  )
  // Pebble.openURL(`https://localhost:8080/`)
})

pebble.addEventListener('webviewclosed', (e) => {
  const response = e.response
  console.log(response)
})
