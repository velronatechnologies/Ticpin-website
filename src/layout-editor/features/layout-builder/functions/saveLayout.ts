import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

const Input = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  layoutJson: z.unknown(),
  thumbnail: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
});

export const saveLayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = {
      user_id: userId,
      name: data.name,
      layout_json: data.layoutJson as Json,
      thumbnail: data.thumbnail ?? null,
      is_public: data.isPublic ?? false,
    };
    if (data.id) {
      const { data: updated, error } = await supabase
        .from("layouts")
        .update(row)
        .eq("id", data.id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { id: updated.id as string };
    }
    const { data: inserted, error } = await supabase
      .from("layouts")
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id as string };
  });
