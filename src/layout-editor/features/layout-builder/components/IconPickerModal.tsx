import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { iconMap, iconNames } from "../lib/iconMap";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
}

export function IconPickerModal({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Pick an icon</DialogTitle></DialogHeader>
        <div className="grid max-h-80 grid-cols-6 gap-2 overflow-auto">
          {iconNames.map((n) => {
            const Icon = iconMap[n];
            return (
              <button
                key={n}
                type="button"
                onClick={() => { onSelect(n); onClose(); }}
                className="flex aspect-square items-center justify-center rounded-md border border-border hover:bg-accent"
                title={n}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
