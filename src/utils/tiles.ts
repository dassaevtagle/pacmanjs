
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
}

const TilesUtils = new Utils ();

export default TilesUtils;