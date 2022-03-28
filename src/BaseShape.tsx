import React from 'react'

export enum Orientation {
  Up,
  Down,
  Left,
  Right,
}

export interface BaseShapeProps {
  color?: string
  orientation?: Orientation
}

const Shape = ({ color, orientation }: BaseShapeProps) => {
  return (
    <div className={`border ${color ?? 'bg-slate-400'} w-16 h-16 m-auto`}>
      <div></div>
    </div>
  )
}

export default Shape
