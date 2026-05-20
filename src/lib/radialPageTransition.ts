import { flushSync } from "react-dom";
import type { NavigateFunction } from "react-router-dom";

interface RadialViewTransition {
  finished: Promise<void>;
}

interface RadialTransitionDocument extends Document {
  startViewTransition?: (callback: () => Promise<void> | void) => RadialViewTransition;
}

interface RadialPageTransitionOptions {
  centerX?: number;
  centerY?: number;
  glow?: string;
  navigate: NavigateFunction;
  to: string;
}

export const runRadialPageTransition = ({
  centerX = window.innerWidth / 2,
  centerY = window.innerHeight / 2,
  glow = "rgba(176, 136, 255, 0.84)",
  navigate,
  to,
}: RadialPageTransitionOptions) => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transitionDocument = document as RadialTransitionDocument;

  if (prefersReducedMotion || !transitionDocument.startViewTransition) {
    navigate(to);
    return;
  }

  const maxRadius = Math.hypot(
    Math.max(centerX, window.innerWidth - centerX),
    Math.max(centerY, window.innerHeight - centerY),
  );

  document.documentElement.style.setProperty("--page-transition-x", `${centerX}px`);
  document.documentElement.style.setProperty("--page-transition-y", `${centerY}px`);
  document.documentElement.style.setProperty("--page-transition-radius", `${maxRadius}px`);
  document.documentElement.style.setProperty("--page-transition-glow", glow);
  document.documentElement.classList.add("page-transition-active");

  const transition = transitionDocument.startViewTransition(() => {
    flushSync(() => {
      navigate(to);
    });
  });

  void transition.finished
    .catch(() => undefined)
    .finally(() => {
      document.documentElement.classList.remove("page-transition-active");
    });
};
