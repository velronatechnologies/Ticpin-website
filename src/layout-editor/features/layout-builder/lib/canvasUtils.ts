import type { LayoutElement } from "../types/layout.types";

export interface Rect { x: number; y: number; width: number; height: number; }

export function elementBounds(el: LayoutElement): Rect {
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

export function normalizeRect(a: { x: number; y: number }, b: { x: number; y: number }): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

export function snap(value: number, size: number, enabled: boolean): number {
  if (!enabled || size <= 0) return value;
  return Math.round(value / size) * size;
}
