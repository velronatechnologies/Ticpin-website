import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Layer, Line, Rect, Stage } from "react-konva";
import { useLayoutStore } from "../store/layoutStore";
import { createElement } from "../lib/elementDefaults";
import { elementBounds, normalizeRect, rectsIntersect } from "../lib/canvasUtils";
import type { PaletteItemKind } from "../types/layout.types";
import { CanvasElement } from "./CanvasElement";
import { ContextMenu } from "./ContextMenu";
import { GridLayer } from "./GridLayer";
import { Transformer } from "./Transformer";

interface Props {
  width: number;
  height: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  readOnly?: boolean;
  viewState?: {
    zoom: number;
    panX: number;
    panY: number;
  };
}

interface SelectionRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface GuideLine {
  points: number[];
  orientation: "h" | "v";
}

const GUIDE_COLOR = "#a855f7"; // purple-500
const SNAP_THRESHOLD = 8; // px in canvas coords

/** Returns edge + center snapping anchors for an element bounding box */
function getAnchors(b: { x: number; y: number; width: number; height: number }) {
  return {
    xs: [b.x, b.x + b.width / 2, b.x + b.width],
    ys: [b.y, b.y + b.height / 2, b.y + b.height],
  };
}

export function Canvas({ width, height, stageRef, readOnly, viewState }: Props) {
  const layout = useLayoutStore((s) => s.layout);
  const selectedIds = useLayoutStore((s) => s.selectedIds);
  const activeTool = useLayoutStore((s) => s.activeTool);
  const addElement = useLayoutStore((s) => s.addElement);
  const boxSelect = useLayoutStore((s) => s.boxSelect);
  const clearSelection = useLayoutStore((s) => s.clearSelection);
  const setDragging = useLayoutStore((s) => s.setDragging);
  const setPan = useLayoutStore((s) => s.setPan);
  const setZoom = useLayoutStore((s) => s.setZoom);
  const updateElement = useLayoutStore((s) => s.updateElement);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [spaceDown, setSpaceDown] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceDown(true);
    }
    function up(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceDown(false);
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(
      0.1,
      Math.min(5, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy),
    );

    setZoom(newScale);
    setPan(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale);
  }

  function toCanvasCoords(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.container().getBoundingClientRect();
    return {
      x: (clientX - rect.left - stage.x()) / stage.scaleX(),
      y: (clientY - rect.top - stage.y()) / stage.scaleY(),
    };
  }

  function placeItem(item: PaletteItemKind, x: number, y: number) {
    const z = layout.elements.reduce((m, el) => Math.max(m, el.zIndex), 0) + 1;
    addElement(createElement(item, { x, y, zIndex: z }));
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false, null);
    const raw = e.dataTransfer.getData("application/x-layout-item");
    if (!raw) return;
    let item: PaletteItemKind;
    try {
      item = JSON.parse(raw);
    } catch {
      return;
    }
    const point = toCanvasCoords(e.clientX, e.clientY);
    if (!point) return;
    placeItem(item, point.x, point.y);
  }

  function onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (readOnly || e.evt.button === 2) return;
    const stage = stageRef.current;
    if (!stage) return;

    const clickedOnEmpty = e.target === stage;
    if (!clickedOnEmpty) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const point = {
      x: (pos.x - stage.x()) / stage.scaleX(),
      y: (pos.y - stage.y()) / stage.scaleY(),
    };

    if (activeTool) {
      placeItem(activeTool, point.x, point.y);
      return;
    }
    if (spaceDown || e.evt.button === 1) return;

    setSelectionRect({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
    clearSelection();
  }

  function onMouseMove() {
    const stage = stageRef.current;
    if (!stage || !selectionRect) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const point = {
      x: (pos.x - stage.x()) / stage.scaleX(),
      y: (pos.y - stage.y()) / stage.scaleY(),
    };
    setSelectionRect((rect) => (rect ? { ...rect, x2: point.x, y2: point.y } : rect));
  }

  function onMouseUp() {
    if (!selectionRect) return;
    const rect = normalizeRect(
      { x: selectionRect.x1, y: selectionRect.y1 },
      { x: selectionRect.x2, y: selectionRect.y2 },
    );
    if (rect.width < 3 && rect.height < 3) {
      setSelectionRect(null);
      return;
    }
    const ids = layout.elements
      .filter((el) => rectsIntersect(elementBounds(el), rect))
      .map((el) => el.id);
    boxSelect(ids);
    setSelectionRect(null);
  }

  function onStageDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const stage = stageRef.current;
    if (!stage || e.target !== stage) return;
    setPan(stage.x(), stage.y());
  }

  // ── Smart alignment guides ─────────────────────────────────────────────────
  function computeGuides(
    draggedId: string,
    dragX: number,
    dragY: number,
    dragW: number,
    dragH: number,
  ): { lines: GuideLine[]; snapX: number | null; snapY: number | null } {
    const others = layout.elements.filter(
      (el) => !selectedIds.includes(el.id) && el.id !== draggedId && el.visible !== false,
    );

    const dragAnchors = getAnchors({ x: dragX, y: dragY, width: dragW, height: dragH });

    const lines: GuideLine[] = [];
    let snapX: number | null = null;
    let snapY: number | null = null;
    let bestDx = SNAP_THRESHOLD + 1;
    let bestDy = SNAP_THRESHOLD + 1;

    const CANVAS_W = 4000;
    const CANVAS_H = 3000;

    for (const other of others) {
      const b = elementBounds(other);
      const { xs: oxs, ys: oys } = getAnchors(b);

      for (const dx of dragAnchors.xs) {
        for (const ox of oxs) {
          const diff = Math.abs(dx - ox);
          if (diff < SNAP_THRESHOLD && diff < bestDx) {
            bestDx = diff;
            snapX = ox - (dx - dragX);
            lines.push({
              orientation: "v",
              points: [ox, 0, ox, CANVAS_H],
            });
          }
        }
      }

      for (const dy of dragAnchors.ys) {
        for (const oy of oys) {
          const diff = Math.abs(dy - oy);
          if (diff < SNAP_THRESHOLD && diff < bestDy) {
            bestDy = diff;
            snapY = oy - (dy - dragY);
            lines.push({
              orientation: "h",
              points: [0, oy, CANVAS_W, oy],
            });
          }
        }
      }
    }

    return { lines, snapX, snapY };
  }

  function handleElementDragMove(
    e: Konva.KonvaEventObject<DragEvent>,
    id: string,
    w: number,
    h: number,
  ) {
    if (readOnly) return;
    const node = e.target;
    const { lines, snapX, snapY } = computeGuides(id, node.x(), node.y(), w, h);

    if (snapX !== null) node.x(snapX);
    if (snapY !== null) node.y(snapY);

    setGuides(lines);
  }

  function handleElementDragEnd(
    e: Konva.KonvaEventObject<DragEvent>,
    id: string,
  ) {
    setGuides([]);
    updateElement(id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
  }

  const sortedElements = [...layout.elements].sort((a, b) => a.zIndex - b.zIndex);
  const canvasW = 4000;
  const canvasH = 3000;
  const zoom = viewState?.zoom ?? layout.zoom;
  const panX = viewState?.panX ?? layout.panX;
  const panY = viewState?.panY ?? layout.panY;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-muted/40"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={onDrop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        x={panX}
        y={panY}
        scaleX={zoom}
        scaleY={zoom}
        draggable={spaceDown && !readOnly}
        onDragEnd={onStageDragEnd}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={(e) => {
          if (e.target === stageRef.current && !activeTool) {
            clearSelection();
          }
        }}
        style={{
          cursor: readOnly ? "default" : spaceDown ? "grab" : activeTool ? "copy" : "default",
          background: "#f8fafc",
        }}
      >
        {/* ── Background + grid ── */}
        <Layer listening={false}>
          <Rect
            x={0} y={0} width={canvasW} height={canvasH}
            fill={layout.background}
            shadowBlur={20} shadowColor="rgba(0,0,0,0.08)"
          />
          {layout.showGrid && <GridLayer width={canvasW} height={canvasH} size={layout.gridSize} />}
        </Layer>

        {/* ── Elements ── */}
        <Layer>
          {sortedElements.map((el) => (
            <CanvasElement
              key={el.id}
              el={el}
              readOnly={readOnly}
              onDragMove={
                readOnly
                  ? undefined
                  : (e) => handleElementDragMove(e, el.id, el.width, el.height)
              }
              onDragEnd={
                readOnly
                  ? undefined
                  : (e) => handleElementDragEnd(e, el.id)
              }
              onContextMenu={(evt, id) => {
                if (readOnly) return;
                evt.evt.preventDefault();
                setCtxMenu({ x: evt.evt.clientX, y: evt.evt.clientY, id });
                useLayoutStore.getState().selectElement(id);
              }}
            />
          ))}

          {!readOnly && <Transformer selectedIds={selectedIds} stageRef={stageRef} />}

          {/* Box selection rect */}
          {selectionRect && (
            <Rect
              x={Math.min(selectionRect.x1, selectionRect.x2)}
              y={Math.min(selectionRect.y1, selectionRect.y2)}
              width={Math.abs(selectionRect.x2 - selectionRect.x1)}
              height={Math.abs(selectionRect.y2 - selectionRect.y1)}
              fill="rgba(59,130,246,0.1)"
              stroke="#3b82f6"
              strokeWidth={1}
              listening={false}
            />
          )}
        </Layer>

        {/* ── Alignment guide lines (top layer, non-interactive) ── */}
        {guides.length > 0 && (
          <Layer listening={false}>
            {guides.map((g, i) => (
              <Line
                key={i}
                points={g.points}
                stroke={GUIDE_COLOR}
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ))}
          </Layer>
        )}
      </Stage>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          targetId={ctxMenu.id}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
