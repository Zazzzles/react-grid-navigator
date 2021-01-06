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

export function makeHash( str: String ) {
  if (str.length % 32 > 0) str += Array(33 - str.length % 32).join("z");
  var i, j, k, a; i = j = k = a = 0;
  var hash = '', bytes = [], dict = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','1','2','3','4','5','6','7','8','9'];
  for (i = 0; i < str.length; i++ ) {
      var ch = str.charCodeAt(i);
      bytes[j++] = (ch < 127) ? ch & 0xFF : 127;
  }
  var chunk_len = Math.ceil(bytes.length / 32);   
  for (i=0; i<bytes.length; i++) {
      j += bytes[i];
      k++;
      if ((k === chunk_len) || (i === bytes.length-1)) {
          a = Math.floor( j / k );
          if (a < 32)
              hash += '0';
          else if (a > 126)
              hash += 'z';
          else
              hash += dict[  Math.floor( (a-32) / 2.76) ];
          j = k = 0;
      }
  }
  return hash;
}