import { createClient } from "@supabase/supabase-js";

export interface SharedTask {
  task_id: string;
  kind: string;
  source_id: string;
  title: string;
  status: string;
  due_at: string | null;
  reminder_at: string | null;
  scheduled_date: string | null;
  priority: string | null;
  rule_summary: string | null;
  updated_at: string;
}

export interface AppPresence {
  device_id: string;
  device_name: string | null;
  last_seen_at: string;
  updated_at: string;
}

interface WebsiteReminderInsert {
  senderName?: string | null;
  message: string;
  taskId?: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigError =
  !supabaseUrl || !supabasePublishableKey
    ? "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before using this page."
    : null;

const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export const fetchSharedTasks = async () => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is unavailable.");
  }

  const { data, error } = await supabase
    .from("shared_tasks")
    .select(
      "task_id, kind, source_id, title, status, due_at, reminder_at, scheduled_date, priority, rule_summary, updated_at"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SharedTask[];
};

export const fetchAppPresence = async (deviceId: string) => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is unavailable.");
  }

  const { data, error } = await supabase
    .from("app_presence")
    .select("device_id, device_name, last_seen_at, updated_at")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as AppPresence | null;
};

export const createWebsiteReminder = async ({
  senderName,
  message,
  taskId,
}: WebsiteReminderInsert) => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is unavailable.");
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Message cannot be empty.");
  }

  const { error } = await supabase.from("tasks").insert({
    sender_name: senderName?.trim() || null,
    message: trimmedMessage,
    is_read: false,
    source: "website",
    task_id: taskId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
};
