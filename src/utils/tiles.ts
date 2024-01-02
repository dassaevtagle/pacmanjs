
class Utils {
  findNearestTile(coordinate: number) {
    //-1 to account for the fact that the tiles are 0 indexed
    return Math.round(coordinate / 12) - 1;
  }
}

const TilesUtils = new Utils ();

export default TilesUtils;