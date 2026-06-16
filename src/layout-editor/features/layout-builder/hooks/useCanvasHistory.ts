// History is maintained inside the Zustand store. This hook re-exposes it.
import { useLayoutStore } from "../store/layoutStore";

export function useCanvasHistory() {
  const undo = useLayoutStore((s) => s.undo);
  const redo = useLayoutStore((s) => s.redo);
  const canUndo = useLayoutStore((s) => s.historyIndex > 0);
  const canRedo = useLayoutStore((s) => s.historyIndex < s.history.length - 1);
  return { undo, redo, canUndo, canRedo };
}
