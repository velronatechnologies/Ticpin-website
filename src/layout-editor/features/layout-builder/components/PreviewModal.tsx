import { useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Canvas } from "./Canvas";
import { useLayoutStore } from "../store/layoutStore";
import { elementBounds } from "../lib/canvasUtils";
import type { LayoutElement, SectionElement } from "../types/layout.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 3000;
const PREVIEW_PADDING = 80;

export function PreviewModal({ open, onClose }: Props) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const elements = useLayoutStore((s) => s.layout.elements);
  const [selected, setSelected] = useState<SectionElement | null>(null);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      return;
    }

    function resize() {
      const r = wrapRef.current?.getBoundingClientRect();
      if (r) {
        setSize({ w: r.width, h: r.height });
      }
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onClick(event: MouseEvent) {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }

      const rect = stage.container().getBoundingClientRect();
      const x = (event.clientX - rect.left - stage.x()) / stage.scaleX();
      const y = (event.clientY - rect.top - stage.y()) / stage.scaleY();
      setSelected(findSectionAtPoint(elements, x, y));
    }

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [elements, open]);

  const viewState = useMemo(
    () => fitElementsToViewport(elements, size.w, size.h),
    [elements, size.h, size.w],
  );

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex h-[92vh] max-w-[96vw] flex-col overflow-hidden p-0">
        <DialogTitle className="sr-only">Customer Preview</DialogTitle>
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
            <span className="text-sm font-semibold">Customer Preview</span>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </div>
          <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden bg-white">
            <Canvas
              width={size.w}
              height={size.h}
              stageRef={stageRef}
              readOnly
              viewState={viewState}
            />
            {selected && <SectionTooltip x={24} y={88} el={selected} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionTooltip({ x, y, el }: { x: number; y: number; el: SectionElement }) {
  return (
    <div
      className="pointer-events-none absolute z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg"
      style={{ left: x, top: y }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-semibold">{el.name}</span>
        <Badge style={{ backgroundColor: el.color, color: el.textColor }}>{el.sectionType}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{el.description || "No description"}</p>
      {el.sectionType === "class" ? (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Seat mode</div>
            <div className="font-semibold">{el.seatingType}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Amount</div>
            <div className="font-semibold">₹{el.price.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Max seats</div>
            <div className="font-semibold">{el.capacity}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Available</div>
            <div className="font-semibold">{el.available}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fitElementsToViewport(
  elements: LayoutElement[],
  viewportWidth: number,
  viewportHeight: number,
) {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return { zoom: 1, panX: 0, panY: 0 };
  }

  const visible = elements.filter((element) => element.visible !== false);
  if (visible.length === 0) {
    const zoom = Math.min(viewportWidth / CANVAS_WIDTH, viewportHeight / CANVAS_HEIGHT);
    return {
      zoom,
      panX: (viewportWidth - CANVAS_WIDTH * zoom) / 2,
      panY: (viewportHeight - CANVAS_HEIGHT * zoom) / 2,
    };
  }

  const bounds = visible.reduce(
    (acc, element) => {
      const box = elementBounds(element);
      return {
        minX: Math.min(acc.minX, box.x),
        minY: Math.min(acc.minY, box.y),
        maxX: Math.max(acc.maxX, box.x + box.width),
        maxY: Math.max(acc.maxY, box.y + box.height),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

  const contentWidth = Math.max(120, bounds.maxX - bounds.minX + PREVIEW_PADDING * 2);
  const contentHeight = Math.max(120, bounds.maxY - bounds.minY + PREVIEW_PADDING * 2);
  const zoom = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight);

  return {
    zoom,
    panX: (viewportWidth - contentWidth * zoom) / 2 - (bounds.minX - PREVIEW_PADDING) * zoom,
    panY: (viewportHeight - contentHeight * zoom) / 2 - (bounds.minY - PREVIEW_PADDING) * zoom,
  };
}

function findSectionAtPoint(elements: LayoutElement[], x: number, y: number) {
  const sections = elements.filter(
    (element): element is SectionElement => element.type === "section" && element.visible,
  );
  return (
    [...sections]
      .reverse()
      .find(
        (element) =>
          x >= element.x &&
          x <= element.x + element.width &&
          y >= element.y &&
          y <= element.y + element.height,
      ) ?? null
  );
}
