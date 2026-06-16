import type { LayoutElement, PaletteItemKind, SectionType, ShapeType } from "../types/layout.types";
import { sectionColors } from "./colorPresets";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `el_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

interface DropContext {
  x: number;
  y: number;
  zIndex: number;
}

function base(
  name: string,
  ctx: DropContext,
  w = 120,
  h = 80,
): Omit<LayoutElement, "type"> & { id: string } {
  return {
    id: newId(),
    name,
    x: ctx.x - w / 2,
    y: ctx.y - h / 2,
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    color: "#ffffff",
    borderColor: "#000000",
    borderWidth: 2,
    zIndex: ctx.zIndex,
  } as unknown as Omit<LayoutElement, "type"> & { id: string };
}

export function createElement(item: PaletteItemKind, ctx: DropContext): LayoutElement {
  switch (item.kind) {
    case "section": {
      return createSectionElement(item.sectionType, ctx);
    }
    case "stage": {
      const b = base("STAGE", ctx, 715, 165);
      return {
        ...b,
        type: "stage",
        color: "#D9D9D9",
        borderColor: "#686868",
        borderWidth: 2,
        label: "STAGE",
        textColor: "#686868",
        fontSize: 32,
      };
    }
    case "shape": {
      const size = getShapeDefaultSize(item.shapeType);
      const b = base(shapeLabel(item.shapeType), ctx, size.width, size.height);
      return {
        ...b,
        type: "shape",
        shapeType: item.shapeType,
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 2,
        sides: item.shapeType === "polygon" ? 6 : 4,
      };
    }
    case "text": {
      const b = base("Text", ctx, 160, 40);
      return {
        ...b,
        type: "text",
        color: "transparent",
        borderColor: "transparent",
        borderWidth: 0,
        text: "Double-click to edit",
        fontSize: 18,
        fontWeight: "normal",
        fontFamily: "Anek Latin, sans-serif",
        align: "left",
        textColor: "#111827",
      };
    }
    case "image": {
      const b = base("Image", ctx, 200, 140);
      return {
        ...b,
        type: "image",
        src: "",
        objectFit: "cover",
      };
    }
    case "icon": {
      const b = base("Icon", ctx, 64, 64);
      return {
        ...b,
        type: "icon",
        color: "#ffffff",
        borderColor: "#000000",
        borderWidth: 2,
        iconName: "Users",
        iconColor: "#111827",
        label: "",
      };
    }
    case "divider": {
      const horizontal = item.orientation === "horizontal";
      const b = base("Divider", ctx, horizontal ? 200 : 2, horizontal ? 2 : 200);
      return {
        ...b,
        type: "divider",
        color: "#9ca3af",
        borderColor: "#9ca3af",
        borderWidth: 0,
        orientation: item.orientation,
      };
    }
  }
}

function createSectionElement(sectionType: SectionType, ctx: DropContext): LayoutElement {
  const sc = sectionColors[sectionType];
  const size = sectionType === "class" ? { width: 750, height: 140 } : { width: 190, height: 100 };
  const b = base(sc.label, ctx, size.width, size.height);

  return {
    ...b,
    type: "section",
    name: sectionType === "class" ? "CLASS" : sc.label,
    sectionType,
    color: sectionType === "class" ? "rgba(93, 78, 181, 0.5)" : sc.fill,
    borderColor: sectionType === "class" ? "#240281" : sc.border,
    borderWidth: 2,
    price: sectionType === "class" ? 2000 : 0,
    capacity: sectionType === "class" ? 100 : 0,
    available: sectionType === "class" ? 100 : 0,
    description: sectionType === "class" ? "Editable class box" : `${sc.label} gate`,
    icon: sectionType === "class" ? "sitting" : sectionType === "entrygate" ? "entry" : "exit",
    textColor: sectionType === "class" ? "#240281" : "#111827",
    iconColor: sectionType === "class" ? "#240281" : "#111827",
    seatingType: sectionType === "class" ? "sitting" : "standing",
    fontSize: sectionType === "class" ? 32 : undefined,
    priceSize: sectionType === "class" ? 22 : undefined,
    iconScale: sectionType === "class" ? 24 : undefined,
  };
}

function shapeLabel(s: ShapeType): string {
  return {
    rect: "Rectangle",
    square: "Square",
    circle: "Circle",
    ellipse: "Ellipse",
    triangle: "Triangle",
    polygon: "Polygon",
    line: "Line",
    semicircle: "Semi Circle",
  }[s];
}

function getShapeDefaultSize(s: ShapeType) {
  switch (s) {
    case "line":
      return { width: 180, height: 6 };
    case "rect":
      return { width: 140, height: 90 };
    case "square":
      return { width: 90, height: 90 };
    case "semicircle":
      return { width: 120, height: 60 };
    default:
      return { width: 100, height: 100 };
  }
}
