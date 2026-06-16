import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tailwindColorGroups } from "../lib/colorPresets";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ColorPickerField({ value, onChange }: Props) {
  const safeValue = value || "#ffffff";

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-8 w-8 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: safeValue }}
            aria-label="Pick color"
          />
        </PopoverTrigger>
        <PopoverContent className="max-h-[420px] w-[320px] overflow-y-auto">
          <div className="space-y-3">
            {tailwindColorGroups.map((group) => (
              <div key={group.name} className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.name}
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {group.colors.map((color) => {
                    const selected = safeValue.toLowerCase() === color.toLowerCase();
                    const light = isLightColor(color);
                    return (
                      <button
                        key={`${group.name}-${color}`}
                        type="button"
                        onClick={() => onChange(color)}
                        className="flex h-8 w-8 items-center justify-center rounded border border-border"
                        style={{ backgroundColor: color }}
                        aria-label={`Use color ${color}`}
                        title={`${group.name} ${color}`}
                      >
                        {selected && (
                          <Check
                            className="h-4 w-4"
                            style={{ color: light ? "#111827" : "#ffffff" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Input
            className="mt-3 h-8"
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
          />
        </PopoverContent>
      </Popover>
      <Input value={safeValue} onChange={(e) => onChange(e.target.value)} className="h-8" />
    </div>
  );
}

function isLightColor(color: string) {
  const normalized = color.replace("#", "");
  if (normalized.length !== 6) {
    return false;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return brightness > 160;
}
