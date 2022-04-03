export type Color =
  | "bg-white"
  | "bg-slate-400"
  | "bg-slate-200"
  | "bg-blue-400"
  | "bg-red-400"
  | "bg-orange-400"
  | "bg-yellow-400"
  | "bg-green-400"
  | "bg-pink-400"
  | "bg-purple-400";

export interface Shape {
  column: Column;
  row: number;
  width: number;
  height: number;
  orientation: Orientation;
  color: Color;
  sprite: number[][];
}

export interface ShapeMap {
  [key: string]: Partial<Shape>;
}

export interface Spot {
  row: number;
  col: Column;
  value: string;
  color: Color;
  fixed: boolean;
}

export interface SpriteSpot {
  row: number;
  col: number;
}

export type Sprite = SpriteSpot[];

export interface SpriteEntry {
  name: string;
  color: Color;
  sprite: Sprite;
  row: number;
  column: number;
  height: number;
  width: number;
}

export interface PieceSprite {
  [key: string]: SpriteEntry;
}

export enum Column {
  a,
  b,
  c,
  d,
  e,
  f,
  g,
  h,
  i,
  j,
}

export enum Orientation {
  Up,
  Down,
  Left,
  Right,
}
