import { motion } from "framer-motion";
import { AlertCircle, BellRing, CheckCircle2, Clock3, LoaderCircle, MessageSquareText } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createWebsiteReminder,
  fetchSharedTasks,
  isSupabaseConfigured,
  supabaseConfigError,
  type SharedTask,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

const generalReminderValue = "__general__";
const taskRefreshIntervalMs = 30000;
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

const formatTaskKind = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

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

const AppDevelopment = () => {
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(generalReminderValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLockUntil, setSubmitLockUntil] = useState<number | null>(null);
  const [formFeedback, setFormFeedback] = useState<FormFeedback | null>(null);

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
    if (!isSupabaseConfigured) {
      setIsLoadingTasks(false);
      setTasksError(supabaseConfigError);
      return;
    }

    let isActive = true;

    const loadTasks = async (showSpinner: boolean) => {
      if (showSpinner) {
        setIsLoadingTasks(true);
      }

      try {
        const nextTasks = await fetchSharedTasks();

        if (!isActive) {
          return;
        }

        setTasks(nextTasks);
        setTasksError(null);
        setLastSyncedAt(new Date().toISOString());
      } catch (error) {
        if (!isActive) {
          return;
        }

        setTasksError(error instanceof Error ? error.message : "Unable to load shared tasks.");
      } finally {
        if (isActive && showSpinner) {
          setIsLoadingTasks(false);
        }
      }
    };

    void loadTasks(true);

    const refreshInterval = window.setInterval(() => {
      void loadTasks(false);
    }, taskRefreshIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setFormFeedback({
        title: "Supabase not configured",
        description: supabaseConfigError ?? "Add the Vite Supabase environment variables before using this form.",
        variant: "destructive",
      });
      return;
    }

    if (submitLockUntil && submitLockUntil > Date.now()) {
      setFormFeedback({
        title: "Please wait a moment",
        description: "Rapid repeat submits are blocked for a couple of seconds.",
        variant: "destructive",
      });
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setFormFeedback({
        title: "Message required",
        description: "Write a short popup message before sending it.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback(null);

    try {
      await createWebsiteReminder({
        senderName,
        message: trimmedMessage,
        taskId: selectedTaskId === generalReminderValue ? null : selectedTaskId,
      });

      setSenderName("");
      setMessage("");
      setSelectedTaskId(generalReminderValue);
      setSubmitLockUntil(Date.now() + submitCooldownMs);
      setFormFeedback({
        title: "Reminder sent",
        description:
          selectedTaskId === generalReminderValue
            ? "The popup message was added as a general reminder."
            : "The popup message was linked to the selected task.",
        variant: "default",
      });
    } catch (error) {
      setFormFeedback({
        title: "Send failed",
        description: error instanceof Error ? error.message : "Unable to send the popup message.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitLocked = Boolean(submitLockUntil && submitLockUntil > Date.now());

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
            This page mirrors the live task feed from the desktop app and lets visitors send popup
            reminders back into the app. General reminders and task-specific reminders both flow
            through the same inbox table.
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
              Auto refresh every 30s
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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
                Last Sync
              </p>
              <p className="mt-1 text-sm text-foreground">
                {lastSyncedAt ? formatTimestamp(lastSyncedAt) : "Waiting for first load"}
              </p>
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

            {!isLoadingTasks && !tasks.length && !tasksError ? (
              <div className="rounded-[2rem] border border-white/24 bg-white/22 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.03]">
                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-primary/78">
                  Nothing shared yet
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The website is connected, but there are no rows in <code>public.shared_tasks</code>
                  {" "}right now.
                </p>
              </div>
            ) : null}

            {tasks.map((task) => (
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
                      getStatusTone(task.status)
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
            Leave the task selector on the general option for a standalone popup, or link the
            message to one of the shared tasks below.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="target-task"
                className="font-display text-[10px] uppercase tracking-[0.24em] text-foreground/90"
              >
                Target
              </label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger
                  id="target-task"
                  className="h-12 rounded-[1.4rem] border-white/24 bg-white/32 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <SelectValue placeholder="Choose where the popup should go" />
                </SelectTrigger>
                <SelectContent className="rounded-[1.2rem] border-white/20 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#151126]/95">
                  <SelectItem value={generalReminderValue}>General reminder</SelectItem>
                  {tasks.map((task) => (
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
                placeholder="Write the popup message here"
                rows={6}
                maxLength={400}
                required
                className="min-h-[9rem] rounded-[1.4rem] border-white/24 bg-white/32 text-sm leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] placeholder:text-muted-foreground/80 dark:border-white/10 dark:bg-white/[0.04]"
              />
            </div>

            {formFeedback ? (
              <Alert
                variant={formFeedback.variant}
                className={cn(
                  "rounded-[1.8rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
                  formFeedback.variant === "destructive"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
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
                    General reminders insert <code>task_id = null</code>. Task-specific reminders use
                    the exact <code>shared_tasks.task_id</code> value from the selector.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isSubmitLocked || !isSupabaseConfigured}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.5rem] border border-white/26 bg-white/36 px-5 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-foreground shadow-[0_18px_46px_rgba(173,133,37,0.12),inset_0_1px_0_rgba(255,255,255,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/48 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
              {isSubmitting ? "Sending..." : isSubmitLocked ? "Hold for a second" : "Send popup reminder"}
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <p>Messages are trimmed, empty submissions are blocked, and rapid repeats are throttled.</p>
            </div>
          </form>
        </motion.section>
      </div>
    </PageLayout>
  );
};

export default AppDevelopment;
