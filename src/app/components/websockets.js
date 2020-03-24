import { DOM_EL } from '../index';
export const ws = new WebSocket("ws://127.0.0.1:7777/ws");

const MESSAGE_ENUM = Object.freeze({
  SELF_CONNECTED: "SELF_CONNECTED",
  CLIENT_CONNECTED: "CLIENT_CONNECTED",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED",
  CLIENT_MESSAGE: "CLIENT_MESSAGE",
  PING: "PING",
  PONG: "PONG"
})

let wsTimeout = null;

ws.onopen = evt =>{
  console.log(evt.explicitOriginalTarget.url);
  wsTimeout = setTimeout(ping, 10000);

  ws.onmessage = evt => {
    let msg = JSON.parse(evt.data);
    switch (msg.message_type) {
      case MESSAGE_ENUM.PONG:
        wsTimeout = setTimeout(ping, 10000);
        break;
      case MESSAGE_ENUM.CLIENT_CONNECTED:
        console.log(msg.body);
        logMessage(msg);
        break;
      case MESSAGE_ENUM.CLIENT_DISCONNECTED:
        console.log(msg.body);
        logMessage(msg);
        break;
      case MESSAGE_ENUM.CLIENT_MESSAGE:
        console.log(msg.body);
        printMessage(msg);
        break;
      case MESSAGE_ENUM.SELF_CONNECTED:
        DOM_EL.username.innerText = `You are ${msg.body.name}`;
        break;
      default:
        console.log("Unknown message type");
    }
  };
};

const ping = () => {
  clearTimeout(wsTimeout);
  let msg = {
    message_type: MESSAGE_ENUM.PING
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