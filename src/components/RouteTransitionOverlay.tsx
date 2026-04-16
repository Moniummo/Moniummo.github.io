import { useEffect, useState } from "react";
import HomeBackdrop from "@/components/HomeBackdrop";
import SubpageBackdrop from "@/components/SubpageBackdrop";

interface RouteTransitionOverlayProps {
  animateToClipPath: string;
  backdrop?: "home" | "subpage";
  initialClipPath: string;
}

// This overlay reuses the subpage shell so route transitions feel like the same surface moving.
const RouteTransitionOverlay = ({
  animateToClipPath,
  backdrop = "subpage",
  initialClipPath,
}: RouteTransitionOverlayProps) => {
  const [clipPath, setClipPath] = useState(initialClipPath);

  useEffect(() => {
    setClipPath(initialClipPath);
    const raf = window.requestAnimationFrame(() => {
      setClipPath(animateToClipPath);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [animateToClipPath, initialClipPath]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
      style={{
        clipPath,
        transition: "clip-path 680ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {backdrop === "home" ? <HomeBackdrop /> : <SubpageBackdrop />}
    </div>
  );
};

export default RouteTransitionOverlay;
