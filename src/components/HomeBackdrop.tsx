import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface HomeBackdropProps {
  className?: string;
  featurePanelArmed?: boolean;
  featurePanelOutlineSweeping?: boolean;
  featurePanelVaultOpen?: boolean;
  vaultButtonSweeping?: boolean;
  onFeaturePanelClick?: (point: { x: number; y: number }) => void;
  onVaultButtonClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

// The homepage keeps its richer layered glass backdrop separate from the simpler subpage gradients.
const HomeBackdrop = ({
  className,
  featurePanelArmed = false,
  featurePanelOutlineSweeping = false,
  featurePanelVaultOpen = false,
  vaultButtonSweeping = false,
  onFeaturePanelClick,
  onVaultButtonClick,
}: HomeBackdropProps) => {
  const vaultDoorClass =
    "border-primary/14 bg-white/26 backdrop-blur-[30px] dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(245,232,199,0.78)_42%,rgba(221,188,113,0.38))] dark:bg-[linear-gradient(145deg,rgba(11,10,20,0.96),rgba(28,24,52,0.92)_40%,rgba(74,46,124,0.82))]" />
      <div className="absolute inset-0 md:hidden bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.28),transparent_40%),radial-gradient(circle_at_84%_14%,rgba(171,132,46,0.22),transparent_34%)] dark:bg-[radial-gradient(circle_at_18%_28%,rgba(166,124,255,0.2),transparent_40%),radial-gradient(circle_at_84%_14%,rgba(103,71,188,0.26),transparent_34%)]" />
      <div className="absolute -left-[11%] top-[15%] hidden h-[46vh] w-[38vw] rotate-[13deg] rounded-[4.5rem] border border-white/30 bg-white/34 shadow-[0_30px_95px_rgba(181,149,70,0.16)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_28px_120px_rgba(7,5,18,0.55)] md:block" />
      <motion.div
        id="feature-glass-panel"
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          onFeaturePanelClick?.({ x: event.clientX, y: event.clientY });
        }}
        animate={{
          rotate: -8,
          scale: 1,
          boxShadow: "0 28px 90px rgba(191,156,73,0.10)",
        }}
        whileTap={featurePanelArmed ? { scale: 0.995 } : undefined}
        transition={{ duration: 0.3, ease: "easeOut" }}
        aria-label="Hidden floating panel"
        className={cn(
          "pointer-events-auto absolute left-[24%] top-[10%] hidden h-[65vh] w-[21vw] overflow-visible rounded-[4.25rem] border bg-white/26 backdrop-blur-[30px] transition-all duration-300 md:block",
          "border-primary/14 shadow-[0_28px_90px_rgba(191,156,73,0.10)] dark:border-white/10 dark:bg-white/[0.04]"
        )}
        >
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-[14%] top-[35%] h-[30%] w-[72%] opacity-0",
              featurePanelOutlineSweeping ? "opacity-100" : ""
            )}
          >
            <svg
              className="feature-outline-flash h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <rect
                className={cn("feature-outline-flash-path", featurePanelOutlineSweeping ? "feature-outline-flash-active" : "")}
                x="1"
                y="1"
                width="98"
                height="98"
                rx="22"
                ry="22"
                pathLength="1"
              />
            </svg>
          </div>
          <motion.div
            aria-hidden={!featurePanelVaultOpen}
          initial={false}
          animate={
            featurePanelVaultOpen
              ? {
                  opacity: [0, 1, 1],
                  scale: [0.98, 0.98, 1.04],
                  x: "-50%",
                  y: ["-50%", "-50%", "-58%"],
                  boxShadow: [
                    "0 10px 30px rgba(6,3,18,0.06)",
                    "0 10px 30px rgba(6,3,18,0.06)",
                    "0 36px 96px rgba(6,3,18,0.34)",
                  ],
                }
              : {
                  opacity: 0,
                  scale: 0.92,
                  x: "-50%",
                  y: "-50%",
                  boxShadow: "0 10px 30px rgba(6,3,18,0.06)",
                }
          }
          transition={{ duration: 4.8, times: [0, 0.22, 1], ease: [0.08, 0.72, 0.16, 1] }}
          className="absolute left-1/2 top-1/2 h-[30%] w-[72%] overflow-visible rounded-[2.4rem] [transform-style:preserve-3d]"
        >
          <motion.div
            initial={false}
            animate={featurePanelVaultOpen ? { opacity: [0, 1, 0.18] } : { opacity: 0 }}
            transition={{ duration: 4.8, times: [0, 0.18, 1], ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-30 rounded-[2.4rem] border border-white/22 shadow-[0_0_34px_rgba(170,130,255,0.14)] dark:border-white/12"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-[2px] right-[2px] rounded-[2.3rem] bg-transparent shadow-[inset_0_0_34px_rgba(7,4,18,0.34)]"
          />
          <motion.div
            initial={false}
            animate={featurePanelVaultOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.82 }}
            transition={{ duration: 0.25, delay: featurePanelVaultOpen ? 1.1 : 0, ease: "easeOut" }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onVaultButtonClick?.(event);
              }}
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-[radial-gradient(circle_at_33%_25%,rgba(245,236,255,0.96)_0%,rgba(185,142,255,0.96)_34%,rgba(119,72,211,1)_72%)] font-display text-[10px] uppercase tracking-[0.24em] text-white shadow-[0_12px_0_rgba(59,33,125,0.96),0_16px_20px_rgba(44,25,102,0.38),inset_0_3px_0_rgba(255,255,255,0.42),inset_0_-8px_0_rgba(73,39,154,0.44)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_8px_0_rgba(59,33,125,0.96),0_10px_14px_rgba(44,25,102,0.36),inset_0_3px_0_rgba(255,255,255,0.36),inset_0_-7px_0_rgba(73,39,154,0.44)]"
            >
              <span
                className={cn(
                  "vault-button-sheen pointer-events-none absolute inset-y-0 -left-[140%] w-[90%] rotate-12 bg-white/45 blur-sm",
                  vaultButtonSweeping ? "vault-button-sheen-active" : ""
                )}
              />
              <span className="relative z-10">Ally</span>
            </button>
          </motion.div>

          <motion.div
            initial={false}
            animate={featurePanelVaultOpen ? { opacity: 1, x: "-95%", rotateY: -16 } : { opacity: 0, x: "0%", rotateY: 0 }}
            transition={{
              opacity: { duration: 1.2, delay: featurePanelVaultOpen ? 0.7 : 0, ease: "easeOut" },
              x: { duration: 6.2, delay: featurePanelVaultOpen ? 4.8 : 0, ease: "linear" },
              rotateY: { duration: 6.2, delay: featurePanelVaultOpen ? 4.8 : 0, ease: "linear" },
            }}
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 origin-left rounded-l-[2.4rem] rounded-r-none border shadow-[inset_0_1px_0_rgba(255,255,255,0.12),10px_0_30px_rgba(7,4,18,0.28)]",
              vaultDoorClass
            )}
          />
          <motion.div
            initial={false}
            animate={featurePanelVaultOpen ? { opacity: 1, x: "95%", rotateY: 16 } : { opacity: 0, x: "0%", rotateY: 0 }}
            transition={{
              opacity: { duration: 1.2, delay: featurePanelVaultOpen ? 0.7 : 0, ease: "easeOut" },
              x: { duration: 6.2, delay: featurePanelVaultOpen ? 4.8 : 0, ease: "linear" },
              rotateY: { duration: 6.2, delay: featurePanelVaultOpen ? 4.8 : 0, ease: "linear" },
            }}
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 origin-right rounded-l-none rounded-r-[2.4rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.12),-10px_0_30px_rgba(7,4,18,0.26)]",
              vaultDoorClass
            )}
          />
        </motion.div>
      </motion.div>
      <div className="absolute right-[-4%] top-[8%] hidden h-[75vh] w-[31vw] rotate-[7deg] rounded-[5rem] border border-primary/14 bg-primary/14 shadow-[0_26px_88px_rgba(155,119,33,0.12)] backdrop-blur-[26px] dark:border-white/10 dark:bg-primary/12 dark:shadow-[0_28px_96px_rgba(38,22,76,0.35)] md:block" />
      <div className="absolute bottom-[-10%] left-[31%] hidden h-[31vh] w-[43vw] -rotate-[8deg] rounded-[5rem] border border-white/22 bg-white/20 shadow-[0_24px_70px_rgba(191,156,73,0.08)] backdrop-blur-[24px] dark:border-white/10 dark:bg-white/[0.03] md:block" />
      <div className="absolute bottom-[11%] left-[46%] hidden h-[22vh] w-[14vw] rotate-[11deg] rounded-[3rem] border border-primary/12 bg-white/16 backdrop-blur-[22px] dark:border-white/10 dark:bg-primary/[0.06] xl:block" />
      <div className="absolute left-[9%] top-[69%] hidden h-56 w-56 rounded-full bg-white/18 blur-[90px] dark:bg-primary/10 md:block" />
      <div className="absolute right-[12%] top-[17%] hidden h-64 w-64 rounded-full bg-primary/16 blur-[105px] dark:bg-primary/14 md:block" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(176,129,26,0.22),transparent_25%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(160,120,255,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(93,65,170,0.24),transparent_25%)]" />
    </div>
  );
};

export default HomeBackdrop;
