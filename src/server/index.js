const uWS = require('./uws.js');
const { uuid } = require('uuidv4');
const port = 7777;

const decoder = new TextDecoder('utf-8');

const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  SELF_UPDATE: "SELF_UPDATE",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
  CLIENT_UPDATE: "CLIENT_UPDATE",
  PING: "PING",
  PONG: "PONG"
})

const charNames = ["blob", "croc", "mosquito", "orange", "spaceman", "worm"]

let sockets = [];

const app = uWS.App()
  .ws('/ws', {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 15,

    open: (ws, req) => {
      ws.id = uuid();
      ws.name = createName(getRandomInt());
      ws.char = charNames[Math.floor(Math.random() * charNames.length)];
      ws.pos = {
        x: 0,
        y: 0
      };

      ws.subscribe(MESSAGE_ENUM.CLIENT_CONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_DISCONNECTED);
      ws.subscribe(MESSAGE_ENUM.CLIENT_MESSAGE);
      ws.subscribe(MESSAGE_ENUM.CLIENT_UPDATE);

      sockets.push(ws);
      console.log(sockets);

      let socketMsg = {
        message_type: MESSAGE_ENUM.SELF_CONNECTED,
        body: {
          name: ws.name,
          char: ws.char,
          pos: ws.pos
        }
      }

      let pubMsg = {
        message_type: MESSAGE_ENUM.CLIENT_CONNECTED,
        body: {
          id: ws.id,
          name: ws.name,
          char: ws.char,
          pos: ws.pos
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
        case MESSAGE_ENUM.SELF_UPDATE:
          updatePos(ws, clientMessage.body.x, clientMessage.body.y);
          break;
        case MESSAGE_ENUM.PING:
          serverMessage = {
            message_type: MESSAGE_ENUM.PONG
          };
          ws.send(JSON.stringify(serverMessage));
          break;
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

      let pubMsg = {
        message_type: MESSAGE_ENUM.CLIENT_DISCONNECTED,
        body: {
          id: ws.id,
          name: ws.name
        }
      }

      console.log(sockets);
      app.publish(MESSAGE_ENUM.CLIENT_DISCONNECTED, JSON.stringify(pubMsg));
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

function updatePos(ws, xPos, yPos) {
  sockets.find((socket, index) => {
    if (socket && socket.id === ws.id) {
      sockets[index].x = xPos;
      sockets[index].y = yPos;
    }
  });
}

function getRandomInt() {
  return Math.floor(Math.random() * Math.floor(9999));
}

function tick() {
  let pubMsg = {
    message_type: MESSAGE_ENUM.CLIENT_UPDATE,
    body: { sockets: sockets }
  }

  app.publish(MESSAGE_ENUM.CLIENT_UPDATE, JSON.stringify(pubMsg));
}

setInterval(tick, 1000);