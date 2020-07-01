import { Coords, Maxes } from './types';

export default class Cell {
  coords: Array<Coords>;
  gridPositions: Array<Coords>;
  name: string;
  maxes: Maxes;
  width: number;
  height: number;

  constructor(name: string, gridPosition: Coords) {
    this.coords = [];
    this.name = name;
    this.width = 0;
    this.height = 0;
    this.gridPositions = [gridPosition];
    this.maxes = { xMaxes: [], yMaxes: [] };
  }

  set setName(name: string) {
    this.name = name;
  }

  set addGridPosition(coords: Coords) {
    this.gridPositions.push(coords);
    this.calculateDimensions();
  }

  set addCoords(newCoords: Coords) {
    let hasCoords = !this.coords.every((coords: Coords) => {
      return !(newCoords.x === coords.x && newCoords.y === coords.y);
    });
    if (!hasCoords) {
      this.coords.push(newCoords);
      this.calculateMaxes();
      this.calculateDimensions();
    }
  }

  getNextLogicalIndex = (direction: string) => {
    if (direction === '-x') {
      if (Math.max(...this.maxes.xMaxes) === 0) {
        return {
          x: 0,
          y: 0,
        };
      } else {
        return {
          x: Math.max(...this.maxes.xMaxes),
          y: this.maxes.yMaxes[Math.max(...this.maxes.xMaxes)],
        };
      }
    }
    return {
      x: 0,
      y: 0,
    };
  };

  calculateDimensions() {
    //  FIXME: Remove these logs
    console.log('##############################');
    console.log('Calculating dimensions for', this.name);

    let isHorizontal = this.gridPositions.every((coord) => {
      return coord.y === this.gridPositions[0].y;
    });
    let isVertical = this.gridPositions.every((coord) => {
      return coord.x === this.gridPositions[0].x;
    });
    console.log('isHorz : ', isHorizontal);
    console.log('isVert : ', isVertical);
    if (isHorizontal && isVertical) {
      console.log(
        'Setting w and h to ',
        this.gridPositions.length,
        this.gridPositions.length
      );
      this.width = this.gridPositions.length;
      this.height = this.gridPositions.length;
    } else {
      if (isHorizontal) {
        console.log(
          'Setting w and h to ',
          this.gridPositions.length,
          Math.max(...this.gridPositions.map((pos) => pos.x))
        );
        this.width = this.gridPositions.length;
        this.height = Math.max(...this.gridPositions.map((pos) => pos.x));
      }
      if (isVertical) {
        console.log(
          'Setting w and h to ',
          Math.max(...this.gridPositions.map((pos) => pos.y)),
          this.gridPositions.length
        );
        this.height = this.gridPositions.length;
        this.width = Math.max(...this.gridPositions.map((pos) => pos.y));
      }
    }
    console.log('##############################');
  }

  calculateMaxes() {
    this.coords.forEach(({ x, y }) => {
      this.maxes = {
        xMaxes: this.updateMaxes(this.maxes.xMaxes, y, x),
        yMaxes: this.updateMaxes(this.maxes.yMaxes, x, y),
      };
    });
  }

  updateMaxes(maxes: Array<number>, targetIndex: number, effectIndex: number) {
    if (maxes[targetIndex]) {
      if (maxes[targetIndex] < effectIndex) {
        maxes[targetIndex] = effectIndex;
      }
    } else {
      maxes[targetIndex] = effectIndex;
    }
    return maxes;
  }
}
