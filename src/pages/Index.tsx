import { Suspense, lazy, useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileText, FlaskConical, FolderKanban, UserRound, X } from "lucide-react";
import HomeBackdrop from "@/components/HomeBackdrop";
import { runRadialPageTransition } from "@/lib/radialPageTransition";

const ThemeToggle = lazy(() => import("@/components/ThemeToggle"));
const RouteTransitionOverlay = lazy(() => import("@/components/RouteTransitionOverlay"));

const navItems = [
  {
    to: "/projects",
    label: "Projects",
    summary: "Built systems, prototypes, and polished implementation work.",
    index: "01",
    icon: FolderKanban,
  },
  {
    to: "/research",
    label: "Research",
    summary: "Technical investigations, analysis, and experimental thinking.",
    index: "02",
    icon: FlaskConical,
  },
  {
    to: "/cv",
    label: "CV",
    summary: "Experience, education, and the through-line behind the work.",
    index: "03",
    icon: FileText,
  },
  {
    to: "/about",
    label: "About",
    summary: "The person, process, and perspective shaping the portfolio.",
    index: "04",
    icon: UserRound,
  },
];

const focusPills = ["Biomedical engineering", "Human-centered tools", "Research to product"];

const quickNotes = [
  {
    label: "Approach",
    value: "Engineering systems that stay readable to real people",
  },
  {
    label: "Strength",
    value: "Bridging technical detail with polished presentation",
  },
  {
    label: "Focus",
    value: "Research, prototyping, and thoughtful interface work",
  },
];

const currentWork = [
  {
    label: "Now building",
    title: "ESONIC",
    summary:
      "Developing work around ESONIC with an emphasis on clear technical thinking, iteration, and practical implementation.",
  },
  {
    label: "In the lab",
    title: "Rat brain dissections",
    summary:
      "Hands-on dissection work that keeps me close to biological structure, observation, and the realities behind biomedical study.",
  },
];

const givenNameLetters = [
  { id: "arkan-A", display: "A", secret: "A" },
  { id: "arkan-r", display: "r", secret: "r" },
  { id: "arkan-k", display: "k" },
  { id: "arkan-a", display: "a", secret: "a" },
  { id: "arkan-n", display: "n" },
];
const surnameLetters = [
  { id: "dave-D", display: "D" },
  { id: "dave-a", display: "a" },
  { id: "dave-v", display: "v" },
  { id: "dave-e", display: "e" },
];
const allyLetterOrder = "Aiza";
const allyLetterIds = ["arkan-A", "bio-i", "copy-z", "arkan-a"];
const rickrollLetterOrder = "Absar";
const rickrollLetterIds = ["arkan-A", "badge-b", "badge-s", "arkan-a", "arkan-r"];
const secretOrderYMargin = 90;
const secretOrderMinXGap = 8;
const allyOrderMaxXGaps = [360, 220, 220];
const rickrollOrderMaxXGaps = [360, 220, 220, 160];
const featurePanelRotation = (-8 * Math.PI) / 180;
const vaultDoorOpenDelayMs = 4800;
const vaultDoorOpenDurationMs = 6200;
const vaultButtonShineDurationMs = 560;
const featurePanelOutlineShineDurationMs = 360;
const allyPassword = "ch3ss.ally.blahblah";

interface Point {
  x: number;
  y: number;
}

interface PageTransitionState {
  clipPath: string;
  to: string;
}

const Index = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const featurePanelOutlineSweepTimeoutRef = useRef<number | null>(null);
  const featurePanelVaultOpenTimeoutRef = useRef<number | null>(null);
  const vaultSweepTimeoutRef = useRef<number | null>(null);
  const vaultNavigateTimeoutRef = useRef<number | null>(null);
  const dragBoundsRef = useRef<HTMLDivElement | null>(null);
  const secretLetterRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const secretOrderMatchedRef = useRef(false);
  const rickrollOrderMatchedRef = useRef(false);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [transitionState, setTransitionState] = useState<PageTransitionState | null>(null);
  const [featurePanelArmed, setFeaturePanelArmed] = useState(false);
  const [featurePanelArmedAt, setFeaturePanelArmedAt] = useState<number | null>(null);
  const [featurePanelOutlineSweeping, setFeaturePanelOutlineSweeping] = useState(false);
  const [featurePanelVaultOpen, setFeaturePanelVaultOpen] = useState(false);
  const [vaultButtonSweeping, setVaultButtonSweeping] = useState(false);
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [rickrollOpen, setRickrollOpen] = useState(false);
  const [secretOrderMatched, setSecretOrderMatched] = useState(false);
  const [passwordRejectedForCurrentSolve, setPasswordRejectedForCurrentSolve] = useState(false);
  const skipEntranceMotion = prefersReducedMotion || isMobileViewport;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      if (featurePanelOutlineSweepTimeoutRef.current) {
        window.clearTimeout(featurePanelOutlineSweepTimeoutRef.current);
      }

      if (featurePanelVaultOpenTimeoutRef.current) {
        window.clearTimeout(featurePanelVaultOpenTimeoutRef.current);
      }

      if (vaultSweepTimeoutRef.current) {
        window.clearTimeout(vaultSweepTimeoutRef.current);
      }

      if (vaultNavigateTimeoutRef.current) {
        window.clearTimeout(vaultNavigateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
      window.requestAnimationFrame(() => {
        updateFeaturePanelArmed();
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const getFeaturePanelMetrics = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const panel = document.getElementById("feature-glass-panel");

    if (!panel) {
      return null;
    }

    const panelRect = panel.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;

    return {
      centerX: panelRect.left + panelRect.width / 2,
      centerY: panelRect.top + panelRect.height / 2,
      width,
      height,
      insetX: width * 0.02,
      insetY: height * 0.02,
    };
  };

  const isPointInsideFeaturePanel = (point: Point, metrics: NonNullable<ReturnType<typeof getFeaturePanelMetrics>>) => {
    const cos = Math.cos(-featurePanelRotation);
    const sin = Math.sin(-featurePanelRotation);
    const dx = point.x - metrics.centerX;
    const dy = point.y - metrics.centerY;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return (
      Math.abs(localX) <= metrics.width / 2 - metrics.insetX &&
      Math.abs(localY) <= metrics.height / 2 - metrics.insetY
    );
  };

  const isPointInsideFeatureSubbox = (
    point: Point,
    metrics: NonNullable<ReturnType<typeof getFeaturePanelMetrics>>
  ) => {
    const cos = Math.cos(-featurePanelRotation);
    const sin = Math.sin(-featurePanelRotation);
    const dx = point.x - metrics.centerX;
    const dy = point.y - metrics.centerY;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const subboxCenterY = -metrics.height * 0.08;
    const subboxHalfWidth = metrics.width * 0.36;
    const subboxHalfHeight = metrics.height * 0.15;

    return Math.abs(localX) <= subboxHalfWidth && Math.abs(localY - subboxCenterY) <= subboxHalfHeight;
  };

  const isPointInsideVaultButton = (
    point: Point,
    metrics: NonNullable<ReturnType<typeof getFeaturePanelMetrics>>
  ) => {
    const cos = Math.cos(-featurePanelRotation);
    const sin = Math.sin(-featurePanelRotation);
    const dx = point.x - metrics.centerX;
    const dy = point.y - metrics.centerY;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const buttonCenterY = -metrics.height * 0.024;
    const buttonRadius = Math.min(metrics.width * 0.22, 58);

    return Math.hypot(localX, localY - buttonCenterY) <= buttonRadius;
  };

  const getRectCorners = (rect: DOMRect): Point[] => [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ];

  const getFeaturePanelCorners = (metrics: NonNullable<ReturnType<typeof getFeaturePanelMetrics>>): Point[] => {
    const halfWidth = metrics.width / 2 - metrics.insetX;
    const halfHeight = metrics.height / 2 - metrics.insetY;
    const cos = Math.cos(featurePanelRotation);
    const sin = Math.sin(featurePanelRotation);

    return [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ].map((point) => ({
      x: metrics.centerX + point.x * cos - point.y * sin,
      y: metrics.centerY + point.x * sin + point.y * cos,
    }));
  };

  const isPointInsideRect = (point: Point, rect: DOMRect) =>
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;

  const doesRectIntersectFeaturePanel = (
    rect: DOMRect,
    metrics: NonNullable<ReturnType<typeof getFeaturePanelMetrics>>
  ) => {
    const rectCorners = getRectCorners(rect);

    if (rectCorners.some((point) => isPointInsideFeaturePanel(point, metrics))) {
      return true;
    }

    return getFeaturePanelCorners(metrics).some((point) => isPointInsideRect(point, rect));
  };

  const updateFeaturePanelArmed = () => {
    const featurePanelMetrics = getFeaturePanelMetrics();

    if (!featurePanelMetrics) {
      setFeaturePanelArmed(false);
      setFeaturePanelVaultOpen(false);
      return;
    }

    const puzzleAllowsPanel = secretOrderMatchedRef.current && !passwordRejectedForCurrentSolve;

    setFeaturePanelArmed((previouslyArmed) => {
      if (puzzleAllowsPanel && !previouslyArmed) {
        setFeaturePanelArmedAt(Date.now());
      }

      if (!puzzleAllowsPanel && previouslyArmed) {
        setFeaturePanelArmedAt(null);
      }

      return puzzleAllowsPanel;
    });

    if (!puzzleAllowsPanel) {
      setFeaturePanelArmedAt(null);
      setFeaturePanelOutlineSweeping(false);
      setFeaturePanelVaultOpen(false);
    }
  };

  const isSecretWordMatched = (letterIds: string[], expectedOrder: string, maxXGaps: number[]) => {
    const letterPositions = letterIds
      .map((id) => {
        const letterRef = secretLetterRefs.current[id];

        if (!letterRef) {
          return null;
        }

        const letterRect = letterRef.getBoundingClientRect();
        const secretLetter = letterRef.dataset.secretLetter;

        if (!secretLetter) {
          return null;
        }

        return {
          letter: secretLetter,
          x: letterRect.left + letterRect.width / 2,
          y: letterRect.top + letterRect.height / 2,
        };
      })
      .filter((item): item is { letter: string; x: number; y: number } => Boolean(item));

    if (letterPositions.length !== letterIds.length) {
      return false;
    }

    const sortedLetters = [...letterPositions].sort((first, second) => first.x - second.x);
    const yValues = sortedLetters.map((item) => item.y);
    const yRange = Math.max(...yValues) - Math.min(...yValues);
    const xGaps = sortedLetters.slice(1).map((item, index) => item.x - sortedLetters[index].x);
    const lettersAreInALine =
      yRange <= secretOrderYMargin &&
      xGaps.every(
        (gap, index) => gap >= secretOrderMinXGap && gap <= (maxXGaps[index] ?? maxXGaps[0])
      );

    const currentOrder = sortedLetters
      .map((item) => item.letter)
      .join("");
    return lettersAreInALine && currentOrder === expectedOrder;
  };

  const updateSecretLetterOrder = () => {
    const secretOrderMatched = isSecretWordMatched(allyLetterIds, allyLetterOrder, allyOrderMaxXGaps);
    const rickrollOrderMatched = isSecretWordMatched(rickrollLetterIds, rickrollLetterOrder, rickrollOrderMaxXGaps);

    if (secretOrderMatched && !secretOrderMatchedRef.current) {
      setPasswordRejectedForCurrentSolve(false);
      setFeaturePanelArmed(true);
      setFeaturePanelArmedAt(Date.now());
    }

    if (!secretOrderMatched && secretOrderMatchedRef.current) {
      setPasswordPromptOpen(false);
      setPasswordValue("");
      setPasswordRejectedForCurrentSolve(false);
      setFeaturePanelArmed(false);
      setFeaturePanelArmedAt(null);
    }

    secretOrderMatchedRef.current = secretOrderMatched;
    setSecretOrderMatched(secretOrderMatched);

    if (rickrollOrderMatched && !rickrollOrderMatchedRef.current) {
      setRickrollOpen(true);
    }

    rickrollOrderMatchedRef.current = rickrollOrderMatched;
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      updateFeaturePanelArmed();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isMobileViewport]);

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

  const handleFeaturePanelClick = (point = pointerPositionRef.current) => {
    if (featurePanelVaultOpen || featurePanelOutlineSweeping || passwordPromptOpen) {
      return;
    }

    const featurePanelMetrics = getFeaturePanelMetrics();
    const clickedFeatureSubbox = Boolean(
      point && featurePanelMetrics && isPointInsideFeatureSubbox(point, featurePanelMetrics)
    );

    if (
      !featurePanelArmed ||
      !secretOrderMatched ||
      passwordRejectedForCurrentSolve ||
      !clickedFeatureSubbox ||
      featurePanelArmedAt === null ||
      Date.now() < featurePanelArmedAt
    ) {
      return;
    }

    setPasswordValue("");
    setPasswordPromptOpen(true);
  };

  const openFeaturePanelVault = () => {
    if (featurePanelOutlineSweepTimeoutRef.current) {
      window.clearTimeout(featurePanelOutlineSweepTimeoutRef.current);
    }

    if (featurePanelVaultOpenTimeoutRef.current) {
      window.clearTimeout(featurePanelVaultOpenTimeoutRef.current);
    }

    setFeaturePanelOutlineSweeping(false);
    window.requestAnimationFrame(() => {
      setFeaturePanelOutlineSweeping(true);
    });

    featurePanelOutlineSweepTimeoutRef.current = window.setTimeout(() => {
      setFeaturePanelOutlineSweeping(false);
    }, featurePanelOutlineShineDurationMs);

    featurePanelVaultOpenTimeoutRef.current = window.setTimeout(() => {
      setFeaturePanelVaultOpen(true);
    }, featurePanelOutlineShineDurationMs);
  };

  const handlePasswordSubmit = () => {
    if (passwordValue === allyPassword) {
      setPasswordPromptOpen(false);
      setPasswordValue("");
      openFeaturePanelVault();
      return;
    }

    setPasswordPromptOpen(false);
    setPasswordValue("");
    setPasswordRejectedForCurrentSolve(true);
    setFeaturePanelArmed(false);
    setFeaturePanelArmedAt(null);
  };

  const handleVaultButtonClick = (event?: MouseEvent<HTMLButtonElement>) => {
    if (vaultSweepTimeoutRef.current) {
      window.clearTimeout(vaultSweepTimeoutRef.current);
    }

    if (vaultNavigateTimeoutRef.current) {
      window.clearTimeout(vaultNavigateTimeoutRef.current);
    }

    const buttonRect = event?.currentTarget.getBoundingClientRect();
    const centerX = buttonRect ? buttonRect.left + buttonRect.width / 2 : pointerPositionRef.current?.x;
    const centerY = buttonRect ? buttonRect.top + buttonRect.height / 2 : pointerPositionRef.current?.y;

    vaultNavigateTimeoutRef.current = window.setTimeout(() => {
      runRadialPageTransition({
        centerX,
        centerY,
        glow: "rgba(176, 136, 255, 0.84)",
        navigate,
        to: "/ally",
      });
    }, 520);
  };

  useEffect(() => {
    if (!featurePanelVaultOpen) {
      setVaultButtonSweeping(false);
      return;
    }

    if (vaultSweepTimeoutRef.current) {
      window.clearTimeout(vaultSweepTimeoutRef.current);
    }

    vaultSweepTimeoutRef.current = window.setTimeout(() => {
      setVaultButtonSweeping(false);
      window.requestAnimationFrame(() => {
        setVaultButtonSweeping(true);
      });

      vaultSweepTimeoutRef.current = window.setTimeout(() => {
        setVaultButtonSweeping(false);
      }, vaultButtonShineDurationMs);
    }, vaultDoorOpenDelayMs + vaultDoorOpenDurationMs);

    return () => {
      if (vaultSweepTimeoutRef.current) {
        window.clearTimeout(vaultSweepTimeoutRef.current);
      }
    };
  }, [featurePanelVaultOpen]);

  useEffect(() => {
    const updatePointerPosition = (event: PointerEvent) => {
      pointerPositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleWindowClick = (event: globalThis.MouseEvent) => {
      const clickPoint = { x: event.clientX, y: event.clientY };
      const featurePanelMetrics = getFeaturePanelMetrics();

      if (featurePanelVaultOpen && featurePanelMetrics && isPointInsideVaultButton(clickPoint, featurePanelMetrics)) {
        handleVaultButtonClick();
        return;
      }

      handleFeaturePanelClick(clickPoint);
    };

    const clearPointerPosition = () => {
      pointerPositionRef.current = null;
    };

    window.addEventListener("pointermove", updatePointerPosition);
    window.addEventListener("click", handleWindowClick);
    window.addEventListener("pointerleave", clearPointerPosition);

    return () => {
      window.removeEventListener("pointermove", updatePointerPosition);
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("pointerleave", clearPointerPosition);
    };
  }, [featurePanelArmed, featurePanelArmedAt, featurePanelVaultOpen, navigate]);

  return (
    <div
      ref={dragBoundsRef}
      className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500"
    >
      <AnimatePresence>
        {transitionState ? (
          <Suspense fallback={null}>
            <RouteTransitionOverlay
              initialClipPath={transitionState.clipPath}
              animateToClipPath="inset(0px 0px 0px 0px round 2.4rem)"
            />
          </Suspense>
        ) : null}

        {passwordPromptOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(10,7,22,0.62)] px-5 backdrop-blur-md"
          >
            <motion.div
              initial={skipEntranceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={skipEntranceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full max-w-[420px] overflow-hidden rounded-[1.25rem] border border-white/14 bg-[rgba(25,21,43,0.95)] p-4 shadow-[0_32px_110px_rgba(5,2,16,0.58)]"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handlePasswordSubmit();
                }}
              >
                <input
                  autoFocus
                  aria-label="Password"
                  value={passwordValue}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  className="h-12 w-full rounded-none border border-white/18 bg-white text-black outline-none"
                />
                <button
                  type="submit"
                  aria-label="Submit password"
                  className="mt-4 h-10 w-full rounded-none border border-white/18 bg-white text-black"
                />
              </form>
            </motion.div>
          </motion.div>
        ) : null}

        {rickrollOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[320] flex items-center justify-center bg-[rgba(10,7,22,0.74)] px-5 backdrop-blur-md"
            onClick={() => setRickrollOpen(false)}
          >
            <motion.div
              initial={skipEntranceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={skipEntranceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full max-w-[780px] overflow-hidden rounded-[1.25rem] border border-white/14 bg-[rgba(25,21,43,0.95)] p-4 shadow-[0_32px_110px_rgba(5,2,16,0.58)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-display text-xs uppercase tracking-[0.32em] text-primary/90">Absar</p>
                <button
                  type="button"
                  aria-label="Close video"
                  onClick={() => setRickrollOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white/82 transition hover:bg-white/14"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="aspect-video overflow-hidden rounded-[0.9rem] bg-black">
                <iframe
                  title="Absar"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <HomeBackdrop
        featurePanelArmed={featurePanelArmed}
        featurePanelOutlineSweeping={featurePanelOutlineSweeping}
        featurePanelVaultOpen={featurePanelVaultOpen}
        vaultButtonSweeping={vaultButtonSweeping}
        onFeaturePanelClick={handleFeaturePanelClick}
        onVaultButtonClick={handleVaultButtonClick}
      />

      <main className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-full border border-white/28 bg-white/34 px-4 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]">
            <p className="font-display text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
              Arkan Dave / Portfolio
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-[3rem] w-[11.5rem] rounded-full border border-white/16 bg-white/12 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05]" />
            }
          >
            <ThemeToggle />
          </Suspense>
        </div>

        <div className="relative flex flex-1 items-center py-10 sm:py-14">
          <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-10 xl:gap-14">
            <div className="relative z-[120]">
              <motion.div
                initial={skipEntranceMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
                className="inline-flex items-center rounded-full border border-primary/18 bg-white/38 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-primary/90 shadow-[0_16px_38px_rgba(171,132,46,0.12)] backdrop-blur-lg dark:border-white/10 dark:bg-white/[0.05]"
              >
                <span className="mr-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_hsla(var(--primary)/0.75)]" />
                <motion.span
                  ref={(node) => {
                    secretLetterRefs.current["badge-b"] = node;
                  }}
                  data-secret-letter="b"
                  drag
                  dragConstraints={dragBoundsRef}
                  dragElastic={0.12}
                  dragMomentum={false}
                  onDrag={updateSecretLetterOrder}
                  onDragEnd={updateSecretLetterOrder}
                  whileDrag={{ scale: 1.16, cursor: "grabbing", zIndex: 999 }}
                  className="relative z-[90] inline-block cursor-grab select-none active:cursor-grabbing"
                  title="Drag B"
                  style={{ touchAction: "none" }}
                >
                  B
                </motion.span>
                <motion.span
                  ref={(node) => {
                    secretLetterRefs.current["bio-i"] = node;
                  }}
                  data-secret-letter="i"
                  drag
                  dragConstraints={dragBoundsRef}
                  dragElastic={0.12}
                  dragMomentum={false}
                  onDrag={updateSecretLetterOrder}
                  onDragEnd={updateSecretLetterOrder}
                  whileDrag={{ scale: 1.16, cursor: "grabbing", zIndex: 999 }}
                  className="relative z-[90] inline-block cursor-grab select-none active:cursor-grabbing"
                  title="Drag i"
                  style={{ touchAction: "none" }}
                >
                  i
                </motion.span>
                omedical engineering, interfaces,
                <span aria-hidden="true" className="inline-block w-[0.32em]" />
                <motion.span
                  ref={(node) => {
                    secretLetterRefs.current["badge-s"] = node;
                  }}
                  data-secret-letter="s"
                  drag
                  dragConstraints={dragBoundsRef}
                  dragElastic={0.12}
                  dragMomentum={false}
                  onDrag={updateSecretLetterOrder}
                  onDragEnd={updateSecretLetterOrder}
                  whileDrag={{ scale: 1.16, cursor: "grabbing", zIndex: 999 }}
                  className="relative z-[90] inline-block cursor-grab select-none active:cursor-grabbing"
                  title="Drag s"
                  style={{ touchAction: "none" }}
                >
                  s
                </motion.span>
                ystems
              </motion.div>

              <motion.div
                initial={skipEntranceMotion ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut", delay: 0.08 }}
                className="mt-8 max-w-[48rem]"
              >
                <p className="font-display text-[10px] tracking-[0.34em] uppercase text-muted-foreground">
                  Portfolio / selected work
                </p>
                <h1 className="mt-4 font-serif text-[clamp(4.2rem,9vw,8.5rem)] leading-[0.9] tracking-[-0.05em] text-foreground">
                  <span className="relative z-[80] inline-flex items-center">
                    {givenNameLetters.map((letter) => (
                      <motion.span
                        key={letter.id}
                        ref={(node) => {
                          if (letter.secret) {
                            secretLetterRefs.current[letter.id] = node;
                          }
                        }}
                        data-secret-letter={letter.secret}
                        drag
                        dragConstraints={dragBoundsRef}
                        dragElastic={0.12}
                        dragMomentum={false}
                        onDrag={updateSecretLetterOrder}
                        onDragEnd={updateSecretLetterOrder}
                        whileDrag={{
                          scale: 1.06,
                          cursor: "grabbing",
                          zIndex: 999,
                        }}
                        className="relative z-[90] inline-block cursor-grab select-none px-[0.01em] active:cursor-grabbing"
                        title={`Drag ${letter.display}`}
                        style={{ touchAction: "none" }}
                      >
                        {letter.display}
                      </motion.span>
                    ))}
                  </span>{" "}
                  <span className="relative z-[80] inline-flex items-center">
                    {surnameLetters.map((letter) => (
                      <motion.span
                        key={letter.id}
                        drag
                        dragConstraints={dragBoundsRef}
                        dragElastic={0.12}
                        dragMomentum={false}
                        onDrag={updateSecretLetterOrder}
                        onDragEnd={updateSecretLetterOrder}
                        whileDrag={{
                          scale: 1.06,
                          cursor: "grabbing",
                          zIndex: 999,
                        }}
                        className="relative z-[90] inline-block cursor-grab select-none px-[0.01em] active:cursor-grabbing"
                        title={`Drag ${letter.display}`}
                        style={{ touchAction: "none" }}
                      >
                        {letter.display}
                      </motion.span>
                    ))}
                  </span>
                </h1>
                <p className="mt-6 max-w-[30rem] text-base leading-8 text-foreground/78 sm:text-lg lg:max-w-[34rem]">
                  I’m a biomedical engineering student interested in building technical work that
                  feels rigorous, usable, and visually clear, from research-heavy vi
                  <motion.span
                    ref={(node) => {
                      secretLetterRefs.current["copy-z"] = node;
                    }}
                    data-secret-letter="z"
                    drag
                    dragConstraints={dragBoundsRef}
                    dragElastic={0.12}
                    dragMomentum={false}
                    onDrag={updateSecretLetterOrder}
                    onDragEnd={updateSecretLetterOrder}
                    whileDrag={{ scale: 1.16, cursor: "grabbing", zIndex: 999 }}
                    className="relative z-[90] inline-block cursor-grab select-none active:cursor-grabbing"
                    title="Drag z"
                    style={{ touchAction: "none" }}
                  >
                    z
                  </motion.span>
                  ualization and experimentation to projects that need structure, iteration, and strong presentation.
                </p>
              </motion.div>

              <motion.div
                initial={skipEntranceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/projects"
                  onClick={(event) => handleDockNavigation(event, "/projects")}
                  className="group inline-flex items-center gap-3 rounded-full border border-primary/22 bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_18px_38px_rgba(173,133,37,0.26)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(173,133,37,0.34)] dark:border-primary/30"
                >
                  Explore projects
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/cv"
                  onClick={(event) => handleDockNavigation(event, "/cv")}
                  className="inline-flex items-center rounded-full border border-white/28 bg-white/40 px-6 py-3 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/54 dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                >
                  View CV
                </Link>
              </motion.div>

              <motion.div
                initial={skipEntranceMotion ? false : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="mt-10 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)]"
              >
                <div className="rounded-[2rem] border border-white/30 bg-white/30 p-6 shadow-[0_26px_70px_rgba(173,133,37,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="font-display text-[10px] tracking-[0.32em] uppercase text-primary/80">
                    Areas of interest
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {focusPills.map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-white/28 bg-white/54 px-3 py-2 text-sm text-foreground/82 dark:border-white/10 dark:bg-white/[0.06]"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 max-w-[30rem] text-sm leading-7 text-muted-foreground">
                    I’m especially drawn to work that sits between engineering, research, and
                    communication, where the challenge is not just solving the problem, but making
                    the solution understandable and useful.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/28 bg-white/24 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="font-display text-[10px] tracking-[0.32em] uppercase text-primary/80">
                    Current work
                  </p>
                  <div className="mt-4 space-y-4">
                    {currentWork.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[1.4rem] border border-white/24 bg-white/40 px-4 py-4 dark:border-white/10 dark:bg-white/[0.05]"
                      >
                        <p className="font-display text-[10px] tracking-[0.28em] uppercase text-primary/78">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg text-foreground">{item.title}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {item.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.aside
              initial={skipEntranceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.85, ease: "easeOut", delay: 0.16 }}
              className="relative z-10"
            >
              <div className="rounded-[2.4rem] border border-white/30 bg-white/24 p-4 shadow-[0_34px_95px_rgba(173,133,37,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
                <div className="rounded-[1.9rem] border border-white/22 bg-white/38 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="font-display text-[10px] tracking-[0.32em] uppercase text-primary/82">
                    Navigate
                  </p>
                  <p className="mt-3 max-w-[30rem] text-sm leading-6 text-muted-foreground">
                    Selected work, research, experience, and the background behind it.
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.to}
                        initial={skipEntranceMotion ? false : { opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={
                          skipEntranceMotion
                            ? { duration: 0 }
                            : { duration: 0.55, ease: "easeOut", delay: 0.24 + index * 0.08 }
                        }
                      >
                        <Link
                          to={item.to}
                          onClick={(event) => handleDockNavigation(event, item.to)}
                          className="group flex items-start gap-4 rounded-[1.7rem] border border-white/24 bg-white/44 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/58 hover:shadow-[0_18px_40px_rgba(173,133,37,0.15)] dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/60 text-primary shadow-[0_10px_24px_rgba(173,133,37,0.12)] dark:border-white/10 dark:bg-white/[0.06]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xl leading-none text-foreground">{item.label}</p>
                              <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                                {item.index}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {item.summary}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {quickNotes.map((note) => (
                    <div
                      key={note.label}
                      className="rounded-[1.4rem] border border-white/22 bg-white/30 px-4 py-4 backdrop-blur-lg dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <p className="font-display text-[10px] tracking-[0.28em] uppercase text-primary/78">
                        {note.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-foreground/82">{note.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
