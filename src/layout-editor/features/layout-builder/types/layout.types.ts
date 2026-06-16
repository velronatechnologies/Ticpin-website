export type SectionType = "class" | "entrygate" | "exitgate";

export type SeatingType = "standing" | "sitting";

export type ShapeType =
  | "rect"
  | "square"
  | "circle"
  | "ellipse"
  | "triangle"
  | "polygon"
  | "line"
  | "semicircle";

export type ElementType = "section" | "stage" | "text" | "image" | "icon" | "shape" | "divider";

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  color: string;
  borderColor: string;
  borderWidth: number;
  zIndex: number;
}

export interface SectionElement extends BaseElement {
  type: "section";
  sectionType: SectionType;
  price: number;
  capacity: number;
  available: number;
  description: string;
  icon: string;
  textColor: string;
  iconColor: string;
  seatingType: SeatingType;
  fontSize?: number;
  priceSize?: number;
  iconScale?: number;
}

export interface StageElement extends BaseElement {
  type: "stage";
  label: string;
  textColor: string;
  fontSize?: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontFamily: string;
  align: "left" | "center" | "right";
  textColor: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  objectFit: "cover" | "contain" | "fill";
}

export interface IconElement extends BaseElement {
  type: "icon";
  iconName: string;
  iconColor: string;
  label: string;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: ShapeType;
  sides: number;
}

export interface DividerElement extends BaseElement {
  type: "divider";
  orientation: "horizontal" | "vertical";
}

export type LayoutElement =
  | SectionElement
  | StageElement
  | TextElement
  | ImageElement
  | IconElement
  | ShapeElement
  | DividerElement;

export interface LayoutDocument {
  id: string;
  name: string;
  background: string;
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  elements: LayoutElement[];
}

export type PaletteItemKind =
  | { kind: "section"; sectionType: SectionType }
  | { kind: "stage" }
  | { kind: "shape"; shapeType: ShapeType }
  | { kind: "text" }
  | { kind: "image" }
  | { kind: "icon" }
  | { kind: "divider"; orientation: "horizontal" | "vertical" };
