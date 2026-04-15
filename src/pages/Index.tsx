import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HomeBackdrop from "@/components/HomeBackdrop";
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";
import ThemeToggle from "@/components/ThemeToggle";

// These links stay simple on the landing page so the hero can do most of the visual work.
const navItems = [
  {
    to: "/projects",
    label: "Projects",
    summary: "built work",
  },
  {
    to: "/research",
    label: "Research",
    summary: "analysis",
  },
  {
    to: "/cv",
    label: "CV",
    summary: "experience",
  },
  {
    to: "/about",
    label: "About",
    summary: "background",
  },
];

interface PageTransitionState {
  clipPath: string;
  to: string;
}

const Index = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const [transitionState, setTransitionState] = useState<PageTransitionState | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDockNavigation = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      transitionState
    ) {
      return;
    }

    event.preventDefault();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      navigate(to);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const computedRadius = window.getComputedStyle(event.currentTarget).borderRadius || "1.7rem";
    const clipPath = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round ${computedRadius})`;

    setTransitionState({ clipPath, to });

    timeoutRef.current = window.setTimeout(() => {
      navigate(to);
    }, 680);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      <AnimatePresence>
        {transitionState ? (
          <RouteTransitionOverlay
            initialClipPath={transitionState.clipPath}
            animateToClipPath="inset(0px 0px 0px 0px round 2.4rem)"
          />
        ) : null}
      </AnimatePresence>

      <HomeBackdrop />

      <div className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14">
        <div className="flex items-start justify-between gap-4">
          <p className="font-display text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
            Portfolio / Biomedical Engineering
          </p>
          <ThemeToggle />
        </div>

        <div className="relative flex flex-1 flex-col justify-between pb-10 pt-10 sm:pb-14 sm:pt-16">
          <div className="relative z-10 max-w-[1300px]">
            {/* The diagonal stroke now lives inside the "Arkan" span so it tracks the word instead of the page. */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="max-w-max font-script text-[clamp(4.5rem,12vw,12rem)] leading-[0.8] tracking-[-0.035em] text-foreground"
            >
              <span className="relative inline-block pr-[0.08em]">
                <span className="pointer-events-none absolute left-[0.02em] top-[-2.15em] rotate-[35deg] sm:left-[0.06em] sm:top-[-2.4em] lg:left-[0.1em] lg:top-[-2.7em]">
                  <motion.span
                    initial={{ opacity: 0, scaleY: 0.7 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                    className="block h-[6.6em] w-[0.06em] origin-top rounded-full bg-foreground/100 shadow-[0_0_40px_rgba(255,255,255,0.2)] sm:h-[7.8em] lg:h-[9.2em]"
                  />
                </span>
                Arkan
              </span>
              <span className="inline-block pl-[0.08em]">Dave</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
              className="mt-10 ml-[clamp(3.5rem,11vw,10.5rem)] max-w-[34rem] rounded-[2rem] border border-white/34 bg-white/28 px-6 py-6 shadow-[0_28px_78px_rgba(173,133,37,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_24px_80px_rgba(8,5,18,0.42)] sm:px-7"
            >
              <p className="font-display text-[11px] tracking-[0.36em] uppercase text-primary/85">
                Biomedical Engineer
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                I build engineering work that feels clear, usable, and intentional, from
                technical projects to the digital spaces that present them.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-14 flex justify-center lg:mt-20 lg:justify-end">
            {/* The nav becomes a single glass dock so it feels more like one polished object. */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.34 }}
              className="w-full max-w-[66rem] rounded-[2.25rem] border border-white/30 bg-white/22 p-3 shadow-[0_30px_88px_rgba(173,133,37,0.16)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_30px_90px_rgba(8,5,18,0.48)]"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={(event) => handleDockNavigation(event, item.to)}
                    className="group relative overflow-hidden rounded-[1.7rem] border border-white/24 bg-white/48 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/58 hover:shadow-[0_18px_40px_rgba(173,133,37,0.16)] dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]"
                  >
                    <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-80" />
                    <p className="font-display text-[10px] tracking-[0.32em] uppercase text-primary/78">
                      {item.summary}
                    </p>
                    <p className="mt-3 text-[1.85rem] leading-none text-foreground">{item.label}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
