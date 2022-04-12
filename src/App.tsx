/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
import React, { useEffect, useState } from "react";
import { useKeyPress } from "./hooks";
import {
  BoardMap,
  BoardType,
  Color,
  PieceSprite,
  Spot,
  Piece,
  Board,
  GameMode as Game,
} from "./types";
import * as sprites from "./sprites.json";
import SideBoard from "./SideBoard";
import Overlay from "./Overlay";
import Row from "./Row";
import { rotate } from "./utils";

function App() {
  const boardWidth = 12;
  const boardHeight = 21;
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
  const emptyBoard: Board = [];
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

  const emptyNextQueue: Board = [];
  // init an empty board
  for (let y = 0; y < 4 * pieceOptions.length; y++) {
    const tempRow: Spot[] = [];
    for (let x = 0; x < 5; x++) {
      tempRow.push({
        ...empty,
        color: "bg-slate-200",
        col: x,
        row: y,
        value: `r${y} c${x}`,
      });
    }
    emptyNextQueue.push(tempRow);
  }

  const emptysmallBoard: Board = [];
  for (let y = 0; y < 4; y++) {
    const tempRow: Spot[] = [];
    for (let x = 0; x < 5; x++) {
      tempRow.push({
        fixed: true,
        color: "bg-slate-200",
        col: x,
        row: y,
        value: `r${y} c${x}`,
      });
    }
    emptysmallBoard.push(tempRow);
  }

  const pieceSprites: PieceSprite = sprites as PieceSprite;

  const [nextPieceQueue, setNextPieceQueue] = useState<Piece[]>([
    pieceSprites.t,
    pieceSprites.j,
    pieceSprites.z,
    pieceSprites.o,
    pieceSprites.i,
    pieceSprites.l,
    pieceSprites.z,
  ]);

  const nextQ = Array.from(emptyNextQueue);
  let piecePosition = 0;
  nextPieceQueue.forEach((tempPiece) => {
    tempPiece.sprite.forEach((spriteSpot) => {
      nextQ[spriteSpot.row + piecePosition * 4].splice(spriteSpot.col, 1, {
        col: spriteSpot.col,
        row: spriteSpot.row,
        color: tempPiece.color,
        fixed: true,
        value: `r${spriteSpot.row} c${spriteSpot.col}`,
      });
    });
    piecePosition++;
  });

  const [stageBoard, setStageBoard] = useState<Board>(emptyBoard);
  const [nextBoard, setNextBoard] = useState<Board>(nextQ);
  const [swappedBoard, setSwappedBoard] = useState<Board>(emptysmallBoard);

  const [piece, setPiece] = useState<Piece>(pieceSprites.j);
  const [nextPiece, setNextPiece] = useState<Piece>(pieceSprites.t);
  const [swappedPiece, setSwappedPiece] = useState<Piece>();

  const [velocity, setVelocity] = useState(velocityStart);
  const [levelVelocity, setLevelVelocity] = useState(velocityStart);
  const [tick, setTick] = useState(0);

  const [gameMode, setGameMode] = useState<Game>(Game.Play);
  const [dropPiece, setDropPiece] = useState(false);
  const [fastGravity, setFastGravity] = useState(false);

  const [overlayText, setOverlayText] = useState("paused");
  const [rowsClearedCount, setRowsClearedCount] = useState(0);

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
  const keyEscapePressed = useKeyPress("Escape");
  const keySpacePressed = useKeyPress(" ");
  const controlsEnabled = gameMode === Game.Play;
  const rotateCW = controlsEnabled && keySpacePressed;
  const rotateCounterCW = controlsEnabled && rotateCW && keyShiftPressed;
  const leftPressed = controlsEnabled && (keyLeftPressed || keyAPressed);
  const rightPressed = controlsEnabled && (keyRightPressed || keyDPressed);
  let swappPressed = controlsEnabled && keyEnterPressed;

  const buttonClasses = `block text-xl font-medium px-4 py-2 mt-4 capitalize text-sky-500 border-sky-600 hover:bg-sky-200 active:bg-sky-300 hover:text-sky-600 transition ease-in duration-400 border-2 rounded-md ${
    !gameMode ? "cursor-default" : ""
  }`;

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

  const resetGame = () => {
    setStageBoard(emptyBoard);
    setSwappedBoard(emptysmallBoard);
    setTick(0);
    setVelocity(velocityStart);
    setLevelVelocity(velocityStart);
    setRowsClearedCount(0);
    setGameMode(Game.Play);
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
      tempBoard[spriteSpot.row].splice(spriteSpot.col, 1, {
        row: 0,
        col: spriteSpot.col,
        color: thePiece.color,
        fixed: false,
        value: `r${spriteSpot.row} c${spriteSpot.col}`,
      });
    });
    boards[boardType].set(tempBoard);
  };

  const setPieceOnStage = (newSprite: Piece, fixed?: boolean) => {
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

  const clearLines = (tempBoard: Board) => {
    const cleared =
      tempBoard.filter((row) =>
        row.filter((spot) => spot.fixed).length === boardWidth ? false : true
      ) ?? [];
    if (cleared.length < tempBoard.length) {
      const clearedLength = cleared.length;
      let count = 0;
      for (let i = 0; i <= tempBoard.length - 1 - clearedLength; i++) {
        cleared.unshift([...emptyRow]);
        count++;
        console.log("line cleared");
      }

      setRowsClearedCount(rowsClearedCount + count);
      setLevelVelocity(levelVelocity - 10 * count);
    }
    return cleared;
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (gameMode === Game.Play && keyEscapePressed) {
      setGameMode(Game.Pause);
      setOverlayText("paused");
    }
  }, [keyEscapePressed]);

  useEffect(() => {
    gameMode === Game.Play && setFastGravity(keyDownPressed || keySPressed);
  }, [keyDownPressed, keySPressed]);

  useEffect(() => {
    gameMode === Game.Play &&
      (keyUpPressed || keyWPressed) &&
      setDropPiece(true);
  }, [keyUpPressed, keyWPressed]);

  useEffect(() => {
    gameMode === Game.Play &&
      tick > 0 &&
      setVelocity(dropPiece ? velocity / 10000 : levelVelocity);
  }, [dropPiece]);

  useEffect(() => {
    gameMode === Game.Play &&
      tick > 0 &&
      setVelocity(fastGravity ? velocity / 10 : levelVelocity);
  }, [fastGravity]);

  useEffect(() => {
    if (tick > 0) {
      setOverlayText("game over");
      setGameMode(Game.Over);
      console.log("GAME OVER");
    }
  }, [stageBoard[0].some((spot) => spot.fixed)]); // when any spot in top row is fixed

  // swap
  useEffect(() => {
    if (swappPressed) {
      swappPressed = false;
      console.log("SWAP");
      let newPiece = swappedPiece;
      if (!newPiece) {
        newPiece = nextPiece;
        const piece = pieceOptions.charAt(Math.floor(Math.random() * 6));
        nextPieceQueue.shift();
        nextPieceQueue.push(pieceSprites[piece]);
        setNextPieceQueue(nextPieceQueue);
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

  // move piece down G R A V I T Y
  useEffect(() => {
    let pieceFixed = false;
    if (piece.row + piece.height <= boardHeight - 1) {
      let allowed = true;
      piece?.sprite?.forEach((spot) => {
        const isFixed = stageBoard[spot.row + 1][spot.col]?.fixed;
        if (isFixed) {
          allowed = !isFixed;
        }
      });

      if (allowed) {
        setPieceOnStage({
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
        pieceFixed = true;
        setPieceOnStage(piece, pieceFixed);
      }
    } else {
      pieceFixed = true;
      setPieceOnStage(piece, pieceFixed);
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

      const tempQ = [...nextPieceQueue];
      const newPiece = tempQ.shift() ?? next;
      setPieceOnStage(newPiece);
      setNextPiece(tempQ[0]);
      tempQ.push(next);
      setNextPieceQueue(tempQ);

      const tempNextBoard = [...nextBoard];
      for (let i = 0; i < 4; i++) {
        tempNextBoard.shift();
      }

      const mysmallboard = Array.from(emptysmallBoard);
      next.sprite.forEach((spriteSpot) => {
        mysmallboard[spriteSpot.row].splice(spriteSpot.col, 1, {
          color: next.color,
          col: spriteSpot.col,
          row: spriteSpot.row,
          fixed: false,
          value: "idc",
        });
      });
      tempNextBoard.push(...mysmallboard);
      setNextBoard(tempNextBoard);
    }

    let timeout = setTimeout(() => {
      gameMode === Game.Play && setTick(tick + 1);
    }, velocity);

    return () => clearInterval(timeout);
  }, [tick, velocity, swappedPiece, gameMode]);

  // move left or right
  useEffect(() => {
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
      setPieceOnStage({
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

  // rotation
  useEffect(() => {
    // debounce protection
    if (!rotateCW && !rotateCounterCW) {
      return;
    }
    const [converted, cornerPosition] = rotate(piece, rotateCW ? "cw" : "ccw");

    setPieceOnStage({
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
        <SideBoard
          board={nextBoard}
          gameMode={gameMode}
          columns={nextBoard[0].length}
          title="Next"
        />

        <div
          className={`transition-opacity duration-1000 ease-out justify-items-start ${
            gameMode === Game.Play ? "opacity-0 cursor-default" : "opacity-100"
          }`}
        >
          <Overlay gameMode={gameMode} heading={overlayText}>
            {gameMode === Game.Pause ? (
              <button
                key={`button-resume`}
                className={`mr-4 ${buttonClasses}`}
                onClick={() => {
                  setTimeout(() => setOverlayText("paused"), 1100);
                  setGameMode(Game.Play);
                }}
              >
                resume
              </button>
            ) : (
              <></>
            )}
            <button
              key={`button-reset`}
              className={`${buttonClasses.replaceAll(
                "sky",
                gameMode === Game.Over ? "fuchsia" : "emerald"
              )}`}
              onClick={() => (gameMode !== Game.Play ? resetGame() : {})}
            >
              new game
            </button>
          </Overlay>
        </div>

        <div
          className={[
            `place-content-center content-start`,
            `px-4 w-96 mx-auto grid gap-0 grid-cols-${boardWidth.toString()}`,
            `${gameMode === Game.Play ? "opacity-100" : "opacity-25"}`,
            `transition duration-1000 z-0`,
          ]
            .join(" ")
            .trim()}
        >
          {stageBoard.map((row, index) => {
            return (
              <Row
                key={index}
                spots={row}
                width="w-8"
                height="h-8"
                hide={index === 0}
              />
            );
          })}
        </div>

        <div className="text-green-400">
          <div className="w-16">
            <SideBoard
              board={swappedBoard}
              width="w-20"
              columns={swappedBoard[0].length}
              gameMode={gameMode}
              title="Swap"
            />
          </div>
          <div className="flex mt-4">
            <h3 className="">Rows Cleared:</h3>
            <p>{`\u00a0 ${rowsClearedCount}`}</p>
          </div>
          <div className="flex mt-4">
            <h3 className="">Ticks:</h3>
            <p>{`\u00a0 ${tick}`}</p>
          </div>
          <div className="flex mt-4">
            <h3 className="">Fall Delay:</h3>
            <p>{`\u00a0 ${velocity} ms`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

const drunk = "transition duration-700";
