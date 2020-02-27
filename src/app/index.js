import * as PIXI from 'pixi.js';

const app = new PIXI.Application({ 
  width: 800,
  height: 600,
  antialias: true,
  transparent: true,
  resolution: 1
});
const loader = PIXI.Loader.shared;

// app.renderer.backgroundColor = 0x000000;

document.body.appendChild(app.view);

loader.add("assets/spritesheet.json");

loader.load((loader, resources) => {
  let id = resources["assets/spritesheet.json"].textures; 
  let blob = new PIXI.Sprite(id["blob_1.png"]);
  
  app.stage.addChild(blob);
});
