import { useEffect, useRef } from "react";
import { Transformer as KonvaTransformer } from "react-konva";
import type Konva from "konva";

interface Props {
  selectedIds: string[];
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function Transformer({ selectedIds, stageRef }: Props) {
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const tr = trRef.current;
    if (!stage || !tr) {
      return;
    }

    // Use a callback-based lookup instead of CSS selector to avoid
    // CSS.escape mangling UUIDs that start with a digit (e.g. "5abc..." → "\35 abc...")
    // which Konva cannot match back to the real node ID.
    const nodes = selectedIds
      .map((id) =>
        stage.findOne((node: Konva.Node) => node.id() === id && node.getType() === "Group"),
      )
      .filter((node): node is Konva.Node => !!node);

    tr.nodes(nodes);
    tr.forceUpdate();
    tr.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  return (
    <KonvaTransformer
      ref={trRef}
      rotateEnabled
      keepRatio={false}
      enabledAnchors={[
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ]}
      borderStroke="#3b82f6"
      anchorStroke="#3b82f6"
      anchorFill="#ffffff"
      anchorSize={10}
      anchorCornerRadius={3}
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent collapsing to zero size
        if (Math.abs(newBox.width) < 4 || Math.abs(newBox.height) < 4) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
