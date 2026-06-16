import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { LayersPanel } from "./LayersPanel";
import { Toolbar } from "./Toolbar";
import { Canvas } from "./Canvas";
import { PreviewModal } from "./PreviewModal";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useLayoutStore } from "../store/layoutStore";
import type { LayoutDocument } from "../types/layout.types";
import { exportLayoutJson, importLayoutJson } from "../lib/layoutSerializer";

interface Props {
  initialLayout?: LayoutDocument;
  initialId?: string;
  onSave?: (layout: LayoutDocument) => void;
  onBack?: () => void;
}

const DRAFT_KEY = "layout_editor_draft";

export function LayoutBuilder({ initialLayout, initialId, onSave, onBack: _onBack }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [layoutId, setLayoutId] = useState<string | undefined>(initialId);
  const loadLayoutAction = useLayoutStore((s) => s.loadLayout);
  const pushHistory = useLayoutStore((s) => s.pushHistory);
  const importLayoutAction = useLayoutStore((s) => s.importLayout);
  const layout = useLayoutStore((s) => s.layout);
  const stageRef = useRef<import("konva").default.Stage | null>(null);
  const [mounted, setMounted] = useState(false);

  useKeyboardShortcuts();

  // ── On first mount: load initialLayout OR restore draft from localStorage ──
  useEffect(() => {
    setMounted(true);
    if (initialLayout) {
      loadLayoutAction(initialLayout);
    } else {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          importLayoutAction(draft);
          toast.info("Draft restored — click Save to keep permanently.");
        } else {
          pushHistory();
        }
      } catch {
        pushHistory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save to localStorage on every layout change ──
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(DRAFT_KEY, exportLayoutJson(layout));
    } catch {
      // storage quota exceeded — ignore silently
    }
  }, [layout, mounted]);

  useEffect(() => {
    function resize() {
      const r = wrapRef.current?.getBoundingClientRect();
      if (r) setSize({ w: r.width, h: r.height });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(layout);
        // Clear draft only after a successful permanent save
        localStorage.removeItem(DRAFT_KEY);
        toast.success("Layout saved permanently.");
      } else {
        toast.success("Layout prepared");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
      setLayoutId(layout.id);
    }
  }

  void layoutId; // suppress unused warning

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <Toolbar
        onPreview={() => setShowPreview(true)}
        onSave={handleSave}
        saving={saving}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <div ref={wrapRef} className="flex flex-1 flex-col overflow-hidden">
          {mounted ? (
            <Canvas width={size.w} height={size.h - 192} stageRef={stageRef} />
          ) : (
            <div className="flex-1 bg-muted/40" />
          )}
          <LayersPanel />
        </div>
        <RightSidebar />
      </div>
      <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  );
}
