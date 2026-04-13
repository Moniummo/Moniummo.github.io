import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";

const motionEase = [0.22, 1, 0.36, 1] as const;
const closeDelayMs = 220;

const projects = [
  {
    title: "Project One",
    note: "Placeholder layout for the first project page.",
  },
  {
    title: "Project Two",
    note: "Placeholder layout for the second project page.",
  },
  {
    title: "Project Three",
    note: "Placeholder layout for the third project page.",
  },
  {
    title: "Project Four",
    note: "Placeholder layout for the fourth project page.",
  },
  {
    title: "Project Five",
    note: "Placeholder layout for the fifth project page.",
  },
  {
    title: "Project Six",
    note: "Placeholder layout for the sixth project page.",
  },
  {
    title: "Project Seven",
    note: "Placeholder layout for the seventh project page.",
  },
  {
    title: "Project Eight",
    note: "Placeholder layout for the eighth project page.",
  },
];

interface OrbitMetrics {
  buttonSize: number;
  cardHeight: number;
  cardWidth: number;
  imageHeight: number;
  radius: number;
  stageSize: number;
}

const getOrbitMetrics = (): OrbitMetrics => {
  if (typeof window === "undefined") {
    return {
      buttonSize: 204,
      cardHeight: 126,
      cardWidth: 164,
      imageHeight: 72,
      radius: 230,
      stageSize: 660,
    };
  }

  if (window.innerWidth >= 1440) {
    return {
      buttonSize: 228,
      cardHeight: 138,
      cardWidth: 178,
      imageHeight: 78,
      radius: 300,
      stageSize: 760,
    };
  }

  if (window.innerWidth >= 1100) {
    return {
      buttonSize: 208,
      cardHeight: 126,
      cardWidth: 164,
      imageHeight: 72,
      radius: 230,
      stageSize: 660,
    };
  }

  if (window.innerWidth >= 768) {
    return {
      buttonSize: 176,
      cardHeight: 110,
      cardWidth: 138,
      imageHeight: 58,
      radius: 186,
      stageSize: 540,
    };
  }

  return {
    buttonSize: 138,
    cardHeight: 92,
    cardWidth: 112,
    imageHeight: 42,
    radius: 132,
    stageSize: 380,
  };
};

const Projects = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isFloatingHovered, setIsFloatingHovered] = useState(false);
  const [isFloatingPinned, setIsFloatingPinned] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<OrbitMetrics>(getOrbitMetrics);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedSectionRef = useRef<HTMLDivElement | null>(null);
  const selectorAnchorRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingSelector, setShowFloatingSelector] = useState(false);

  const isExpanded = isHovered || isPinned;
  const isFloatingExpanded = showFloatingSelector && (isFloatingHovered || isFloatingPinned);
  const selectedProject = selectedIndex === null ? null : projects[selectedIndex];

  useEffect(() => {
    const handleResize = () => {
      setMetrics(getOrbitMetrics());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedProject || !selectedSectionRef.current) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      selectedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(raf);
  }, [selectedProject]);

  useEffect(() => {
    if (!selectorAnchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingSelector(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(selectorAnchorRef.current);

    return () => observer.disconnect();
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openOrbit = () => {
    clearCloseTimer();
    setIsHovered(true);
  };

  const queueCloseOrbit = () => {
    clearCloseTimer();

    if (isPinned) {
      return;
    }

    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, closeDelayMs);
  };

  const toggleOrbit = () => {
    clearCloseTimer();
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    setIsHovered(nextPinned);
  };

  const openFloatingOrbit = () => {
    setIsFloatingHovered(true);
  };

  const queueCloseFloatingOrbit = () => {
    if (isFloatingPinned) {
      return;
    }

    setIsFloatingHovered(false);
  };

  const toggleFloatingOrbit = () => {
    const nextPinned = !isFloatingPinned;
    setIsFloatingPinned(nextPinned);
    setIsFloatingHovered(nextPinned);
  };

  const floatingMetrics = {
    buttonSize: 68,
    cardHeight: 54,
    cardWidth: 72,
    stackGap: 12,
    stackOffset: 10,
  };

  return (
    <PageLayout title="Projects" mainClassName="max-w-none px-0 sm:px-0">
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[120rem]">
          {/* Enforce a strict 1/3 + 2/3 split on wider viewports so intro and selector stay inline. */}
          <section className="pb-8 pt-2">
            <div className="rounded-[3.8rem] border border-white/32 bg-white/32 p-4 shadow-[0_28px_92px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_34px_110px_rgba(8,5,18,0.5)] sm:rounded-[4.6rem] sm:p-6 lg:p-8">
              <div
                className="grid min-h-[calc(100vh-11rem)] gap-6 lg:gap-8 xl:gap-10"
                style={
                  metrics.stageSize > 380
                    ? { alignItems: "center", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)" }
                    : undefined
                }
              >
                <div ref={selectorAnchorRef} className="flex flex-col justify-center">
                  <div className="rounded-[3.2rem] border border-white/30 bg-white/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:rounded-[3.8rem] sm:p-8">
                    <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">
                      Project Page
                    </p>
                    <h1 className="mt-4 text-3xl text-foreground sm:text-4xl">
                      Explore the work.
                    </h1>
                    <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Hover over the selector to open the project orbit, then choose a tile to
                      open its page below.
                    </p>
                  </div>
                </div>

                <div
                  className="flex min-w-0 items-center justify-center rounded-[3.2rem] border border-white/28 bg-white/22 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[3.8rem] sm:p-4 lg:min-h-[42rem] xl:min-h-[46rem]"
                  style={
                    metrics.stageSize > 380
                      ? { minHeight: `${metrics.stageSize + 64}px` }
                      : undefined
                  }
                >
                  <div
                    className="pointer-events-none relative"
                    style={{
                      height: metrics.stageSize,
                      width: metrics.stageSize,
                    }}
                  >
                    {projects.map((project, index) => {
                      const angle = (Math.PI * 2 * index) / projects.length - Math.PI / 2;
                      const x = Math.cos(angle) * metrics.radius;
                      const y = Math.sin(angle) * metrics.radius;

                      return (
                        <div
                          key={project.title}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <motion.button
                            type="button"
                            initial={false}
                            animate={
                              isExpanded
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                    x,
                                    y,
                                    filter: "blur(0px)",
                                  }
                                : {
                                    opacity: 0,
                                    scale: 0.7,
                                    x: 0,
                                    y: 0,
                                    filter: "blur(14px)",
                                  }
                            }
                            transition={{
                              duration: 0.6,
                              delay: isExpanded ? index * 0.035 : 0,
                              ease: motionEase,
                            }}
                            style={{
                              height: metrics.cardHeight,
                              width: metrics.cardWidth,
                            }}
                            onMouseEnter={openOrbit}
                            onMouseLeave={queueCloseOrbit}
                            onFocus={openOrbit}
                            onBlur={queueCloseOrbit}
                            onClick={() => {
                              clearCloseTimer();
                              setSelectedIndex(index);
                              setIsPinned(true);
                              setIsHovered(true);
                            }}
                            className="pointer-events-auto relative overflow-hidden rounded-[2.2rem] border border-white/22 bg-white/34 p-3 text-left shadow-[0_26px_72px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_66px_rgba(8,5,18,0.5)] sm:rounded-[2.5rem] sm:p-3.5"
                          >
                            <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90" />
                            <div
                              className="rounded-[1.6rem] border border-white/18 bg-gradient-to-br from-white/62 via-white/20 to-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:from-white/[0.14] dark:via-white/[0.05] dark:to-transparent"
                              style={{ height: metrics.imageHeight }}
                            />
                            <div className="mt-3 flex h-[calc(100%-3rem)] items-end sm:mt-3.5">
                              <p className="font-medium leading-tight text-foreground">
                                {project.title}
                              </p>
                            </div>
                          </motion.button>
                        </div>
                      );
                    })}

                    {/* The selector stays centered in the right-hand stage and only changes scale. */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <motion.button
                        type="button"
                        aria-label="Project selector"
                        onMouseEnter={openOrbit}
                        onMouseLeave={queueCloseOrbit}
                        onFocus={openOrbit}
                        onBlur={queueCloseOrbit}
                        onClick={toggleOrbit}
                        animate={
                          isExpanded
                            ? {
                                scale: 1,
                                boxShadow: "0px 28px 110px rgba(173,133,37,0.22)",
                              }
                            : {
                                scale: 0.9,
                                boxShadow: "0px 24px 80px rgba(173,133,37,0.12)",
                              }
                        }
                        transition={{ duration: 0.45, ease: motionEase }}
                        style={{
                          height: metrics.buttonSize,
                          width: metrics.buttonSize,
                        }}
                        className="pointer-events-auto relative overflow-hidden rounded-full border border-white/24 bg-white/18 backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.06]"
                      >
                        <motion.span
                          aria-hidden="true"
                          animate={
                            isExpanded
                              ? { opacity: 0.95, scale: 1.08 }
                              : { opacity: 0.6, scale: 1 }
                          }
                          transition={{ duration: 0.45, ease: motionEase }}
                          className="pointer-events-none absolute -inset-7 rounded-full bg-primary/18 blur-3xl dark:bg-primary/20"
                        />

                        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.72),transparent_32%),radial-gradient(circle_at_72%_78%,rgba(255,255,255,0.08),transparent_42%)]" />
                        <span className="pointer-events-none absolute inset-x-[18%] top-[10%] h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-95" />
                        <span className="pointer-events-none absolute inset-[8%] rounded-full border border-white/16 bg-white/[0.03] dark:border-white/10 dark:bg-white/[0.02]" />

                        <motion.span
                          aria-hidden="true"
                          animate={
                            isExpanded ? { rotate: 360, scale: 1.02 } : { rotate: 0, scale: 1 }
                          }
                          transition={
                            isExpanded
                              ? { duration: 6.6, ease: "linear", repeat: Infinity }
                              : { duration: 0.6, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[22%] rounded-full"
                        >
                          <span className="absolute inset-[8%] rounded-full border border-white/18 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.18),transparent_56%)] dark:border-white/10" />
                          <span className="absolute left-1/2 top-[4%] h-[22%] w-[28%] -translate-x-1/2 rounded-full border border-white/18 bg-gradient-to-br from-white/60 via-white/20 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:from-white/[0.14] dark:via-white/[0.05] dark:to-transparent" />
                          <span className="absolute bottom-[14%] left-[9%] h-[18%] w-[30%] rotate-[28deg] rounded-full border border-white/16 bg-gradient-to-br from-white/42 via-white/14 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent" />
                          <span className="absolute bottom-[14%] right-[9%] h-[18%] w-[30%] -rotate-[28deg] rounded-full border border-white/16 bg-gradient-to-br from-white/42 via-white/14 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent" />
                        </motion.span>

                        <span className="pointer-events-none absolute inset-[30%] rounded-full border border-primary/16 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_68%)] dark:border-primary/22 dark:bg-[radial-gradient(circle_at_center,rgba(167,129,255,0.12),transparent_68%)]" />

                        <motion.span
                          aria-hidden="true"
                          animate={isExpanded ? { rotate: 360 } : { rotate: 0 }}
                          transition={
                            isExpanded
                              ? { duration: 2.8, ease: "linear", repeat: Infinity }
                              : { duration: 0.5, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[19%] rounded-full border border-primary/22"
                        >
                          <span className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/90 shadow-[0_0_26px_rgba(173,133,37,0.45)] sm:h-4 sm:w-4 dark:bg-primary/85 dark:shadow-[0_0_24px_rgba(155,120,255,0.34)]" />
                        </motion.span>

                        <motion.span
                          aria-hidden="true"
                          animate={isExpanded ? { rotate: -360 } : { rotate: 0 }}
                          transition={
                            isExpanded
                              ? { duration: 3.8, ease: "linear", repeat: Infinity }
                              : { duration: 0.55, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[29%] rounded-full border border-dashed border-white/26 dark:border-primary/30"
                        />

                        <motion.span
                          aria-hidden="true"
                          animate={
                            isExpanded
                              ? {
                                  scale: [1, 1.08, 1],
                                  opacity: [0.52, 0.78, 0.52],
                                }
                              : {
                                  scale: 1,
                                  opacity: 0.58,
                                }
                          }
                          transition={
                            isExpanded
                              ? { duration: 1.8, ease: "easeInOut", repeat: Infinity }
                              : { duration: 0.45, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[37%] rounded-full border border-white/18 bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.05]"
                        />

                        <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                          <span className="h-4 w-4 rounded-full bg-white/82 shadow-[0_0_28px_rgba(255,255,255,0.48)] dark:bg-primary/82 dark:shadow-[0_0_28px_rgba(155,120,255,0.34)] sm:h-5 sm:w-5" />
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence>
            {showFloatingSelector ? (
              <motion.div
                key="floating-selector"
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.92 }}
                transition={{ duration: 0.35, ease: motionEase }}
                className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
                style={{
                  height:
                    projects.length * (floatingMetrics.cardHeight + floatingMetrics.stackGap) +
                    floatingMetrics.buttonSize,
                  width: Math.max(floatingMetrics.cardWidth, floatingMetrics.buttonSize),
                }}
              >
                <div className="pointer-events-none absolute bottom-0 right-0">
                  {projects.map((project, index) => {
                    const yOffset =
                      (index + 1) * (floatingMetrics.cardHeight + floatingMetrics.stackGap) +
                      floatingMetrics.stackOffset;

                    return (
                      <div
                        key={`floating-${project.title}`}
                        className="absolute bottom-0 right-0"
                      >
                        <motion.button
                          type="button"
                          initial={false}
                          animate={
                            isFloatingExpanded
                              ? {
                                  opacity: 1,
                                  scale: 1,
                                  x: 0,
                                  y: -yOffset,
                                  filter: "blur(0px)",
                                }
                              : {
                                  opacity: 0,
                                  scale: 0.7,
                                  x: 0,
                                  y: 0,
                                  filter: "blur(10px)",
                                }
                          }
                          transition={{
                            duration: 0.45,
                            delay: isFloatingExpanded ? index * 0.02 : 0,
                            ease: motionEase,
                          }}
                          style={{
                            height: floatingMetrics.cardHeight,
                            width: floatingMetrics.cardWidth,
                          }}
                          onMouseEnter={openFloatingOrbit}
                          onMouseLeave={queueCloseFloatingOrbit}
                          onFocus={openFloatingOrbit}
                          onBlur={queueCloseFloatingOrbit}
                          onClick={() => {
                            setSelectedIndex(index);
                            setIsFloatingPinned(true);
                            setIsFloatingHovered(true);
                          }}
                          className="pointer-events-auto relative overflow-hidden rounded-[1.4rem] border border-white/26 bg-white/32 p-2 text-left shadow-[0_18px_40px_rgba(173,133,37,0.18)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.08]"
                        >
                          <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-90" />
                          <div className="h-6 rounded-[1rem] border border-white/20 bg-white/30 dark:border-white/10 dark:bg-white/[0.05]" />
                        </motion.button>
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  type="button"
                  aria-label="Open project selector"
                  onMouseEnter={openFloatingOrbit}
                  onMouseLeave={queueCloseFloatingOrbit}
                  onFocus={openFloatingOrbit}
                  onBlur={queueCloseFloatingOrbit}
                  onClick={toggleFloatingOrbit}
                  animate={
                    isFloatingExpanded
                      ? { scale: 1, boxShadow: "0px 18px 70px rgba(173,133,37,0.3)" }
                      : { scale: 0.92, boxShadow: "0px 12px 46px rgba(173,133,37,0.2)" }
                  }
                  transition={{ duration: 0.35, ease: motionEase }}
                  style={{
                    height: floatingMetrics.buttonSize,
                    width: floatingMetrics.buttonSize,
                  }}
                  className="pointer-events-auto absolute bottom-0 right-0 overflow-hidden rounded-full border border-white/32 bg-white/30 backdrop-blur-3xl dark:border-white/12 dark:bg-white/[0.08]"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.8),transparent_42%)]" />
                  <span className="pointer-events-none absolute inset-[14%] rounded-full border border-white/24 bg-white/10" />
                  <span className="pointer-events-none absolute inset-[34%] rounded-full bg-primary/70 shadow-[0_0_18px_rgba(173,133,37,0.4)] dark:bg-primary/85 dark:shadow-[0_0_18px_rgba(155,120,255,0.32)]" />
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.section
                key={selectedProject.title}
                initial={{ opacity: 0, y: 26, scale: 0.985, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 20, scale: 0.985, filter: "blur(8px)" }}
                transition={{ duration: 0.48, ease: motionEase }}
                className="pointer-events-auto pb-14"
              >
                <div
                  ref={selectedSectionRef}
                  className="mx-auto w-full max-w-[120rem] scroll-mt-28 overflow-hidden rounded-[4.25rem] border border-white/30 bg-white/32 p-4 shadow-[0_36px_120px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_36px_122px_rgba(8,5,18,0.52)] sm:rounded-[5rem] sm:p-6"
                >
                  <div className="rounded-[3.5rem] border border-white/24 bg-white/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.04] sm:rounded-[4.2rem] sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">
                          Project Placeholder
                        </p>
                        <h2 className="mt-3 text-2xl text-foreground sm:text-4xl">
                          {selectedProject.title}
                        </h2>
                      </div>
                      <span className="rounded-full border border-white/18 bg-white/26 px-4 py-1.5 font-display text-[10px] uppercase tracking-[0.28em] text-muted-foreground dark:border-white/10 dark:bg-white/[0.05]">
                        In Progress
                      </span>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                      <div className="rounded-[3.1rem] border border-white/28 bg-gradient-to-br from-white/70 via-white/26 to-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent sm:rounded-[3.6rem] sm:p-7">
                        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {selectedProject.note}
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          This is placeholder content for {selectedProject.title}. Lorem ipsum
                          dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                          incididunt ut labore et dolore magna aliqua.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                          ut aliquip ex ea commodo consequat. This section will be replaced with
                          your real project summary later.
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 rounded-[3.1rem] border border-white/26 bg-white/20 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[3.6rem] sm:p-6">
                        {["Project 1", "Project 2", "Project 3"].map((label) => (
                          <div
                            key={label}
                            className="rounded-[2.2rem] border border-white/24 bg-white/22 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                          >
                            <div className="h-24 rounded-[1.7rem] border border-white/20 bg-gradient-to-br from-white/56 via-white/22 to-transparent dark:border-white/10 dark:from-white/[0.06] dark:via-white/[0.02] dark:to-transparent" />
                            <p className="mt-3 text-center font-display text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
};

export default Projects;
