import { createClient } from "@supabase/supabase-js";

export interface AllyDrawingState {
  canvasFillColor: string;
  canvasSize: {
    height: number;
    width: number;
  };
  paintActions: unknown[];
}

export const allyDrawingPageKeys = ["main", "projects", "research", "cv", "about"] as const;
export type AllyDrawingPageKey = (typeof allyDrawingPageKeys)[number];

interface AllyDrawingRow {
  canvas_fill_color: string | null;
  canvas_size: AllyDrawingState["canvasSize"] | null;
  page_key: string;
  paint_actions: unknown[] | null;
}

const allySupabaseUrl =
  import.meta.env.VITE_ALLY_SUPABASE_URL?.trim() || "https://xotmiksbpqkqaxphncjx.supabase.co";
const allySupabasePublishableKey =
  import.meta.env.VITE_ALLY_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "sb_publishable_cFmj9li8I670pNkImy6k9g_1d3OYubb";

const allySupabase = createClient(allySupabaseUrl, allySupabasePublishableKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const normalizeDrawingState = (row: AllyDrawingRow, fallback: AllyDrawingState): AllyDrawingState => ({
  canvasFillColor: row.canvas_fill_color ?? fallback.canvasFillColor,
  canvasSize:
    row.canvas_size &&
    typeof row.canvas_size.width === "number" &&
    typeof row.canvas_size.height === "number"
      ? row.canvas_size
      : fallback.canvasSize,
  paintActions: Array.isArray(row.paint_actions) ? row.paint_actions : fallback.paintActions,
});

export const isAllyDrawingPageKey = (pageKey: string): pageKey is AllyDrawingPageKey =>
  allyDrawingPageKeys.includes(pageKey as AllyDrawingPageKey);

export const fetchAllyDrawing = async (pageKey: AllyDrawingPageKey, fallback: AllyDrawingState) => {
  const { data, error } = await allySupabase
    .from("ally_drawings")
    .select("page_key, canvas_fill_color, canvas_size, paint_actions")
    .eq("page_key", pageKey)
    .maybeSingle<AllyDrawingRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeDrawingState(data, fallback) : fallback;
};

export const saveAllyDrawing = async (pageKey: AllyDrawingPageKey, state: AllyDrawingState) => {
  const { error } = await allySupabase.from("ally_drawings").upsert(
    {
      canvas_fill_color: state.canvasFillColor,
      canvas_size: state.canvasSize,
      page_key: pageKey,
      paint_actions: state.paintActions,
      updated_by: "ally-website",
    },
    { onConflict: "page_key" },
  );

  if (error) {
    throw new Error(error.message);
  }
};

export const subscribeToAllyDrawing = (
  pageKey: AllyDrawingPageKey,
  onChange: (changedPageKey: AllyDrawingPageKey) => void,
) => {
  const channel = allySupabase
    .channel(`ally-drawing-${pageKey}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        filter: `page_key=eq.${pageKey}`,
        schema: "public",
        table: "ally_drawings",
      },
      (payload) => {
        const changedPageKey = String(
          ((payload.new as Partial<AllyDrawingRow> | null)?.page_key ??
            (payload.old as Partial<AllyDrawingRow> | null)?.page_key ??
            ""),
        );

        if (changedPageKey === pageKey && isAllyDrawingPageKey(changedPageKey)) {
          onChange(changedPageKey);
        }
      },
    )
    .subscribe();

  return () => {
    void allySupabase.removeChannel(channel);
  };
};
