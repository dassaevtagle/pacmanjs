import { Math as PhaserMath, Scene } from "phaser";
import Pacman from "../characters/pacman";
import OrangeGhost from "../characters/orange";
import RedGhost from "../characters/red";
import { DIRECTIONS } from "../constants/directions";
import "../characters/orange";
import "../characters/blue";
import "../characters/pink";
import "../characters/red";
import "../characters/pacman";
import { TILE_SIZE } from "../constants/game";
import PinkGhost from "../characters/pink";
import BlueGhost from "../characters/blue";

type TileCollisionGroup = {
  draworder: string;
  name: string;
  objects: TileCollisionObject[];
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
}

type TileCollisionObject = {
  id: number;
  name: string;
  type: string;
  rotation: number;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rectangle: boolean;
}

export default class Game extends Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private pacman!: Pacman | null;
  private map!: Phaser.Tilemaps.Tilemap | null;
  private tileset!: Phaser.Tilemaps.Tileset | null;
  private showDebug = false;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private tilesetLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private foodLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private highScoreLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private decisionTilesLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private speed = 120;
  private score = -2;
  private red!: RedGhost | null;
  private blue!: BlueGhost | null;
  private pink!: PinkGhost | null;
  private orange!: OrangeGhost | null;
  private graphics!: Phaser.GameObjects.Graphics | null;

  constructor() {
    super({ key: 'game' })
  }
  preload() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.map = this.add.tilemap("map");
    this.tileset = this.map.addTilesetImage("pacman_tileset", "pacman_tileset");
    if (!this.tileset) return;

    this.wallsLayer = this.map.createLayer('Walls', this.tileset);
    this.highScoreLayer = this.map.createLayer('HighScore', this.tileset);
    this.foodLayer = this.map.createLayer('Food', this.tileset);
    this.decisionTilesLayer = this.map.createLayer('Intersections', this.tileset);
    if (!this.wallsLayer || !this.foodLayer || !this.highScoreLayer || !this.decisionTilesLayer) return;

    this.debugGraphics = this.add.graphics();

    this.foodLayer.setCollisionByExclusion([-1]);
    this.decisionTilesLayer.setCollisionByExclusion([-1]);
    this.wallsLayer.setCollisionByProperty({ collides: true });
    this.decisionTilesLayer.setAlpha(0);

    this.pacman = this.add.pacman(TILE_SIZE * 14, TILE_SIZE * 26.5, 'pacman', 'die-1.png');
    this.physics.add.collider(this.pacman, this.wallsLayer);

    this.blue = this.add.blue(TILE_SIZE * 12.5, TILE_SIZE * 17.5, "blue");
    this.orange = this.add.orange(TILE_SIZE * 15.5, TILE_SIZE * 17.5, "orange");
    this.pink = this.add.pink(TILE_SIZE * 14.5, TILE_SIZE * 17.5, "pink");
    this.red = this.add.red(TILE_SIZE * 14, TILE_SIZE * 14.5, "red");
    this.physics.add.collider(this.red, this.wallsLayer);
    this.physics.add.collider(this.blue, this.wallsLayer);
    this.physics.add.collider(this.orange, this.wallsLayer);
    this.physics.add.collider(this.pink, this.wallsLayer);
    //this.physics.add.collider(this.red, this.decisionTilesLayer);
    this.setupListeners();
    this.createAnimations();
  }

  update(t: number, dt: number) {
    if (!this.map || !this.pacman || !this.red || !this.pink || !this.orange || !this.blue || !this.wallsLayer || !this.decisionTilesLayer) return;
    this.pacman.update(this.cursors, this.map);
    this.red.update(this.map, this.pacman.x, this.pacman.y);
    this.orange.update(this.map, this.pacman.x, this.pacman.y);
    this.blue.update(this.map, this.pacman.x, this.pacman.y);
    this.pink.update(this.map, this.pacman.x, this.pacman.y);
    const GAME_WIDTH = 330;
    if (!this.pacman || !this.foodLayer) return;

    if (this.pacman.x < 0) {
      this.pacman.setX(GAME_WIDTH);
    }

    if (this.pacman.x > GAME_WIDTH) {
      this.pacman.setX(0);
    }

    // @ts-ignore: Unreachable code error
    this.physics.overlap(this.pacman, this.foodLayer, this.handleFoodOverlap, null, this);

    /* this.physics.overlap(this.red, this.decisionTilesLayer, (ghost: RedGhost, tile: Phaser.Tilemaps.Tile) => {
      console.log(ghost)
      console.log(tile)

      //If there is a decisionTile collide
      if (TilesUtils.findNearestTile(ghost.x) === tile.x && TilesUtils.findNearestTile(ghost.y) === tile.y) {
        this.red?.changeDirection(this.wallsLayer, { isDecisionTile: true });
      }
    }, (ghost: RedGhost, tile: Phaser.Tilemaps.Tile) => {
      return tile.index === -1 ? false : true;
    }, this); */
  }

  setupListeners() {
    this.cursors.left?.on('down', () => {
      console.log('left')
      this.pacman?.move(DIRECTIONS.LEFT)
    })
    this.cursors.right?.on('down', () => {
      console.log('right')
      this.pacman?.move(DIRECTIONS.RIGHT)
    })
    this.cursors.up?.on('down', () => {
      console.log('up')
      this.pacman?.move(DIRECTIONS.UP)
    })
    this.cursors.down?.on('down', () => {
      console.log('down')
      this.pacman?.move(DIRECTIONS.DOWN)
    })

    //toggle debug graphics
    this.input.keyboard?.on('keydown-ONE', () => {
      this.showDebug = !this.showDebug;
      this.drawDebug();
    });
  }

  handleFoodOverlap(pacman: Pacman, tile: Phaser.Tilemaps.Tile) {
    if (!this.foodLayer || !pacman.body) return;
    tile.setAlpha(0);
    tile.setCollision(false, false, false, false, false);
    this.score++;
    if (this.tileHasPowerup(tile)) {
      console.log('powerup!');
    }
    return false;
  }

  tileHasPowerup(tile: Phaser.Tilemaps.Tile) {
    let result = false;
    if (tile.x === 1 && tile.y === 26) {
      result = true;
    }
    if (tile.x === 26 && tile.y === 26) {
      result = true;
    }
    if (tile.x === 1 && tile.y === 6) {
      result = true;
    }
    if (tile.x === 26 && tile.y === 6) {
      result = true;
    }
    return result;
  }

  createAnimations() {
    if(!this.pacman) return;
    this.pacman.generateAnimations();
  }

  drawDebug() {
    this.debugGraphics.clear();
    this.decisionTilesLayer?.setAlpha(0);

    if (this.showDebug) {
      this.debugGraphics = this.add.graphics().setAlpha(0.5)
      this.wallsLayer?.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 243, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255)
      })

      this.foodLayer?.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(0, 0, 255, 255),
        faceColor: new Phaser.Display.Color(0, 0, 255, 255)
      });

      this.decisionTilesLayer?.setAlpha(80);
      this.decisionTilesLayer?.setDepth(100);
    }
  }
}

