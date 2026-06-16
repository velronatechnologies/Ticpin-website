import type { ReactNode } from "react";
import { Circle, Minus, Square, Triangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { iconMap, sectionIcons } from "../lib/iconMap";
import { sectionColors } from "../lib/colorPresets";
import type { SectionType, ShapeType } from "../types/layout.types";
import { SectionCard } from "./SectionCard";

const componentItems: SectionType[] = ["class"];
const facilityItems: SectionType[] = ["entrygate", "exitgate"];
const shapeItems: Array<{
  shapeType: ShapeType;
  label: string;
  color: string;
  preview: ReactNode;
}> = [
  {
    shapeType: "circle",
    label: "Circle",
    color: "#ffffff",
    preview: <Circle className="h-4 w-4" />,
  },
  {
    shapeType: "semicircle",
    label: "Semi Circle",
    color: "#ffffff",
    preview: (
      <span className="inline-block h-3 w-5 rounded-t-full border-2 border-current border-b-0" />
    ),
  },
  {
    shapeType: "square",
    label: "Square",
    color: "#ffffff",
    preview: <Square className="h-4 w-4" />,
  },
  {
    shapeType: "rect",
    label: "Rectangle",
    color: "#ffffff",
    preview: <span className="inline-block h-3 w-5 rounded-sm border-2 border-current" />,
  },
  {
    shapeType: "triangle",
    label: "Triangle",
    color: "#ffffff",
    preview: <Triangle className="h-4 w-4" />,
  },
  {
    shapeType: "line",
    label: "Line",
    color: "#ffffff",
    preview: <Minus className="h-4 w-4" />,
  },
];

export function LeftSidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-3 py-2">
        <div className="text-sm font-semibold">Components</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Click a card, then click the canvas to place it. Drag-and-drop also works.
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Components
            </div>
            <div className="space-y-2">
              <SectionCard
                label="Stage"
                Icon={iconMap.Mic2}
                color="#ffffff"
                iconClassName="text-black"
                item={{ kind: "stage" }}
              />
              {componentItems.map((sectionType) => (
                <SectionCard
                  key={sectionType}
                  label={sectionColors[sectionType].label}
                  Icon={iconMap[sectionIcons[sectionType]]}
                  color={sectionColors[sectionType].fill}
                  iconClassName="text-black"
                  item={{ kind: "section", sectionType }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Facilities
            </div>
            <div className="space-y-2">
              {facilityItems.map((sectionType) => (
                <SectionCard
                  key={sectionType}
                  label={sectionColors[sectionType].label}
                  Icon={iconMap[sectionIcons[sectionType]]}
                  color={sectionColors[sectionType].fill}
                  iconClassName="text-black"
                  item={{ kind: "section", sectionType }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Shapes
            </div>
            <div className="space-y-2">
              {shapeItems.map((shape) => (
                <SectionCard
                  key={shape.shapeType}
                  label={shape.label}
                  color={shape.color}
                  iconClassName="text-black"
                  preview={shape.preview}
                  item={{ kind: "shape", shapeType: shape.shapeType }}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
