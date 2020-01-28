import { Container } from "./context";

import { Coords, NewCoords, CellCollection, Maxes } from "./types";

import {
  getDirection,
  applyDirectionCoords,
  applyCellDimensionOffsets
} from "./methods";

import Cell from "./Cell";

class FocusEngine extends Container {
  cellFocusEvents: { [key: string]: Function };
  cellBlurEvents: { [key: string]: Function };
  cellIndexChangeEvents: { [key: string]: Function };
  focusActions: { [key: string]: Function };
  constructor() {
    super();
    this.state = {
      coords: {
        x: 0,
        y: 0
      },
      activeCellCoords: { x: 0, y: 0 },
      grid: [],
      cells: {},
      activeCell: ""
    };
    this.cellFocusEvents = {};
    this.cellBlurEvents = {};
    this.cellIndexChangeEvents = {};
    this.focusActions = {};
  }

  setGrid = (gridNames: Array<[]>, activeCell: string): Promise<void> => {
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
    return this.setState({
      grid,
      cells,
      activeCell,
      activeCellCoords: cells[activeCell].gridPositions[0]
    });
  };

  setActiveCell = (newActiveCell: string, direction: string): void => {
    const { cells, activeCell } = this.state;
    this.cellFocusEvents[newActiveCell] &&
      this.cellFocusEvents[newActiveCell]();
    this.cellBlurEvents[activeCell] && this.cellBlurEvents[activeCell]();
    this.setState({
      activeCell: newActiveCell,
      activeCellCoords: cells[newActiveCell].gridPositions[0],
      coords: cells[newActiveCell].getNextLogicalIndex(direction)
    });
  };

  addCellCoords = (cell: string, coords: Coords): void => {
    let { grid } = this.state;
    let selectedCell = grid.reduce(
      (acc: Cell | undefined, row: Array<Cell>) => {
        if (!acc) {
          return row.find((item: Cell) => item.name === cell);
        } else {
          return acc;
        }
      },
      null
    );
    if (selectedCell) {
      selectedCell.addCoords = coords;
    }
  };

  addCellFocusEvent = (cellName: string, func: Function) => {
    this.cellFocusEvents[cellName] = func;
  };

  addCellBlurEvent = (cellName: string, func: Function) => {
    this.cellBlurEvents[cellName] = func;
  };

  addCellIndexChangeEvent = (cellName: string, func: Function) => {
    this.cellIndexChangeEvents[cellName] = func;
  };

  addFocusAction = (index: Array<number>, cellName: string, func: Function) => {
    this.focusActions[cellName + index.join()] = func;
  };

  onArrowUp = () => {
    const { x, y } = this.state.coords;
    if (this.pipeMove(x, y - 1)) {
      this.setState({
        coords: {
          x,
          y: y - 1
        }
      });
    }
  };

  onArrowDown = () => {
    const { x, y } = this.state.coords;
    if (this.pipeMove(x, y + 1)) {
      this.setState({
        coords: {
          x,
          y: y + 1
        }
      });
    }
  };

  onArrowLeft = () => {
    const { x, y } = this.state.coords;
    if (this.pipeMove(x - 1, y)) {
      this.setState({
        coords: {
          x: x - 1,
          y
        }
      });
    }
  };

  onArrowRight = () => {
    const { x, y } = this.state.coords;
    if (this.pipeMove(x + 1, y)) {
      this.setState({
        coords: {
          x: x + 1,
          y
        }
      });
    }
  };

  onEnter = () => {
    const { coords, activeCell } = this.state;
    this.focusActions[activeCell + [coords.x, coords.y].join()] &&
      this.focusActions[activeCell + [coords.x, coords.y].join()]();
  };

  pipeMove = (nX: number, nY: number) => {
    const { coords }: { coords: Coords } = this.state;
    let newCoords: NewCoords = {
      nX,
      nY,
      direction: getDirection(nX, nY, coords.x, coords.y)
    };
    return this.applyNavLogic(newCoords);
  };

  applyNavLogic = (newCoords: NewCoords) => {
    const {
      cells,
      activeCell
    }: { cells: CellCollection; activeCell: string } = this.state;
    const { maxes }: { maxes: Maxes } = cells[activeCell];
    const { coords }: { coords: Coords } = this.state;
    const { nX, nY, direction } = newCoords;
    const { xMaxes, yMaxes } = maxes;

    let canMove = false;

    if (direction === "x") {
      if (xMaxes[coords.y] < nX) {
        canMove = false;
        this.tryNavigateToNewCell(newCoords);
      } else {
        canMove = true;
      }
    }

    if (direction === "-x") {
      if (nX >= 0) {
        canMove = true;
      } else {
        canMove = false;
        this.tryNavigateToNewCell(newCoords);
      }
    }

    if (direction === "y") {
      if (yMaxes[coords.x] < nY) {
        if (xMaxes[nY] < xMaxes[coords.y] && coords.x > xMaxes[nY]) {
          if (xMaxes[nY]) {
            canMove = false;
            this.setState({
              coords: {
                x: xMaxes[nY],
                y: nY
              }
            });
          }
        } else {
          canMove = false;
          this.tryNavigateToNewCell(newCoords);
        }
      } else {
        canMove = true;
      }
    }

    if (direction === "-y") {
      if (nY >= 0) {
        if (xMaxes[nY] < xMaxes[coords.y] && coords.x > xMaxes[nY]) {
          if (xMaxes[nY]) {
            canMove = false;
            this.setState({
              coords: {
                x: xMaxes[nY],
                y: nY
              }
            });
          }
        } else {
          canMove = true;
        }
      } else {
        canMove = false;
        this.tryNavigateToNewCell(newCoords);
      }
    }
    if (canMove) {
      this.fireIndexChangeEvent(newCoords);
    }
    return canMove;
  };

  fireIndexChangeEvent = (newCoords: NewCoords) => {
    const { activeCell } = this.state;
    this.cellIndexChangeEvents[activeCell] &&
      this.cellIndexChangeEvents[activeCell](newCoords);
  };

  tryNavigateToNewCell = (newCoords: NewCoords) => {
    //  FIXME: Good god refine this
    const { cells, grid, activeCell, activeCellCoords } = this.state;
    const { nX, nY, direction } = newCoords;
    let nextGridCoord = applyDirectionCoords({
      nX: activeCellCoords.x,
      nY: activeCellCoords.y,
      direction
    });
    let nextCell = this.nextAvailableNeighboringCell(nextGridCoord);
    if (nextCell) {
      //  If name is the same it is a spanned cell
      if (nextCell === activeCell) {
        let nextCoords = applyCellDimensionOffsets(
          {
            nX: activeCellCoords.x,
            nY: activeCellCoords.y,
            direction
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
  };

  nextAvailableNeighboringCell = (nextGridCoord: Coords) => {
    const { cells } = this.state;
    let nextCell = undefined;
    Object.keys(cells).forEach(cellName => {
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
  };
}

export default new FocusEngine();
