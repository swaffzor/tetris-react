/* eslint-disable no-debugger */
import React, { useEffect, useState } from "react";
import "./App.css";
import BaseShape, { Orientation } from "./BaseShape";
import useKeyPress from "./useKeyPress";

interface Shape {
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
  const empty = "bg-slate-400";
  const emptyBoard: string[][] = [];
  for (let y = 0; y < boardHeight; y++) {
    const tempRow: string[] = [];
    for (let x = 0; x < boardWidth; x++) {
      tempRow.push(empty);
    }
    emptyBoard.push(tempRow);
  }

  const pieces = {
    i: {
      color: "bg-blue-400",
      sprite: [[1], [1], [1], [1]],
    },
    j: {
      color: "bg-red-400",
      sprite: [
        [1, 0, 0],
        [1, 1, 1],
      ],
    },
    l: {
      color: "bg-orange-400",
      sprite: [
        [0, 0, 1],
        [1, 1, 1],
      ],
    },
    o: {
      color: "bg-yellow-400",
      sprite: [
        [1, 1],
        [1, 1],
      ],
    },
    s: {
      color: "bg-green-400",
      sprite: [
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    t: {
      color: "bg-blue-400",
      sprite: [
        [0, 1, 0],
        [1, 1, 1],
      ],
    },
    z: {
      color: "bg-purple-400",
      sprite: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    },
  };

  const initalPiece: Shape = {
    row: 0,
    column: Column.e,
    orientation: Orientation.Up,
    color: pieces["i"].color,
    sprite: pieces["i"].sprite,
  };

  const [board, setBoard] = useState<string[][]>(emptyBoard);
  const [piece, setPiece] = useState<Shape>(initalPiece);
  const [time, setTime] = useState(0);
  const [isPieceSet, setIsPieceSet] = useState(false);

  const leftPressed = useKeyPress("ArrowLeft");
  const rightPressed = useKeyPress("ArrowRight");

  useEffect(() => {
    const tempBoard = [...board];
    piece.sprite.map((myRow, rowIndex) => {
      myRow.map((spot, colIndex) => {
        const color = spot === 1 ? piece.color : empty;
        const myRow = (piece.row + rowIndex) as Column;
        if (myRow < tempBoard.length) {
          tempBoard[myRow].splice(piece.column + colIndex, 1, color);
        }
      });
    });
    setBoard(tempBoard);
  }, [piece]);

  useEffect(() => {
    // move piece down G R A V I T Y
    if (piece.row + piece.sprite.length < boardHeight) {
      setBoard(
        board.map((row, index) =>
          index === piece.row ? new Array(boardWidth).fill(empty) : row
        )
      );
      setPiece({ ...piece, row: piece.row + 1 });
    } else {
      setIsPieceSet(true);
    }
    setTimeout(() => {
      setTime(time + 1);
    }, 1000);

    return () => clearInterval();
  }, [time]);

  useEffect(() => {
    if (leftPressed && !isPieceSet) {
      setPiece({ ...piece, column: piece.column - 1 });
      shiftLeft();
    }
    if (rightPressed && !isPieceSet) {
      setPiece({ ...piece, column: piece.column + 1 });
      shiftRight();
    }
  }, [leftPressed, rightPressed]);

  useEffect(() => {
    let nextPiece = pieces["l"];
    switch (Math.floor(Math.random() * 6)) {
      case 0:
        nextPiece = pieces["i"];
        break;
      case 1:
        nextPiece = pieces["j"];
        break;
      case 2:
        nextPiece = pieces["l"];
        break;
      case 3:
        nextPiece = pieces["o"];
        break;
      case 4:
        nextPiece = pieces["s"];
        break;
      case 5:
        nextPiece = pieces["t"];
        break;
      case 6:
        nextPiece = pieces["z"];
        break;
      default:
        break;
    }
    setPiece({
      row: 0,
      column: Column.e,
      color: nextPiece.color,
      sprite: nextPiece.sprite,
      orientation: Orientation.Up,
    });
    setIsPieceSet(false);
  }, [isPieceSet]);

  const shiftLeft = () => {
    const b = board.map((row) => {
      return row.reduce((cumuRow: string[], current, currentIndex, self) => {
        if (currentIndex + 1 < self.length) {
          cumuRow.push(self[currentIndex + 1]);
        } else {
          cumuRow.push(empty);
        }
        return cumuRow;
      }, []);
    });
    setBoard(b);
  };

  const shiftRight = () => {
    const b = board.map((row) => {
      return row.reduce((cumuRow: string[], current, currentIndex, self) => {
        if (currentIndex - 1 >= 0) {
          cumuRow.push(self[currentIndex - 1]);
        } else {
          cumuRow.push(empty);
        }
        return cumuRow;
      }, []);
    });
    setBoard(b);
  };

  return (
    <div className="">
      <div className="max-w-2xl m-2">
        <div className="m-x-auto">
          {board.map((row, index) => {
            return <Row key={index} spots={row} />;
          })}
        </div>
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
          return (
            <div
              key={`spot-${index}`}
              className={`${spot} w-16 h-16 m-auto border`}
            ></div>
          );
        })}
    </div>
  );
};
