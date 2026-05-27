import { createClient } from "@supabase/supabase-js";

export interface SharedTask {
  owner_account_id: string | null;
  task_id: string;
  kind: string;
  source_id: string | null;
  title: string;
  status: string;
  due_at: string | null;
  reminder_at: string | null;
  completed_at: string | null;
  scheduled_date: string | null;
  priority: string | null;
  rule_summary: string | null;
  visibility: string | null;
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
  source?: string | null;
}

interface WebsiteTaskSubmissionInsert {
  senderName?: string | null;
  title: string;
  details?: string | null;
}

type SuggestedPriority = "auto" | "high" | "medium" | "low";

interface WebsiteTaskEditSuggestionInsert {
  senderName?: string | null;
  sharedTaskId: string;
  localTaskId: string;
  taskTitleSnapshot: string;
  changeTitle: boolean;
  suggestedTitle?: string | null;
  changeNotes: boolean;
  suggestedNotes?: string | null;
  changeDueAt: boolean;
  suggestedDueAt?: string | null;
  changeReminderAt: boolean;
  suggestedReminderAt?: string | null;
  changePriority: boolean;
  suggestedPriority?: SuggestedPriority | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const sharedTasksOwnerAccountId =
  import.meta.env.VITE_SHARED_TASKS_OWNER_ACCOUNT_ID?.trim() ||
  "608bf029-35f4-4107-a90d-5971e4591bdc";
const sharedTasksViewerAccountId =
  import.meta.env.VITE_SHARED_TASKS_VIEWER_ACCOUNT_ID?.trim() || sharedTasksOwnerAccountId;
const sharedTasksViewerPasswordHash =
  import.meta.env.VITE_SHARED_TASKS_VIEWER_PASSWORD_HASH?.trim();

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
export const sharedTasksAccountId = sharedTasksOwnerAccountId;

export const sharedTasksConfigError = !sharedTasksViewerPasswordHash
  ? "Shared tasks are not configured. Add VITE_SHARED_TASKS_VIEWER_PASSWORD_HASH so the website can load the live account feed."
  : null;

export const fetchSharedTasks = async () => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is unavailable.");
  }

  if (!sharedTasksViewerPasswordHash) {
    throw new Error(sharedTasksConfigError ?? "Shared tasks are unavailable.");
  }

  const { data, error } = await supabase.rpc("list_shared_tasks_for_viewer", {
    p_owner_account_id: sharedTasksOwnerAccountId,
    p_password_hash: sharedTasksViewerPasswordHash,
    p_viewer_account_id: sharedTasksViewerAccountId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SharedTask[];
};

export const subscribeToSharedTaskChanges = (onChange: (event: string, taskId?: string) => void) => {
  if (!supabase) {
    return () => undefined;
  }

  const channel = supabase
    .channel(`shared-tasks-${sharedTasksOwnerAccountId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shared_tasks",
        filter: `owner_account_id=eq.${sharedTasksOwnerAccountId}`,
      },
      (payload) => {
        const newTaskId =
          payload.new &&
          typeof payload.new === "object" &&
          "task_id" in payload.new &&
          typeof payload.new.task_id === "string"
            ? payload.new.task_id
            : undefined;
        const oldTaskId =
          payload.old &&
          typeof payload.old === "object" &&
          "task_id" in payload.old &&
          typeof payload.old.task_id === "string"
            ? payload.old.task_id
            : undefined;

        onChange(payload.eventType, newTaskId ?? oldTaskId);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
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
  source,
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
    source: source?.trim() || "website",
    task_id: taskId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const normalizeOptionalIsoDateTime = (value?: string | null) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Please use a valid date and time.");
  }

  return parsedDate.toISOString();
};

const normalizeSuggestedPriority = (value?: SuggestedPriority | null) => {
  if (!value) {
    return null;
  }

  if (value === "auto" || value === "high" || value === "medium" || value === "low") {
    return value;
  }

  throw new Error("Please choose a valid priority.");
};
 
export const createWebsiteTaskEditSuggestion = async ({
  senderName,
  sharedTaskId,
  localTaskId,
  taskTitleSnapshot,
  changeTitle,
  suggestedTitle,
  changeNotes,
  suggestedNotes,
  changeDueAt,
  suggestedDueAt,
  changeReminderAt,
  suggestedReminderAt,
  changePriority,
  suggestedPriority,
}: WebsiteTaskEditSuggestionInsert) => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is unavailable.");
  }

  const trimmedSharedTaskId = sharedTaskId.trim();
  const trimmedLocalTaskId = localTaskId.trim();
  const trimmedTaskTitleSnapshot = taskTitleSnapshot.trim();

  if (!trimmedSharedTaskId || !trimmedLocalTaskId || !trimmedTaskTitleSnapshot) {
    throw new Error("Choose a valid shared task before submitting an edit suggestion.");
  }

  if (!changeTitle && !changeNotes && !changeDueAt && !changeReminderAt && !changePriority) {
    throw new Error("Pick at least one field to change before submitting.");
  }

  const normalizedSuggestedTitle = suggestedTitle?.trim() || null;

  if (changeTitle && !normalizedSuggestedTitle) {
    throw new Error("A replacement title is required when changing the task title.");
  }

  const { error } = await supabase.from("task_edit_suggestions").insert({
    sender_name: senderName?.trim() || null,
    shared_task_id: trimmedSharedTaskId,
    local_task_id: trimmedLocalTaskId,
    task_title_snapshot: trimmedTaskTitleSnapshot,
    change_title: changeTitle,
    suggested_title: changeTitle ? normalizedSuggestedTitle : null,
    change_notes: changeNotes,
    suggested_notes: changeNotes ? suggestedNotes?.trim() || null : null,
    change_due_at: changeDueAt,
    suggested_due_at: changeDueAt ? normalizeOptionalIsoDateTime(suggestedDueAt) : null,
    change_reminder_at: changeReminderAt,
    suggested_reminder_at: changeReminderAt
      ? normalizeOptionalIsoDateTime(suggestedReminderAt)
      : null,
    change_priority: changePriority,
    suggested_priority: changePriority ? normalizeSuggestedPriority(suggestedPriority) : null,
    status: "pending",
    source: "website",
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const createWebsiteTaskSubmission = async ({
  senderName,
  title,
  details,
}: WebsiteTaskSubmissionInsert) => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is unavailable.");
  }

  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("Task title cannot be empty.");
  }

  const trimmedDetails = details?.trim() || null;

  const { error } = await supabase.from("task_submissions").insert({
    sender_name: senderName?.trim() || null,
    title: trimmedTitle,
    details: trimmedDetails,
    status: "pending",
    source: "website",
  });

  if (error) {
    throw new Error(error.message);
  }
};
