import Phaser from "phaser";
import { DIRECTIONS } from "../constants/directions";
import TilesUtils from "../utils/tiles";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      red(x: number, y: number, texture: string, frame?: string | number): RedGhost
    }
  }
}

export default class RedGhost extends Phaser.Physics.Arcade.Sprite {
  private direction: DIRECTIONS = DIRECTIONS.LEFT;
  private speed = 198;
  private lastTurn: {x: number, y: number} = {x: 0, y: 0};
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
  }

  update(wallsLayer: Phaser.Tilemaps.TilemapLayer) {
    if (!this.body) return;
    if (!this.body.blocked.none) {
      this.changeDirection(wallsLayer);
    }
    switch (this.direction) {
      case DIRECTIONS.UP:
        this.setVelocity(0, -this.speed);
        break;
      case DIRECTIONS.DOWN:
        this.setVelocity(0, this.speed);
        break;
      case DIRECTIONS.LEFT:
        this.setVelocity(-this.speed, 0);
        break;
      case DIRECTIONS.RIGHT:
        this.setVelocity(this.speed, 0);
        break;
    }
  }

  changeDirection(wallsLayer: Phaser.Tilemaps.TilemapLayer, {isDecisionTile} = {isDecisionTile: false}) {
    const x = TilesUtils.findNearestTile(this.x);
    const y = TilesUtils.findNearestTile(this.y);
    const possibleDirections = this.checkPosibleDirections(wallsLayer, x, y);
    //sometimes the tile is blocked in all directions because x and y are not exact, so we continue in the same direction
    if (possibleDirections.length < 1) return;

    console.log(possibleDirections, DIRECTIONS)
    
    //if (this.lastTurn.x === x || this.lastTurn.y === y) return;
    //if there is only one possible direction, ghost doesn't need to decide, it is only a turn
    if (possibleDirections.length === 1) {
      this.direction = possibleDirections[0];
      return;
    }
    
    //if there are two possible directions, ghost decides randomly
    const random = Math.floor(Math.random() * possibleDirections.length);
    this.direction = possibleDirections[random];
  }

  /* decideNextDirection(tile: Phaser.Tilemaps.Tile, wallsLayer: Phaser.Tilemaps.TilemapLayer) {
    let possibleDirections = this.checkPosibleDirections(wallsLayer);
  } */

  checkPosibleDirections(layer: Phaser.Tilemaps.TilemapLayer, x: number, y: number): DIRECTIONS[] {
    const possibleDirections = [];
    if (!layer.hasTileAt(x - 1, y) && this.direction !== DIRECTIONS.RIGHT) {
      possibleDirections.push(DIRECTIONS.LEFT);
    }
    if (!layer.hasTileAt(x + 1, y) && this.direction !== DIRECTIONS.LEFT) {
      possibleDirections.push(DIRECTIONS.RIGHT);
    }
    if (!layer.hasTileAt(x, y - 1) && this.direction !== DIRECTIONS.DOWN) {
      possibleDirections.push(DIRECTIONS.UP);
    }
    if (!layer.hasTileAt(x, y + 1) && this.direction !== DIRECTIONS.UP) {
      possibleDirections.push(DIRECTIONS.DOWN);
    }
    return possibleDirections;
  }
}

Phaser.GameObjects.GameObjectFactory.register('red', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
  var sprite = new RedGhost(this.scene, x, y, texture, frame)

  this.displayList.add(sprite)
  this.updateList.add(sprite)

  this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

  sprite.body?.setSize(12, 12);

  return sprite
})