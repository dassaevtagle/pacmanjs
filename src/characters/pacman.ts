import Phaser from 'phaser'
import { DIRECTIONS } from '../constants/directions'
import { TILE_SIZE } from '../constants/game'
import { getOppositeDirection } from '../utils/directions'
import { Reactor } from '../utils/reactor'

declare global {
	namespace Phaser.GameObjects {
		interface GameObjectFactory {
			pacman(x: number, y: number, texture: string, reactor: Reactor, frame?: string | number): Pacman
		}
	}
}

export default class Pacman extends Phaser.Physics.Arcade.Sprite {

	private _lives = 3
	private _score = 0
	private _direction?: DIRECTIONS;
	private _nextDirection?: DIRECTIONS
	private _turningPointThreshold = 1.5;
	private _isFirstMove: boolean = true;
	private _speed = 85;
	private _animFrameRate = 11;
	private _nearbyTiles: { [key: string]: Phaser.Tilemaps.Tile | null } = {};
	private _marker = new Phaser.Geom.Point();
	private _turningPoint = new Phaser.Geom.Point();
	private _reactor: Reactor;

	get lives() {
		return this._lives;
	}

	get getOrientation() {
		return this._direction || DIRECTIONS.LEFT;
	}

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, reactor: Reactor, frame?: string | number) {
		super(scene, x, y, texture, frame)
		this._reactor = reactor;
	}

	preUpdate(t: number, dt: number) {
		super.preUpdate(t, dt)
	}

	update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, map: Phaser.Tilemaps.Tilemap) {
		this.calculateNearbyTiles(map);
		if (this.thereIsAWall(this._direction!)) {
			this.anims.stop();
		}
		if (!cursors || !this.body || !this._nextDirection) return;

		//Don't change direction until you can move
		if (this.canChangeDirection(this._nextDirection, map)){
			this.changeDirection(this._nextDirection);
		}
	}

	move(direction: DIRECTIONS) {
		this._nextDirection = direction;
	}
	changeDirection(direction: DIRECTIONS) {
		if (!this.body || !this._nextDirection) return false;
		this.body.reset(this._turningPoint.x, this._turningPoint.y);

		switch (direction) {
			case DIRECTIONS.UP:
				this.anims.play('pacman-up', true);
				this.setVelocity(0, -this._speed)
				break;
			case DIRECTIONS.DOWN:
				this.anims.play('pacman-down', true);
				this.setVelocity(0, this._speed)
				break;
			case DIRECTIONS.LEFT:
				this.anims.play('pacman-left', true);
				this.setVelocity(-this._speed, 0)
				break;
			case DIRECTIONS.RIGHT:
				this.anims.play('pacman-right', true);
				this.setVelocity(this._speed, 0)
				break;
		}

		this._direction = direction;
		this._nextDirection = undefined;
		this._isFirstMove = false;
	}

	getAngle(to: DIRECTIONS): string {
		if (!this._direction || this._isFirstMove) return "0";
		//  About-face?
		if (this._direction === getOppositeDirection(to)) {
			return "180";
		}

		if ((this._direction === DIRECTIONS.UP && to === DIRECTIONS.LEFT) ||
			(this._direction === DIRECTIONS.DOWN && to === DIRECTIONS.RIGHT) ||
			(this._direction === DIRECTIONS.LEFT && to === DIRECTIONS.DOWN) ||
			(this._direction === DIRECTIONS.RIGHT && to === DIRECTIONS.UP)) {
			return "-90";
		}

		return "90";

	}

	die() {
		this.setVelocity(0, 0);
		this._reactor.emit("pacman-die");
		this.anims.play('pacman-die', true);
		this._lives--;
	}

	calculateTurningPoint() {
		this._turningPoint.x = (this._marker.x * TILE_SIZE) + (TILE_SIZE / 2);
		this._turningPoint.y = (this._marker.y * TILE_SIZE) + (TILE_SIZE / 2);
	}

	intersectsTurningPoint() {
		this.calculateTurningPoint()
		let x = Math.floor(this.x);
		let y = Math.floor(this.y);
		return Phaser.Math.Fuzzy.Equal(x, this._turningPoint.x, this._turningPointThreshold) && Phaser.Math.Fuzzy.Equal(y, this._turningPoint.y, this._turningPointThreshold);
	}

	calculateNearbyTiles(map: Phaser.Tilemaps.Tilemap) {
		//update marker coordinates
		this._marker.x = Phaser.Math.Snap.Floor(Math.floor(this.x), TILE_SIZE) / TILE_SIZE;
		this._marker.y = Phaser.Math.Snap.Floor(Math.floor(this.y), TILE_SIZE) / TILE_SIZE;

		let { x, y } = this._marker;
		this._nearbyTiles[DIRECTIONS.LEFT] = map.getTileAt(x - 1, y, true, "Walls");
		this._nearbyTiles[DIRECTIONS.RIGHT] = map.getTileAt(x + 1, y, true, "Walls");
		this._nearbyTiles[DIRECTIONS.UP] = map.getTileAt(x, y - 1, true, "Walls");
		this._nearbyTiles[DIRECTIONS.DOWN] = map.getTileAt(x, y + 1, true, "Walls");
	}

	canChangeDirection(direction: DIRECTIONS, map: Phaser.Tilemaps.Tilemap) {
		if (!this.body) return false;

		//if pacman is already moving in that direction, do not change direction
		if (this._direction === direction) return false;

		if (this.thereIsAWall(direction)) return false;

		//if pacman is in the turning point or it is the first move we can move
		if (this.intersectsTurningPoint() || this._isFirstMove) return true;

		return false;
	}

/* 	isAtGhostDoors(map: Phaser.Tilemaps.Tilemap) {
		let target = null;
		switch (this._direction) {
			case DIRECTIONS.UP:
				target = map.getTileAt(this._marker.x, this._marker.y - 1, true, "Ghost_doors");
				break;
			case DIRECTIONS.DOWN:
				target = map.getTileAt(this._marker.x, this._marker.y + 1, true, "Ghost_doors");
				break;
			case DIRECTIONS.LEFT:
				target = map.getTileAt(this._marker.x - 1, this._marker.y, true, "Ghost_doors");
				break;
			case DIRECTIONS.RIGHT:
				target = map.getTileAt(this._marker.x + 1, this._marker.y, true, "Ghost_doors");
				break;
		}
	}
 */
	thereIsAWall(direction: DIRECTIONS) {
		//when index != 1 means that there is an actual tile in Walls Layer in that direction and pacman cannot move there
		return this._nearbyTiles[direction] && this._nearbyTiles[direction]?.index !== -1 ? true : false;
	}

	generateAnimations() {
		this.anims.create({
			key: 'pacman-idle',
			frames: [{ key: 'pacman', frame: 'die-1.png' }]
		})

		this.anims.create({
			key: 'pacman-die',
			frames: this.anims.generateFrameNames('pacman', { start: 1, end: 13, prefix: 'die-', suffix: '.png' }),
			frameRate: this._animFrameRate,
			hideOnComplete: true,
		})

		this.anims.create({
			key: 'pacman-left',
			frames: this.anims.generateFrameNames('pacman', { start: 1, end: 2, prefix: 'left-', suffix: '.png' }),
			repeat: -1,
			frameRate: this._animFrameRate,
		})

		this.anims.create({
			key: 'pacman-up',
			frames: this.anims.generateFrameNames('pacman', { start: 1, end: 2, prefix: 'up-', suffix: '.png' }),
			repeat: -1,
			frameRate: this._animFrameRate,
		})

		this.anims.create({
			key: 'pacman-right',
			frames: this.anims.generateFrameNames('pacman', { start: 1, end: 2, prefix: 'right-', suffix: '.png' }),
			repeat: -1,
			frameRate: this._animFrameRate,
		})

		this.anims.create({
			key: 'pacman-down',
			frames: this.anims.generateFrameNames('pacman', { start: 1, end: 2, prefix: 'down-', suffix: '.png' }),
			repeat: -1,
			frameRate: this._animFrameRate,
		})
	}
}

Phaser.GameObjects.GameObjectFactory.register('pacman', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, reactor: Reactor, frame?: string | number) {
	var sprite = new Pacman(this.scene, x, y, texture, reactor, frame)

	this.displayList.add(sprite)
	this.updateList.add(sprite)

	this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

	sprite.body?.setSize(11, 11)

	return sprite
})