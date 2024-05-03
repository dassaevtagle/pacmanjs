import { Scene } from "phaser";

export default class Preloader extends Scene {
  constructor() {
    super('preloader')
  }

  preload() {
    this.load.image('pacman_tileset', './tiles/tiles-map.png');
    this.load.tilemapTiledJSON('map', './tiles/tilemap.json');
    this.load.atlas('ghosts', './characters/ghosts_texture.png', './characters/ghosts_texture.json');
    this.load.atlas('pacman', './characters/pacman.png', './characters/pacman.json');
  }

  create() {
    this.scene.start('game')
  }
}