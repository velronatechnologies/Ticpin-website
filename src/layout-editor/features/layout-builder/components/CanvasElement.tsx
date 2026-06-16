import type Konva from "konva";
import { Circle, Ellipse, Group, Image as KImage, Line, Rect, Text } from "react-konva";
import useImage from "use-image";
import { useLayoutStore } from "../store/layoutStore";
import type {
  LayoutElement,
  SectionElement,
  ShapeElement,
  StageElement,
} from "../types/layout.types";
import { useSnapToGrid } from "../hooks/useSnapToGrid";

interface Props {
  el: LayoutElement;
  onContextMenu: (e: Konva.KonvaEventObject<PointerEvent>, id: string) => void;
  readOnly?: boolean;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

export function CanvasElement({ el, onContextMenu, readOnly, onDragMove, onDragEnd: onDragEndProp }: Props) {
  const select = useLayoutStore((s) => s.selectElement);
  const update = useLayoutStore((s) => s.updateElement);
  const pushHistory = useLayoutStore((s) => s.pushHistory);
  const snap = useSnapToGrid();

  if (!el.visible) {
    return null;
  }

  const minSize = getMinimumSize(el);

  const common = {
    id: el.id,
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: el.opacity,
    draggable: !el.locked && !readOnly,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (!readOnly) {
        select(el.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey);
      }
    },
    onTap: (e: Konva.KonvaEventObject<TouchEvent>) => {
      e.cancelBubble = true;
      if (!readOnly) {
        select(el.id);
      }
    },
    onDblClick: () => {
      if (!readOnly) {
        editElementText(el, pushHistory, update);
      }
    },
    onDblTap: () => {
      if (!readOnly) {
        editElementText(el, pushHistory, update);
      }
    },
    onContextMenu: (e: Konva.KonvaEventObject<PointerEvent>) => onContextMenu(e, el.id),
    onDragStart: () => {
      if (!readOnly) pushHistory();
    },
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!readOnly && onDragMove) onDragMove(e);
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!readOnly) {
        if (onDragEndProp) {
          onDragEndProp(e);
        } else {
          update(el.id, {
            x: snapNumber(snap(e.target.x())),
            y: snapNumber(snap(e.target.y())),
          });
        }
      }
    },
    onTransformStart: () => {
      if (!readOnly) {
        pushHistory();
      }
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      if (readOnly) {
        return;
      }

      const node = e.target as Konva.Node;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const nextWidth = Math.max(minSize.width, snapNumber(snap(Math.abs(el.width * scaleX))));
      const nextHeight = Math.max(minSize.height, snapNumber(snap(Math.abs(el.height * scaleY))));

      node.scaleX(1);
      node.scaleY(1);

      update(el.id, {
        x: snapNumber(snap(node.x())),
        y: snapNumber(snap(node.y())),
        width: nextWidth,
        height: nextHeight,
        rotation: snapNumber(node.rotation()),
      });
    },
  };

  return <Group {...common}>{renderElement(el)}</Group>;
}

function renderElement(el: LayoutElement) {
  if (el.type === "shape") {
    return <ShapeNode el={el} />;
  }

  if (el.type === "section") {
    return <SectionNode el={el} />;
  }

  if (el.type === "stage") {
    return <StageNode el={el} />;
  }

  if (el.type === "text") {
    return (
      <Text
        width={el.width}
        height={el.height}
        text={el.text}
        fontSize={el.fontSize}
        fontStyle={el.fontWeight}
        fontFamily={el.fontFamily}
        align={el.align}
        verticalAlign="middle"
        fill={el.textColor}
      />
    );
  }

  if (el.type === "image") {
    return <ImageNode el={el} />;
  }

  if (el.type === "icon") {
    return (
      <>
        <Rect
          width={el.width}
          height={el.height}
          fill={el.color}
          stroke={el.borderColor}
          strokeWidth={el.borderWidth}
          cornerRadius={8}
        />
        <Text
          width={el.width}
          height={el.height}
          text={el.label || el.iconName}
          align="center"
          verticalAlign="middle"
          fontSize={Math.min(el.height * 0.28, 16)}
          fontStyle="bold"
          fontFamily="Anek Latin"
          fill={el.iconColor}
          padding={6}
        />
      </>
    );
  }

  if (el.type === "divider") {
    const lineColor = el.color || el.borderColor || "#000000";
    return (
      <>
        <Rect
          width={Math.max(el.width, 14)}
          height={Math.max(el.height, 14)}
          fill="rgba(0,0,0,0.001)"
        />
        <Line
          points={
            el.orientation === "horizontal"
              ? [0, el.height / 2, el.width, el.height / 2]
              : [el.width / 2, 0, el.width / 2, el.height]
          }
          stroke={lineColor}
          strokeWidth={Math.max(el.orientation === "horizontal" ? el.height : el.width, 2)}
          lineCap="round"
        />
      </>
    );
  }

  return null;
}

function ShapeNode({ el }: { el: ShapeElement }) {
  const stroke = el.borderColor || "#000000";
  const fill = el.shapeType === "line" ? "transparent" : el.color;

  if (el.shapeType === "circle") {
    return (
      <Circle
        x={el.width / 2}
        y={el.height / 2}
        radius={Math.min(el.width, el.height) / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={el.borderWidth}
      />
    );
  }

  if (el.shapeType === "ellipse") {
    return (
      <Ellipse
        x={el.width / 2}
        y={el.height / 2}
        radiusX={el.width / 2}
        radiusY={el.height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={el.borderWidth}
      />
    );
  }

  if (el.shapeType === "triangle") {
    return (
      <Line
        points={[el.width / 2, 0, 0, el.height, el.width, el.height]}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={el.borderWidth}
        lineJoin="round"
      />
    );
  }

  if (el.shapeType === "polygon") {
    const points = createPolygonPoints(el.width, el.height, Math.max(3, el.sides || 6));
    return (
      <Line
        points={points}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={el.borderWidth}
        lineJoin="round"
      />
    );
  }

  if (el.shapeType === "line") {
    return (
      <>
        <Rect
          width={Math.max(el.width, 14)}
          height={Math.max(el.height, 14)}
          fill="rgba(0,0,0,0.001)"
        />
        <Line
          points={[0, el.height / 2, el.width, el.height / 2]}
          stroke={stroke}
          strokeWidth={Math.max(el.height, 2)}
          lineCap="round"
        />
      </>
    );
  }

  if (el.shapeType === "semicircle") {
    return (
      <Line
        points={createSemiCirclePoints(el.width, el.height)}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={el.borderWidth}
        lineJoin="round"
      />
    );
  }

  return (
    <Rect
      width={el.width}
      height={el.height}
      fill={fill}
      stroke={stroke}
      strokeWidth={el.borderWidth}
      cornerRadius={el.shapeType === "square" ? 0 : 4}
    />
  );
}

function SectionNode({ el }: { el: SectionElement }) {
  const isSitting    = el.sectionType === "class" && el.seatingType === "sitting";
  const isGate       = el.sectionType === "entrygate" || el.sectionType === "exitgate";
  const iconText     = getSectionIconText(el);
  const priceVisible = el.sectionType === "class" && Number(el.price) > 0;

  const scaleFactor = (el.height || 110) / 110;

  const nameFontSize = el.fontSize && el.fontSize !== 14 && el.fontSize !== 12
    ? el.fontSize 
    : Math.max(12, Math.round(32 * scaleFactor));
      
  const priceFontSize = el.priceSize && el.priceSize !== 12 && el.priceSize !== 10
    ? el.priceSize 
    : Math.max(10, Math.round(22 * scaleFactor));
      
  const iconSize = el.iconScale && el.iconScale !== 22
    ? el.iconScale 
    : Math.max(12, Math.round(24 * scaleFactor));

  const gap = isSitting ? Math.max(2, Math.round(4 * scaleFactor)) : Math.max(3, Math.round(6 * scaleFactor));

  // ── SITTING layout: name / icon / price ──────────────────────────────────
  const sittingContentH = nameFontSize + gap + iconSize + (priceVisible ? gap + priceFontSize : 0);
  const sittingStartY   = Math.max(4, (el.height - sittingContentH) / 2);
  const nameY  = sittingStartY;
  const iconY  = nameY + nameFontSize + gap;
  const priceY = iconY + iconSize + gap;            // sitting price y

  // ── STANDING layout: name / price (no icon) ──────────────────────────────
  const standingContentH = priceVisible
    ? nameFontSize + gap + priceFontSize
    : nameFontSize;
  const standingStartY  = Math.max(4, (el.height - standingContentH) / 2);
  const standNameY      = standingStartY;
  const standPriceY     = standNameY + nameFontSize + gap;

  return (
    <>
      <Rect
        width={el.width} height={el.height}
        fill={el.color} stroke={el.borderColor}
        strokeWidth={el.borderWidth} cornerRadius={10}
      />

      {/* ── GATE: arrow centred full box ── */}
      {isGate && (
        <Text
          x={0} y={0} width={el.width} height={el.height}
          text={iconText} align="center" verticalAlign="middle"
          fontSize={Math.min(el.height * 0.5, 36)}
          fontFamily="Anek Latin" fill={el.iconColor}
        />
      )}

      {/* ── STANDING: name + price stacked, no icon ── */}
      {!isGate && !isSitting && (
        <>
          <Text
            x={8} y={standNameY}
            width={Math.max(0, el.width - 16)} height={nameFontSize + 2}
            text={el.name} align="center" verticalAlign="middle"
            fontSize={nameFontSize} fontStyle="bold"
            fontFamily="Anek Latin" fill={el.textColor}
          />
          {priceVisible && (
            <Text
              x={8} y={standPriceY}
              width={Math.max(0, el.width - 16)} height={priceFontSize + 4}
              text={`₹ ${Number(el.price || 0)}`}
              align="center" verticalAlign="middle"
              fontSize={priceFontSize} fontStyle="normal"
              fontFamily="Anek Latin" fill={el.textColor}
            />
          )}
        </>
      )}

      {/* ── SITTING: tight stack — name / icon / price ── */}
      {!isGate && isSitting && (
        <>
          {/* Name */}
          <Text
            x={8} y={nameY}
            width={Math.max(0, el.width - 16)} height={nameFontSize + 2}
            text={el.name} align="center" verticalAlign="middle"
            fontSize={nameFontSize} fontStyle="bold"
            fontFamily="Anek Latin" fill={el.textColor}
          />

          {/* Chair icon — matches SVG viewBox 0 0 24 24 exactly */}
          <Group
            x={(el.width - iconSize) / 2}
            y={iconY}
            scaleX={iconSize / 24}
            scaleY={iconSize / 24}
          >
            {/* Backrest */}
            <Rect x={4}  y={4}  width={16} height={10} cornerRadius={2}   fill={el.iconColor} opacity={0.8} />
            {/* Left leg */}
            <Rect x={4}  y={14} width={4}  height={6}  cornerRadius={1}   fill={el.iconColor} />
            {/* Right leg */}
            <Rect x={16} y={14} width={4}  height={6}  cornerRadius={1}   fill={el.iconColor} />
            {/* Seat rail */}
            <Rect x={2}  y={12} width={20} height={3}  cornerRadius={1.5} fill={el.iconColor} />
          </Group>

          {/* Price */}
          {priceVisible && (
            <Text
              x={8} y={priceY}
              width={Math.max(0, el.width - 16)} height={priceFontSize + 4}
              text={`₹ ${Number(el.price || 0)}`}
              align="center" verticalAlign="middle"
              fontSize={priceFontSize} fontStyle="normal"
              fontFamily="Anek Latin"
              fill={el.textColor}
            />
          )}
        </>
      )}
    </>
  );
}




function StageNode({ el }: { el: StageElement }) {
  return (
    <>
      <Rect
        width={el.width}
        height={el.height}
        fill={el.color}
        stroke={el.borderColor}
        strokeWidth={el.borderWidth}
        cornerRadius={10}
      />
      <Text
        width={el.width}
        height={el.height}
        text={el.label || el.name || "STAGE"}
        fill={el.textColor}
        fontSize={el.fontSize ?? Math.min(el.height * 0.38, 28)}
        fontStyle="bold"
        fontFamily="Anek Latin"
        align="center"
        verticalAlign="middle"
        padding={8}
      />
    </>
  );
}

function ImageNode({
  el,
}: {
  el: {
    src: string;
    width: number;
    height: number;
    color: string;
    borderColor: string;
    borderWidth: number;
  };
}) {
  const [img] = useImage(el.src || "");

  return (
    <Group>
      <Rect
        width={el.width}
        height={el.height}
        fill={el.color}
        stroke={el.borderColor}
        strokeWidth={el.borderWidth}
        cornerRadius={6}
      />
      {img ? (
        <KImage image={img} width={el.width} height={el.height} />
      ) : (
        <>
          <Text
            width={el.width}
            height={el.height}
            text="Image"
            align="center"
            verticalAlign="middle"
            fill="#6b7280"
            fontFamily="Anek Latin"
            fontSize={14}
          />
        </>
      )}
    </Group>
  );
}

function editElementText(
  el: LayoutElement,
  pushHistory: () => void,
  update: (id: string, patch: Partial<LayoutElement>) => void,
) {
  if (el.type !== "section" && el.type !== "stage" && el.type !== "text" && el.type !== "icon") {
    return;
  }

  const currentValue =
    el.type === "text"
      ? el.text
      : el.type === "stage"
        ? el.label || el.name
        : el.type === "icon"
          ? el.label || el.name
          : el.name;

  const nextValue = window.prompt("Edit text", currentValue);
  if (nextValue == null || nextValue.trim() === "") {
    return;
  }

  pushHistory();

  if (el.type === "text") {
    update(el.id, { text: nextValue } as Partial<LayoutElement>);
    return;
  }

  if (el.type === "stage") {
    update(el.id, {
      name: nextValue,
      label: nextValue,
    } as Partial<LayoutElement>);
    return;
  }

  if (el.type === "icon") {
    update(el.id, {
      name: nextValue,
      label: nextValue,
    } as Partial<LayoutElement>);
    return;
  }

  update(el.id, { name: nextValue } as Partial<LayoutElement>);
}

function getSectionIconText(el: SectionElement) {
  if (el.sectionType === "class") {
    return el.seatingType === "sitting" ? "🪑" : "";
  }

  return el.sectionType === "entrygate" ? "⇢" : "⇠";
}

function getMinimumSize(el: LayoutElement) {
  if (el.type === "shape" && el.shapeType === "line") {
    return { width: 24, height: 2 };
  }

  if (el.type === "divider") {
    return { width: 2, height: 2 };
  }

  if (el.type === "shape" && el.shapeType === "semicircle") {
    return { width: 24, height: 12 };
  }

  return { width: 24, height: 24 };
}

function snapNumber(value: number) {
  return Math.round(value * 10) / 10;
}

function createPolygonPoints(width: number, height: number, sides: number) {
  const radius = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const points: number[] = [];

  for (let index = 0; index < sides; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    points.push(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
  }

  return points;
}

function createSemiCirclePoints(width: number, height: number) {
  const radius = width / 2;
  const centerX = width / 2;
  const centerY = height;
  const points: number[] = [0, height];
  const segments = 24;

  for (let index = 0; index <= segments; index += 1) {
    const angle = Math.PI - (index * Math.PI) / segments;
    points.push(centerX + radius * Math.cos(angle), centerY - radius * Math.sin(angle));
  }

  points.push(width, height);
  return points;
}
