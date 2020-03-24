import * as PIXI from 'pixi.js';
var ws = new WebSocket("ws://127.0.0.1:7777/ws");

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

let DOM_EL = {
  canvasContainer: null,
  username: null,
  chatLog: null,
  chatInput: null,
  chatInputButton: null
}

let app = new PIXI.Application({
  width: 800,
  height: 600,
  antialias: true,
  transparent: true,
  resolution: 1,
});

const loader = PIXI.Loader.shared;
let id, state, animatedBlob;

window.addEventListener('DOMContentLoaded', (event) => {
  DOM_EL.canvasContainer = document.getElementById("canvas-container");
  DOM_EL.username = document.getElementById("username");
  DOM_EL.chatLog = document.getElementById("chat-log");
  DOM_EL.chatInput = document.getElementById("chat-input");
  DOM_EL.chatInputButton = document.getElementById("chat-input-button");

  DOM_EL.chatInputButton.addEventListener('click', sendMessage);
  
  DOM_EL.canvasContainer.appendChild(app.view);

  loader.add("assets/spritesheet.json")
    .load((loader, resources) => {
      id = resources["assets/spritesheet.json"].textures;

      setup();
    });
});

// app.renderer.backgroundColor = 0x000000;

function setup() {
  // let blob = new PIXI.Sprite(id["blob_1.png"]);

  // app.stage.addChild(blob);
  animatedBlob = createAnimatedSprites("blob", 1, 7);
  app.stage.addChild(animatedBlob);

  let left = keyboard("ArrowLeft"),
      up = keyboard("ArrowUp"),
      right = keyboard("ArrowRight"),
      down = keyboard("ArrowDown");

  left.press = () => {
    animatedBlob.vx = -5;
    animatedBlob.vy = 0;
  }

  left.release = () => {
    if (!right.isDown && animatedBlob.vy === 0) {
      animatedBlob.vx = 0;
    }
  };

  right.press = () => {
    animatedBlob.vx = 5;
    animatedBlob.vy = 0;
  }

  right.release = () => {
    if (!left.isDown && animatedBlob.vy === 0) {
      animatedBlob.vx = 0;
    }
  };

  up.press = () => {
    animatedBlob.vy = -5;
    animatedBlob.vx = 0;
  }

  up.release = () => {
    if (!down.isDown && animatedBlob.vx === 0) {
      animatedBlob.vy = 0;
    }
  };

  down.press = () => {
    animatedBlob.vy = 5;
    animatedBlob.vx = 0;
  }

  down.release = () => {
    if (!up.isDown && animatedBlob.vx === 0) {
      animatedBlob.vy = 0;
    }
  };

  state = play;

  app.ticker.add(delta => gameLoop(delta));
}

function createAnimatedSprites(name, startFrame, endFrame) {
  const frames = [];
  var animatedSprite;

  for (var i = startFrame; i < endFrame + 1; i++) {
    frames.push(PIXI.Texture.from(`${name}_${i}.png`));
  }

  animatedSprite = new PIXI.AnimatedSprite(frames);
  animatedSprite.x = app.screen.width / 2;
  animatedSprite.y = app.screen.height / 2;
  animatedSprite.vx = 0;
  animatedSprite.vy = 0;
  animatedSprite.anchor.set(0.5);
  animatedSprite.animationSpeed = 0.05;
  animatedSprite.play();

  return animatedSprite;
}


function gameLoop(delta){
  //Update the current game state:
  state(delta);
}

function play(delta) {
  animatedBlob.x += animatedBlob.vx;
  animatedBlob.y += animatedBlob.vy
}

function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener(
    "keydown", downListener, false
  );
  window.addEventListener(
    "keyup", upListener, false
  );
  
  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}

const ping = () => {
  clearTimeout(wsTimeout);
  let msg = {
    message_type: MESSAGE_ENUM.PING
  }
  ws.send(JSON.stringify(msg));
}

const sendMessage = evt => {
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