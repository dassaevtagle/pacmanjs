import Phaser from "phaser";
import { DIRECTIONS } from "../constants/directions";
import TilesUtils from "../utils/tiles";
import { TILE_SIZE } from "../constants/game";

export default abstract class Ghost extends Phaser.Physics.Arcade.Sprite {
    private debugGraphics = this.scene.add.graphics().setAlpha(0.50).setDepth(20);
    //@ts-ignore
    private _prevDirection: DIRECTIONS;
    private _initialDirection: DIRECTIONS;
    private _direction: DIRECTIONS = DIRECTIONS.LEFT;
    private _speed = 50;
    private _marker = new Phaser.Geom.Point();
    private _isFirstMove: boolean = true;
    private _nearbyWallTiles: { [key: string]: Phaser.Tilemaps.Tile | null } = {};
    private _turningPoint = new Phaser.Geom.Point();
    private _turningPointThreshold = 2;
    private canTurn = true;
    private _scatterModeTile: Phaser.Geom.Point;
    private _isScatterMode = true;
    private _timerFlag: null | number = null;
    //@ts-ignore
    private _ghostColor: "red" | "orange" | "pink" | "blue";

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, scatterModeTileX: number, scatterModeTileY: number, initialDirection: DIRECTIONS, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this._scatterModeTile = new Phaser.Geom.Point(scatterModeTileX, scatterModeTileY);
        this._initialDirection = initialDirection;
    }

    update(map: Phaser.Tilemaps.Tilemap, pacmanX: number, pacmanY: number) {
        if (!this.body) return;
        this.toggleScatterModeThrottled();
        if (this._isFirstMove) {
            this.changeDirection(this._initialDirection);
            this._isFirstMove = false;
            this._prevDirection = this._initialDirection;
        }

        this._nearbyWallTiles = this.calculateNearbyTiles(map);
        this.paintNearbyTiles();

        if (!this.isIntersectingTurningPoint() || !this.canTurn) return null;

        //Intersection tiles take priority over walls
        if (this.thereIsAnIntersectionTile() || this.thereIsAWall(this._direction)) {
            let direction = this.chooseNextDirection(pacmanX, pacmanY);
            this.changeDirection(direction);
        }
    }

    toggleScatterModeThrottled() {
        if (this._timerFlag === null) {
            this._timerFlag = setTimeout(() => {
                this._isScatterMode = !this._isScatterMode;
                this.reverseDirection();
                this._timerFlag = null;
            }, this._isScatterMode ? 7000 : 20000)
        }
    }

    reverseDirection() {
        switch(this._direction){
            case DIRECTIONS.UP:
                this.changeDirection(DIRECTIONS.DOWN);
                break;
            case DIRECTIONS.DOWN:
                this.changeDirection(DIRECTIONS.UP);
                break;
            case DIRECTIONS.LEFT:
                this.changeDirection(DIRECTIONS.RIGHT);
                break;
            case DIRECTIONS.RIGHT:
                this.changeDirection(DIRECTIONS.LEFT);
                break;
        }
    }

    throttleCanTurn() {
        this.canTurn = false;
        setTimeout(() => {
            this.canTurn = true;
        }, 300);
    }

    chooseNextDirection(pacmanX: number, pacmanY: number): DIRECTIONS {
        let possibleDirections = this.checkPossibleDirections();
        let distanceDict: { [key: string]: number } = {};
        if (this._isScatterMode) {
            distanceDict = this.measureStrategyScatterMode(possibleDirections);
        } else {
            distanceDict = this.measureStrategyChaseMode(this._marker, pacmanX, pacmanY, possibleDirections);
        }
        let min = Math.min(...Object.values(distanceDict));
        let minKey = Object.keys(distanceDict).find(key => distanceDict[key] === min);
        return minKey as DIRECTIONS;
    }

    measureStrategyScatterMode(possibleDirections: DIRECTIONS[]): { [key: string]: number; } {
        let distanceDict: { [key: string]: number } = {};
        possibleDirections.forEach((direction) => {
            switch (direction) {
                case DIRECTIONS.UP:
                    distanceDict[DIRECTIONS.UP] = TilesUtils.getDistance(this._marker.x, this._marker.y - 1, this._scatterModeTile.x, this._scatterModeTile.y);
                    break;
                case DIRECTIONS.DOWN:
                    distanceDict[DIRECTIONS.DOWN] = TilesUtils.getDistance(this._marker.x, this._marker.y + 1, this._scatterModeTile.x, this._scatterModeTile.y);
                    break;
                case DIRECTIONS.LEFT:
                    distanceDict[DIRECTIONS.LEFT] = TilesUtils.getDistance(this._marker.x - 1, this._marker.y, this._scatterModeTile.x, this._scatterModeTile.y);
                    break;
                case DIRECTIONS.RIGHT:
                    distanceDict[DIRECTIONS.RIGHT] = TilesUtils.getDistance(this._marker.x + 1, this._marker.y, this._scatterModeTile.x, this._scatterModeTile.y);
                    break;
            }
        });
        return distanceDict;
    }

    abstract measureStrategyChaseMode(marker: { x: number, y: number }, pacmanX: number, pacmanY: number, possibleDirections: DIRECTIONS[]): { [key: string]: number; };

    changeDirection(direction: DIRECTIONS) {
        if (!this.body) return false;
        //Trick to get out of the cage at the beginning
        if ((this._marker.x === 13 && this._marker.y === 16) || (this._marker.x === 14 && this._marker.y === 16)) {
            direction = DIRECTIONS.UP;
        }

        if (!this._isFirstMove) {
            this.body.reset(this._turningPoint.x, this._turningPoint.y);
            this._prevDirection = this._direction;
        }
        switch (direction) {
            case DIRECTIONS.UP:
                this.setVelocity(0, -this._speed);
				this.anims.play(`${this._ghostColor}-up`, true);
                break;
            case DIRECTIONS.DOWN:
                this.setVelocity(0, this._speed);
				this.anims.play(`${this._ghostColor}-down`, true);
                break;
            case DIRECTIONS.LEFT:
                this.setVelocity(-this._speed, 0);
				this.anims.play(`${this._ghostColor}-left`, true);
                break;
            case DIRECTIONS.RIGHT:
                this.setVelocity(this._speed, 0);
				this.anims.play(`${this._ghostColor}-right`, true);
                break;
        }

        this._direction = direction;
        this.throttleCanTurn();
    }

    thereIsAWall(direction: DIRECTIONS) {
        //when index != 1 means that there is an actual tile in Walls Layer in that direction and pacman cannot move there
        return this._nearbyWallTiles[direction] && this._nearbyWallTiles[direction]?.index !== -1 ? true : false;
    }

    calculateNearbyTiles(map: Phaser.Tilemaps.Tilemap) {
        this._marker.x = Phaser.Math.Snap.Floor(Math.floor(this.x), TILE_SIZE) / TILE_SIZE;
        this._marker.y = Phaser.Math.Snap.Floor(Math.floor(this.y), TILE_SIZE) / TILE_SIZE;

        let { x, y } = this._marker;
        this.debugGraphics.clear();
        return {
            [DIRECTIONS.LEFT]: map.getTileAt(x - 1, y, true, "Walls"),
            [DIRECTIONS.RIGHT]: map.getTileAt(x + 1, y, true, "Walls"),
            [DIRECTIONS.UP]: map.getTileAt(x, y - 1, true, "Walls"),
            [DIRECTIONS.DOWN]: map.getTileAt(x, y + 1, true, "Walls"),
        }
    }

    calculateNearbyTilesInDirection(map: Phaser.Tilemaps.Tilemap, direction: DIRECTIONS) {
        this._marker.x = Phaser.Math.Snap.Floor(Math.floor(this.x), TILE_SIZE) / TILE_SIZE;
        this._marker.y = Phaser.Math.Snap.Floor(Math.floor(this.y), TILE_SIZE) / TILE_SIZE;

        switch (direction) {
            case DIRECTIONS.DOWN:
                this._marker.y += 1;
                break;
            case DIRECTIONS.LEFT:
                this._marker.x -= 1;
                break;
            case DIRECTIONS.RIGHT:
                this._marker.x += 1;
                break;
            case DIRECTIONS.UP:
                this._marker.y -= 1;
                break;
        }

        let { x, y } = this._marker;
        return {
            [DIRECTIONS.LEFT]: map.getTileAt(x - 1, y, true, "Walls"),
            [DIRECTIONS.RIGHT]: map.getTileAt(x + 1, y, true, "Walls"),
            [DIRECTIONS.UP]: map.getTileAt(x, y - 1, true, "Walls"),
            [DIRECTIONS.DOWN]: map.getTileAt(x, y + 1, true, "Walls"),
        }
    }

    calculateTurningPoint() {
        this._turningPoint.x = (this._marker.x * TILE_SIZE) + (TILE_SIZE / 2);
        this._turningPoint.y = (this._marker.y * TILE_SIZE) + (TILE_SIZE / 2);
    }

    thereIsAnIntersectionTile() {
        let possibleDirections = this.checkPossibleDirections()
        return possibleDirections.length > 1;
    }

    isIntersectingTurningPoint() {
        this.calculateTurningPoint();
        let x = Math.floor(this.x);
        let y = Math.floor(this.y);
        return Phaser.Math.Fuzzy.Equal(x, this._turningPoint.x, this._turningPointThreshold) && Phaser.Math.Fuzzy.Equal(y, this._turningPoint.y, this._turningPointThreshold);
    }

    checkPossibleDirections(): DIRECTIONS[] {
        const possibleDirections = [];
        if (this._nearbyWallTiles[DIRECTIONS.DOWN]?.index === -1 && this._direction !== DIRECTIONS.UP) {
            possibleDirections.push(DIRECTIONS.DOWN);
        }
        if (this._nearbyWallTiles[DIRECTIONS.UP]?.index === -1 && this._direction !== DIRECTIONS.DOWN) {
            possibleDirections.push(DIRECTIONS.UP);
        }
        if (this._nearbyWallTiles[DIRECTIONS.LEFT]?.index === -1 && this._direction !== DIRECTIONS.RIGHT) {
            possibleDirections.push(DIRECTIONS.LEFT);
        }
        if (this._nearbyWallTiles[DIRECTIONS.RIGHT]?.index === -1 && this._direction !== DIRECTIONS.LEFT) {
            possibleDirections.push(DIRECTIONS.RIGHT);
        }
        return possibleDirections;
    }

    generateAnimations(ghost: "blue" | "orange" | "pink" | "red") {
        this._ghostColor = ghost;
        this.anims.create({
			key: `${ghost}-left`,
			frames: [{ key: 'ghosts', frame: `${ghost}-left.png` }]
		});
        this.anims.create({
			key: `${ghost}-right`,
			frames: [{ key: 'ghosts', frame: `${ghost}-right.png` }]
		});
        this.anims.create({
			key: `${ghost}-down`,
			frames: [{ key: 'ghosts', frame: `${ghost}-down.png` }]
		});
        this.anims.create({
			key: `${ghost}-up`,
			frames: [{ key: 'ghosts', frame: `${ghost}-up.png` }]
		});
    }

    paintNearbyTiles() {
        // Iterate through the nearby wall tiles
        for (const direction in this._nearbyWallTiles) {
            const tile = this._nearbyWallTiles[direction];
            if (tile) {
                const { x, y } = tile;
                const worldX = x * TILE_SIZE;
                const worldY = y * TILE_SIZE;

                // Draw a rectangle around the tile
                this.debugGraphics.lineStyle(2, 0xff0000);
                this.debugGraphics.strokeRect(worldX, worldY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}
