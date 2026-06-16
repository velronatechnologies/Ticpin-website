import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LayoutPanelLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Event Layout Builder" },
      { name: "description", content: "Design event venue layouts visually — drag sections, stages, and facilities onto a canvas." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/40 px-4">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LayoutPanelLeft className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Event Layout Builder</h1>
        <p className="mt-3 text-muted-foreground">
          Design venue layouts visually. Drag sections, stages, and facilities onto an infinite canvas — share previews with your customers.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/layout-builder">Open builder</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
