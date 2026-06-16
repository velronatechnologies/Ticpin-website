import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaletteItemKind } from "../types/layout.types";
import { useLayoutStore } from "../store/layoutStore";

interface Props {
  label: string;
  Icon?: LucideIcon;
  color: string;
  item: PaletteItemKind;
  preview?: ReactNode;
  iconClassName?: string;
}

export function SectionCard({ label, Icon, color, item, preview, iconClassName }: Props) {
  const activeTool = useLayoutStore((s) => s.activeTool);
  const setActiveTool = useLayoutStore((s) => s.setActiveTool);
  const setDragging = useLayoutStore((s) => s.setDragging);

  const active = isSameItem(activeTool, item);

  return (
    <button
      type="button"
      draggable
      onClick={() => setActiveTool(active ? null : item)}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-layout-item", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
        setDragging(
          true,
          item.kind === "section"
            ? "section"
            : item.kind === "shape"
              ? "shape"
              : item.kind === "stage"
                ? "stage"
                : item.kind === "text"
                  ? "text"
                  : item.kind === "image"
                    ? "image"
                    : item.kind === "icon"
                      ? "icon"
                      : "divider",
        );
      }}
      onDragEnd={() => setDragging(false, null)}
      className={cn(
        "flex w-full cursor-grab items-center gap-2 rounded-md border p-2 text-left text-sm transition-colors hover:bg-accent active:cursor-grabbing",
        active ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card",
      )}
      title={`Click or drag to add ${label}`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-black text-white"
        style={{ backgroundColor: color }}
      >
        {active ? (
          <Check className="h-4 w-4 text-black" />
        ) : preview ? (
          <span className={cn("flex items-center justify-center", iconClassName)}>{preview}</span>
        ) : Icon ? (
          <Icon className={cn("h-4 w-4", iconClassName)} />
        ) : null}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function isSameItem(a: PaletteItemKind | null, b: PaletteItemKind): boolean {
  if (!a) {
    return false;
  }

  if (a.kind !== b.kind) {
    return false;
  }

  if (a.kind === "section" && b.kind === "section") {
    return a.sectionType === b.sectionType;
  }

  if (a.kind === "divider" && b.kind === "divider") {
    return a.orientation === b.orientation;
  }

  if (a.kind === "shape" && b.kind === "shape") {
    return a.shapeType === b.shapeType;
  }

  return true;
}
