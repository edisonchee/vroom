const uWS = require('./uws.js');
const { uuid } = require('uuidv4');
const port = 7777;

const decoder = new TextDecoder('utf-8');

const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
  PING: "PING",
  PONG: "PONG"
})

let sockets = [];

const app = uWS.App()
  .ws('/ws', {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 15,

    open: (ws, req) => {
      ws.id = uuid();
      ws.name = createName(getRandomInt());

      ws.subscribe(MESSAGE_ENUM.CLIENT_CONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_DISCONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_MESSAGE);

      sockets.push(ws);
      console.log(sockets);

      let socketMsg = {
        message_type: MESSAGE_ENUM.SELF_CONNECTED,
        body: {
          name: ws.name
        }
      }

      let pubMsg = {
        message_type: MESSAGE_ENUM.CLIENT_CONNECTED,
        body: {
          id: ws.id,
          name: ws.name
        }
      }

      ws.send(JSON.stringify(socketMsg));
      app.publish(MESSAGE_ENUM.CLIENT_CONNECTED, JSON.stringify(pubMsg));
    },
    message: (ws, message, isBinary) => {
      // message from client
      let clientMessage = JSON.parse(decoder.decode(message));
      let serverMessage = {};
      clientMessage.message_type === MESSAGE_ENUM.PING ? '' : console.log(clientMessage);
      
      switch (clientMessage.message_type) {
        case MESSAGE_ENUM.PING:
          serverMessage = {
            message_type: MESSAGE_ENUM.PONG
          };
          ws.send(JSON.stringify(serverMessage));
        case MESSAGE_ENUM.CLIENT_MESSAGE:
          serverMessage = {
            message_type: clientMessage.message_type,
            sender: ws.name,
            body: clientMessage.body
          };
          app.publish(serverMessage.message_type, JSON.stringify(serverMessage));
          break;
        default:
          console.log("Unknown message type");
      }
    },
    drain: ws => {

    },
    close: (ws, code, message) => {
      /* The library guarantees proper unsubscription at close */
      sockets.find((socket, index) => {
        if (socket && socket.id === ws.id) {
          sockets.splice(index, 1);
        }
      });
      console.log(sockets);
    }
  }).any('/*', (res, req) => {
    console.log(req);
    res.end('Nothing to see here!');
  }).listen(port, token => {
    if (token) {
      console.log('Listening to port ' + port);
    } else {
      console.log('Failed to listen to port ' + port);
    }
  });

function createName(randomInt) {
  return sockets.find(ws => ws.name === `user-${randomInt}`) ? 
  createName(getRandomInt()) : 
  `user-${randomInt}`
}

function getRandomInt() {
  return Math.floor(Math.random() * Math.floor(9999));
}