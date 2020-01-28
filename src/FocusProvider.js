import React, { memo, useEffect } from "react";

import { Subscribe } from "./unstated";
import FocusEngine from "./FocusEngine";

const FocusProvider = ({ children, cell }) => {
  useEffect(() => {
    registerCells();
  });

  function registerCells() {
    React.Children.forEach(children, elem => {
      if (elem) {
        if (elem.props.focusIndex) {
          const [x, y] = elem.props.focusIndex;
          FocusEngine.addCellCoords(cell, { x, y });
        } else {
          throw new Error("Focus index not provided on elements");
        }
      }
    });
  }

  function renderFocusedElement(elem, x, y) {
    const [elemX, elemY] = elem.props.focusIndex;

    if (elem.props.focusAction) {
      FocusEngine.addFocusAction(
        elem.props.focusIndex,
        cell,
        elem.props.focusAction
      );
    }

    if (elemX === x && elemY === y) {
      return React.cloneElement(elem, {
        focused: true
      });
    } else {
      return elem;
    }
  }

  function renderElementsWithFocus(engineState) {
    const { x, y } = engineState.coords;
    const { activeCell } = engineState;
    if (activeCell === cell) {
      let focusedElements = React.Children.map(children, elem => {
        if (elem) {
          if (!elem.props.focusIndex) {
            throw new Error("Focus index not provided on elements");
          }
          return renderFocusedElement(elem, x, y);
        }
      });

      return focusedElements;
    } else {
      return children;
    }
  }

  return (
    <Subscribe to={[FocusEngine]}>
      {engine => renderElementsWithFocus(engine.state)}
    </Subscribe>
  );
};

export default memo(FocusProvider);
