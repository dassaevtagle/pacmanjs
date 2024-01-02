import { DIRECTIONS } from "../constants/directions";

export function getOppositeDirection(direction: DIRECTIONS) {
    switch (direction) {
        case DIRECTIONS.UP:
            return DIRECTIONS.DOWN;
        case DIRECTIONS.DOWN:
            return DIRECTIONS.UP;
        case DIRECTIONS.LEFT:
            return DIRECTIONS.RIGHT;
        case DIRECTIONS.RIGHT:
            return DIRECTIONS.LEFT;
    }
}