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
} from "./types";
import * as sprites from "./sprites.json";
import SideBoard from "./SideBoard";
import Overlay from "./Overlay";
import Row from "./Row";
import { rotate } from "./utils";

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
    for (let x = 0; x < 4; x++) {
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
    for (let x = 0; x < 4; x++) {
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
      for (let i = 0; i <= tempBoard.length - cleared.length; i++) {
        cleared.unshift([...emptyRow]);
        console.log("line cleared");
      }

      setLevelVelocity(levelVelocity - 10);
    }
    return cleared;
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    setFastGravity(keyDownPressed || keySPressed);
  }, [keyDownPressed, keySPressed]);

  useEffect(() => {
    (keyUpPressed || keyWPressed) && setDropPiece(true);
  }, [keyUpPressed, keyWPressed]);

  useEffect(() => {
    time > 0 && setVelocity(dropPiece ? velocity / 10000 : levelVelocity);
  }, [dropPiece]);

  useEffect(() => {
    time > 0 && setVelocity(fastGravity ? velocity / 10 : levelVelocity);
  }, [fastGravity]);

  useEffect(() => {
    if (time > 0) {
      setGameMode(0);
      console.log("GAME OVER");
    }
  }, [stageBoard[0].some((spot) => spot.fixed)]);

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
    if (piece.row + piece.height < boardHeight) {
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
      gameMode && setTime(time + 1);
    }, velocity);

    return () => clearInterval(timeout);
  }, [time, velocity, swappedPiece, gameMode]);

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
        <SideBoard board={nextBoard} gameMode={gameMode} title="Next" />

        <Overlay gameOver={gameMode === 0} onClick={resetGame} />

        <div
          className={[
            `place-content-center content-start`,
            `px-4 w-96 mx-auto grid gap-0 grid-cols-${boardWidth.toString()}`,
            `${gameMode ? "opacity-100" : "opacity-25"}`,
            `transition duration-1000 z-0`,
          ]
            .join(" ")
            .trim()}
        >
          {stageBoard.map((row, index) => {
            return <Row key={index} spots={row} width="w-8" height="h-8" />;
          })}
        </div>

        <SideBoard board={swappedBoard} gameMode={gameMode} title="Swap" />
      </div>
    </div>
  );
}

export default App;

const drunk = "transition duration-700";
