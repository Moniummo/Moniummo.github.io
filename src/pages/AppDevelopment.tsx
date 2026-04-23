import { motion } from "framer-motion";
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
import { type FormEvent, type KeyboardEvent, useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createWebsiteReminder,
  createWebsiteTaskEditSuggestion,
  createWebsiteTaskSubmission,
  fetchAppPresence,
  fetchSharedTasks,
  isSupabaseConfigured,
  supabaseConfigError,
  type AppPresence,
  type SharedTask,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

const generalReminderValue = "__general__";
const editableTaskPlaceholderValue = "__no_editable_task__";
const priorityOptions = [
  { value: "auto", label: "Auto" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const appPresenceDeviceId =
  import.meta.env.VITE_SUPABASE_PRESENCE_DEVICE_ID?.trim() || "MonTop-Duo";
const appPresenceDeviceName =
  import.meta.env.VITE_SUPABASE_PRESENCE_DEVICE_NAME?.trim() || "My Laptop";
const emergencyPopupPasswordHash =
  import.meta.env.VITE_EMERGENCY_POPUP_PASSWORD_HASH?.trim().toLowerCase() || "";

const dataRefreshIntervalMs = 15000;
const onlineThresholdMs = 90000;
const submitCooldownMs = 2500;

interface FormFeedback {
  title: string;
  description: string;
  variant: "default" | "destructive";
}

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return "Not set";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

const formatElapsedTime = (value: string | null) => {
  if (!value) {
    return "No heartbeat yet";
  }

  const elapsedMs = Date.now() - new Date(value).getTime();

  if (Number.isNaN(elapsedMs) || elapsedMs < 0) {
    return "Just now";
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `${elapsedHours}h ago`;
};

const formatTaskKind = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const isPendingTask = (task: SharedTask) => {
  const normalizedStatus = task.status.toLowerCase();

  return ![
    "done",
    "complete",
    "completed",
    "cancelled",
    "canceled",
    "archived",
  ].some((keyword) => normalizedStatus.includes(keyword));
};

const isEditableSharedTask = (task: SharedTask) => task.kind.toLowerCase() === "task";

const getStatusTone = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("done") || normalizedStatus.includes("complete")) {
    return "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
  }

  if (normalizedStatus.includes("overdue") || normalizedStatus.includes("late")) {
    return "border-rose-500/25 bg-rose-500/12 text-rose-700 dark:text-rose-300";
  }

  if (normalizedStatus.includes("progress") || normalizedStatus.includes("active")) {
    return "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300";
  }

  return "border-white/24 bg-white/34 text-foreground/90 dark:border-white/12 dark:bg-white/[0.08]";
};

const createFeedback = (
  title: string,
  description: string,
  variant: "default" | "destructive",
): FormFeedback => ({
  title,
  description,
  variant,
});

const createToggleCardClassName = (isEnabled: boolean) =>
  cn(
    "rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors dark:border-white/10 dark:bg-white/[0.03]",
    isEnabled
      ? "border-primary/30 bg-primary/[0.08]"
      : "border-white/22 bg-white/24",
  );

const hashToSha256Hex = async (value: string) => {
  if (!window.crypto?.subtle) {
    throw new Error("This browser does not support secure password hashing.");
  }

  const encodedValue = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encodedValue);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const AppDevelopment = () => {
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [presence, setPresence] = useState<AppPresence | null>(null);
  const [isLoadingPresence, setIsLoadingPresence] = useState(true);
  const [presenceError, setPresenceError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(generalReminderValue);
  const [isEmergencyReminder, setIsEmergencyReminder] = useState(false);
  const [emergencyPassword, setEmergencyPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLockUntil, setSubmitLockUntil] = useState<number | null>(null);
  const [formFeedback, setFormFeedback] = useState<FormFeedback | null>(null);

  const [editSuggestionSenderName, setEditSuggestionSenderName] = useState("");
  const [editSuggestionTaskId, setEditSuggestionTaskId] = useState("");
  const [changeTitle, setChangeTitle] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState("");
  const [changeNotes, setChangeNotes] = useState(false);
  const [suggestedNotes, setSuggestedNotes] = useState("");
  const [changeDueAt, setChangeDueAt] = useState(false);
  const [suggestedDueAt, setSuggestedDueAt] = useState("");
  const [changeReminderAt, setChangeReminderAt] = useState(false);
  const [suggestedReminderAt, setSuggestedReminderAt] = useState("");
  const [changePriority, setChangePriority] = useState(false);
  const [suggestedPriority, setSuggestedPriority] = useState<(typeof priorityOptions)[number]["value"]>("auto");
  const [isSubmittingEditSuggestion, setIsSubmittingEditSuggestion] = useState(false);
  const [editSuggestionSubmitLockUntil, setEditSuggestionSubmitLockUntil] = useState<number | null>(null);
  const [editSuggestionFeedback, setEditSuggestionFeedback] = useState<FormFeedback | null>(null);

  const [suggestionSenderName, setSuggestionSenderName] = useState("");
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionDetails, setSuggestionDetails] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSubmitLockUntil, setSuggestionSubmitLockUntil] = useState<number | null>(null);
  const [suggestionFeedback, setSuggestionFeedback] = useState<FormFeedback | null>(null);

  useEffect(() => {
    if (!submitLockUntil) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSubmitLockUntil(null);
    }, Math.max(0, submitLockUntil - Date.now()));

    return () => {
      window.clearTimeout(timeout);
    };
  }, [submitLockUntil]);

  useEffect(() => {
    if (!editSuggestionSubmitLockUntil) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setEditSuggestionSubmitLockUntil(null);
    }, Math.max(0, editSuggestionSubmitLockUntil - Date.now()));

    return () => {
      window.clearTimeout(timeout);
    };
  }, [editSuggestionSubmitLockUntil]);

  useEffect(() => {
    if (!suggestionSubmitLockUntil) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuggestionSubmitLockUntil(null);
    }, Math.max(0, suggestionSubmitLockUntil - Date.now()));

    return () => {
      window.clearTimeout(timeout);
    };
  }, [suggestionSubmitLockUntil]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoadingTasks(false);
      setTasksError(supabaseConfigError);
      setIsLoadingPresence(false);
      setPresenceError(supabaseConfigError);
      return;
    }

    let isActive = true;

    const loadPageData = async (showSpinner: boolean) => {
      if (showSpinner) {
        setIsLoadingTasks(true);
        setIsLoadingPresence(true);
      }

      const [tasksResult, presenceResult] = await Promise.allSettled([
        fetchSharedTasks(),
        fetchAppPresence(appPresenceDeviceId),
      ]);

      if (!isActive) {
        return;
      }

      if (tasksResult.status === "fulfilled") {
        setTasks(tasksResult.value);
        setTasksError(null);
      } else {
        setTasksError(
          tasksResult.reason instanceof Error
            ? tasksResult.reason.message
            : "Unable to load shared tasks.",
        );
      }

      if (presenceResult.status === "fulfilled") {
        setPresence(presenceResult.value);
        setPresenceError(null);
      } else {
        setPresenceError(
          presenceResult.reason instanceof Error
            ? presenceResult.reason.message
            : "Unable to load laptop presence.",
        );
      }

      if (tasksResult.status === "fulfilled" || presenceResult.status === "fulfilled") {
        setLastSyncedAt(new Date().toISOString());
      }

      if (showSpinner) {
        setIsLoadingTasks(false);
        setIsLoadingPresence(false);
      }
    };

    void loadPageData(true);

    const refreshInterval = window.setInterval(() => {
      void loadPageData(false);
    }, dataRefreshIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const nextEditableTasks = tasks.filter((task) => isPendingTask(task) && isEditableSharedTask(task));

    if (nextEditableTasks.length === 0) {
      setEditSuggestionTaskId("");
      return;
    }

    setEditSuggestionTaskId((currentValue) =>
      nextEditableTasks.some((task) => task.task_id === currentValue)
        ? currentValue
        : nextEditableTasks[0].task_id,
    );
  }, [tasks]);

  const visibleTasks = tasks.filter(isPendingTask);
  const editableTasks = visibleTasks.filter(isEditableSharedTask);
  const selectedEditableTask =
    editableTasks.find((task) => task.task_id === editSuggestionTaskId) ?? null;
  const isLaptopOnline =
    Boolean(presence) &&
    Date.now() - new Date(presence.last_seen_at).getTime() <= onlineThresholdMs;
  const laptopName = presence?.device_name?.trim() || appPresenceDeviceName;
  const laptopStatusLabel = isLaptopOnline
    ? "Online / laptop connected"
    : "Offline / messages will queue until the laptop reconnects";
  const isSubmitLocked = Boolean(submitLockUntil && submitLockUntil > Date.now());
  const isEditSuggestionSubmitLocked = Boolean(
    editSuggestionSubmitLockUntil && editSuggestionSubmitLockUntil > Date.now(),
  );
  const isSuggestionSubmitLocked = Boolean(
    suggestionSubmitLockUntil && suggestionSubmitLockUntil > Date.now(),
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setFormFeedback(
        createFeedback(
          "Supabase not configured",
          supabaseConfigError ??
            "Add the Vite Supabase environment variables before using this form.",
          "destructive",
        ),
      );
      return;
    }

    if (submitLockUntil && submitLockUntil > Date.now()) {
      setFormFeedback(
        createFeedback(
          "Please wait a moment",
          "Rapid repeat submits are blocked for a couple of seconds.",
          "destructive",
        ),
      );
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setFormFeedback(
        createFeedback(
          "Message required",
          "Write a short popup message before sending it.",
          "destructive",
        ),
      );
      return;
    }

    if (isEmergencyReminder && !emergencyPopupPasswordHash) {
      setFormFeedback(
        createFeedback(
          "Emergency password missing",
          "Set VITE_EMERGENCY_POPUP_PASSWORD_HASH before using emergency reminder mode.",
          "destructive",
        ),
      );
      return;
    }

    if (isEmergencyReminder && !emergencyPassword.trim()) {
      setFormFeedback(
        createFeedback(
          "Password required",
          "Enter the emergency password before sending a full-screen popup.",
          "destructive",
        ),
      );
      return;
    }

    setIsSubmitting(true);
    setFormFeedback(null);

    try {
      if (isEmergencyReminder) {
        const hashedPassword = await hashToSha256Hex(emergencyPassword.trim());

        if (hashedPassword !== emergencyPopupPasswordHash) {
          setEmergencyPassword("");
          setFormFeedback(
            createFeedback(
              "Incorrect password",
              "The emergency popup password was incorrect, so nothing was sent.",
              "destructive",
            ),
          );
          return;
        }
      }

      await createWebsiteReminder({
        senderName,
        message: trimmedMessage,
        taskId:
          isEmergencyReminder || selectedTaskId === generalReminderValue
            ? null
            : selectedTaskId,
        source: isEmergencyReminder ? "website-emergency" : undefined,
      });

      setSenderName("");
      setMessage("");
      setSelectedTaskId(generalReminderValue);
      setIsEmergencyReminder(false);
      setEmergencyPassword("");
      setSubmitLockUntil(Date.now() + submitCooldownMs);
      setFormFeedback(
        createFeedback(
          isEmergencyReminder ? "Emergency popup sent" : "Reminder sent",
          isEmergencyReminder
            ? isLaptopOnline
              ? "A full-screen emergency popup was sent to the desktop app."
              : "The laptop is offline right now. The emergency popup was queued and should appear full-screen when it reconnects."
            : isLaptopOnline
              ? selectedTaskId === generalReminderValue
                ? "The popup message was added as a general reminder."
                : "The popup message was linked to the selected task."
              : selectedTaskId === generalReminderValue
                ? "The laptop is offline right now. Your general reminder was queued and should deliver when it reconnects."
                : "The laptop is offline right now. Your task-specific reminder was queued and should deliver when it reconnects.",
          "default",
        ),
      );
    } catch (error) {
      setFormFeedback(
        createFeedback(
          "Send failed",
          error instanceof Error ? error.message : "Unable to send the popup message.",
          "destructive",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleTaskEditSuggestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setEditSuggestionFeedback(
        createFeedback(
          "Supabase not configured",
          supabaseConfigError ??
            "Add the Vite Supabase environment variables before using this form.",
          "destructive",
        ),
      );
      return;
    }

    if (editSuggestionSubmitLockUntil && editSuggestionSubmitLockUntil > Date.now()) {
      setEditSuggestionFeedback(
        createFeedback(
          "Please wait a moment",
          "Rapid repeat submits are blocked for a couple of seconds.",
          "destructive",
        ),
      );
      return;
    }

    if (!selectedEditableTask) {
      setEditSuggestionFeedback(
        createFeedback(
          "No editable task selected",
          "Choose one of the live tasks before suggesting edits.",
          "destructive",
        ),
      );
      return;
    }

    if (!changeTitle && !changeNotes && !changeDueAt && !changeReminderAt && !changePriority) {
      setEditSuggestionFeedback(
        createFeedback(
          "Choose at least one change",
          "Turn on at least one field before submitting a task edit suggestion.",
          "destructive",
        ),
      );
      return;
    }

    if (changeTitle && !suggestedTitle.trim()) {
      setEditSuggestionFeedback(
        createFeedback(
          "Replacement title required",
          "When changing the title, enter the new title you want to suggest.",
          "destructive",
        ),
      );
      return;
    }

    setIsSubmittingEditSuggestion(true);
    setEditSuggestionFeedback(null);

    try {
      await createWebsiteTaskEditSuggestion({
        senderName: editSuggestionSenderName,
        sharedTaskId: selectedEditableTask.task_id,
        localTaskId: selectedEditableTask.source_id,
        taskTitleSnapshot: selectedEditableTask.title,
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
      });

      setEditSuggestionSenderName("");
      setChangeTitle(false);
      setSuggestedTitle("");
      setChangeNotes(false);
      setSuggestedNotes("");
      setChangeDueAt(false);
      setSuggestedDueAt("");
      setChangeReminderAt(false);
      setSuggestedReminderAt("");
      setChangePriority(false);
      setSuggestedPriority("auto");
      setEditSuggestionSubmitLockUntil(Date.now() + submitCooldownMs);
      setEditSuggestionFeedback(
        createFeedback(
          "Edit suggestion submitted",
          isLaptopOnline
            ? "The edit request was added to the website review queue and a desktop popup should appear for review."
            : "The edit request was saved to the review queue. It will still be waiting when the laptop reconnects.",
          "default",
        ),
      );
    } catch (error) {
      setEditSuggestionFeedback(
        createFeedback(
          "Suggestion failed",
          error instanceof Error
            ? error.message
            : "Unable to submit the task edit suggestion.",
          "destructive",
        ),
      );
    } finally {
      setIsSubmittingEditSuggestion(false);
    }
  };

  const handleTaskSuggestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setSuggestionFeedback(
        createFeedback(
          "Supabase not configured",
          supabaseConfigError ??
            "Add the Vite Supabase environment variables before using this form.",
          "destructive",
        ),
      );
      return;
    }

    if (suggestionSubmitLockUntil && suggestionSubmitLockUntil > Date.now()) {
      setSuggestionFeedback(
        createFeedback(
          "Please wait a moment",
          "Rapid repeat submits are blocked for a couple of seconds.",
          "destructive",
        ),
      );
      return;
    }

    const trimmedTitle = suggestionTitle.trim();

    if (!trimmedTitle) {
      setSuggestionFeedback(
        createFeedback(
          "Title required",
          "Give the suggested task a short title before submitting it.",
          "destructive",
        ),
      );
      return;
    }

    setIsSubmittingSuggestion(true);
    setSuggestionFeedback(null);

    try {
      await createWebsiteTaskSubmission({
        senderName: suggestionSenderName,
        title: trimmedTitle,
        details: suggestionDetails,
      });

      setSuggestionSenderName("");
      setSuggestionTitle("");
      setSuggestionDetails("");
      setSuggestionSubmitLockUntil(Date.now() + submitCooldownMs);
      setSuggestionFeedback(
        createFeedback(
          "Task suggestion submitted",
          isLaptopOnline
            ? "It was added to the website review queue and will be reviewed before it reaches your real task list."
            : "It was added to the website review queue and will stay there for later review even while the laptop is offline.",
          "default",
        ),
      );
    } catch (error) {
      setSuggestionFeedback(
        createFeedback(
          "Submission failed",
          error instanceof Error ? error.message : "Unable to submit the task suggestion.",
          "destructive",
        ),
      );
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  return (
    <PageLayout title="App Development" mainClassName="max-w-6xl px-5 sm:px-7">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[3rem] border border-white/30 bg-white/32 p-5 shadow-[0_26px_90px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_30px_100px_rgba(8,5,18,0.5)] sm:p-7"
      >
        <div className="rounded-[2.2rem] border border-white/24 bg-white/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">
            Hidden Route | Supabase Bridge
          </p>
          <h1 className="mt-3 text-3xl text-foreground sm:text-4xl">App Development</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            This page mirrors the live task feed from the desktop app, lets visitors send popup
            reminders back into the app, suggest new tasks, suggest edits to live tasks, and trigger
            a password-gated emergency full-screen popup.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              Live task feed
            </div>
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              General reminders
            </div>
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              Task-linked reminders
            </div>
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              Task edit suggestions
            </div>
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              Review queue suggestions
            </div>
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              Emergency full-screen popup
            </div>
            <div className="rounded-full border border-white/24 bg-white/30 px-4 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
              Polling every 15s
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-7">
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[3rem] border border-white/30 bg-white/30 p-5 shadow-[0_24px_76px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_26px_88px_rgba(8,5,18,0.46)] sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/78">
                  Laptop Status
                </p>
                <h2 className="mt-2 text-2xl text-foreground">{laptopName}</h2>
                <p className="mt-2 font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {appPresenceDeviceId}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-white/24 bg-white/28 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.04]">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Last Sync
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {lastSyncedAt ? formatTimestamp(lastSyncedAt) : "Waiting for first load"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {presenceError ? (
                <Alert className="rounded-[1.8rem] border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Could not load laptop presence</AlertTitle>
                  <AlertDescription>{presenceError}</AlertDescription>
                </Alert>
              ) : null}

              {isLoadingPresence ? (
                <div className="rounded-[2rem] border border-white/24 bg-white/22 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Checking whether the laptop is connected...</p>
                  </div>
                </div>
              ) : null}

              {!isLoadingPresence && !presenceError ? (
                <div className="rounded-[2rem] border border-white/24 bg-white/24 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "h-3.5 w-3.5 rounded-full border",
                          isLaptopOnline
                            ? "border-emerald-500/40 bg-emerald-500/80 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                            : "border-rose-500/40 bg-rose-500/80 shadow-[0_0_18px_rgba(244,63,94,0.35)]",
                        )}
                      />
                      <div>
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-primary/78">
                          Heartbeat Status
                        </p>
                        <p className="mt-1 text-base text-foreground">{laptopStatusLabel}</p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em]",
                        isLaptopOnline
                          ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {isLaptopOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-white/22 bg-white/28 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Last Seen
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                        {presence?.last_seen_at
                          ? formatTimestamp(presence.last_seen_at)
                          : "No heartbeat row found"}
                      </p>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/22 bg-white/28 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Heartbeat Age
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                        {presence?.last_seen_at
                          ? formatElapsedTime(presence.last_seen_at)
                          : "Waiting for heartbeat"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    The website treats the laptop as online when <code>last_seen_at</code> is within
                    the last 90 seconds. If it drops offline, reminders and emergency popups can
                    still be sent and will wait in the inbox until it reconnects.
                  </p>
                </div>
              ) : null}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[3rem] border border-white/30 bg-white/30 p-5 shadow-[0_24px_76px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_26px_88px_rgba(8,5,18,0.46)] sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/78">
                  Shared Tasks
                </p>
                <h2 className="mt-2 text-2xl text-foreground">Current task feed</h2>
              </div>

              <div className="rounded-[1.4rem] border border-white/24 bg-white/28 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.04]">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Pending Items
                </p>
                <p className="mt-1 text-sm text-foreground">{visibleTasks.length}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {tasksError ? (
                <Alert className="rounded-[1.8rem] border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Could not load the shared tasks</AlertTitle>
                  <AlertDescription>{tasksError}</AlertDescription>
                </Alert>
              ) : null}

              {isLoadingTasks ? (
                <div className="rounded-[2rem] border border-white/24 bg-white/22 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Loading tasks from Supabase...</p>
                  </div>
                </div>
              ) : null}

              {!isLoadingTasks && !visibleTasks.length && !tasksError ? (
                <div className="rounded-[2rem] border border-white/24 bg-white/22 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="font-display text-[10px] uppercase tracking-[0.24em] text-primary/78">
                    No active tasks right now
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    The shared feed is connected, but there are no pending task or routine rows to
                    show right now.
                  </p>
                </div>
              ) : null}

              {visibleTasks.map((task) => (
                <article
                  key={task.task_id}
                  className="rounded-[2rem] border border-white/24 bg-white/24 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-[10px] uppercase tracking-[0.24em] text-primary/78">
                        {formatTaskKind(task.kind)} | {task.source_id}
                      </p>
                      <h3 className="mt-2 text-lg leading-snug text-foreground">{task.title}</h3>
                    </div>

                    <span
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em]",
                        getStatusTone(task.status),
                      )}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {task.priority ? (
                      <span className="rounded-full border border-white/24 bg-white/30 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
                        Priority {task.priority}
                      </span>
                    ) : null}
                    {task.scheduled_date ? (
                      <span className="rounded-full border border-white/24 bg-white/30 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
                        Scheduled {task.scheduled_date}
                      </span>
                    ) : null}
                    {task.rule_summary ? (
                      <span className="rounded-full border border-white/24 bg-white/30 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]">
                        {task.rule_summary}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.35rem] border border-white/22 bg-white/28 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Due
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                        {formatTimestamp(task.due_at)}
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/22 bg-white/28 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Reminder
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                        {formatTimestamp(task.reminder_at)}
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/22 bg-white/28 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Updated
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                        {formatTimestamp(task.updated_at)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 break-all font-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {task.task_id}
                  </p>
                </article>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="space-y-7">
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[3rem] border border-white/30 bg-white/30 p-5 shadow-[0_24px_76px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_26px_88px_rgba(8,5,18,0.46)] sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-[1.25rem] border border-white/24 bg-white/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                <BellRing className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/78">
                  Popup Inbox
                </p>
                <h2 className="mt-1 text-2xl text-foreground">Send a reminder</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Leave the task selector on the general option for a standalone popup, link the
              message to one of the shared tasks below, or toggle emergency mode to turn it into a
              full-screen alert.
            </p>

            <div className="mt-4 rounded-[1.8rem] border border-white/22 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                Delivery Status
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {isLaptopOnline
                  ? `${laptopName} is online, so new reminders should arrive right away.`
                  : `${laptopName} is offline right now. You can still send reminders and they will wait in the inbox until the laptop reconnects.`}
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="target-task"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Target
                </label>
                <Select
                  value={isEmergencyReminder ? generalReminderValue : selectedTaskId}
                  onValueChange={setSelectedTaskId}
                  disabled={isEmergencyReminder}
                >
                  <SelectTrigger
                    id="target-task"
                    className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <SelectValue placeholder="Choose where the popup should go" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.2rem] border-white/20 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#151126]/95">
                    <SelectItem value={generalReminderValue}>General reminder</SelectItem>
                    {visibleTasks.map((task) => (
                      <SelectItem key={task.task_id} value={task.task_id}>
                        {task.title} ({formatTaskKind(task.kind)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="sender-name"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Sender Name
                </label>
                <Input
                  id="sender-name"
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Optional"
                  maxLength={80}
                  className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="reminder-message"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Message
                </label>
                <Textarea
                  id="reminder-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleMessageKeyDown}
                  placeholder="Write the popup message here"
                  rows={6}
                  maxLength={400}
                  required
                  className="min-h-[9rem] rounded-[1.4rem] border-white/24 bg-white/32 text-sm leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div
                className={cn(
                  "rounded-[1.8rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors dark:border-white/10 dark:bg-white/[0.03]",
                  isEmergencyReminder
                    ? "border-rose-500/30 bg-rose-500/10"
                    : "border-white/22 bg-white/24",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "rounded-[1rem] border p-2 dark:border-white/10 dark:bg-white/[0.05]",
                        isEmergencyReminder
                          ? "border-rose-500/30 bg-rose-500/14"
                          : "border-white/22 bg-white/30",
                      )}
                    >
                      <AlertCircle
                        className={cn(
                          "h-4 w-4",
                          isEmergencyReminder ? "text-rose-600 dark:text-rose-300" : "text-primary",
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                        Emergency mode
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Toggle this on to send the reminder as a full-screen alert. Emergency mode
                        always sends <code>task_id = null</code> and uses
                        <code> source = 'website-emergency'</code>.
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={isEmergencyReminder}
                    onCheckedChange={(checked) => {
                      setIsEmergencyReminder(checked);
                      setEmergencyPassword("");
                      setFormFeedback(null);
                    }}
                    aria-label="Toggle emergency popup mode"
                    className="data-[state=checked]:bg-rose-500 data-[state=unchecked]:bg-white/40"
                  />
                </div>

                {isEmergencyReminder ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[1.5rem] border border-rose-500/20 bg-rose-500/8 p-3 text-sm leading-relaxed text-muted-foreground">
                      Emergency alerts bypass task linking and will fill the screen when the desktop
                      app receives them.
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="emergency-password"
                        className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                      >
                        Emergency Password
                      </label>
                      <Input
                        id="emergency-password"
                        type="password"
                        value={emergencyPassword}
                        onChange={(event) => setEmergencyPassword(event.target.value)}
                        placeholder="Required to send a full-screen alert"
                        maxLength={160}
                        className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                      />
                    </div>

                    {!emergencyPopupPasswordHash ? (
                      <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                        Emergency mode is not configured in this build yet. Add
                        <code> VITE_EMERGENCY_POPUP_PASSWORD_HASH</code> before using it.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {formFeedback ? (
                <Alert
                  variant={formFeedback.variant}
                  className={cn(
                    "rounded-[1.8rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
                    formFeedback.variant === "destructive"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
                  )}
                >
                  {formFeedback.variant === "destructive" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertTitle>{formFeedback.title}</AlertTitle>
                  <AlertDescription>{formFeedback.description}</AlertDescription>
                </Alert>
              ) : null}

              <div className="rounded-[1.8rem] border border-white/22 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <div className="rounded-[1rem] border border-white/22 bg-white/30 p-2 dark:border-white/10 dark:bg-white/[0.05]">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Reminder behavior
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {isEmergencyReminder ? (
                        <>
                          Emergency reminders insert <code>task_id = null</code> and send
                          <code> source = 'website-emergency'</code>, so they open full-screen
                          after the password hash check passes.
                        </>
                      ) : (
                        <>
                          General reminders insert <code>task_id = null</code>. Task-specific reminders
                          use the exact <code>shared_tasks.task_id</code> value from the selector.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitLocked || !isSupabaseConfigured}
                className={cn(
                  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.5rem] px-5 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-foreground transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
                  isEmergencyReminder
                    ? "border border-rose-500/30 bg-rose-500/14 shadow-[0_18px_46px_rgba(190,24,93,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 hover:bg-rose-500/20 dark:text-rose-100"
                    : "border border-white/26 bg-white/36 shadow-[0_18px_46px_rgba(173,133,37,0.12),inset_0_1px_0_rgba(255,255,255,0.24)] hover:-translate-y-0.5 hover:bg-white/48 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
                )}
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isEmergencyReminder ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <BellRing className="h-4 w-4" />
                    )}
                  </>
                )}
                {isSubmitting
                  ? "Sending..."
                  : isSubmitLocked
                    ? "Hold for a second"
                    : isEmergencyReminder
                      ? "Send emergency popup"
                      : "Send popup reminder"}
              </button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <p>
                  Press Enter to send, Shift+Enter for a new line. Empty messages and rapid repeats
                  are blocked. Emergency mode reveals the password field only when it is enabled.
                </p>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.17, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[3rem] border border-white/30 bg-white/30 p-5 shadow-[0_24px_76px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_26px_88px_rgba(8,5,18,0.46)] sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-[1.25rem] border border-white/24 bg-white/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/78">
                  Task Edits
                </p>
                <h2 className="mt-1 text-2xl text-foreground">Suggest a task edit</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Suggest changes to an existing live task. These edits go into a separate review queue
              so nothing changes in the real task list until the suggestion is accepted.
            </p>

            <div className="mt-4 rounded-[1.8rem] border border-white/22 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                Review Flow
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Each edit suggestion stays isolated in the website review queue. It can be accepted
                or dismissed later, and a desktop popup is triggered when a new edit suggestion is
                submitted.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleTaskEditSuggestionSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="edit-task-target"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Task
                </label>
                <Select
                  value={selectedEditableTask ? selectedEditableTask.task_id : editableTaskPlaceholderValue}
                  onValueChange={(value) =>
                    setEditSuggestionTaskId(
                      value === editableTaskPlaceholderValue ? "" : value,
                    )
                  }
                  disabled={!editableTasks.length}
                >
                  <SelectTrigger
                    id="edit-task-target"
                    className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <SelectValue placeholder="Choose a task to edit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.2rem] border-white/20 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#151126]/95">
                    {!editableTasks.length ? (
                      <SelectItem value={editableTaskPlaceholderValue}>
                        No editable tasks available
                      </SelectItem>
                    ) : null}
                    {editableTasks.map((task) => (
                      <SelectItem key={task.task_id} value={task.task_id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEditableTask ? (
                <div className="rounded-[1.8rem] border border-white/22 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                    Current task
                  </p>
                  <h3 className="mt-2 text-base text-foreground">{selectedEditableTask.title}</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-white/22 bg-white/26 px-3 py-2.5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.18em] text-foreground/90">
                        Due
                      </p>
                      <p className="mt-1 leading-relaxed text-foreground">
                        {formatTimestamp(selectedEditableTask.due_at)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/22 bg-white/26 px-3 py-2.5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.18em] text-foreground/90">
                        Reminder
                      </p>
                      <p className="mt-1 leading-relaxed text-foreground">
                        {formatTimestamp(selectedEditableTask.reminder_at)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/22 bg-white/26 px-3 py-2.5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-display text-[10px] uppercase tracking-[0.18em] text-foreground/90">
                        Priority
                      </p>
                      <p className="mt-1 leading-relaxed text-foreground">
                        {selectedEditableTask.priority || "Auto"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                  No one-off tasks are available to edit right now. Task-edit suggestions are only
                  enabled for shared items with <code>kind = task</code>.
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="edit-suggestion-sender-name"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Sender Name
                </label>
                <Input
                  id="edit-suggestion-sender-name"
                  value={editSuggestionSenderName}
                  onChange={(event) => setEditSuggestionSenderName(event.target.value)}
                  placeholder="Optional"
                  maxLength={80}
                  className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div className={createToggleCardClassName(changeTitle)}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={changeTitle}
                    onChange={(event) => setChangeTitle(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-transparent text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Change title
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Suggest a new task title.
                    </p>
                  </div>
                </label>
                {changeTitle ? (
                  <div className="mt-4 space-y-2">
                    <Input
                      value={suggestedTitle}
                      onChange={(event) => setSuggestedTitle(event.target.value)}
                      placeholder="Suggested title"
                      maxLength={140}
                      className="h-12 rounded-[1.4rem] border-white/24 bg-white/34 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </div>
                ) : null}
              </div>

              <div className={createToggleCardClassName(changeNotes)}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={changeNotes}
                    onChange={(event) => setChangeNotes(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-transparent text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Change description
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Leave the text box blank if you want to suggest clearing the description.
                    </p>
                  </div>
                </label>
                {changeNotes ? (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      value={suggestedNotes}
                      onChange={(event) => setSuggestedNotes(event.target.value)}
                      placeholder="Suggested description or leave blank to clear it"
                      rows={4}
                      maxLength={1200}
                      className="min-h-[7rem] rounded-[1.4rem] border-white/24 bg-white/34 text-sm leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </div>
                ) : null}
              </div>

              <div className={createToggleCardClassName(changeDueAt)}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={changeDueAt}
                    onChange={(event) => setChangeDueAt(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-transparent text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Change due date
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Current due date: {selectedEditableTask ? formatTimestamp(selectedEditableTask.due_at) : "Not set"}.
                      Leave the value blank to suggest clearing it.
                    </p>
                  </div>
                </label>
                {changeDueAt ? (
                  <div className="mt-4 space-y-2">
                    <Input
                      type="datetime-local"
                      value={suggestedDueAt}
                      onChange={(event) => setSuggestedDueAt(event.target.value)}
                      className="h-12 rounded-[1.4rem] border-white/24 bg-white/34 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </div>
                ) : null}
              </div>

              <div className={createToggleCardClassName(changeReminderAt)}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={changeReminderAt}
                    onChange={(event) => setChangeReminderAt(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-transparent text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Change reminder date
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Current reminder date: {selectedEditableTask ? formatTimestamp(selectedEditableTask.reminder_at) : "Not set"}.
                      Leave the value blank to suggest clearing it.
                    </p>
                  </div>
                </label>
                {changeReminderAt ? (
                  <div className="mt-4 space-y-2">
                    <Input
                      type="datetime-local"
                      value={suggestedReminderAt}
                      onChange={(event) => setSuggestedReminderAt(event.target.value)}
                      className="h-12 rounded-[1.4rem] border-white/24 bg-white/34 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </div>
                ) : null}
              </div>

              <div className={createToggleCardClassName(changePriority)}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={changePriority}
                    onChange={(event) => setChangePriority(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-transparent text-primary focus:ring-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Change priority
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Current priority: {selectedEditableTask?.priority || "Auto"}.
                    </p>
                  </div>
                </label>
                {changePriority ? (
                  <div className="mt-4 space-y-2">
                    <Select value={suggestedPriority} onValueChange={(value) => setSuggestedPriority(value as (typeof priorityOptions)[number]["value"])}>
                      <SelectTrigger className="h-12 rounded-[1.4rem] border-white/24 bg-white/34 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.04]">
                        <SelectValue placeholder="Choose a suggested priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[1.2rem] border-white/20 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#151126]/95">
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>

              {editSuggestionFeedback ? (
                <Alert
                  variant={editSuggestionFeedback.variant}
                  className={cn(
                    "rounded-[1.8rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
                    editSuggestionFeedback.variant === "destructive"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
                  )}
                >
                  {editSuggestionFeedback.variant === "destructive" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertTitle>{editSuggestionFeedback.title}</AlertTitle>
                  <AlertDescription>{editSuggestionFeedback.description}</AlertDescription>
                </Alert>
              ) : null}

              <button
                type="submit"
                disabled={
                  isSubmittingEditSuggestion ||
                  isEditSuggestionSubmitLocked ||
                  !isSupabaseConfigured ||
                  !selectedEditableTask
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.5rem] border border-white/26 bg-white/36 px-5 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-foreground shadow-[0_18px_46px_rgba(173,133,37,0.12),inset_0_1px_0_rgba(255,255,255,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/48 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
              >
                {isSubmittingEditSuggestion ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareText className="h-4 w-4" />
                )}
                {isSubmittingEditSuggestion
                  ? "Submitting..."
                  : isEditSuggestionSubmitLocked
                    ? "Hold for a second"
                    : "Submit task edit suggestion"}
              </button>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[3rem] border border-white/30 bg-white/30 p-5 shadow-[0_24px_76px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_26px_88px_rgba(8,5,18,0.46)] sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-[1.25rem] border border-white/24 bg-white/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/78">
                  Website Tasks
                </p>
                <h2 className="mt-1 text-2xl text-foreground">Suggest a task</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Use this to suggest something new for the workflow. Suggestions go into a separate
              review queue first and are not added straight into the real task list.
            </p>

            <div className="mt-4 rounded-[1.8rem] border border-white/22 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                Review Flow
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Submitted tasks land in the website review queue with a pending status. They are
                reviewed later and only become real tasks if accepted from that separate queue.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleTaskSuggestionSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="suggestion-sender-name"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Sender Name
                </label>
                <Input
                  id="suggestion-sender-name"
                  value={suggestionSenderName}
                  onChange={(event) => setSuggestionSenderName(event.target.value)}
                  placeholder="Optional"
                  maxLength={80}
                  className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="suggestion-title"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Task Title
                </label>
                <Input
                  id="suggestion-title"
                  value={suggestionTitle}
                  onChange={(event) => setSuggestionTitle(event.target.value)}
                  placeholder="Required"
                  maxLength={140}
                  required
                  className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="suggestion-details"
                  className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
                >
                  Details
                </label>
                <Textarea
                  id="suggestion-details"
                  value={suggestionDetails}
                  onChange={(event) => setSuggestionDetails(event.target.value)}
                  placeholder="Optional background or explanation"
                  rows={5}
                  maxLength={600}
                  className="min-h-[8rem] rounded-[1.4rem] border-white/24 bg-white/32 text-sm leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </div>

              {suggestionFeedback ? (
                <Alert
                  variant={suggestionFeedback.variant}
                  className={cn(
                    "rounded-[1.8rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
                    suggestionFeedback.variant === "destructive"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
                  )}
                >
                  {suggestionFeedback.variant === "destructive" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertTitle>{suggestionFeedback.title}</AlertTitle>
                  <AlertDescription>{suggestionFeedback.description}</AlertDescription>
                </Alert>
              ) : null}

              <div className="rounded-[1.8rem] border border-white/22 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <div className="rounded-[1rem] border border-white/22 bg-white/30 p-2 dark:border-white/10 dark:bg-white/[0.05]">
                    <Clock3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Queue behavior
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Suggestions are stored in <code>task_submissions</code> with a pending status.
                      They do not create a real task immediately, and they do not go into the popup
                      reminder inbox.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSuggestion || isSuggestionSubmitLocked || !isSupabaseConfigured}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.5rem] border border-white/26 bg-white/36 px-5 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-foreground shadow-[0_18px_46px_rgba(173,133,37,0.12),inset_0_1px_0_rgba(255,255,255,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/48 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
              >
                {isSubmittingSuggestion ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareText className="h-4 w-4" />
                )}
                {isSubmittingSuggestion
                  ? "Submitting..."
                  : isSuggestionSubmitLocked
                    ? "Hold for a second"
                    : "Submit task suggestion"}
              </button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <p>Task suggestions are stored for later review even if the laptop is offline.</p>
              </div>
            </form>
          </motion.section>

        </div>
      </div>
    </PageLayout>
  );
};

export default AppDevelopment;
