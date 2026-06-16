import { useLayoutStore } from "../store/layoutStore";

export function useSnapToGrid() {
  const { snapToGrid, gridSize } = useLayoutStore((s) => s.layout);
  return (v: number) => (snapToGrid ? Math.round(v / gridSize) * gridSize : v);
}
