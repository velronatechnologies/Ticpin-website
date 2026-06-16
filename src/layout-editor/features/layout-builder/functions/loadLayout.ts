import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const loadLayout = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("layouts")
      .select("id, name, layout_json, is_public, user_id, thumbnail")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Layout not found");
    return {
      id: row.id as string,
      name: row.name as string,
      layoutJson: row.layout_json,
      isPublic: row.is_public as boolean,
      userId: row.user_id as string,
      thumbnail: row.thumbnail as string | null,
    };
  });
