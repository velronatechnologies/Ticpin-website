import { useRef } from "react";
import {
  Crosshair,
  Eye,
  Redo2,
  Save,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { useLayoutStore } from "../store/layoutStore";

interface Props {
  onPreview: () => void;
  onSave: () => void;
  saving?: boolean;
}

export function Toolbar({
  onPreview,
  onSave,
  saving,
}: Props) {
  const name = useLayoutStore((s) => s.layout.name);
  const setName = useLayoutStore((s) => s.setLayoutName);
  const zoom = useLayoutStore((s) => s.layout.zoom);
  const setZoom = useLayoutStore((s) => s.setZoom);
  const setPan = useLayoutStore((s) => s.setPan);
  const showGrid = useLayoutStore((s) => s.layout.showGrid);
  const snapToGrid = useLayoutStore((s) => s.layout.snapToGrid);
  const gridSize = useLayoutStore((s) => s.layout.gridSize);
  const setGrid = useLayoutStore((s) => s.setGrid);
  const exportJsonStr = useLayoutStore((s) => s.exportLayoutJson);
  const importLayout = useLayoutStore((s) => s.importLayout);
  const { canRedo, canUndo, redo, undo } = useCanvasHistory();
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex h-12 items-center gap-2 border-b border-border bg-background px-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 w-52 text-sm font-medium"
      />
      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)">
        <Redo2 className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="icon" onClick={() => setZoom(zoom - 0.1)} title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <button
        type="button"
        onClick={() => setZoom(1)}
        className="w-14 rounded px-1 text-center text-xs hover:bg-accent"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button variant="ghost" size="icon" onClick={() => setZoom(zoom + 0.1)} title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setPan(0, 0)} title="Center canvas">
        <Crosshair className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1 text-xs">
        <span>Snap</span>
        <Switch
          checked={snapToGrid}
          onCheckedChange={(value) => setGrid(showGrid, value, gridSize)}
        />
      </div>
      <Input
        type="number"
        min={2}
        max={200}
        value={gridSize}
        onChange={(e) => setGrid(showGrid, snapToGrid, Number(e.target.value) || 20)}
        className="h-8 w-16 text-xs"
      />

      <div className="ml-auto flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                importLayout(String(reader.result));
                toast.success("Layout imported");
              } catch (err) {
                toast.error((err as Error).message);
              }
            };
            reader.readAsText(file);
            e.target.value = "";
          }}
        />
        <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} title="Import JSON">
          <Upload className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="mr-1 h-4 w-4" /> Preview
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          <Save className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
