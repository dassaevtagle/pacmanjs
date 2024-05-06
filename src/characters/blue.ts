import Phaser from "phaser";
import Ghost from "./ghost";
import { DIRECTIONS } from "../constants/directions";
import TilesUtils from "../utils/tiles";
import { TILE_SIZE } from "../constants/game";

declare global {
	namespace Phaser.GameObjects {
		interface GameObjectFactory {
			blue(x: number, y: number, texture: string, frame?: string | number): BlueGhost
		}
	}
}

export default class BlueGhost extends Ghost {
	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
		super(scene, x, y, texture, 27, 35, DIRECTIONS.UP, frame);
	}

	measureStrategyChaseMode(marker: { x: number, y: number }, pacmanX: number, pacmanY: number, possibleDirections: DIRECTIONS[], pacmanOrientation: DIRECTIONS, redX: number, redY: number): { [key: string]: number; } {
		let distanceDict: { [key: string]: number; } = {};
		let markerCoordinates = {
			x: marker.x * TILE_SIZE,
			y: marker.y * TILE_SIZE
		}
		possibleDirections.forEach((direction) => {
			switch (direction) {
				case DIRECTIONS.UP:
					distanceDict[DIRECTIONS.UP] = TilesUtils.blueChaseStrategy(markerCoordinates.x, markerCoordinates.y - 1, pacmanX, pacmanY, pacmanOrientation, redX * TILE_SIZE, redY * TILE_SIZE);
					break;
				case DIRECTIONS.DOWN:
					distanceDict[DIRECTIONS.DOWN] = TilesUtils.blueChaseStrategy(markerCoordinates.x, markerCoordinates.y + 1, pacmanX, pacmanY, pacmanOrientation, redX * TILE_SIZE, redY * TILE_SIZE);
					break;
				case DIRECTIONS.LEFT:
					distanceDict[DIRECTIONS.LEFT] = TilesUtils.blueChaseStrategy(markerCoordinates.x - 1, markerCoordinates.y, pacmanX, pacmanY, pacmanOrientation, redX * TILE_SIZE, redY * TILE_SIZE);
					break;
				case DIRECTIONS.RIGHT:
					distanceDict[DIRECTIONS.RIGHT] = TilesUtils.blueChaseStrategy(markerCoordinates.x + 1, markerCoordinates.y, pacmanX, pacmanY, pacmanOrientation, redX * TILE_SIZE, redY * TILE_SIZE);
					break;
			}
		});
		return distanceDict;
	}
}

Phaser.GameObjects.GameObjectFactory.register('blue', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
	var sprite = new BlueGhost(this.scene, x, y, texture, frame)

	this.displayList.add(sprite)
	this.updateList.add(sprite)

	this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

	sprite.body?.setSize(12, 12)

	return sprite
})