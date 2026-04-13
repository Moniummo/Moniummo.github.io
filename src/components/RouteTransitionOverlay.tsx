import { motion } from "framer-motion";
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
  return (
    <motion.div
      initial={{ clipPath: initialClipPath, opacity: 1 }}
      animate={{ clipPath: animateToClipPath, opacity: 1 }}
      transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
    >
      {backdrop === "home" ? <HomeBackdrop /> : <SubpageBackdrop />}
    </motion.div>
  );
};

export default RouteTransitionOverlay;
