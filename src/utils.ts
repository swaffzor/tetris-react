import { Piece, Sprite, SpriteSpot } from "./types";

export const rotate = (
  piece: Piece,
  direction: "cw" | "ccw"
): [Sprite, SpriteSpot] => {
  let count = 1;
  const max = Math.max(piece.height, piece.width) + 1;

  const tempMatrix: number[][] = [];
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
  for (let i = 0; i < (direction === "ccw" ? 3 : 1); i++) {
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

  return [converted, cornerPosition];
};
