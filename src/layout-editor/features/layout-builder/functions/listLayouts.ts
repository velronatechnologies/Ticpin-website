import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listLayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("layouts")
      .select("id, name, thumbnail, updated_at, is_public")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return {
      layouts: (data ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        thumbnail: r.thumbnail as string | null,
        updatedAt: r.updated_at as string,
        isPublic: r.is_public as boolean,
      })),
    };
  });
