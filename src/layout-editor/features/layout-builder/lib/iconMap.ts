import { DoorClosed, DoorOpen, Mic2, Users, type LucideIcon } from "lucide-react";
import type { SectionType } from "../types/layout.types";

export const iconMap: Record<string, LucideIcon> = {
  DoorClosed,
  DoorOpen,
  Mic2,
  Users,
};

export const iconNames = Object.keys(iconMap);

export const sectionIcons: Record<SectionType, string> = {
  class: "Users",
  entrygate: "DoorOpen",
  exitgate: "DoorClosed",
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Users;
}
