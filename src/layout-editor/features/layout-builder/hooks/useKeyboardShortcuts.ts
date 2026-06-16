import { useEffect } from "react";
import { useLayoutStore } from "../store/layoutStore";

export function useKeyboardShortcuts() {
  const s = useLayoutStore();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement | null;
      if (tgt && /input|textarea|select/i.test(tgt.tagName)) return;
      if (tgt && tgt.isContentEditable) return;

      const meta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (meta && key === "z" && !e.shiftKey) {
        e.preventDefault();
        s.undo();
        return;
      }
      if ((meta && key === "y") || (meta && e.shiftKey && key === "z")) {
        e.preventDefault();
        s.redo();
        return;
      }
      if (meta && key === "c") {
        e.preventDefault();
        s.copySelected();
        return;
      }
      if (meta && key === "v") {
        e.preventDefault();
        s.paste();
        return;
      }
      if (meta && key === "d") {
        e.preventDefault();
        s.duplicateSelected();
        return;
      }
      if (meta && key === "a") {
        e.preventDefault();
        s.selectAll();
        return;
      }
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        s.deleteSelected();
        return;
      }
      if (key === "escape") {
        s.clearSelection();
        s.clearActiveTool();
        return;
      }

      const grid = s.layout.snapToGrid ? s.layout.gridSize : 1;
      const step = e.shiftKey ? 10 : grid;
      if (key === "arrowleft") {
        e.preventDefault();
        s.nudgeSelected(-step, 0);
      }
      if (key === "arrowright") {
        e.preventDefault();
        s.nudgeSelected(step, 0);
      }
      if (key === "arrowup") {
        e.preventDefault();
        s.nudgeSelected(0, -step);
      }
      if (key === "arrowdown") {
        e.preventDefault();
        s.nudgeSelected(0, step);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s]);
}
