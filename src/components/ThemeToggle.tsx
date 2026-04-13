import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

interface ThemeViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
}

interface ThemeTransitionDocument extends Document {
  startViewTransition?: (callback: () => Promise<void> | void) => ThemeViewTransition;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  // We wait until mount so the button always matches the active theme on first paint.
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = async () => {
    const nextTheme = isDark ? "light" : "dark";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const themedDocument = document as ThemeTransitionDocument;

    if (!mounted || prefersReducedMotion || !themedDocument.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const centerX = buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth / 2;
    const centerY = buttonRect ? buttonRect.top + buttonRect.height / 2 : window.innerHeight / 2;
    const maxRadius = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY),
    );

    document.documentElement.style.setProperty("--theme-transition-x", `${centerX}px`);
    document.documentElement.style.setProperty("--theme-transition-y", `${centerY}px`);
    document.documentElement.style.setProperty("--theme-transition-radius", `${maxRadius}px`);
    document.documentElement.classList.add("theme-transition-active");

    const transition = themedDocument.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    try {
      await transition.finished;
    } catch {
      setTheme(nextTheme);
    } finally {
      document.documentElement.classList.remove("theme-transition-active");
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        void toggleTheme();
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-primary/20 bg-background/70 px-4 py-2.5 font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground shadow-[0_16px_38px_rgba(173,133,37,0.10)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:text-primary dark:shadow-[0_16px_38px_rgba(8,5,18,0.55)]",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-colors duration-300",
          isDark ? "bg-primary/20" : "bg-white/70",
        )}
      >
        {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </span>
      <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
};

export default ThemeToggle;
