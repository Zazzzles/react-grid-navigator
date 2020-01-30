import { Coords, NewCoords } from "./types";

export function getDirection(
  nX: number,
  nY: number,
  x: number,
  y: number
): string {
  if (nY !== y) {
    if (nY > y) {
      return "y";
    } else {
      return "-y";
    }
  }
  if (nX !== x) {
    if (nX > x) {
      return "x";
    } else {
      return "-x";
    }
  }
  return "";
}

export function applyDirectionCoords(coords: NewCoords): Coords {
  const { nX, nY, direction } = coords;

  if (direction === "x") {
    return { x: nX + 1, y: nY };
  }
  if (direction === "-x") {
    return { x: nX - 1, y: nY };
  }
  if (direction === "y") {
    return { x: nX, y: nY + 1 };
  }
  if (direction === "-y") {
    return { x: nX, y: nY - 1 };
  }
  return { x: nX, y: nY };
}

export function applyCellDimensionOffsets(
  coords: NewCoords,
  height: number,
  width: number
): Coords {
  const { nX, nY, direction } = coords;

  if (direction === "x") {
    return {
      x: nX + width,
      y: nY
    };
  }
  if (direction === "-x") {
    return {
      x: nX - width,
      y: nY
    };
  }
  if (direction === "y") {
    return {
      x: nX,
      y: nY + height
    };
  }
  if (direction === "-y") {
    return {
      x: nX,
      y: nY - height
    };
  }

  return { x: nX, y: nY };
}

export function isValidGrid(grid: Array<Array<string>>) {
  let rowLength = grid[0].length;
  return grid.every(row => {
    return row.length === rowLength;
  });
}
