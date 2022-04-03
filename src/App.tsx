/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
import React, { useEffect, useState } from "react";
import { useKeyPress } from "./hooks";
import {
  BoardMap,
  BoardType,
  Color,
  Column,
  PieceSprite,
  Spot,
  Sprite,
  Piece,
} from "./types";
import * as sprites from "./sprites.json";
import "./App.css";

function App() {
  const boardWidth = 12;
  const boardHeight = 20;
  const pieceOptions = "ijlostz";
  const velocityStart = 700;
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

  const emptysmallBoard: Spot[][] = [];
  for (let y = 0; y < 4; y++) {
    const tempRow: Spot[] = [];
    for (let x = 0; x < 4; x++) {
      tempRow.push({
        ...empty,
        color: "bg-slate-200",
        col: x,
        row: y,
        value: `r${y} c${x}`,
      });
    }
    emptysmallBoard.push(tempRow);
  }

  const pieceSprites: PieceSprite = sprites as PieceSprite;

  const [stageBoard, setStageBoard] = useState<Spot[][]>(emptyBoard);
  const [nextBoard, setNextBoard] = useState<Spot[][]>(emptysmallBoard);
  const [swappedBoard, setSwappedBoard] = useState<Spot[][]>(emptysmallBoard);

  const [piece, setPiece] = useState<Piece>(pieceSprites.j);
  const [nextPiece, setNextPiece] = useState<Piece>(pieceSprites.t);
  const [swappedPiece, setSwappedPiece] = useState<Piece>();

  const [nextQueue, setNextQueue] = useState<Piece[]>([
    pieceSprites.t,
    pieceSprites.j,
  ]);

  const [velocity, setVelocity] = useState(velocityStart);
  const [levelVelocity, setLevelVelocity] = useState(velocityStart);
  const [time, setTime] = useState(0);
  const [gameMode, setGameMode] = useState(1);
  const [dropPiece, setDropPiece] = useState(false);
  const [fastGravity, setFastGravity] = useState(false);

  const keyLeftPressed = useKeyPress("ArrowLeft");
  const keyRightPressed = useKeyPress("ArrowRight");
  const keyUpPressed = useKeyPress("ArrowUp");
  const keyDownPressed = useKeyPress("ArrowDown");
  const keyEnterPressed = useKeyPress("Enter");
  const keyWPressed = useKeyPress("w");
  const keyAPressed = useKeyPress("a");
  const keySPressed = useKeyPress("s");
  const keyDPressed = useKeyPress("d");
  const keyShiftPressed = useKeyPress("Shift");
  const rotateCW = useKeyPress(" ");
  const rotateCounterCW = rotateCW && keyShiftPressed;
  const leftPressed = keyLeftPressed || keyAPressed;
  const rightPressed = keyRightPressed || keyDPressed;
  let swappPressed = keyEnterPressed;

  const boards: BoardMap = {
    [BoardType.Stage]: {
      board: stageBoard,
      set: setStageBoard,
      bgColor: "bg-slate-400",
    },
    [BoardType.Next]: {
      board: nextBoard,
      set: setNextBoard,
      bgColor: "bg-slate-200",
    },
    [BoardType.Swap]: {
      board: swappedBoard,
      set: setSwappedBoard,
      bgColor: "bg-slate-200",
    },
  };

  useEffect(() => {
    if (swappPressed) {
      swappPressed = false;
      console.log("SWAP");
      let newPiece = swappedPiece;
      if (!newPiece) {
        newPiece = nextPiece;
        const piece = pieceOptions.charAt(Math.floor(Math.random() * 6));
        colorPieceOnBoard(pieceSprites[piece], BoardType.Next);
        setNextPiece(pieceSprites[piece]);
      }

      newPiece.column = pieceSprites[newPiece.name].column;
      newPiece.row = pieceSprites[newPiece.name].row;
      newPiece.sprite = pieceSprites[newPiece.name].sprite;

      // clear board of previous piece
      colorPieceOnBoard({ ...piece, color: "bg-slate-400" }, BoardType.Stage);

      colorPieceOnBoard(pieceSprites[piece.name], BoardType.Swap);
      setSwappedPiece(piece);
      setPiece(newPiece);
    }
  }, [swappPressed]);

  useEffect(() => {
    setFastGravity(keyDownPressed || keySPressed);
  }, [keyDownPressed, keySPressed]);

  useEffect(() => {
    if (time > 0) {
      setGameMode(0);
      console.log("GAME OVER");
    }
  }, [stageBoard[0].some((spot) => spot.fixed)]);

  useEffect(() => {
    (keyUpPressed || keyWPressed) && setDropPiece(true);
  }, [keyUpPressed, keyWPressed]);

  const replaceSpotInBoard = (row: number, column: Column, newSpot: Spot) => {
    const tempBoard = [...stageBoard];
    tempBoard[row].splice(column, 1, newSpot);
    setStageBoard(tempBoard);
  };

  const resetGame = () => {
    setStageBoard(emptyBoard);
    setSwappedBoard(emptysmallBoard);
    setTime(0);
    setVelocity(velocityStart);
    setLevelVelocity(velocityStart);
    setGameMode(1);
  };

  const colorTheSpots = (theSprite: Piece, color: Color, fixed: boolean) => {
    const tempBoard = [...stageBoard];
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

    setStageBoard(clearLines(tempBoard));
  };

  const colorPieceOnBoard = (thePiece: Piece, boardType: BoardType) => {
    const tempBoard = [...boards[boardType].board].map((row) =>
      row.map((spot) => {
        return {
          ...spot,
          color: spot.fixed ? spot.color : boards[boardType].bgColor,
        };
      })
    );

    thePiece.sprite.forEach((spriteSpot) => {
      const tcol = spriteSpot.col - 3;
      tempBoard[spriteSpot.row].splice(tcol, 1, {
        row: 0,
        col: tcol,
        color: thePiece.color,
        fixed: false,
        value: `r${spriteSpot.row} c${spriteSpot.col}`,
      });
    });
    boards[boardType].set(tempBoard);
  };

  const setThePiece = (newSprite: Piece, fixed?: boolean) => {
    setPiece((oldSprite) => {
      colorTheSpots(oldSprite, "bg-slate-400", false);
      colorTheSpots(
        newSprite,
        fixed ? (newSprite.color.replace("4", "6") as Color) : newSprite.color,
        !!fixed
      );
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

      setLevelVelocity(levelVelocity - 10);
    }
    return cleared;
  };

  useEffect(() => {
    time > 0 && setVelocity(dropPiece ? velocity / 10000 : levelVelocity);
  }, [dropPiece]);

  useEffect(() => {
    time > 0 && setVelocity(fastGravity ? velocity / 10 : levelVelocity);
  }, [fastGravity]);

  useEffect(() => {
    // move piece down G R A V I T Y
    let pieceFixed = false;
    if (piece.row + piece.height < boardHeight) {
      let allowed = true;
      piece?.sprite?.forEach((spot) => {
        const isFixed = stageBoard[spot.row + 1][spot.col]?.fixed;
        if (isFixed) {
          allowed = !isFixed;
        }
      });

      if (allowed) {
        setThePiece({
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
        setThePiece(piece, true);
        pieceFixed = true;
      }
    } else {
      setThePiece(piece, true);
      pieceFixed = true;
    }

    if (pieceFixed) {
      setDropPiece(false);
      setFastGravity(false);
      // get next sprite
      let next = pieceSprites["j"];
      // switch (Math.floor(Math.random() * 6)) {
      switch (nextPiece.name) {
        case "i":
          next = pieceSprites["j"];
          break;
        case "j":
          next = pieceSprites["l"];
          break;
        case "l":
          next = pieceSprites["o"];
          break;
        case "o":
          next = pieceSprites["s"];
          break;
        case "s":
          next = pieceSprites["t"];
          break;
        case "t":
          next = pieceSprites["z"];
          break;
        case "z":
        default:
          next = pieceSprites["i"];
          break;
      }
      const tempQ = [...nextQueue];
      tempQ.push(next);
      setNextQueue(tempQ);
      setThePiece(nextPiece);
      setNextPiece(next);
      colorPieceOnBoard(next, BoardType.Next);
    }

    let timeout = setTimeout(() => {
      gameMode && setTime(time + 1);
    }, velocity);

    return () => clearInterval(timeout);
  }, [time, velocity, swappedPiece, gameMode]);

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
      const isFixed = stageBoard[spot.row][spot.col + direction]?.fixed;
      if (isFixed) {
        allowed = !isFixed;
      }
    });

    allowed &&
      setThePiece({
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

    setThePiece({
      ...piece,
      sprite: converted,
      height: piece.width,
      width: piece.height,
      row: cornerPosition.row,
      column: cornerPosition.col,
    });
  }, [rotateCW, rotateCounterCW]);

  return (
    <div className="flex w-full h-screen dark:bg-slate-900">
      <div className={`relative flex p-4 m-2 `}>
        <fieldset
          className={`${
            gameMode ? "opacity-100" : "opacity-25"
          } p-4 mx-auto text-sm align-middle border-2 rounded-md h-fit border-slate-700 text-slate-500 dark:text-slate-400`}
        >
          <legend className="mx-auto text-base font-medium tracking-tight text-slate-900 dark:text-white">
            Next
          </legend>

          <div className={`grid gap-0 grid-cols-4 place-content-center`}>
            {nextBoard.map((row, nextIndex) => {
              return (
                <Row
                  key={`next-${nextIndex}`}
                  spots={row}
                  width="w-4"
                  height="h-4"
                  border="border-white"
                />
              );
            })}
          </div>
        </fieldset>

        {
          <div
            className={`transition-opacity duration-1000 ease-out absolute inset-x-0 z-10 w-72 mx-auto capitalize top-48 ${
              gameMode ? "opacity-0 cursor-default" : "opacity-100"
            }`}
          >
            <p
              className={`text-5xl text-red-500 font-extrabold ${
                time ? "opacity-100" : "opacity-0"
              }`}
            >
              game over
            </p>
            <button
              className={`text-xl font-medium px-4 py-2 mx-auto mt-4 capitalize text-sky-500 border-sky-600 hover:bg-sky-200 hover:text-sky-600 transition ease-in duration-400 border-2 rounded-md ${
                gameMode ? "cursor-default" : ""
              }`}
              onClick={() => !gameMode && resetGame()}
            >
              new game
            </button>
          </div>
        }
        <div
          className={`transition duration-1000 z-0 ${
            gameMode ? "opacity-100" : "opacity-25"
          } px-4 w-96 mx-auto grid gap-0 grid-cols-${boardWidth.toString()} place-content-center content-start`}
        >
          {stageBoard.map((row, index) => {
            return (
              <Row
                key={index}
                spots={row}
                width="w-8"
                height="h-8"
                border="border-slate-300"
              />
            );
          })}
        </div>

        <fieldset
          className={`${
            gameMode ? "opacity-100" : "opacity-25"
          } p-4 mx-auto text-sm align-middle border-2 rounded-md h-fit border-slate-700 text-slate-500 dark:text-slate-400`}
        >
          <legend className="mx-auto text-base font-medium tracking-tight text-slate-900 dark:text-white">
            Swap
          </legend>
          <div className={`grid gap-0 grid-cols-4 place-content-center`}>
            {swappedBoard.map((row, nextIndex) => {
              return (
                <Row
                  key={`next-${nextIndex}`}
                  spots={row}
                  width="w-4"
                  height="h-4"
                  border="border-white"
                />
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default App;

const drunk = "transition duration-700";
interface RowProps {
  spots: Spot[];
  width: string;
  height: string;
  border: string;
}
export const Row = ({ spots, border, width, height }: RowProps) => {
  return (
    <>
      {spots.length > 0 &&
        spots?.map((spot, index) => {
          return (
            <div key={`spot-${index}`}>
              <div
                className={[
                  `ease-linear ${spot.fixed ? "duration-200" : "duration-75"}`,
                  spot.color,
                  width,
                  height,
                  spot.fixed
                    ? "rounded-xs border"
                    : spot.color === "bg-slate-400"
                    ? "border border-slate-500" //affects grid
                    : "border", // piece/cursor
                ].join(" ")}
              >
                {/* {spot.value} */}
              </div>
            </div>
          );
        })}
    </>
  );
};
