import { createFileRoute } from "@tanstack/react-router";
import { LayoutBuilder } from "@/features/layout-builder/components/LayoutBuilder";

export const Route = createFileRoute("/_authenticated/layout-builder")({
  head: () => ({
    meta: [
      { title: "Event Layout Builder" },
      { name: "description", content: "Design event venue layouts with sections, seating, and facilities." },
    ],
  }),
  component: () => <LayoutBuilder />,
});
