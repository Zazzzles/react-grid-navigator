import Cell from "./Cell.ts";

export type Coords = {
  x: number;
  y: number;
};

export type NewCoords = {
  nX: number;
  nY: number;
  direction: string;
};

export type Maxes = {
  xMaxes: Array<number>;
  yMaxes: Array<number>;
};

export type CellCollection = { [key: string]: Cell };
