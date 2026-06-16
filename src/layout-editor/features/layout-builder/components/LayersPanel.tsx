import { useLayoutStore } from "../store/layoutStore";
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function LayersPanel() {
  const elements = useLayoutStore((s) => s.layout.elements);
  const selectedIds = useLayoutStore((s) => s.selectedIds);
  const selectElement = useLayoutStore((s) => s.selectElement);
  const setVisibility = useLayoutStore((s) => s.setVisibility);
  const setLocked = useLayoutStore((s) => s.setLocked);
  const deleteElement = useLayoutStore((s) => s.deleteElement);
  const rename = useLayoutStore((s) => s.renameElement);
  const reorder = useLayoutStore((s) => s.reorderLayer);
  const [editing, setEditing] = useState<string | null>(null);

  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex h-48 shrink-0 flex-col border-t border-border bg-background">
      <div className="border-b border-border px-3 py-2 text-sm font-semibold">Layers</div>
      <ScrollArea className="flex-1">
        {sorted.length === 0 && (
          <p className="p-3 text-xs text-muted-foreground">No elements yet. Drag from the left.</p>
        )}
        {sorted.map((el, i) => (
          <div
            key={el.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/layer-index", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("text/layer-index"));
              if (!Number.isNaN(from) && from !== i) reorder(from, i);
            }}
            onClick={(e) => selectElement(el.id, e.shiftKey || e.metaKey || e.ctrlKey)}
            className={cn(
              "group flex items-center gap-1 border-b border-border px-2 py-1.5 text-xs hover:bg-accent",
              selectedIds.includes(el.id) && "bg-accent",
            )}
          >
            <GripVertical className="h-3 w-3 cursor-grab text-muted-foreground" />
            <button type="button" onClick={(e) => { e.stopPropagation(); setVisibility(el.id, !el.visible); }}>
              {el.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setLocked(el.id, !el.locked); }}>
              {el.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            <span className="ml-1 w-12 shrink-0 text-[10px] uppercase text-muted-foreground">{el.type}</span>
            {editing === el.id ? (
              <Input
                autoFocus
                defaultValue={el.name}
                className="h-6 flex-1 text-xs"
                onBlur={(e) => { rename(el.id, e.target.value); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { rename(el.id, (e.target as HTMLInputElement).value); setEditing(null); } }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="flex-1 truncate"
                onDoubleClick={(e) => { e.stopPropagation(); setEditing(el.id); }}
              >{el.name}</span>
            )}
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
