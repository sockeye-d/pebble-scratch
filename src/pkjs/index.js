// const Clay = require('pebble-clay')
// const settingsPage = require('./testing.html')
// const settingsPage = `
//   <!DOCTYPE html>
//   <html lang="en">
//       <head>
//           <meta charset="utf-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
//           <script>
//               console.log("The document has been opened. Yippee");
//           </script>
//       </head>
//       <body>
//           <h1>Hi!</h1>
//       </body>
//   </html>
// `

// const clay = new Clay([]);
// console.log(clay.generateUrl());
Pebble.addEventListener('showConfiguration', openSettingsPage)

function openSettingsPage() {
    // const url = `data:text/html;charset=utf-8,${encodeURIComponent(settingsPage)}`
    // Pebble.openURL(url)
}
