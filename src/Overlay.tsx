import React, { ReactElement } from "react";
import { GameMode } from "./types";

interface Props {
  gameMode: GameMode;
  heading: string;
  children: ReactElement[];
  // buttons: ReactElement[];
}

const Overlay = ({ gameMode, heading, children }: Props) => {
  return (
    <div className={`absolute inset-x-0 z-10 w-72 mx-auto capitalize top-48`}>
      <h1
        className={`text-5xl ${
          gameMode === GameMode.Over ? "text-red-500" : "text-blue-500"
        } font-extrabold opacity-100`}
      >
        {heading}
      </h1>
      <div className="">{children}</div>
    </div>
  );
};

export default Overlay;
