import Phaser from "phaser";
import Ghost from "./ghost";
import { DIRECTIONS } from "../constants/directions";
import TilesUtils from "../utils/tiles";
import { TILE_SIZE } from "../constants/game";
import { Reactor } from "../utils/reactor";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      pink(x: number, y: number, texture: string, reactor: Reactor, frame?: string | number): PinkGhost
    }
  }
}

export default class PinkGhost extends Ghost {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, reactor: Reactor, frame?: string | number) {
    super(scene, x, y, texture, 2, 0, DIRECTIONS.UP, reactor, frame);
  }
  update(map: Phaser.Tilemaps.Tilemap, pacmanX: number, pacmanY: number, pacmanOrientation: DIRECTIONS): null | undefined {
    super.update(map, pacmanX, pacmanY, pacmanOrientation);
    return null;
  }

  measureStrategyChaseMode(marker: { x: number, y: number }, pacmanX: number, pacmanY: number, possibleDirections: DIRECTIONS[], pacmanOrientation: DIRECTIONS): { [key: string]: number; } {
    let distanceDict: { [key: string]: number; } = {};
    let markerCoordinates = {
      x: marker.x * TILE_SIZE,
      y: marker.y * TILE_SIZE
    }
    possibleDirections.forEach((direction) => {
      switch (direction) {
        case DIRECTIONS.UP:
          distanceDict[DIRECTIONS.UP] = TilesUtils.pinkChaseStrategy(markerCoordinates.x, markerCoordinates.y - 1, pacmanX, pacmanY, pacmanOrientation);
          break;
        case DIRECTIONS.DOWN:
          distanceDict[DIRECTIONS.DOWN] = TilesUtils.pinkChaseStrategy(markerCoordinates.x, markerCoordinates.y + 1, pacmanX, pacmanY, pacmanOrientation);
          break;
        case DIRECTIONS.LEFT:
          distanceDict[DIRECTIONS.LEFT] = TilesUtils.pinkChaseStrategy(markerCoordinates.x - 1, markerCoordinates.y, pacmanX, pacmanY, pacmanOrientation);
          break;
        case DIRECTIONS.RIGHT:
          distanceDict[DIRECTIONS.RIGHT] = TilesUtils.pinkChaseStrategy(markerCoordinates.x + 1, markerCoordinates.y, pacmanX, pacmanY, pacmanOrientation);
          break;
      }
    });
    return distanceDict;
  }
}

Phaser.GameObjects.GameObjectFactory.register('pink', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, reactor: Reactor, frame?: string | number) {
  var sprite = new PinkGhost(this.scene, x, y, texture, reactor, frame)

  this.displayList.add(sprite)
  this.updateList.add(sprite)

  this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

  sprite.body?.setSize(11, 11);

  return sprite
})