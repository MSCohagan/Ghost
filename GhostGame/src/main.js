import BootScene from './scenes/boot/BootScene.js'
import PreloadScene from './scenes/boot/PreloadScene.js'
import LevelEditor from './scenes/editor/LevelEditor.js'
import Room1 from './scenes/gameplay/Room1.js'
import Room2 from './scenes/gameplay/Room2.js'
import Room3 from './scenes/gameplay/Room3.js'

const config = {
  type: Phaser.AUTO,
  title: "Will 'o the Wisp",
  description: '',
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  pixelArt: true,
  scene: [BootScene, PreloadScene, LevelEditor, Room1, Room2, Room3],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
}

new Phaser.Game(config)
