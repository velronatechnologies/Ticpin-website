import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ColorPickerField } from "./ColorPickerField";
import { PropertyField } from "./PropertyField";
import { useLayoutStore } from "../store/layoutStore";
import type {
  IconElement,
  ImageElement,
  LayoutElement,
  SectionElement,
  ShapeElement,
  StageElement,
  TextElement,
} from "../types/layout.types";

export function RightSidebar() {
  const elements = useLayoutStore((s) => s.layout.elements);
  const selectedIds = useLayoutStore((s) => s.selectedIds);
  const update = useLayoutStore((s) => s.updateElement);

  const selected = elements.filter((e) => selectedIds.includes(e.id));

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background">
      <div className="border-b border-border px-3 py-2 text-sm font-semibold">Properties</div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {selected.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Select a stage, box, facility, or shape to edit it.
            </p>
          )}
          {selected.length === 1 && <SingleProperties el={selected[0]} update={update} />}
          {selected.length > 1 && <MultiProperties els={selected} update={update} />}
        </div>
      </ScrollArea>
    </aside>
  );
}

function SingleProperties({
  el,
  update,
}: {
  el: LayoutElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <PropertyField label="Name">
        <Input
          value={el.name}
          onChange={(e) => {
            const value = e.target.value;
            if (el.type === "stage") {
              update(el.id, {
                name: value,
                label: value,
              } as Partial<LayoutElement>);
              return;
            }

            if (el.type === "icon") {
              update(el.id, {
                name: value,
                label: value,
              } as Partial<LayoutElement>);
              return;
            }

            update(el.id, { name: value });
          }}
          className="h-8"
        />
      </PropertyField>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Type</span>
        <Badge variant="secondary" className="text-[10px] uppercase">
          {el.type === "section" ? el.sectionType : el.type === "shape" ? el.shapeType : el.type}
        </Badge>
      </div>

      {el.type === "section" && <SectionProperties el={el} update={update} />}
      {el.type === "stage" && <StageProperties el={el} update={update} />}
      {el.type === "shape" && <ShapeProperties el={el} update={update} />}
      {el.type === "text" && <TextProperties el={el} update={update} />}
      {el.type === "image" && <ImageProperties el={el} update={update} />}
      {el.type === "icon" && <IconProperties el={el} update={update} />}

      <CommonBoxProperties el={el} update={update} />
    </div>
  );
}

function CommonBoxProperties({
  el,
  update,
}: {
  el: LayoutElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <>
      <PropertyField label={`Opacity (${el.opacity.toFixed(2)})`}>
        <Slider
          value={[el.opacity]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={([value]) => update(el.id, { opacity: value })}
        />
      </PropertyField>

      {el.type !== "text" && (
        <PropertyField label={`Border width (${el.borderWidth})`}>
          <Slider
            value={[el.borderWidth]}
            min={0}
            max={12}
            step={1}
            onValueChange={([value]) => update(el.id, { borderWidth: value })}
          />
        </PropertyField>
      )}

      <PropertyField label="Rotation">
        <div className="flex gap-2">
          <Input
            type="number"
            value={el.rotation}
            onChange={(e) => update(el.id, { rotation: Number(e.target.value) })}
            className="h-8"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update(el.id, { rotation: 0 })}
          >
            Reset
          </Button>
        </div>
      </PropertyField>

      <div className="grid grid-cols-2 gap-2">
        <PropertyField label="Width">
          <Input
            type="number"
            value={Math.round(el.width)}
            onChange={(e) => update(el.id, { width: Number(e.target.value) })}
            className="h-8"
          />
        </PropertyField>
        <PropertyField label="Height">
          <Input
            type="number"
            value={Math.round(el.height)}
            onChange={(e) => update(el.id, { height: Number(e.target.value) })}
            className="h-8"
          />
        </PropertyField>
        <PropertyField label="X">
          <Input
            type="number"
            value={Math.round(el.x)}
            onChange={(e) => update(el.id, { x: Number(e.target.value) })}
            className="h-8"
          />
        </PropertyField>
        <PropertyField label="Y">
          <Input
            type="number"
            value={Math.round(el.y)}
            onChange={(e) => update(el.id, { y: Number(e.target.value) })}
            className="h-8"
          />
        </PropertyField>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs">Visible</span>
        <Switch
          checked={el.visible}
          onCheckedChange={(value) => update(el.id, { visible: value })}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs">Locked</span>
        <Switch checked={el.locked} onCheckedChange={(value) => update(el.id, { locked: value })} />
      </div>
    </>
  );
}

function SectionProperties({
  el,
  update,
}: {
  el: SectionElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  const isClass = el.sectionType === "class";

  return (
    <>
      {isClass && (
        <PropertyField label="Seat mode">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={el.seatingType === "standing" ? "default" : "outline"}
              onClick={() =>
                update(el.id, {
                  seatingType: "standing",
                  icon: "standing",
                } as Partial<LayoutElement>)
              }
            >
              Standing
            </Button>
            <Button
              type="button"
              variant={el.seatingType === "sitting" ? "default" : "outline"}
              onClick={() =>
                update(el.id, {
                  seatingType: "sitting",
                  icon: "sitting",
                } as Partial<LayoutElement>)
              }
            >
              Sitting
            </Button>
          </div>
        </PropertyField>
      )}

      {isClass && (
        <div className="grid grid-cols-2 gap-2">
          <PropertyField label="Total seats">
            <Input
              type="number"
              min={0}
              value={el.capacity}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                update(el.id, {
                  capacity: value,
                  available: Math.min(el.available, value) || value,
                } as Partial<LayoutElement>);
              }}
              className="h-8"
            />
          </PropertyField>
          <PropertyField label="Available tickets">
            <Input
              type="number"
              min={0}
              value={el.available}
              onChange={(e) => {
                const value = Math.min(Number(e.target.value) || 0, el.capacity);
                update(el.id, { available: value } as Partial<LayoutElement>);
              }}
              className="h-8"
            />
          </PropertyField>
          <PropertyField label="Amount (₹)">
            <Input
              type="number"
              min={0}
              value={el.price}
              onChange={(e) =>
                update(el.id, { price: Number(e.target.value) || 0 } as Partial<LayoutElement>)
              }
              className="h-8"
            />
          </PropertyField>
          <PropertyField label="Sold tickets">
            <div className="flex h-8 items-center rounded border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
              {Math.max(0, el.capacity - el.available)}
            </div>
          </PropertyField>
        </div>
      )}

      <PropertyField label="Box background">
        <ColorPickerField value={el.color} onChange={(color) => update(el.id, { color })} />
      </PropertyField>
      <PropertyField label="Border color">
        <ColorPickerField
          value={el.borderColor}
          onChange={(color) => update(el.id, { borderColor: color })}
        />
      </PropertyField>
      <PropertyField label="Text color">
        <ColorPickerField
          value={el.textColor}
          onChange={(color) => update(el.id, { textColor: color } as Partial<LayoutElement>)}
        />
      </PropertyField>
      <PropertyField label="Icon color">
        <ColorPickerField
          value={el.iconColor}
          onChange={(color) => update(el.id, { iconColor: color } as Partial<LayoutElement>)}
        />
      </PropertyField>
      <PropertyField label="Notes">
        <Textarea
          rows={2}
          value={el.description}
          onChange={(e) => update(el.id, { description: e.target.value } as Partial<LayoutElement>)}
        />
      </PropertyField>
      <PropertyField label={`Name size (${el.fontSize ?? 'auto'})`}>
        <div className="flex items-center gap-2">
          <Slider value={[el.fontSize ?? 30]} min={8} max={72} step={1} className="flex-1"
            onValueChange={([v]) => update(el.id, { fontSize: v } as Partial<LayoutElement>)} />
          <button type="button" className="text-xs text-muted-foreground underline whitespace-nowrap"
            onClick={() => update(el.id, { fontSize: undefined } as Partial<LayoutElement>)}>auto</button>
        </div>
      </PropertyField>
      {isClass && el.seatingType === "sitting" && (
        <PropertyField label={`Icon size (${el.iconScale ?? 'auto'})`}>
          <div className="flex items-center gap-2">
            <Slider value={[el.iconScale ?? 22]} min={10} max={60} step={1} className="flex-1"
              onValueChange={([v]) => update(el.id, { iconScale: v } as Partial<LayoutElement>)} />
            <button type="button" className="text-xs text-muted-foreground underline whitespace-nowrap"
              onClick={() => update(el.id, { iconScale: undefined } as Partial<LayoutElement>)}>auto</button>
          </div>
        </PropertyField>
      )}
      {isClass && (
        <PropertyField label={`Price size (${el.priceSize ?? 'auto'})`}>
          <div className="flex items-center gap-2">
            <Slider value={[el.priceSize ?? 20]} min={8} max={40} step={1} className="flex-1"
              onValueChange={([v]) => update(el.id, { priceSize: v } as Partial<LayoutElement>)} />
            <button type="button" className="text-xs text-muted-foreground underline whitespace-nowrap"
              onClick={() => update(el.id, { priceSize: undefined } as Partial<LayoutElement>)}>auto</button>
          </div>
        </PropertyField>
      )}
    </>
  );
}

function StageProperties({
  el,
  update,
}: {
  el: StageElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <>
      <PropertyField label="Stage label">
        <Input
          value={el.label}
          onChange={(e) =>
            update(el.id, {
              label: e.target.value,
              name: e.target.value,
            } as Partial<LayoutElement>)
          }
          className="h-8"
        />
      </PropertyField>
      <PropertyField label="Stage background">
        <ColorPickerField value={el.color} onChange={(color) => update(el.id, { color })} />
      </PropertyField>
      <PropertyField label="Border color">
        <ColorPickerField
          value={el.borderColor}
          onChange={(color) => update(el.id, { borderColor: color })}
        />
      </PropertyField>
      <PropertyField label="Text color">
        <ColorPickerField
          value={el.textColor}
          onChange={(color) => update(el.id, { textColor: color } as Partial<LayoutElement>)}
        />
      </PropertyField>
      <PropertyField label={`Font size (${el.fontSize ?? 'auto'})`}>
        <div className="flex items-center gap-2">
          <Slider
            value={[el.fontSize ?? 22]}
            min={8}
            max={72}
            step={1}
            className="flex-1"
            onValueChange={([v]) => update(el.id, { fontSize: v } as Partial<LayoutElement>)}
          />
          <button
            type="button"
            className="text-xs text-muted-foreground underline whitespace-nowrap"
            onClick={() => update(el.id, { fontSize: undefined } as Partial<LayoutElement>)}
          >
            auto
          </button>
        </div>
      </PropertyField>
    </>
  );
}

function ShapeProperties({
  el,
  update,
}: {
  el: ShapeElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <>
      <PropertyField label="Fill color">
        <ColorPickerField value={el.color} onChange={(color) => update(el.id, { color })} />
      </PropertyField>
      <PropertyField label="Border color">
        <ColorPickerField
          value={el.borderColor}
          onChange={(color) => update(el.id, { borderColor: color })}
        />
      </PropertyField>
      <PropertyField label="Quick size">
        <div className="grid grid-cols-3 gap-2">
          {shapeSizePresets(el).map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              onClick={() => update(el.id, { width: preset.width, height: preset.height })}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </PropertyField>
      {el.shapeType === "polygon" && (
        <PropertyField label="Sides">
          <Input
            type="number"
            min={3}
            max={12}
            value={el.sides}
            onChange={(e) =>
              update(el.id, {
                sides: Math.max(3, Number(e.target.value) || 3),
              } as Partial<LayoutElement>)
            }
            className="h-8"
          />
        </PropertyField>
      )}
    </>
  );
}

function TextProperties({
  el,
  update,
}: {
  el: TextElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <>
      <PropertyField label="Text">
        <Textarea
          rows={2}
          value={el.text}
          onChange={(e) => update(el.id, { text: e.target.value } as Partial<LayoutElement>)}
        />
      </PropertyField>
      <div className="grid grid-cols-2 gap-2">
        <PropertyField label="Font size">
          <Input
            type="number"
            value={el.fontSize}
            onChange={(e) =>
              update(el.id, { fontSize: Number(e.target.value) } as Partial<LayoutElement>)
            }
            className="h-8"
          />
        </PropertyField>
        <PropertyField label="Weight">
          <select
            className="h-8 w-full rounded border border-input bg-background px-2 text-sm"
            value={el.fontWeight}
            onChange={(e) =>
              update(el.id, {
                fontWeight: e.target.value as "normal" | "bold",
              } as Partial<LayoutElement>)
            }
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </PropertyField>
      </div>
      <PropertyField label="Text color">
        <ColorPickerField
          value={el.textColor}
          onChange={(color) => update(el.id, { textColor: color } as Partial<LayoutElement>)}
        />
      </PropertyField>
    </>
  );
}

function ImageProperties({
  el,
  update,
}: {
  el: ImageElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <>
      <PropertyField label="Image URL">
        <Input
          value={el.src}
          onChange={(e) => update(el.id, { src: e.target.value } as Partial<LayoutElement>)}
          className="h-8"
        />
      </PropertyField>
      <PropertyField label="Background">
        <ColorPickerField value={el.color} onChange={(color) => update(el.id, { color })} />
      </PropertyField>
      <PropertyField label="Border color">
        <ColorPickerField
          value={el.borderColor}
          onChange={(color) => update(el.id, { borderColor: color })}
        />
      </PropertyField>
    </>
  );
}

function IconProperties({
  el,
  update,
}: {
  el: IconElement;
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  return (
    <>
      <PropertyField label="Label">
        <Input
          value={el.label}
          onChange={(e) => update(el.id, { label: e.target.value } as Partial<LayoutElement>)}
          className="h-8"
        />
      </PropertyField>
      <PropertyField label="Background">
        <ColorPickerField value={el.color} onChange={(color) => update(el.id, { color })} />
      </PropertyField>
      <PropertyField label="Border color">
        <ColorPickerField
          value={el.borderColor}
          onChange={(color) => update(el.id, { borderColor: color })}
        />
      </PropertyField>
      <PropertyField label="Icon color">
        <ColorPickerField
          value={el.iconColor}
          onChange={(color) => update(el.id, { iconColor: color } as Partial<LayoutElement>)}
        />
      </PropertyField>
    </>
  );
}

function MultiProperties({
  els,
  update,
}: {
  els: LayoutElement[];
  update: (id: string, patch: Partial<LayoutElement>) => void;
}) {
  const first = els[0];
  const canUseSectionColors = els.every((el) => el.type === "section");

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{els.length} elements selected</p>
      <PropertyField label="Background color">
        <ColorPickerField
          value={first.color}
          onChange={(color) => els.forEach((el) => update(el.id, { color }))}
        />
      </PropertyField>
      <PropertyField label="Border color">
        <ColorPickerField
          value={first.borderColor}
          onChange={(color) => els.forEach((el) => update(el.id, { borderColor: color }))}
        />
      </PropertyField>
      {canUseSectionColors && (
        <PropertyField label="Text color">
          <ColorPickerField
            value={(first as SectionElement).textColor}
            onChange={(color) =>
              els.forEach((el) => update(el.id, { textColor: color } as Partial<LayoutElement>))
            }
          />
        </PropertyField>
      )}
      <PropertyField label={`Opacity (${first.opacity.toFixed(2)})`}>
        <Slider
          value={[first.opacity]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={([value]) => els.forEach((el) => update(el.id, { opacity: value }))}
        />
      </PropertyField>
    </div>
  );
}

function shapeSizePresets(el: ShapeElement) {
  if (el.shapeType === "line") {
    return [
      { label: "S", width: 120, height: 4 },
      { label: "M", width: 180, height: 6 },
      { label: "L", width: 260, height: 8 },
    ];
  }

  if (el.shapeType === "rect") {
    return [
      { label: "S", width: 100, height: 60 },
      { label: "M", width: 140, height: 90 },
      { label: "L", width: 220, height: 130 },
    ];
  }

  if (el.shapeType === "semicircle") {
    return [
      { label: "S", width: 80, height: 40 },
      { label: "M", width: 120, height: 60 },
      { label: "L", width: 180, height: 90 },
    ];
  }

  return [
    { label: "S", width: 70, height: 70 },
    { label: "M", width: 100, height: 100 },
    { label: "L", width: 150, height: 150 },
  ];
}
