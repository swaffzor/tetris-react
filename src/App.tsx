/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
import React, { useEffect, useState } from "react";
import { useKeyPress } from "./hooks";
import { Color, Column, PieceSprite, Spot, Sprite, SpriteEntry } from "./types";
import * as sprites from "./sprites.json";
import "./App.css";

function App() {
  const boardWidth = 10;
  const boardHeight = 12;
  const empty: Spot = {
    color: "bg-slate-400",
    fixed: false,
    row: 0,
    col: 0,
    value: "0",
  };
  const emptyRow: Spot[] = new Array(boardWidth).fill({
    color: "bg-slate-400",
    fixed: false,
  });
  const emptyBoard: Spot[][] = [];
  // init an empty board
  for (let y = 0; y < boardHeight; y++) {
    const tempRow: Spot[] = [];
    for (let x = 0; x < boardWidth; x++) {
      tempRow.push({
        ...empty,
        color: "bg-slate-400",
        col: x,
        row: y,
        value: `r${y} c${x}`,
      });
    }
    emptyBoard.push(tempRow);
  }

  const pieceSprites: PieceSprite = sprites as PieceSprite;

  const [board, setBoard] = useState<Spot[][]>(emptyBoard);
  const [piece, setPiece] = useState<SpriteEntry>(pieceSprites.j);
  const [velocity, setVelocity] = useState(1000);
  const [time, setTime] = useState(0);
  const [dropPiece, setDropPiece] = useState(false);
  const [fastGravity, setFastGravity] = useState(false);

  const keyLeftPressed = useKeyPress("ArrowLeft");
  const keyRightPressed = useKeyPress("ArrowRight");
  const keyUpPressed = useKeyPress("ArrowUp");
  const keyDownPressed = useKeyPress("ArrowDown");
  const keyWPressed = useKeyPress("w");
  const keyAPressed = useKeyPress("a");
  const keySPressed = useKeyPress("s");
  const keyDPressed = useKeyPress("d");
  const keyShiftPressed = useKeyPress("Shift");
  const rotateCW = useKeyPress(" ");
  const rotateCounterCW = rotateCW && keyShiftPressed;
  const leftPressed = keyLeftPressed || keyAPressed;
  const rightPressed = keyRightPressed || keyDPressed;

  useEffect(() => {
    setFastGravity(keyDownPressed || keySPressed);
  }, [keyDownPressed, keySPressed]);

  useEffect(() => {
    setDropPiece(keyUpPressed || keyWPressed);
  }, [keyUpPressed, keyWPressed]);

  const replaceSpotInBoard = (row: number, column: Column, newSpot: Spot) => {
    const tempBoard = [...board];
    tempBoard[row].splice(column, 1, newSpot);
    setBoard(tempBoard);
  };

  const colorTheSpots = (
    theSprite: SpriteEntry,
    color: Color,
    fixed: boolean
  ) => {
    const tempBoard = [...board];
    theSprite.sprite.forEach((spriteSpot) => {
      const isFixed = tempBoard[spriteSpot.row][spriteSpot.col]?.fixed;
      !isFixed &&
        tempBoard[spriteSpot.row].splice(spriteSpot.col, 1, {
          row: spriteSpot.row,
          col: spriteSpot.col,
          color: color,
          fixed,
          value: `r${spriteSpot.row} c${spriteSpot.col}`,
        });
    });

    setBoard(clearLines(tempBoard));
  };

  const setTheSprite = (newSprite: SpriteEntry, fixed?: boolean) => {
    setPiece((oldSprite) => {
      colorTheSpots(oldSprite, "bg-slate-400", false);
      colorTheSpots(newSprite, newSprite.color, !!fixed);
      return newSprite;
    });
  };

  const clearLines = (tempBoard: Spot[][]) => {
    const cleared =
      tempBoard.filter((row) =>
        row.filter((spot) => spot.fixed).length === boardWidth ? false : true
      ) ?? [];
    if (cleared.length < boardHeight) {
      for (let i = 0; i < boardHeight - cleared.length; i++) {
        cleared.unshift([...emptyRow]);
        console.log("line cleared");
      }
    }
    return cleared;
  };

  useEffect(() => {
    time > 0 && setVelocity(dropPiece ? velocity / 10000 : velocity * 10000);
  }, [dropPiece]);

  useEffect(() => {
    time > 0 && setVelocity(fastGravity ? velocity / 10 : velocity * 10);
  }, [fastGravity]);

  useEffect(() => {
    // move piece down G R A V I T Y
    let pieceFixed = false;
    if (piece.row + piece.height < boardHeight) {
      let allowed = true;
      piece.sprite.forEach((spot) => {
        const isFixed = board[spot.row + 1][spot.col]?.fixed;
        if (isFixed) {
          allowed = !isFixed;
        }
      });

      if (allowed) {
        setTheSprite({
          ...piece,
          row: piece.row + 1,
          sprite: piece.sprite.map((spot) => {
            return {
              ...spot,
              row: spot.row + 1,
            };
          }),
        });
      } else {
        setTheSprite(piece, true);
        pieceFixed = true;
      }
    } else {
      setTheSprite(piece, true);
      pieceFixed = true;
    }

    if (pieceFixed) {
      dropPiece && setDropPiece(false);
      fastGravity && setFastGravity(false);
      // get next sprite
      let nextPiece = pieceSprites["j"];
      // switch (Math.floor(Math.random() * 6)) {
      switch (piece.name) {
        case "i":
          nextPiece = pieceSprites["j"];
          break;
        case "j":
          nextPiece = pieceSprites["l"];
          break;
        case "l":
          nextPiece = pieceSprites["o"];
          break;
        case "o":
          nextPiece = pieceSprites["s"];
          break;
        case "s":
          nextPiece = pieceSprites["t"];
          break;
        case "t":
          nextPiece = pieceSprites["z"];
          break;
        case "z":
        default:
          nextPiece = pieceSprites["i"];
          break;
      }
      setTheSprite(nextPiece);
    }

    let timeout = setTimeout(() => {
      setTime(time + 1);
    }, velocity);

    return () => clearInterval(timeout);
  }, [time, velocity]);

  // const timer = async () => {
  //   return new Promise((res =>))
  // }

  useEffect(() => {
    // move left or right
    const magnitude = leftPressed ? piece.column : piece.column + piece.width;
    const direction =
      leftPressed && magnitude > 0
        ? -1
        : rightPressed && magnitude < boardWidth
        ? 1
        : 0;
    let allowed = true;
    piece.sprite.forEach((spot) => {
      const isFixed = board[spot.row][spot.col + direction]?.fixed;
      if (isFixed) {
        allowed = !isFixed;
      }
    });

    allowed &&
      setTheSprite({
        ...piece,
        column: piece.column + direction,
        sprite: piece.sprite.map((spot) => {
          return {
            ...spot,
            col: spot.col + direction,
          };
        }),
      });
  }, [leftPressed, rightPressed]);

  useEffect(() => {
    // rotation
    // debounce protection
    if (!rotateCW && !rotateCounterCW) {
      return;
    }
    let count = 1;
    let max = Math.max(piece.height, piece.width) + 1;

    let tempMatrix: number[][] = [];
    for (let y = 0; y < max; y++) {
      tempMatrix.push([]);
      for (let x = 0; x < max; x++) {
        tempMatrix[y].push(0);
      }
    }
    piece.sprite.forEach((s) => {
      tempMatrix[s.row - piece.row + 1][s.col - piece.column + 1] = count++;
    });

    let rotated: number[][] = [...tempMatrix];
    for (let i = 0; i < (rotateCounterCW ? 3 : 1); i++) {
      rotated = rotated[0].map((val, index) =>
        rotated.map((row) => row[index]).reverse()
      );
    }

    const converted: Sprite = [];
    rotated.forEach((row, y) => {
      row.forEach((spot, x) => {
        const index = spot > 0 ? spot - 1 : -1;
        index >= 0 &&
          converted?.splice(index, 0, {
            row: y + piece.row - 1,
            col: x + piece.column - 1,
          });
      });
    });
    const cornerPosition = converted.reduce(
      (lowest, current) => {
        const col = lowest.col < current.col ? lowest.col : current.col;
        const row = lowest.row < current.row ? lowest.row : current.row;
        return { col, row };
      },
      { col: converted[0].col, row: converted[0].row }
    );

    setTheSprite({
      ...piece,
      sprite: converted,
      height: piece.width,
      width: piece.height,
      row: cornerPosition.row,
      column: cornerPosition.col,
    });
  }, [rotateCW, rotateCounterCW]);

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
  spots: Spot[];
}
export const Row = ({ spots }: RowProps) => {
  return (
    <div className="grid grid-cols-10 ">
      {spots.length > 0 &&
        spots?.map((spot, index) => {
          return (
            <div
              key={`spot-${index}`}
              className={`${spot.color} w-16 h-16 m-auto border`}
            >
              {/* {spot.value} */}
            </div>
          );
        })}
    </div>
  );
};
