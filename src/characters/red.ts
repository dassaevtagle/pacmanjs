import Phaser from "phaser";
import Ghost from "./ghost";
import { DIRECTIONS } from "../constants/directions";
import TilesUtils from "../utils/tiles";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      red(x: number, y: number, texture: string, frame?: string | number): RedGhost
    }
  }
}

export default class RedGhost extends Ghost {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, 25, 0, DIRECTIONS.LEFT, frame);
  }

  measureStrategyChaseMode(marker: { x: number, y: number }, pacmanX: number, pacmanY: number, possibleDirections: DIRECTIONS[]): { [key: string]: number; } {
    let distanceDict: { [key: string]: number; } = {};
    possibleDirections.forEach((direction) => {
      switch (direction) {
        case DIRECTIONS.UP:
          distanceDict[DIRECTIONS.UP] = TilesUtils.getDistance(marker.x, marker.y - 1, pacmanX, pacmanY);
          break;
        case DIRECTIONS.DOWN:
          distanceDict[DIRECTIONS.DOWN] = TilesUtils.getDistance(marker.x, marker.y + 1, pacmanX, pacmanY);
          break;
        case DIRECTIONS.LEFT:
          distanceDict[DIRECTIONS.LEFT] = TilesUtils.getDistance(marker.x - 1, marker.y, pacmanX, pacmanY);
          break;
        case DIRECTIONS.RIGHT:
          distanceDict[DIRECTIONS.RIGHT] = TilesUtils.getDistance(marker.x + 1, marker.y, pacmanX, pacmanY);
          break;
      }
    });
    return distanceDict;
  }
}

Phaser.GameObjects.GameObjectFactory.register('red', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
  var sprite = new RedGhost(this.scene, x, y, texture, frame)

  this.displayList.add(sprite)
  this.updateList.add(sprite)

  this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

  sprite.body?.setSize(11, 11);

  return sprite
})