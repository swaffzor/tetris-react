import React from "react";
import { Spot } from "./types";

interface RowProps {
  spots: Spot[];
  width: string;
  height: string;
  hide?: boolean;
}
const Row = ({ spots, width, height, hide }: RowProps) => {
  return (
    <>
      {spots.length > 0 &&
        spots?.map((spot, index) => {
          return (
            <div key={`spot-${index}`} className={hide ? "hidden" : ""}>
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

export default Row;
