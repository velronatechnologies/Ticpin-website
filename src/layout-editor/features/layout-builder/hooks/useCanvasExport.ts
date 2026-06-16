import { useRef } from "react";
import type Konva from "konva";
import { useLayoutStore } from "../store/layoutStore";

function download(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function useCanvasExport() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layoutName = useLayoutStore((s) => s.layout.name);
  const exportJsonStr = useLayoutStore((s) => s.exportLayoutJson);

  const exportJSON = () => {
    const blob = new Blob([exportJsonStr()], { type: "application/json" });
    download(`${sanitize(layoutName)}.json`, URL.createObjectURL(blob));
  };

  const exportPNG = () => {
    const st = stageRef.current;
    if (!st) return;
    const url = st.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    download(`${sanitize(layoutName)}.png`, url);
  };

  const exportSVG = () => {
    // Konva native SVG export is not available; fall back to PNG embedded in SVG.
    const st = stageRef.current;
    if (!st) return;
    const png = st.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    const w = st.width(), h = st.height();
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image href="${png}" width="${w}" height="${h}"/></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    download(`${sanitize(layoutName)}.svg`, URL.createObjectURL(blob));
  };

  return { stageRef, exportJSON, exportPNG, exportSVG };
}

function sanitize(name: string): string {
  return name.replace(/[^\w-]+/g, "_") || "layout";
}
