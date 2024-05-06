import { DIRECTIONS } from "../constants/directions";
import { TILE_SIZE } from "../constants/game";

class Utils {
  findNearestTile(coordinate: number) {
    //-1 to account for the fact that the tiles are 0 indexed
    return Math.round(coordinate / 12) - 1;
  }

  getDistance(x1: number, y1: number, x2: number, y2: number) {
    let a = Math.abs(x1 - x2)
    let b = Math.abs(y1 - y2)
    let c2 = (a*a) + (b*b);
    return Math.sqrt(c2);
  }

  pinkChaseStrategy(ghostX: number, ghostY: number, pacmanX: number, pacmanY: number, pacmanOrientation: DIRECTIONS) {
    switch(pacmanOrientation) {
      case DIRECTIONS.UP:
        pacmanY += (TILE_SIZE * 4);
        break;
      case DIRECTIONS.DOWN:
        pacmanY -= (TILE_SIZE * 4);
        break;
      case DIRECTIONS.LEFT:
        pacmanX -= (TILE_SIZE * 4);
        break;
      case DIRECTIONS.RIGHT:
        pacmanX += (TILE_SIZE * 4);
        break;
    }
    return this.getDistance(ghostX, ghostY, pacmanX, pacmanY);
  }

  blueChaseStrategy(ghostX: number, ghostY: number, pacmanX: number, pacmanY: number, pacmanOrientation: DIRECTIONS, redX: number, redY: number) {
    switch(pacmanOrientation) {
      case DIRECTIONS.UP:
        pacmanY += (TILE_SIZE * 2);
        break;
      case DIRECTIONS.DOWN:
        pacmanY -= (TILE_SIZE * 2);
        break;
      case DIRECTIONS.LEFT:
        pacmanX -= (TILE_SIZE * 2);
        break;
      case DIRECTIONS.RIGHT:
        pacmanX += (TILE_SIZE * 2);
        break;
    }

    let a = (Math.abs(redY - pacmanY) * 2);
    let b = (Math.abs(redX - pacmanX) * 2);
    let targetY = redY + a;
    let targetX = redX + b;
    return this.getDistance(ghostX, ghostY, targetX, targetY);
  }

  orangeChaseStrategy(ghostX: number, ghostY: number, pacmanX: number, pacmanY: number, scatterModeTileX: number, scatterModeTileY: number) {   
    let distance = this.getDistance(ghostX, ghostY, pacmanX, pacmanY);
    if (distance > TILE_SIZE * 8) {
      return distance;
    } else {
      return this.getDistance(ghostX, ghostY, scatterModeTileX, scatterModeTileY);
    }
  }

}

const TilesUtils = new Utils ();

export default TilesUtils;