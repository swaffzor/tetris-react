import React from "react";

interface Props {
  gameOver: boolean;
  onClick: () => void;
}

const Overlay = ({ gameOver, onClick }: Props) => {
  return (
    <div
      className={`transition-opacity duration-1000 ease-out absolute inset-x-0 z-10 w-72 mx-auto capitalize top-48 ${
        !gameOver ? "opacity-0 cursor-default" : "opacity-100"
      }`}
    >
      <p className={`text-5xl text-red-500 font-extrabold opacity-100`}>
        game over
      </p>
      <button
        className={`text-xl font-medium px-4 py-2 mx-auto mt-4 capitalize text-sky-500 border-sky-600 hover:bg-sky-200 hover:text-sky-600 transition ease-in duration-400 border-2 rounded-md ${
          !gameOver ? "cursor-default" : ""
        }`}
        onClick={() => gameOver && onClick()}
      >
        new game
      </button>
    </div>
  );
};

export default Overlay;
