/* eslint-disable no-debugger */
import React, { useEffect, useState } from "react";
import "./App.css";
import BaseShape, { Orientation } from "./BaseShape";

interface Shape {
  height: number;
  width: number;
  column: Column;
  row: number;
  orientation: Orientation;
  color: string;
  sprite: number[][];
}

enum Column {
  a,
  b,
  c,
  d,
  e,
  f,
  g,
  h,
  i,
  j,
}

function App() {
  const boardWidth = 10;
  const boardHeight = 12;

  const emptyBoard = [];
  for (let y = 0; y < boardHeight; y++) {
    const tempRow = [];
    for (let x = 0; x < boardWidth; x++) {
      tempRow.push("slate");
    }
    emptyBoard.push(tempRow);
  }
  // const emptyRow: string[] = new Array(boardWidth).fill("slate");
  // new Array(boardHeight).fill([...emptyRow])
  const [board, setBoard] = useState<string[][]>(emptyBoard);

  const piece: Shape = {
    height: 2,
    width: 3,
    column: Column.a,
    row: 0,
    orientation: Orientation.Up,
    color: "purple",
    sprite: [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  };

  useEffect(() => {
    const tempBoard = [...board];

    const column = piece.column;
    const row = piece.row;
    piece.sprite.map((myRow, rowIndex) => {
      // debugger;
      myRow.map((spot, colIndex) => {
        // debugger;

        const color = spot === 1 ? piece.color : "slate";
        const myRow = (row + rowIndex) as Column;
        tempBoard[myRow].splice(column + colIndex, 1, color);
      });
    });
    setBoard(tempBoard);
  }, []);

  return (
    <div className="max-w-2xl m-2">
      <div className="App m-x-auto">
        {board.map((row, index) => {
          return <Row key={index} spots={row} />;
        })}
      </div>
    </div>
  );
}

export default App;

interface RowProps {
  spots: string[];
}
export const Row = ({ spots }: RowProps) => {
  return (
    <div className="grid grid-cols-10 ">
      {spots.length > 0 &&
        spots?.map((spot, index) => {
          return <BaseShape key={`spot-${index}`} color={`bg-${spot}-400`} />;
        })}
    </div>
  );
};
