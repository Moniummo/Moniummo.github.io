import { Suspense, lazy, useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileText, FlaskConical, FolderKanban, UserRound, X } from "lucide-react";
import HomeBackdrop from "@/components/HomeBackdrop";

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

const surnameLetters = ["D", "a", "v", "e"];
const chessFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];
const chessRanks = [8, 7, 6, 5, 4, 3, 2, 1];

interface PageTransitionState {
  clipPath: string;
  to: string;
}

const Index = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [transitionState, setTransitionState] = useState<PageTransitionState | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultActivated, setVaultActivated] = useState(false);
  const vaultClickTimesRef = useRef<number[]>([]);
  const surnameDragRef = useRef<HTMLSpanElement | null>(null);
  const skipEntranceMotion = prefersReducedMotion || isMobileViewport;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
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

  const handleVaultTrigger = () => {
    const now = Date.now();
    const recentClicks = [...vaultClickTimesRef.current, now].filter((timestamp) => now - timestamp < 1400);
    vaultClickTimesRef.current = recentClicks;

    if (recentClicks.length >= 5) {
      setVaultActivated(true);
      setVaultOpen(true);
      vaultClickTimesRef.current = [];
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      <AnimatePresence>
        {transitionState ? (
          <Suspense fallback={null}>
            <RouteTransitionOverlay
              initialClipPath={transitionState.clipPath}
              animateToClipPath="inset(0px 0px 0px 0px round 2.4rem)"
            />
          </Suspense>
        ) : null}

        {vaultOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(14,10,28,0.58)] px-5 backdrop-blur-md"
          >
            <motion.div
              initial={skipEntranceMotion ? false : { opacity: 0, scale: 0.9, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={skipEntranceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-[760px] overflow-hidden rounded-[2.2rem] border border-white/14 bg-[linear-gradient(150deg,rgba(24,20,44,0.96),rgba(34,27,61,0.94))] p-5 shadow-[0_34px_120px_rgba(5,2,16,0.6)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              <div className="flex items-start justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                <div>
                  <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/85">
                    Hidden vault
                  </p>
                  <h2 className="mt-3 font-serif text-3xl text-foreground">Friend Mode</h2>
                  <p className="mt-3 max-w-[30rem] text-sm leading-7 text-muted-foreground">
                    The vault is open. For now it holds a chess board, and we can build the rest of
                    the secret experience from here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVaultOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-foreground transition-colors hover:bg-white/[0.1]"
                  aria-label="Close vault"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-[1.8rem] border border-white/10 bg-[rgba(255,255,255,0.035)] p-4">
                  <div className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[1.2rem] border border-white/10">
                    {chessRanks.flatMap((rank) =>
                      chessFiles.map((file, fileIndex) => {
                        const isLight = (rank + fileIndex) % 2 === 0;
                        return (
                          <div
                            key={`${file}${rank}`}
                            className={`relative flex items-end justify-end p-2 ${
                              isLight ? "bg-[#e8ddcc] text-[#5f4c38]" : "bg-[#6f5a91] text-[#efe9ff]"
                            }`}
                          >
                            <span className="font-display text-[9px] uppercase tracking-[0.2em] opacity-55">
                              {file}
                              {rank}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="font-display text-[10px] uppercase tracking-[0.32em] text-primary/80">
                    Status
                  </p>
                  <p className="mt-3 text-lg text-foreground">Vault unlocked</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Triggered by the hidden glass plate behind your name and draggable surname
                    letters on the landing page.
                  </p>
                  <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-4">
                    <p className="font-display text-[10px] uppercase tracking-[0.28em] text-primary/75">
                      Next layer
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      We can turn this into a playable board, a passphrase puzzle, or a full secret
                      route.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <HomeBackdrop />

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
            <div className="relative z-10">
              <motion.div
                initial={skipEntranceMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
                className="inline-flex items-center gap-3 rounded-full border border-primary/18 bg-white/38 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-primary/90 shadow-[0_16px_38px_rgba(171,132,46,0.12)] backdrop-blur-lg dark:border-white/10 dark:bg-white/[0.05]"
              >
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_hsla(var(--primary)/0.75)]" />
                Biomedical engineering, interfaces, systems
              </motion.div>

              <motion.div
                initial={skipEntranceMotion ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skipEntranceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut", delay: 0.08 }}
                className="relative mt-8 max-w-[48rem]"
              >
                <motion.button
                  type="button"
                  onClick={handleVaultTrigger}
                  whileTap={{ scale: 0.985 }}
                  aria-label="Hidden vault trigger"
                  className="absolute left-[17%] top-[1.35rem] h-[20rem] w-[clamp(15rem,34vw,31rem)] rotate-[8deg] rounded-[3.5rem] border border-white/8 bg-white/[0.025] shadow-[0_28px_90px_rgba(9,4,24,0.28)] backdrop-blur-[1.5px] transition-colors duration-300 hover:border-primary/18 hover:bg-primary/[0.05] sm:left-[15%] sm:top-[0.6rem] sm:h-[24rem] sm:rounded-[4.5rem] lg:left-[14%] lg:top-[-0.2rem] lg:h-[28rem]"
                >
                  <span className="sr-only">Hidden vault trigger</span>
                </motion.button>
                <p className="font-display text-[10px] tracking-[0.34em] uppercase text-muted-foreground">
                  Portfolio / selected work
                </p>
                <h1 className="relative z-10 mt-4 font-serif text-[clamp(4.2rem,9vw,8.5rem)] leading-[0.9] tracking-[-0.05em] text-foreground">
                  <span>Arkan </span>
                  <span
                    ref={surnameDragRef}
                    className="relative inline-flex items-center rounded-[1.2rem] px-1 py-2"
                  >
                    {surnameLetters.map((letter, index) => (
                      <motion.span
                        key={`${letter}-${index}`}
                        drag
                        dragConstraints={surnameDragRef}
                        dragElastic={0.22}
                        dragMomentum={false}
                        whileDrag={{ scale: 1.08, zIndex: 20 }}
                        whileHover={{ y: -2 }}
                        className="relative inline-block cursor-grab select-none active:cursor-grabbing"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                </h1>
                <p className="mt-6 max-w-[38rem] text-base leading-8 text-foreground/78 sm:text-lg">
                  I’m a biomedical engineering student interested in building technical work that
                  feels rigorous, usable, and visually clear, from research-heavy experimentation
                  to projects that need structure, iteration, and strong presentation.
                </p>
                {vaultActivated ? (
                  <p className="mt-4 font-display text-[10px] uppercase tracking-[0.32em] text-primary/78">
                    Vault sequence recognized
                  </p>
                ) : null}
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
