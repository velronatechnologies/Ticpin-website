import type {
  DividerElement,
  IconElement,
  ImageElement,
  LayoutDocument,
  LayoutElement,
  SectionElement,
  ShapeElement,
  StageElement,
  TextElement,
} from "../types/layout.types";

export const emptyLayout = (): LayoutDocument => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `lay_${Date.now()}`,
  name: "Untitled Layout",
  background: "#ffffff",
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 20,
  showGrid: true,
  snapToGrid: false,
  elements: [],
});

export function exportLayoutJson(doc: LayoutDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function importLayoutJson(json: string): LayoutDocument {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid layout JSON");
  }
  if (!Array.isArray(parsed.elements)) {
    throw new Error("Invalid layout: missing elements");
  }

  return {
    ...emptyLayout(),
    ...parsed,
    elements: parsed.elements.map(normalizeElement),
  };
}

function normalizeElement(input: unknown): LayoutElement {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const type = String(raw.type || "section") as LayoutElement["type"];
  const base = normalizeBase(raw, type);

  switch (type) {
    case "section":
      return {
        ...base,
        type,
        sectionType: normalizeSectionType(raw.sectionType),
        price: numberValue(raw.price),
        capacity: numberValue(raw.capacity, 100),
        available: numberValue(raw.available, numberValue(raw.capacity, 100)),
        description: stringValue(raw.description),
        icon: stringValue(raw.icon, "standing"),
        textColor: stringValue(raw.textColor, "#111827"),
        iconColor: stringValue(raw.iconColor, "#111827"),
        seatingType: raw.seatingType === "sitting" ? "sitting" : "standing",
        ...(typeof raw.fontSize   === "number" ? { fontSize:   raw.fontSize   } : {}),
        ...(typeof raw.priceSize  === "number" ? { priceSize:  raw.priceSize  } : {}),
        ...(typeof raw.iconScale  === "number" ? { iconScale:  raw.iconScale  } : {}),
      } satisfies SectionElement;
    case "stage":
      return {
        ...base,
        type,
        label: stringValue(raw.label, stringValue(raw.name, "STAGE")),
        textColor: stringValue(raw.textColor, "#111827"),
        ...(typeof raw.fontSize === "number" ? { fontSize: raw.fontSize } : {}),
      } satisfies StageElement;
    case "text":
      return {
        ...base,
        type,
        color: stringValue(raw.color, "transparent"),
        borderColor: stringValue(raw.borderColor, "transparent"),
        borderWidth: numberValue(raw.borderWidth, 0),
        text: stringValue(raw.text, stringValue(raw.name, "Text")),
        fontSize: numberValue(raw.fontSize, 18),
        fontWeight: raw.fontWeight === "bold" ? "bold" : "normal",
        fontFamily: stringValue(raw.fontFamily, "Inter, sans-serif"),
        align: raw.align === "center" || raw.align === "right" ? raw.align : "left",
        textColor: stringValue(raw.textColor, "#111827"),
      } satisfies TextElement;
    case "image":
      return {
        ...base,
        type,
        src: stringValue(raw.src),
        objectFit:
          raw.objectFit === "contain" || raw.objectFit === "fill" ? raw.objectFit : "cover",
      } satisfies ImageElement;
    case "icon":
      return {
        ...base,
        type,
        iconName: stringValue(raw.iconName, "Users"),
        iconColor: stringValue(raw.iconColor, "#111827"),
        label: stringValue(raw.label),
      } satisfies IconElement;
    case "shape":
      return {
        ...base,
        type,
        shapeType: normalizeShapeType(raw.shapeType),
        sides: Math.max(3, Math.round(numberValue(raw.sides, 6))),
      } satisfies ShapeElement;
    case "divider":
      return {
        ...base,
        type,
        color: stringValue(raw.color, "#000000"),
        borderColor: stringValue(raw.borderColor, "#000000"),
        borderWidth: numberValue(raw.borderWidth, 0),
        orientation: raw.orientation === "vertical" ? "vertical" : "horizontal",
      } satisfies DividerElement;
    default:
      return {
        ...base,
        type: "section",
        sectionType: "class",
        price: 0,
        capacity: 100,
        available: 100,
        description: "",
        icon: "standing",
        textColor: "#111827",
        iconColor: "#111827",
        seatingType: "standing",
      } satisfies SectionElement;
  }
}

function normalizeBase(raw: Record<string, unknown>, type: LayoutElement["type"]) {
  const nameFallback = type === "stage" ? "STAGE" : type.charAt(0).toUpperCase() + type.slice(1);
  const defaultSize = getDefaultSize(type, raw);

  return {
    id: stringValue(raw.id, cryptoId()),
    name: stringValue(raw.name, nameFallback),
    x: numberValue(raw.x),
    y: numberValue(raw.y),
    width: Math.max(2, numberValue(raw.width, defaultSize.width)),
    height: Math.max(2, numberValue(raw.height, defaultSize.height)),
    rotation: numberValue(raw.rotation),
    opacity: clamp(numberValue(raw.opacity, 1), 0, 1),
    visible: booleanValue(raw.visible, true),
    locked: booleanValue(raw.locked, false),
    color: stringValue(raw.color, defaultColor(type)),
    borderColor: stringValue(raw.borderColor, defaultBorderColor(type)),
    borderWidth: numberValue(raw.borderWidth, defaultBorderWidth(type)),
    zIndex: Math.round(numberValue(raw.zIndex)),
  };
}

function getDefaultSize(type: LayoutElement["type"], raw: Record<string, unknown>) {
  if (type === "stage") return { width: 320, height: 90 };
  if (type === "section") return { width: 220, height: 140 };
  if (type === "text") return { width: 160, height: 40 };
  if (type === "image") return { width: 200, height: 140 };
  if (type === "icon") return { width: 64, height: 64 };
  if (type === "divider") {
    return raw.orientation === "vertical" ? { width: 4, height: 180 } : { width: 180, height: 4 };
  }
  if (type === "shape") {
    return normalizeShapeType(raw.shapeType) === "line"
      ? { width: 180, height: 6 }
      : normalizeShapeType(raw.shapeType) === "semicircle"
        ? { width: 120, height: 60 }
        : { width: 100, height: 100 };
  }

  return { width: 120, height: 80 };
}

function defaultColor(type: LayoutElement["type"]) {
  if (type === "text" || type === "icon") {
    return type === "text" ? "transparent" : "#ffffff";
  }
  if (type === "divider") {
    return "#000000";
  }
  return "#ffffff";
}

function defaultBorderColor(type: LayoutElement["type"]) {
  return type === "text" ? "transparent" : "#000000";
}

function defaultBorderWidth(type: LayoutElement["type"]) {
  return type === "text" ? 0 : type === "divider" ? 0 : 1;
}

function normalizeSectionType(value: unknown): SectionElement["sectionType"] {
  return value === "entrygate" || value === "exitgate" ? value : "class";
}

function normalizeShapeType(value: unknown): ShapeElement["shapeType"] {
  switch (value) {
    case "square":
    case "circle":
    case "ellipse":
    case "triangle":
    case "polygon":
    case "line":
    case "semicircle":
      return value;
    default:
      return "rect";
  }
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))
      ? Number(value)
      : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `el_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
