const uWS = require('./uws.js');
const { uuid } = require('uuidv4');
const port = 7777;

const MESSAGE_TYPES = {
  CLIENT_CONNECTED: 1,
}

let sockets = [];

const app = uWS.App()
  .ws('/ws', {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 10,

    open: (ws, req) => {
      ws.id = uuid();
      ws.name = getName(getRandomInt());

      ws.subscribe('CLIENT_CONNECTED');

      sockets.push(ws);

      let msg = {
        message_type: 'CLIENT_CONNECTED',
        data: ws
      }

      app.publish('CLIENT_CONNECTED', JSON.stringify(msg));
    },
    message: (ws, message, isBinary) => {
      // message from client
      console.log(message);
      /* Ok is false if backpressure was built up, wait for drain */
      // let ok = ws.send(JSON.stringify(ws), isBinary);
    },
    drain: (ws) => {

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

function getName(randomInt) {
  return sockets.find(ws => ws.name === `user-${randomInt}`) ? 
  createUser(getRandomInt()) : 
  `user-${randomInt}`
}

function getRandomInt() {
  return Math.floor(Math.random() * Math.floor(9999));
}