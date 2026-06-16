import { useEffect, useRef } from "react";
import { useLayoutStore } from "../store/layoutStore";

interface Props {
  x: number;
  y: number;
  targetId: string | null;
  onClose: () => void;
}

export function ContextMenu({ x, y, targetId, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const s = useLayoutStore();
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [onClose]);

  if (!targetId) return null;

  const items: Array<{ label: string; action: () => void; danger?: boolean } | "separator"> = [
    { label: "Copy", action: () => s.copySelected() },
    { label: "Paste", action: () => s.paste() },
    { label: "Duplicate", action: () => s.duplicateSelected() },
    "separator",
    { label: "Bring to Front", action: () => s.bringToFront(targetId) },
    { label: "Bring Forward", action: () => s.bringForward(targetId) },
    { label: "Send Backward", action: () => s.sendBackward(targetId) },
    { label: "Send to Back", action: () => s.sendToBack(targetId) },
    "separator",
    { label: "Lock / Unlock", action: () => {
      const el = s.layout.elements.find((e) => e.id === targetId);
      if (el) s.setLocked(targetId, !el.locked);
    }},
    { label: "Hide", action: () => s.setVisibility(targetId, false) },
    "separator",
    { label: "Delete", action: () => s.deleteSelected(), danger: true },
  ];

  return (
    <div
      ref={ref}
      style={{ left: x, top: y }}
      className="fixed z-50 w-44 rounded-md border border-border bg-popover p-1 text-sm shadow-md"
    >
      {items.map((it, i) =>
        it === "separator" ? (
          <div key={i} className="my-1 h-px bg-border" />
        ) : (
          <button
            key={i}
            onClick={() => { it.action(); onClose(); }}
            className={
              "block w-full rounded px-2 py-1 text-left hover:bg-accent " +
              (it.danger ? "text-destructive" : "")
            }
          >{it.label}</button>
        ),
      )}
    </div>
  );
}
