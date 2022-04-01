/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
import React, { useEffect, useState } from "react";
import useKeyPress from "./useKeyPress";
import { Color, PieceSprite, Spot, SpriteEntry } from "./types";
import "./App.css";

function App() {
  const boardWidth = 10;
  const boardHeight = 12;
  const empty: Spot = { color: "bg-slate-400", fixed: false };
  const emptyBoard: Spot[][] = [];
  // init an empty board
  for (let y = 0; y < boardHeight; y++) {
    const tempRow: Spot[] = [];
    for (let x = 0; x < boardWidth; x++) {
      tempRow.push({
        ...empty,
        color: "bg-slate-400",
        col: y,
        row: x,
      });
    }
    emptyBoard.push(tempRow);
  }

  const pieceSprites: PieceSprite = {
    i: {
      name: "i",
      color: "bg-blue-400",
      sprite: [
        { row: 0, col: 4 },
        { row: 1, col: 4 },
        { row: 2, col: 4 },
        { row: 3, col: 4 },
      ],
      height: 4,
      width: 1,
      row: 0,
      column: 4,
    },
    j: {
      name: "j",
      color: "bg-red-400",
      sprite: [
        { row: 0, col: 4 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
        { row: 1, col: 6 },
      ],
      height: 2,
      width: 3,
      row: 0,
      column: 4,
    },
    l: {
      name: "l",
      color: "bg-orange-400",
      sprite: [
        { row: 0, col: 6 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
        { row: 1, col: 6 },
      ],
      height: 2,
      width: 3,
      row: 0,
      column: 4,
    },
    o: {
      name: "o",
      color: "bg-yellow-400",
      sprite: [
        { row: 0, col: 4 },
        { row: 0, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
      ],
      height: 2,
      width: 2,
      row: 0,
      column: 4,
    },
    s: {
      name: "s",
      color: "bg-green-400",
      sprite: [
        { row: 0, col: 5 },
        { row: 0, col: 6 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
      ],
      height: 2,
      width: 3,
      row: 0,
      column: 4,
    },
    t: {
      name: "t",
      color: "bg-pink-400",
      sprite: [
        { row: 0, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
        { row: 1, col: 6 },
      ],
      height: 2,
      width: 3,
      row: 0,
      column: 4,
    },
    z: {
      name: "z",
      color: "bg-purple-400",
      sprite: [
        { row: 0, col: 4 },
        { row: 0, col: 5 },
        { row: 1, col: 5 },
        { row: 1, col: 6 },
      ],
      height: 2,
      width: 3,
      row: 0,
      column: 4,
    },
  };

  const [board, setBoard] = useState<Spot[][]>(emptyBoard);
  const [sprite, setSprite] = useState<SpriteEntry>(pieceSprites.i);
  const [time, setTime] = useState(0);
  const [isPieceSet, setIsPieceSet] = useState(false);

  const keyLeftPressed = useKeyPress("ArrowLeft");
  const keyAPressed = useKeyPress("a");
  const keyRightPressed = useKeyPress("ArrowRight");
  const keyDPressed = useKeyPress("d");
  const keySpacePressed = useKeyPress(" ");
  const leftPressed = keyLeftPressed || keyAPressed;
  const rightPressed = keyRightPressed || keyDPressed;

  const colorTheSpots = (
    theSprite: SpriteEntry,
    color: Color,
    fixed: boolean
  ) => {
    const tempBoard = [...board];
    theSprite.sprite.forEach((spriteSpot) => {
      const isFixed = tempBoard[spriteSpot.row][spriteSpot.col].fixed;
      !isFixed &&
        tempBoard[spriteSpot.row].splice(spriteSpot.col, 1, {
          color: color,
          fixed,
        });
    });
    setBoard(tempBoard);
  };

  const setTheSprite = (newSprite: SpriteEntry, fixed?: boolean) => {
    setSprite((oldSprite) => {
      colorTheSpots(oldSprite, "bg-slate-400", false);
      colorTheSpots(newSprite, newSprite.color, !!fixed);
      return newSprite;
    });
  };

  useEffect(() => {
    const tempBoard = [...board];
    sprite.sprite.forEach((spriteSpot, rowIndex) => {
      // color spot above falling sprite
      if (rowIndex === 0) {
        tempBoard[spriteSpot.row - 1]?.splice(spriteSpot.col, 1, {
          color: "bg-slate-400",
          fixed: false,
        });
      }
      // color each spot on board where sprite is
      tempBoard[spriteSpot.row].splice(spriteSpot.col, 1, {
        color: sprite.color,
        fixed: false,
      });
    });

    setBoard(tempBoard);
  }, [sprite]);

  useEffect(() => {
    // move piece down G R A V I T Y
    if (sprite.row + sprite.height < boardHeight) {
      let allowed = true;
      sprite.sprite.forEach((spot) => {
        const isFixed = board[spot.row + 1][spot.col]?.fixed;
        if (isFixed) {
          allowed = !isFixed;
        }
      });

      if (allowed) {
        setTheSprite({
          ...sprite,
          row: sprite.row + 1,
          sprite: sprite.sprite.map((spot) => {
            return {
              ...spot,
              row: spot.row + 1,
            };
          }),
        });
      } else {
        setTheSprite(sprite, true);
        setIsPieceSet(true);
      }
    } else {
      setTheSprite(sprite, true);
      setIsPieceSet(true);
    }
    setTimeout(() => {
      setTime(time + 1);
    }, 500);

    return () => clearInterval();
  }, [time]);

  useEffect(() => {
    // move left or right
    if (!isPieceSet) {
      const magnitude = leftPressed
        ? sprite.column
        : sprite.column + sprite.width;
      const direction =
        leftPressed && magnitude > 0
          ? -1
          : rightPressed && magnitude < boardWidth
          ? 1
          : 0;
      let allowed = true;
      sprite.sprite.forEach((spot) => {
        const isFixed = board[spot.row][spot.col + direction]?.fixed;
        if (isFixed) {
          allowed = !isFixed;
        }
      });

      allowed &&
        setTheSprite({
          ...sprite,
          column: sprite.column + direction,
          sprite: sprite.sprite.map((spot) => {
            return {
              ...spot,
              col: spot.col + direction,
            };
          }),
        });
    }
  }, [leftPressed, rightPressed, isPieceSet]);

  useEffect(() => {
    debugger;
    const matrix = [
      [0, 0, 1, 0],
      [0, 2, 3, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    // [
    //   [{ row: 0, col: 2 }],
    //   [
    //     { row: 1, col: 1 },
    //     { row: 1, col: 2 },
    //     { row: 1, col: 3 },
    //   ],
    // ],
    let count = 1;
    let max = Math.max(pieceSprites.t.height, pieceSprites.t.width);
    let tempMatrix: number[][] = [];

    for (let y = 0; y < max; y++) {
      tempMatrix.push([]);
      for (let x = 0; x < max; x++) {
        tempMatrix[y].push(0);
      }
    }
    const reducedMatrix = pieceSprites.t.sprite.flat().map((s) => {
      return {
        ...s,
        col: s.col - pieceSprites.t.column + 1,
      };
    });

    const tempBoard = [...board];
    // setBoard()
    reducedMatrix.map((spot) => {
      const isFixed = tempBoard[spot.row][spot.col].fixed;
      !isFixed &&
        tempBoard[spot.row].splice(spot.col, 1, {
          color: "bg-blue-400",
          fixed: false,
        });
    });

    // pieceSprites.t.sprite.forEach((row, yOffset) => {
    //   row.forEach((spot, xOffset) => {
    //     tempMatrix[spot.row][spot.col] = count++;
    //   });
    // });

    // const matrix = [

    // ]
    // const matrix = sprite.sprite;
    const idk = matrix[0].map((val, index) =>
      matrix.map((row) => row[index]).reverse()
    );
    // setTheSprite({ ...sprite, sprite: idk });
    debugger;
    // let matrix = compose(translate(40, 40), scale(2, 4));
    // const mtx: Matrix = {
    //   a: 1,
    //   b: 0,
    //   c: 0,
    //   d: 1,
    //   e: 0,
    //   f: 0,
    // };
    // const idk = transform(translate(2, 1), mtx);
  }, [keySpacePressed]);

  useEffect(() => {
    // get next sprite
    let nextPiece = pieceSprites["i"];
    // switch (Math.floor(Math.random() * 6)) {
    switch (sprite.name) {
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
    setIsPieceSet(false);
  }, [isPieceSet]);

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
            ></div>
          );
        })}
    </div>
  );
};
