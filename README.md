# Vroom

Virtual rooms for remote workers

## Getting started 

Grab dependencies:
```sh
npm i
```

Build:
```sh
npm run build:app
npm run build:server
```

## Local Development

Start app:
```sh
npm start
```

Start server:
```sh
node dist/server
```

## Production

On client-side in `websockets.js`, you'll need to supply a valid HTTPS URL:
```js
// Change this:
ws = new WebSocket("ws://127.0.0.1:8888/ws");
// To this:
ws = new WebSocket("wss://your-domain.com/ws");
```

On the server, you'll need to construct `SSLApp` with valid SSL cert/key files:
```js
// Change this:
const app = uWS.App()
// To this:
const app = uWS.SSLApp({
  key_file_name: "privkey.pem",
  cert_file_name: "cert.pem"
})
```

Then configure nginx reverse proxy for websockets accordingly.

## Todo
- Auto scroll to bottom on new message
- Send on 'Enter'
- Enable mic input and change sprite when voice detected (for use with other voice chatting software)
- If not, build our own WebRTC audio with relay server (MCU or SFU?)
- Ephemeral text messaging
- Pixi text sprites for usernames to follow user's character
- Allow users to change username
- World objects for further interactions e.g. mic stand
