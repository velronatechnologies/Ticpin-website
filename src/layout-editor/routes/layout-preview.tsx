import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { z } from "zod";
import { Canvas } from "@/features/layout-builder/components/Canvas";
import { useLayoutStore } from "@/features/layout-builder/store/layoutStore";
import { loadLayout } from "@/features/layout-builder/functions/loadLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { SectionElement, LayoutDocument } from "@/features/layout-builder/types/layout.types";

const search = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/layout-preview")({
  ssr: false,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Layout Preview" },
      { name: "description", content: "View the seating and facilities layout for this event." },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [hover, setHover] = useState<{ x: number; y: number; el: SectionElement } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadLocal = useLayoutStore((s) => s.loadLayout);
  const elements = useLayoutStore((s) => s.layout.elements);
  const name = useLayoutStore((s) => s.layout.name);

  useEffect(() => {
    loadLayout({ data: { id } })
      .then((res) => {
        const doc = res.layoutJson as unknown as LayoutDocument;
        loadLocal(doc);
      })
      .catch((e) => setError(e.message));
  }, [id, loadLocal]);

  useEffect(() => {
    function resize() {
      const r = wrapRef.current?.getBoundingClientRect();
      if (r) setSize({ w: r.width, h: r.height });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.container().getBoundingClientRect();
      const x = (e.clientX - rect.left - stage.x()) / stage.scaleX();
      const y = (e.clientY - rect.top - stage.y()) / stage.scaleY();
      const sections = elements.filter(
        (el): el is SectionElement => el.type === "section" && el.visible,
      );
      const hit = [...sections]
        .reverse()
        .find((el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height);
      setHover(hit ? { x: e.clientX, y: e.clientY, el: hit } : null);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [elements]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Couldn't load layout</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
            Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="text-sm font-semibold">{name}</h1>
        <span className="w-16" />
      </header>
      <div ref={wrapRef} className="relative flex-1">
        <Canvas width={size.w} height={size.h} stageRef={stageRef} readOnly />
        {hover && (
          <div
            className="pointer-events-none fixed z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg"
            style={{ left: hover.x + 16, top: hover.y + 16 }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold">{hover.el.name}</span>
              <Badge style={{ backgroundColor: hover.el.color, color: "#fff" }}>
                {hover.el.sectionType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{hover.el.description}</p>
            {hover.el.sectionType === "class" ? (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Seat mode</div>
                  <div className="font-semibold">{hover.el.seatingType}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-semibold">₹{hover.el.price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max seats</div>
                  <div className="font-semibold">{hover.el.capacity}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Available</div>
                  <div className="font-semibold">{hover.el.available}</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
