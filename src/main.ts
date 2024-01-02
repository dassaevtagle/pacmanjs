import Phaser from "phaser";
import Preloader from "./scenes/preloader";
import Game from "./scenes/game";

const config: Phaser.Types.Core.GameConfig = {
  width: 800,
  height: 470,
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    }
  },
  scene: [Preloader, Game],
  scale: {
    zoom: 1.3
  },
}

const game = new Phaser.Game(config);