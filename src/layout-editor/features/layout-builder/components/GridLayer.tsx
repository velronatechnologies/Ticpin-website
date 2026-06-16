import { Line } from "react-konva";
import { useMemo } from "react";

interface Props { width: number; height: number; size: number; }

export function GridLayer({ width, height, size }: Props) {
  const lines = useMemo(() => {
    const arr: { points: number[] }[] = [];
    for (let x = 0; x <= width; x += size) arr.push({ points: [x, 0, x, height] });
    for (let y = 0; y <= height; y += size) arr.push({ points: [0, y, width, y] });
    return arr;
  }, [width, height, size]);

  return (
    <>
      {lines.map((l, i) => (
        <Line key={i} points={l.points} stroke="#e5e7eb" strokeWidth={1} listening={false} />
      ))}
    </>
  );
}
