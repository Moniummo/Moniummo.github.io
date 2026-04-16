import { Suspense, lazy, type MouseEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SubpageBackdrop from "@/components/SubpageBackdrop";
import { cn } from "@/lib/utils";

const ThemeToggle = lazy(() => import("@/components/ThemeToggle"));
const RouteTransitionOverlay = lazy(() => import("@/components/RouteTransitionOverlay"));

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  mainClassName?: string;
}

interface RouteTransitionState {
  backdrop: "home" | "subpage";
  clipPath: string;
  to: string;
}

const sectionNavItems = [
  { label: "Projects", to: "/projects" },
  { label: "Research", to: "/research" },
  { label: "CV", to: "/cv" },
  { label: "About", to: "/about" },
] as const;

const PageLayout = ({ title, children, mainClassName }: PageLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const transitionTimeoutRef = useRef<number | null>(null);
  const homeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [routeTransition, setRouteTransition] = useState<RouteTransitionState | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const runRouteTransition = ({
    backdrop,
    clipPath,
    to,
  }: {
    backdrop: "home" | "subpage";
    clipPath: string;
    to: string;
  }) => {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    setRouteTransition({ backdrop, clipPath, to });

    transitionTimeoutRef.current = window.setTimeout(() => {
      navigate(to);
    }, 680);
  };

  const handleHomeNavigation = () => {
    if (routeTransition) {
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

    runRouteTransition({ backdrop: "home", clipPath, to: "/" });
  };

  const handleSectionNavigation = (event: MouseEvent<HTMLButtonElement>, to: string) => {
    if (routeTransition || location.pathname === to) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      navigate(to);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const computedRadius = window.getComputedStyle(event.currentTarget).borderRadius || "9999px";
    const clipPath = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round ${computedRadius})`;

    runRouteTransition({ backdrop: "subpage", clipPath, to });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      {routeTransition ? (
        <Suspense fallback={null}>
          <RouteTransitionOverlay
            backdrop={routeTransition.backdrop}
            initialClipPath={routeTransition.clipPath}
            animateToClipPath="inset(0px 0px 0px 0px round 2.4rem)"
          />
        </Suspense>
      ) : null}

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
          <div className="hidden items-center gap-1 rounded-full border border-white/26 bg-white/24 p-1 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] lg:flex">
            {sectionNavItems.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <button
                  key={item.to}
                  type="button"
                  disabled={isActive || !!routeTransition}
                  onClick={(event) => handleSectionNavigation(event, item.to)}
                  className={cn(
                    "rounded-full px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.22em] transition-all duration-300",
                    isActive
                      ? "border border-white/24 bg-white/42 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.12]"
                      : "text-muted-foreground hover:bg-white/30 hover:text-foreground dark:hover:bg-white/[0.1]"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <span className="hidden font-display text-xs tracking-[0.3em] uppercase text-muted-foreground sm:inline">
            {title}
          </span>
          <Suspense
            fallback={
              <div className="h-[3rem] w-[11.5rem] rounded-full border border-white/16 bg-white/12 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05]" />
            }
          >
            <ThemeToggle />
          </Suspense>
        </div>
      </nav>

      <main
        className={cn(
          "page-layout-enter relative mx-auto max-w-4xl px-6 pb-20 pt-28 sm:px-8",
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
