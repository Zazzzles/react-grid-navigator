# react-grid-navigator

A small library for keyboard focus-based navigation of a UI

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install.

```bash
npm install react-grid-navigator
```

## Adding keyboard listeners

Firstly we need to hook keyboard events into the FocusEngine

```js
import { FocusEngine } from "react-grid-navigator";

document.addEventListener("keydown", event => {
  event.preventDefault();
  switch (event.code) {
    case "ArrowUp":
      FocusEngine.onArrowUp();
      break;
    case "ArrowDown":
      FocusEngine.onArrowDown();
      break;
    case "ArrowLeft":
      FocusEngine.onArrowLeft();
      break;
    case "ArrowRight":
      FocusEngine.onArrowRight();
      break;
    case "Enter":
      FocusEngine.onEnter();
      break;
    default:
      break;
  }
});
```

## Setting up context provider

This package uses context for state propegation. For this to work, you need to wrap the root element of your app in `GridContext`

```js
import React from "react";

import RootComponent from './src/root'

import { GridContext } from 'react-grid-navigator'

export default function App () {

    return <GridContext>
    <RootComponent>
    </GridContext>

}

```

## Setting up the grid

![Example](https://i.imgur.com/7SLSr0g.jpg)

First we need to define our grid layout by providing a nested array of rows and columns. This grid will mirror the layout of your UI.

Start by defining cell names on the grid. Each cell will have focusable indexes inside and focus will switch between the cells when a cell's limit is reached.

```js
import { FocusEngine } from "react-grid-navigator";

FocusEngine.setGrid(
  [
    ["sidenav", "contentTop", "sidebar"],
    ["sidenav", "content", "sidebar"]
  ],
  "content" // <- starting cell
);
```

With the above grid, when the last focusable element of cell `content` is reached on the x-axis, focus will switch to the first element in cell `sidebar`.

Likewise, if the last focusable element of cell `content` is reached on the y axis, focus will be switched to the first element of the `contentTop` cell.

**NOTE** : The grid that you specify will determine what cells are navigatable to from relative cells

This is an example of where you'll be able to navigate from `content` to `sidebar`, but not from `contentTop` to `sidebar`.

```js
import { FocusEngine } from "react-grid-navigator";

FocusEngine.setGrid(
  [
    ["sidenav", "contentTop"],
    ["sidenav", "content", "sidebar"]
  ],
  "content"
);
```

Defining a grid is best done before all UI components are mounted. So do this in a top-level component's `componentDidMount` method after binding listeners.

You can also pass a default coordinate for the starting cell by adding an additional argument to `setGrid` in the format of `[x: number, y:number]` which will be the default coordinate when the grid is set :

```js
import { FocusEngine } from "react-grid-navigator";

FocusEngine.setGrid(
  [
    ["sidenav", "contentTop", "sidebar"],
    ["sidenav", "content", "sidebar"]
  ],
  "content",
  [0, 1] // <- Starting coordinate for cell `content`
);
```

## Defining focusable components

![Example1](https://i.imgur.com/2p482CP.jpg)

`FocusProvider` is used to wrap elements that need to have a focusable state. All elements that need to be focusable need to be direct children of `FocusProvider`.

`FocusProvider` passes a `focused` prop into children if they should render in a focused state.

`FocusProvider` takes a `cell` param which indicates which cell in the grid the `FocusProvider` belongs to. The cell props needs to match the cell name defined in the above grid.

Direct children of `FocusProvider` each require a `focusIndex` prop which consists of an `x` and `y` coordinate. These coordinates are used to determine the position of the elements relative to each other.

Direct children of `FocusProvider` can also optionally take a `focusAction` props which binds to a function that gets fired when the `enter` key is pressed while that element has focus.

```js
import { FocusProvider } from 'react-grid-navigator'

 <Content>
            <ContentWrapper>
              <SideNav>
                <FocusProvider cell={"sidenav"}>
                  <SidenavItem
                    focusAction={this.openModal}
                    focusIndex={[0, 0]}
                  />
                  <SidenavItem focusIndex={[0, 1]} />
                  <SidenavItem focusIndex={[0, 2]} />
                  <SidenavItem focusIndex={[0, 3]} />
                  <SidenavItem focusIndex={[0, 4]} />
                  <SidenavItem focusIndex={[0, 5]} />
                </FocusProvider>
              </SideNav>
              <ContentInner>
                <ContentTopbar>
                  <FocusProvider cell={"contentTop"}>
                    <TopbarItem focusIndex={[0, 0]} />
                    <TopbarItem focusIndex={[1, 0]} />
                  </FocusProvider>
                </ContentTopbar>
                <CardContainer>
                  <FocusProvider cell={"content"}>
                    <ContentCard focusIndex={[0, 0]} />
                    <ContentCard focusIndex={[1, 0]} />
                    <ContentCard focusIndex={[2, 0]} />
                  </FocusProvider>
                </CardContainer>
                <CardContainer>
                  <FocusProvider cell={"content"}>
                    <ContentCard focusIndex={[0, 1]} />
                    <ContentCard focusIndex={[1, 1]} />
                    <ContentCard focusIndex={[2, 1]} />
                    <ContentCard focusIndex={[3, 1]} />
                  </FocusProvider>
                </CardContainer>
                <CardContainer>
                  <FocusProvider cell={"content"}>
                    <ContentCard focusIndex={[0, 2]} />
                    <ContentCard focusIndex={[1, 2]} />
                  </FocusProvider>
                </CardContainer>
              </ContentInner>
            </ContentWrapper>
          </Content>
          <Sidebar>
            <FocusProvider cell={"sidebar"}>
              <SidebarItem focusIndex={[0, 0]} />
              <SidebarItem focusIndex={[0, 1]} />
              <SidebarItem focusIndex={[0, 2]} />
              <SidebarItem focusIndex={[0, 3]} />
              <SidebarItem focusIndex={[0, 4]} />
              <SidebarItem focusIndex={[0, 5]} />
              <SidebarItem focusIndex={[0, 6]} />
              <SidebarItem focusIndex={[0, 7]} />
            </FocusProvider>
          </Sidebar>
```

Note that multiple `FocusProviders` can belong to the same cell. If `FocusProviders` belong to the same cell, their inner focusable elements are all part of the same inner-grid, which means that their coordinates need to correspond with their positions relative to the focusable elements in other `FocusProviders` belonging to the same cell.

## Useful methods

`FocusProvider.setGrid(grid, initialFocusedCell)`

`FocusProvider.setGrid` can be called at any time to provide a new grid. This is useful for when conditionally rendered content is used for modals and such. Here is an example for use with a modal:

```js
import { FocusEngine } from "react-grid-navigator";

setDefaultGrid = () => {
  // <- this is called on component mount to setup full page grid
  FocusEngine.setGrid(
    [
      ["sidenav", "contentTop", "sidebar"],
      ["sidenav", "content", "sidebar"]
    ],
    "content"
  );
};

setModalGrid = () => {
  // <- this is called when modal opens to set a new grid for the modal
  FocusEngine.setGrid([["modalTop"], ["modalContent"]], "modalTop");
};

openModal = () => {
  // <- gets bound to the `focusAction` of the element we need to trigger the modal
  this.setState({ modalOpen: true });
  this.setModalGrid();
};
closeModal = () => {
  // <- gets bound to the `focusAction` of the element we need to close the modal
  this.setState({ modalOpen: false });
  this.setDefaultGrid();
};
```

Above we can see that we switch from the full page grid to a modal grid which consists of just 1 column with 2 rows.

Here is what the modal would look like:

```js
{
  modalOpen && (
    <ModalContainer>
      <Modal>
        <ModalTopbar>
          <FocusProvider cell={"modalTop"}>
            <ModalExit focusAction={this.closeModal} focusIndex={[0, 0]} />
          </FocusProvider>
        </ModalTopbar>
        <ModalContent>
          <FocusProvider cell={"modalContent"}>
            <ModalAction focusIndex={[0, 0]} />
            <ModalAction focusIndex={[1, 0]} />
          </FocusProvider>
        </ModalContent>
      </Modal>
    </ModalContainer>
  );
}
```

From this example we can se that the `modalTop` cell contains the close modal button, and the `modalContent` cell contains the modal actions.

`FocusEngine.addCellFocusEvent(cellName, function)`

This method is fired when a specific cell receives focus. This is useful for cases where we want to trigger things like a sidebar opening

`FocusEngine.addCellBlurEvent(cellName, function)`

This method is fired when a specific cell loses focus

`FocusEngine.addCellIndexChangeEvent(cellName, function(newCoords))`

This method is fired when focus changes inside a specific cell. On focus change, the specified function will be called with a param containing the new coordinates. The param passed into this function looks like:

```js
{
  nX: 1, // new x coordinate
  nY: 0, // new y coordinate
  direction: "x" // direction of change - "x" | "-x" | "y" | "-y"
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
