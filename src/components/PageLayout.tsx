import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";
import SubpageBackdrop from "@/components/SubpageBackdrop";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  mainClassName?: string;
}

interface HomeTransitionState {
  clipPath: string;
}

const PageLayout = ({ title, children, mainClassName }: PageLayoutProps) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const homeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [homeTransition, setHomeTransition] = useState<HomeTransitionState | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleHomeNavigation = () => {
    if (homeTransition) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      navigate("/");
      return;
    }

    const rect = homeButtonRef.current?.getBoundingClientRect();

    if (!rect) {
      navigate("/");
      return;
    }

    const computedRadius = window.getComputedStyle(homeButtonRef.current).borderRadius || "9999px";
    const clipPath = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round ${computedRadius})`;

    setHomeTransition({ clipPath });

    timeoutRef.current = window.setTimeout(() => {
      navigate("/");
    }, 680);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      <AnimatePresence>
        {homeTransition ? (
          <RouteTransitionOverlay
            backdrop="home"
            initialClipPath={homeTransition.clipPath}
            animateToClipPath="inset(0px 0px 0px 0px round 0rem)"
          />
        ) : null}
      </AnimatePresence>

      <SubpageBackdrop className="fixed inset-0" />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 sm:px-8">
        <button
          ref={homeButtonRef}
          type="button"
          onClick={handleHomeNavigation}
          className="group relative inline-flex items-center overflow-hidden rounded-full border border-white/26 bg-white/28 px-5 py-3 shadow-[0_18px_48px_rgba(173,133,37,0.12)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/38 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_22px_56px_rgba(8,5,18,0.52)] dark:hover:bg-white/[0.09]"
        >
          <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90" />
          <span className="font-script text-3xl leading-none text-foreground">Arkan Dave</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden font-display text-xs tracking-[0.3em] uppercase text-muted-foreground sm:inline">
            {title}
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn("relative mx-auto max-w-4xl px-6 pb-20 pt-28 sm:px-8", mainClassName)}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default PageLayout;
