import Phaser from 'phaser';
import Scene1 from './Scene1';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  scene: [Scene1],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },  
    }
  }
};

export default config;
