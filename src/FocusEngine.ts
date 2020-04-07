import { Container } from "./context";

import { Coords, NewCoords, CellCollection, Maxes } from "./types";

import {
  getDirection,
  applyDirectionCoords,
  applyCellDimensionOffsets,
} from "./methods";

import Cell from "./Cell";

class FocusEngine extends Container {
  state: {
    coords: {
      x: 0;
      y: 0;
    };
    activeCellCoords: { x: 0; y: 0 };
    grid: [];
    cells: { [key: string]: Cell };
    activeCell: "";
    logs: false;
  };
  cellFocusEvents: { [key: string]: Function };
  cellBlurEvents: { [key: string]: Function };
  cellIndexChangeEvents: { [key: string]: Function };
  focusActions: { [key: string]: Function };
  constructor() {
    super();
    this.state = {
      coords: {
        x: 0,
        y: 0,
      },
      activeCellCoords: { x: 0, y: 0 },
      grid: [],
      cells: {},
      activeCell: "",
      logs: false,
    };
    this.cellFocusEvents = {};
    this.cellBlurEvents = {};
    this.cellIndexChangeEvents = {};
    this.focusActions = {};
  }

  log(m: any): void {
    if (this.state.logs) {
      console.log(m);
    }
  }

  overrideIndex(coords: Array<number>): void {
    if (!coords) {
      throw new Error("Coordinates must be provided when overriding");
    } else {
      this.log("Overriding coords");
      this.log(coords);
      this.setState({
        coords: {
          x: coords[0],
          y: coords[1],
        },
      });
    }
  }

  setGrid(
    gridNames: Array<[]>,
    activeCell: string,
    startingIndex: Array<number> = [0, 0],
    logs = false
  ): Promise<void> {
    this.log("Setting grid");
    this.log(gridNames);
    this.log(`With active cell ${activeCell}`);

    if (!activeCell) {
      throw new Error("Active cell needs to be specified when setting grid");
    }

    this.focusActions = {};

    let cells: CellCollection = {};
    let grid = gridNames.map((rows, yIndex) => {
      return rows.map((cellName, xIndex) => {
        if (cells[cellName]) {
          cells[cellName].addGridPosition = { x: xIndex, y: yIndex };
          return cells[cellName];
        } else {
          cells[cellName] = new Cell(cellName, { x: xIndex, y: yIndex });
          return cells[cellName];
        }
      });
    });

    return this.setState(
      {
        coords: { x: startingIndex[0], y: startingIndex[1] },
        grid,
        cells,
        activeCell,
        activeCellCoords: cells[activeCell].gridPositions[0],
        logs,
      },
      () => {
        this.log("------------ State update ----------");
        this.log(this.state);
        this.log("------------ Focus actions ----------");
        this.log(this.focusActions);
        this.log("------------ Cell Focus Events ----------");
        this.log(this.cellFocusEvents);
        this.log("------------ Cell Blur Events ----------");
        this.log(this.cellBlurEvents);
        this.log("----------------------");
      }
    );
  }

  setActiveCell(newActiveCell: string, direction: string): void {
    this.log(
      `Setting active cell ${newActiveCell} from direction ${direction}`
    );

    const { cells, activeCell } = this.state;

    this.fireIndexChangeEvent({
      nX: cells[newActiveCell].gridPositions[0].x,
      nY: cells[newActiveCell].gridPositions[0].y,
      direction,
    });

    this.cellFocusEvents[newActiveCell] &&
      this.cellFocusEvents[newActiveCell]();
    this.cellBlurEvents[activeCell] && this.cellBlurEvents[activeCell]();
    this.log("State update");
    this.log({
      activeCell: newActiveCell,
      activeCellCoords: cells[newActiveCell].gridPositions[0],
      coords: cells[newActiveCell].getNextLogicalIndex(direction),
    });
    this.setState({
      activeCell: newActiveCell,
      activeCellCoords: cells[newActiveCell].gridPositions[0],
      coords: cells[newActiveCell].getNextLogicalIndex(direction),
    });
    this.log("----------------------");
  }

  addCellCoords(cell: string, coords: Coords): void {
    let { grid } = this.state;
    let selectedCell = grid.reduce((acc: any | undefined, row: Array<Cell>) => {
      if (!acc) {
        return row.find((item: Cell) => item.name === cell);
      } else {
        return acc;
      }
    }, null);
    if (selectedCell) {
      selectedCell.addCoords = coords;
    }
  }

  addCellFocusEvent(cellName: string, func: Function) {
    this.cellFocusEvents[cellName] = func;
  }

  addCellBlurEvent(cellName: string, func: Function) {
    this.cellBlurEvents[cellName] = func;
  }

  addCellIndexChangeEvent(cellName: string, func: Function) {
    this.cellIndexChangeEvents[cellName] = func;
  }

  addFocusAction(index: Array<number>, cellName: string, func: Function) {
    this.focusActions[cellName + index.join()] = func;
  }

  onArrowUp = () => {
    const { x, y } = this.state.coords;
    this.log("Triggering move up");
    if (this.pipeMove(x, y - 1)) {
      this.setState({
        coords: {
          x,
          y: y - 1,
        },
      });
    }
  };

  onArrowDown = () => {
    this.log("Triggering move down");
    const { x, y } = this.state.coords;
    if (this.pipeMove(x, y + 1)) {
      this.setState({
        coords: {
          x,
          y: y + 1,
        },
      });
    }
  };

  onArrowLeft = () => {
    this.log("Triggering move left");
    const { x, y } = this.state.coords;
    if (this.pipeMove(x - 1, y)) {
      this.setState({
        coords: {
          x: x - 1,
          y,
        },
      });
    }
  };

  onArrowRight = () => {
    this.log("Triggering move right");
    const { x, y } = this.state.coords;
    if (this.pipeMove(x + 1, y)) {
      this.setState({
        coords: {
          x: x + 1,
          y,
        },
      });
    }
  };

  onEnter = () => {
    this.log("Triggering enter");
    const { coords, activeCell } = this.state;
    this.focusActions[activeCell + [coords.x, coords.y].join()] &&
      this.focusActions[activeCell + [coords.x, coords.y].join()]();
  };

  pipeMove(nX: number, nY: number) {
    this.log(`Piping move to x:${nX} y:${nY}`);
    const { coords }: { coords: Coords } = this.state;
    let newCoords: NewCoords = {
      nX,
      nY,
      direction: getDirection(nX, nY, coords.x, coords.y),
    };
    return this.applyNavLogic(newCoords);
  }

  applyNavLogic(newCoords: NewCoords) {
    this.log("Applying nav logic");
    const {
      cells,
      activeCell,
    }: { cells: CellCollection; activeCell: string } = this.state;
    const { maxes }: { maxes: Maxes } = cells[activeCell];
    const { coords }: { coords: Coords } = this.state;
    const { nX, nY, direction } = newCoords;
    const { xMaxes, yMaxes } = maxes;

    let canMove = false;

    if (direction === "x") {
      if (xMaxes[coords.y] < nX) {
        this.log("Cell edge reached");
        canMove = false;
        this.tryNavigateToNewCell(newCoords);
      } else {
        this.log("Move legal");
        canMove = true;
      }
    }

    if (direction === "-x") {
      if (nX >= 0) {
        this.log("Move legal");
        canMove = true;
      } else {
        this.log("Cell edge reached");
        canMove = false;
        this.tryNavigateToNewCell(newCoords);
      }
    }

    if (direction === "y") {
      if (yMaxes[coords.x] < nY) {
        if (xMaxes[nY] < xMaxes[coords.y] && coords.x > xMaxes[nY]) {
          if (typeof xMaxes[nY] != "undefined") {
            canMove = false;
            this.fireIndexChangeEvent({
              nX: xMaxes[nY],
              nY: nY,
              direction: newCoords.direction,
            });
            this.setState({
              coords: {
                x: xMaxes[nY],
                y: nY,
              },
            });
          }
        } else {
          this.log("Cell edge reached");
          canMove = false;
          this.tryNavigateToNewCell(newCoords);
        }
      } else {
        this.log("Move legal");
        canMove = true;
      }
    }

    if (direction === "-y") {
      if (nY >= 0) {
        if (xMaxes[nY] < xMaxes[coords.y] && coords.x > xMaxes[nY]) {
          if (typeof xMaxes[nY] != "undefined") {
            canMove = false;
            this.fireIndexChangeEvent({
              nX: xMaxes[nY],
              nY: nY,
              direction: newCoords.direction,
            });
            this.setState({
              coords: {
                x: xMaxes[nY],
                y: nY,
              },
            });
          }
        } else {
          this.log("Move legal");
          canMove = true;
        }
      } else {
        this.log("Cell edge reached");
        canMove = false;
        this.tryNavigateToNewCell(newCoords);
      }
    }
    if (canMove) {
      this.fireIndexChangeEvent(newCoords);
    }
    this.log("----------------------");
    return canMove;
  }

  fireIndexChangeEvent(newCoords: NewCoords) {
    const { activeCell } = this.state;
    this.cellIndexChangeEvents[activeCell] &&
      this.cellIndexChangeEvents[activeCell](newCoords);
  }

  tryNavigateToNewCell(newCoords: NewCoords) {
    //  FIXME: Good god refine this
    const { cells, grid, activeCell, activeCellCoords } = this.state;
    const { nX, nY, direction } = newCoords;
    let nextGridCoord = applyDirectionCoords({
      nX: activeCellCoords.x,
      nY: activeCellCoords.y,
      direction,
    });
    let nextCell = this.nextAvailableNeighboringCell(nextGridCoord);
    if (nextCell) {
      //  If name is the same it is a spanned cell
      if (nextCell === activeCell) {
        let nextCoords = applyCellDimensionOffsets(
          {
            nX: activeCellCoords.x,
            nY: activeCellCoords.y,
            direction,
          },
          cells[activeCell].height,
          cells[activeCell].width
        );
        let nextNextCell = this.nextAvailableNeighboringCell(nextCoords);
        if (nextNextCell) {
          this.setActiveCell(nextNextCell, direction);
        }
      } else {
        this.setActiveCell(nextCell, direction);
      }
    }
  }

  nextAvailableNeighboringCell(nextGridCoord: Coords) {
    const { cells } = this.state;
    let nextCell = undefined;
    Object.keys(cells).forEach((cellName) => {
      let canNavigate = cells[cellName].gridPositions.reduce(
        (acc: boolean, pos: Coords) => {
          if (!acc) {
            if (pos.x === nextGridCoord.x && pos.y === nextGridCoord.y) {
              return true;
            }
          }
          return acc;
        },
        false
      );
      if (canNavigate) {
        nextCell = cellName;
      }
    });
    return nextCell;
  }
}

export default new FocusEngine();
