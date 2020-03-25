import * as PIXI from 'pixi.js';
import { sendMessage, sendPos } from './components/websockets.js';
const loader = PIXI.Loader.shared;

export let DOM_EL = {
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

const characters = [
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

export let selfData = {
  char: "",
  name: "",
  pos: {
    x: 0,
    y: 0
  }
}

export let id, state, animatedSprite;

window.addEventListener('DOMContentLoaded', event => {
  DOM_EL.canvasContainer = document.getElementById("canvas-container");
  DOM_EL.username = document.getElementById("username");
  DOM_EL.chatLog = document.getElementById("chat-log");
  DOM_EL.chatInput = document.getElementById("chat-input");
  DOM_EL.chatInputButton = document.getElementById("chat-input-button");

  DOM_EL.chatInputButton.addEventListener('click', sendMessage);
  
  DOM_EL.canvasContainer.appendChild(app.view);

  loader.add("static/assets/spritesheet.json")
    .load((loader, resources) => {
      id = resources["static/assets/spritesheet.json"].textures;

      setup();
    });
});

function setup() {
  let char = characters.find(character => character.name === selfData.char);
  animatedSprite = createAnimatedSprite(selfData.char, char.startFrame, char.endFrame);
  app.stage.addChild(animatedSprite);
  setInterval(sendPos, 1000);

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

function createAnimatedSprite(name, startFrame, endFrame) {
    const frames = [];
    let animatedSprite;
  
    for (let j = startFrame; j < endFrame + 1; j++) {
      frames.push(PIXI.Texture.from(`${name}_${j}.png`));
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
  animatedSprite.x += animatedSprite.vx;
  animatedSprite.y += animatedSprite.vy;
  selfData.pos.x = animatedSprite.x;
  selfData.pos.y = animatedSprite.y;
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