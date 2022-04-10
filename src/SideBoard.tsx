import React from "react";
import Row from "./Row";
import { Board } from "./types";

interface Props {
  board: Board;
  gameMode: number;
  title: string;
}

const SideBoard = ({ gameMode, board, title }: Props) => {
  return (
    <fieldset
      className={`${
        gameMode ? "opacity-100" : "opacity-25"
      } p-4 mx-auto text-sm align-middle border-2 rounded-md h-fit border-slate-700 text-slate-500 dark:text-slate-400`}
    >
      <legend className="mx-auto text-base font-medium tracking-tight text-slate-900 dark:text-white">
        {title}
      </legend>

      <div className={`grid gap-0 grid-cols-4 place-content-center`}>
        {board.map((row, nextIndex) => {
          return (
            <Row
              key={`next-${nextIndex}`}
              spots={row}
              width="w-4"
              height="h-4"
            />
          );
        })}
      </div>
    </fieldset>
  );
};

export default SideBoard;
