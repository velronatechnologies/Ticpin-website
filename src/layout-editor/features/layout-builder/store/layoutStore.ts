import { create } from "zustand";
import type {
  ElementType,
  LayoutDocument,
  LayoutElement,
  PaletteItemKind,
} from "../types/layout.types";
import { emptyLayout, exportLayoutJson, importLayoutJson } from "../lib/layoutSerializer";

const HISTORY_MAX = 50;

interface State {
  layout: LayoutDocument;
  selectedIds: string[];
  clipboard: LayoutElement[];
  history: LayoutDocument[];
  historyIndex: number;
  isDraggingFromSidebar: boolean;
  draggedType: ElementType | null;
  activePanel: "layers" | "properties";
  activeTool: PaletteItemKind | null;
}

interface Actions {
  addElement: (el: LayoutElement) => void;
  updateElement: (id: string, patch: Partial<LayoutElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelected: () => void;
  duplicateElement: (id: string) => void;
  duplicateSelected: () => void;
  selectElement: (id: string, multi?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  boxSelect: (ids: string[]) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setVisibility: (id: string, visible: boolean) => void;
  setLocked: (id: string, locked: boolean) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;
  renameElement: (id: string, name: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setGrid: (show: boolean, snap: boolean, size: number) => void;
  setBackground: (color: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  importLayout: (json: string) => void;
  exportLayoutJson: () => string;
  resetLayout: () => void;
  setLayoutName: (name: string) => void;
  copySelected: () => void;
  paste: () => void;
  nudgeSelected: (dx: number, dy: number) => void;
  setDragging: (dragging: boolean, type: ElementType | null) => void;
  setActivePanel: (panel: "layers" | "properties") => void;
  setActiveTool: (tool: PaletteItemKind | null) => void;
  clearActiveTool: () => void;
  loadLayout: (doc: LayoutDocument) => void;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `el_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

function nextZ(layout: LayoutDocument): number {
  return layout.elements.reduce((m, e) => Math.max(m, e.zIndex), 0) + 1;
}

export const useLayoutStore = create<State & Actions>((set, get) => ({
  layout: emptyLayout(),
  selectedIds: [],
  clipboard: [],
  history: [],
  historyIndex: -1,
  isDraggingFromSidebar: false,
  draggedType: null,
  activePanel: "properties",
  activeTool: null,

  pushHistory: () => {
    const { history, historyIndex, layout } = get();
    const next = history.slice(0, historyIndex + 1);
    next.push(clone(layout));

    if (next.length > HISTORY_MAX) {
      next.shift();
    }

    set({ history: next, historyIndex: next.length - 1 });
  },

  addElement: (el) => {
    get().pushHistory();
    set((s) => ({
      layout: {
        ...s.layout,
        elements: [...s.layout.elements, { ...el, zIndex: nextZ(s.layout) }],
      },
      selectedIds: [el.id],
    }));
  },

  updateElement: (id, patch) => {
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.map((e) =>
          e.id === id ? ({ ...e, ...patch } as LayoutElement) : e,
        ),
      },
    }));
  },

  deleteElement: (id) => {
    get().pushHistory();
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.filter((e) => e.id !== id),
      },
      selectedIds: s.selectedIds.filter((selectedId) => selectedId !== id),
    }));
  },

  deleteSelected: () => {
    const { selectedIds } = get();
    if (!selectedIds.length) {
      return;
    }

    get().pushHistory();
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.filter((e) => !selectedIds.includes(e.id)),
      },
      selectedIds: [],
    }));
  },

  duplicateElement: (id) => {
    const el = get().layout.elements.find((e) => e.id === id);
    if (!el) {
      return;
    }

    get().pushHistory();
    const copy = {
      ...clone(el),
      id: newId(),
      x: el.x + 20,
      y: el.y + 20,
      zIndex: nextZ(get().layout),
    };

    set((s) => ({
      layout: { ...s.layout, elements: [...s.layout.elements, copy] },
      selectedIds: [copy.id],
    }));
  },

  duplicateSelected: () => {
    const { selectedIds, layout } = get();
    if (!selectedIds.length) {
      return;
    }

    get().pushHistory();
    const copies: LayoutElement[] = [];
    let z = nextZ(layout);

    for (const id of selectedIds) {
      const el = layout.elements.find((e) => e.id === id);
      if (!el) {
        continue;
      }

      copies.push({
        ...clone(el),
        id: newId(),
        x: el.x + 20,
        y: el.y + 20,
        zIndex: z++,
      });
    }

    set((s) => ({
      layout: { ...s.layout, elements: [...s.layout.elements, ...copies] },
      selectedIds: copies.map((copy) => copy.id),
    }));
  },

  selectElement: (id, multi) => {
    set((s) => {
      if (multi) {
        return {
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((selectedId) => selectedId !== id)
            : [...s.selectedIds, id],
        };
      }

      return { selectedIds: [id] };
    });
  },

  selectAll: () => set((s) => ({ selectedIds: s.layout.elements.map((e) => e.id) })),
  clearSelection: () => set({ selectedIds: [] }),
  boxSelect: (ids) => set({ selectedIds: ids }),

  bringForward: (id) => {
    get().pushHistory();
    set((s) => {
      const els = [...s.layout.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = els.findIndex((e) => e.id === id);
      if (idx < 0 || idx === els.length - 1) {
        return s;
      }

      const a = els[idx].zIndex;
      const b = els[idx + 1].zIndex;
      els[idx].zIndex = b;
      els[idx + 1].zIndex = a;
      return { layout: { ...s.layout, elements: els } };
    });
  },

  sendBackward: (id) => {
    get().pushHistory();
    set((s) => {
      const els = [...s.layout.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = els.findIndex((e) => e.id === id);
      if (idx <= 0) {
        return s;
      }

      const a = els[idx].zIndex;
      const b = els[idx - 1].zIndex;
      els[idx].zIndex = b;
      els[idx - 1].zIndex = a;
      return { layout: { ...s.layout, elements: els } };
    });
  },

  bringToFront: (id) => {
    get().pushHistory();
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.map((e) =>
          e.id === id ? { ...e, zIndex: nextZ(s.layout) } : e,
        ),
      },
    }));
  },

  sendToBack: (id) => {
    get().pushHistory();
    set((s) => {
      const minZ = s.layout.elements.reduce((m, e) => Math.min(m, e.zIndex), Infinity);

      return {
        layout: {
          ...s.layout,
          elements: s.layout.elements.map((e) => (e.id === id ? { ...e, zIndex: minZ - 1 } : e)),
        },
      };
    });
  },

  setVisibility: (id, visible) => {
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.map((e) => (e.id === id ? { ...e, visible } : e)),
      },
    }));
  },

  setLocked: (id, locked) => {
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.map((e) => (e.id === id ? { ...e, locked } : e)),
      },
    }));
  },

  reorderLayer: (fromIndex, toIndex) => {
    get().pushHistory();
    set((s) => {
      const sorted = [...s.layout.elements].sort((a, b) => b.zIndex - a.zIndex);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      const total = sorted.length;
      const rezoned = sorted.map((e, i) => ({ ...e, zIndex: total - i }));
      return { layout: { ...s.layout, elements: rezoned } };
    });
  },

  renameElement: (id, name) => {
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.map((e) => (e.id === id ? { ...e, name } : e)),
      },
    }));
  },

  setZoom: (zoom) =>
    set((s) => ({
      layout: { ...s.layout, zoom: Math.max(0.1, Math.min(5, zoom)) },
    })),
  setPan: (x, y) => set((s) => ({ layout: { ...s.layout, panX: x, panY: y } })),
  setGrid: (showGrid, snapToGrid, gridSize) =>
    set((s) => ({
      layout: { ...s.layout, showGrid, snapToGrid, gridSize },
    })),
  setBackground: (background) => set((s) => ({ layout: { ...s.layout, background } })),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) {
      return;
    }

    const prev = history[historyIndex - 1];
    set({
      layout: clone(prev),
      historyIndex: historyIndex - 1,
      selectedIds: [],
      activeTool: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) {
      return;
    }

    const next = history[historyIndex + 1];
    set({
      layout: clone(next),
      historyIndex: historyIndex + 1,
      selectedIds: [],
      activeTool: null,
    });
  },

  importLayout: (json) => {
    const doc = importLayoutJson(json);
    get().pushHistory();
    set({ layout: doc, selectedIds: [], activeTool: null });
  },

  exportLayoutJson: () => exportLayoutJson(get().layout),

  resetLayout: () => {
    get().pushHistory();
    set({ layout: emptyLayout(), selectedIds: [], activeTool: null });
  },

  setLayoutName: (name) => set((s) => ({ layout: { ...s.layout, name } })),

  copySelected: () => {
    const { selectedIds, layout } = get();
    set({
      clipboard: layout.elements.filter((e) => selectedIds.includes(e.id)).map(clone),
    });
  },

  paste: () => {
    const { clipboard, layout } = get();
    if (!clipboard.length) {
      return;
    }

    get().pushHistory();
    let z = nextZ(layout);
    const copies = clipboard.map((e) => ({
      ...clone(e),
      id: newId(),
      x: e.x + 20,
      y: e.y + 20,
      zIndex: z++,
    }));

    set((s) => ({
      layout: { ...s.layout, elements: [...s.layout.elements, ...copies] },
      selectedIds: copies.map((copy) => copy.id),
    }));
  },

  nudgeSelected: (dx, dy) => {
    set((s) => ({
      layout: {
        ...s.layout,
        elements: s.layout.elements.map((e) =>
          s.selectedIds.includes(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e,
        ),
      },
    }));
  },

  setDragging: (isDraggingFromSidebar, draggedType) => set({ isDraggingFromSidebar, draggedType }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setActiveTool: (activeTool) => set({ activeTool }),
  clearActiveTool: () => set({ activeTool: null }),
  loadLayout: (doc) =>
    set({
      layout: doc,
      selectedIds: [],
      history: [doc],
      historyIndex: 0,
      activeTool: null,
    }),
}));
