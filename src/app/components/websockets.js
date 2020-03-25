import { DOM_EL, selfData, syncStates, addPlayer, removePlayer, updatePlayers, createPlayerSprite, removePlayerSprite, setupSelfChar } from '../index';

let ws;

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

let wsTimeout = null;

export const setupWS = () => {
  ws = new WebSocket("ws://127.0.0.1:7777/ws");
  ws.onopen = evt =>{
    wsTimeout = setTimeout(ping, 10000);
  
    ws.onmessage = evt => {
      let msg = JSON.parse(evt.data);
      switch (msg.message_type) {
        case MESSAGE_ENUM.PONG:
          wsTimeout = setTimeout(ping, 10000);
          break;
        case MESSAGE_ENUM.CLIENT_UPDATE:
          // update positions for all sprites
          updatePlayers(msg.body.sockets);
          break;
        case MESSAGE_ENUM.CLIENT_CONNECTED:
          logMessage(msg);
          // update game state
          addPlayer(msg.body);
          // create sprite
          createPlayerSprite(msg.body);
          break;
        case MESSAGE_ENUM.CLIENT_DISCONNECTED:
          logMessage(msg);
          // remove sprite
          removePlayerSprite(msg.body);
          // update game state
          removePlayer(msg.body);
          break;
        case MESSAGE_ENUM.CLIENT_MESSAGE:
          printMessage(msg);
          break;
        case MESSAGE_ENUM.SELF_CONNECTED:
          selfData.id = msg.body.self.id;
          selfData.name = msg.body.self.name;
          selfData.char = msg.body.self.char;
          selfData.pos = msg.body.self.pos;
          setupSelfChar();
          syncStates(msg.body.sockets);
          DOM_EL.username.innerText = `You are ${selfData.name}`;
          break;
        default:
          console.log("Unknown message type");
      }
    };
  };
}

const ping = () => {
  clearTimeout(wsTimeout);
  let msg = {
    message_type: MESSAGE_ENUM.PING
  }
  ws.send(JSON.stringify(msg));
}

export const sendPos = () => {
  let msg = {
    message_type: MESSAGE_ENUM.SELF_UPDATE,
    body: {
      pos: {
        x: selfData.pos.x,
        y: selfData.pos.y
      }
    }
  }

  ws.send(JSON.stringify(msg));
}

export const sendMessage = evt => {
  let msg = {
    message_type: MESSAGE_ENUM.CLIENT_MESSAGE,
    body: DOM_EL.chatInput.value
  }
  ws.send(JSON.stringify(msg));
  DOM_EL.chatInput.value = "";
}

const printMessage = msg => {
  let listEl = document.createElement('li');
  let usernameSpanEl = document.createElement('span');
  let textSpanEl = document.createElement('span');

  usernameSpanEl.classList.add('username');
  usernameSpanEl.innerText = msg.sender;
  textSpanEl.classList.add('text');
  textSpanEl.innerText = msg.body;

  listEl.appendChild(usernameSpanEl);
  listEl.appendChild(textSpanEl);

  DOM_EL.chatLog.appendChild(listEl);
}

const logMessage = msg => {
  let listEl = document.createElement('li');
  let usernameSpanEl = document.createElement('span');
  let textSpanEl = document.createElement('span');

  usernameSpanEl.classList.add('username');
  usernameSpanEl.innerText = "System";
  textSpanEl.classList.add('text');

  switch(msg.message_type) {
    case MESSAGE_ENUM.CLIENT_CONNECTED:
      textSpanEl.innerText = `${msg.body.name} has connected`;
      break;
    case MESSAGE_ENUM.CLIENT_DISCONNECTED:
      textSpanEl.innerText = `${msg.body.name} has disconnected`;
      break;
    default:
      console.error("Unknown message type");
  }

  listEl.appendChild(usernameSpanEl);
  listEl.appendChild(textSpanEl);

  DOM_EL.chatLog.appendChild(listEl);
}