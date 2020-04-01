import * as PIXI from 'pixi.js';
import { setupWS, sendMessage, sendPos } from './components/websockets.js';
const loader = PIXI.Loader.shared;
PIXI.settings.STRICT_TEXTURE_CACHE = true;

export const characters = [
  { name: "worm",
    startFrame: 1,
    endFrame: 4
  },
  { name: "blob",
    startFrame: 1,
    endFrame: 7
  },
  { name: "mosquito",
    startFrame: 1,
    endFrame: 6
  },
  { name: "spaceman",
    startFrame: 1,
    endFrame: 7
  },
  { name: "orange",
    startFrame: 1,
    endFrame: 5
  },
  { name: "croc",
    startFrame: 1,
    endFrame: 7
  },
];

export let DOM_EL = {
  canvasContainer: null,
  username: null,
  chatLog: null,
  chatInput: null,
  chatInputButton: null
}

export let selfData = {
  id: "",
  char: "",
  name: "",
  pos: {
    x: 0,
    y: 0
  }
}

let app = new PIXI.Application({
  width: 800,
  height: 600,
  antialias: true,
  transparent: true,
  resolution: 1,
});

let players = [];
let id, state, animatedSprite;

window.addEventListener('DOMContentLoaded', event => {
  setup();
});

async function setup() {
  assignReferences();
  attachListeners();
  id = await loadAssets();
  setupWS();
  DOM_EL.canvasContainer.appendChild(app.view);
}

export function setupSelfChar() {
  let char = characters.find(character => character.name === selfData.char);
  animatedSprite = createAnimatedSprite(selfData.char, char.startFrame, char.endFrame);
  app.stage.addChild(animatedSprite);

  setInterval(sendPos, 100);

  let left = keyboard("ArrowLeft"),
      up = keyboard("ArrowUp"),
      right = keyboard("ArrowRight"),
      down = keyboard("ArrowDown");

  left.press = () => {
    animatedSprite.vx = -5;
    animatedSprite.vy = 0;
  }

  left.release = () => {
    if (!right.isDown && animatedSprite.vy === 0) {
      animatedSprite.vx = 0;
    }
  };

  right.press = () => {
    animatedSprite.vx = 5;
    animatedSprite.vy = 0;
  }

  right.release = () => {
    if (!left.isDown && animatedSprite.vy === 0) {
      animatedSprite.vx = 0;
    }
  };

  up.press = () => {
    animatedSprite.vy = -5;
    animatedSprite.vx = 0;
  }

  up.release = () => {
    if (!down.isDown && animatedSprite.vx === 0) {
      animatedSprite.vy = 0;
    }
  };

  down.press = () => {
    animatedSprite.vy = 5;
    animatedSprite.vx = 0;
  }

  down.release = () => {
    if (!up.isDown && animatedSprite.vx === 0) {
      animatedSprite.vy = 0;
    }
  };

  state = play;
  app.ticker.add(delta => gameLoop(delta));
}

export function createPlayerSprite(socket) {
  // don't create player sprite for myself again
  if (socket.id !== selfData.id) {
    let char = characters.find(character => character.name === socket.char);
    let animatedSprite = createAnimatedSprite(socket.char, char.startFrame, char.endFrame);

    // assign PIXI sprite to local state;
    players.find(player => {
      if (player.id === socket.id) {
        player.sprite = animatedSprite;
        // add to stage
        app.stage.addChild(animatedSprite);
      }
    })
  }
}

export function removePlayerSprite(socket) {
  players.find(player => {
    if (player.id === socket.id) {
      // remove from stage
      app.stage.removeChild(player.sprite);
    }
  })
}

function createAnimatedSprite(name, startFrame, endFrame) {
  const frames = [];
  let animatedSprite;

  for (let j = startFrame; j < endFrame + 1; j++) {
    frames.push(id[`${name}_${j}.png`]);
    // frames.push(PIXI.Texture.from(`${name}_${j}.png`));
  }

  animatedSprite = new PIXI.AnimatedSprite(frames);
  animatedSprite.x = app.screen.width / 2;
  animatedSprite.y = app.screen.height / 2;
  animatedSprite.vx = 0;
  animatedSprite.vy = 0;
  animatedSprite.anchor.set(0.5);
  animatedSprite.animationSpeed = 0.025;
  animatedSprite.play();
  return animatedSprite;
}

function gameLoop(delta){
  //Update the current game state:
  state(delta);
}

function play(delta) {
  // update sprite positions
  animatedSprite.x += animatedSprite.vx;
  animatedSprite.y += animatedSprite.vy;
  // update self pos
  selfData.pos.x = animatedSprite.x;
  selfData.pos.y = animatedSprite.y;
  players.forEach(player => {
    if (player.sprite) {
      player.sprite.x = player.sprite.x + Math.round((player.pos.x - player.sprite.x) * 0.2);
      player.sprite.y = player.sprite.y + Math.round((player.pos.y - player.sprite.y) * 0.2);
    }
  })
}

export function updatePlayers(socketsArr) {
  // sync local state with server state
  for (let i = 0; i < socketsArr.length; i++) {
    players.find(player => {
      if (player.id === socketsArr[i].id && player.sprite) {
        player.pos.x = socketsArr[i].pos.x;
        player.pos.y = socketsArr[i].pos.y;
      }
    })
  }
}

export function addPlayer(socket) {
  let found = players.find(player => player.id === socket.id);
  found ? '' : players.push(socket);
}

export function removePlayer(socket) {
  players.find((player, index) => { 
    if (player.id === socket.id) {
      players.splice(index, 1);
    }
  });
}

export function syncStates(socketsArr) {
  PIXI.utils.clearTextureCache();
  for (let i = 0; i < socketsArr.length; i++) {
    players.push(socketsArr[i]);
    createPlayerSprite(socketsArr[i]);
  }
}

function assignReferences() {
  DOM_EL.canvasContainer = document.getElementById("canvas-container");
  DOM_EL.username = document.getElementById("username");
  DOM_EL.chatLog = document.getElementById("chat-log");
  DOM_EL.chatInput = document.getElementById("chat-input");
  DOM_EL.chatInputButton = document.getElementById("chat-input-button");
}

function attachListeners() {
  DOM_EL.chatInputButton.addEventListener('click', sendMessage);
  DOM_EL.chatInput.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(evt) {
  evt.key === 'Enter' && 
  DOM_EL.chatInput.value !== '' &&
  DOM_EL.chatInput.value.trim() !== '' ? sendMessage() : '';
}

function loadAssets() {
  return new Promise((resolve, reject) => {
    loader.add("static/assets/spritesheet.json")
    .load((loader, resources) => {
      resolve(resources["static/assets/spritesheet.json"].textures);
    });

    loader.onError.add(() => {
      reject(new Error("Spritesheet.json cannot be loaded"));
    });
  })
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