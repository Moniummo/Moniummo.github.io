import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
    to: "/resume",
    label: "Resume",
    summary: "experience",
  },
  {
    to: "/about",
    label: "About",
    summary: "background",
  },
];

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Large translucent panels give the page the architectural feel from the mockup. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(244,232,204,0.66)_44%,rgba(223,195,132,0.30))] dark:bg-[linear-gradient(145deg,rgba(11,10,20,0.96),rgba(28,24,52,0.92)_40%,rgba(74,46,124,0.82))]" />
        <div className="absolute -left-[12%] top-[16%] h-[44vh] w-[38vw] rotate-[14deg] rounded-[3rem] border border-primary/10 bg-white/34 shadow-[0_26px_90px_rgba(181,149,70,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_28px_120px_rgba(7,5,18,0.55)]" />
        <div className="absolute left-[26%] top-[12%] hidden h-[62vh] w-[18vw] -skew-x-[12deg] rounded-[2.5rem] border border-primary/10 bg-white/24 dark:border-white/10 dark:bg-white/[0.04] md:block" />
        <div className="absolute right-[-5%] top-[8%] h-[72vh] w-[34vw] -rotate-[8deg] rounded-[3rem] border border-primary/10 bg-primary/10 dark:border-white/10 dark:bg-primary/12" />
        <div className="absolute bottom-[-10%] left-[28%] h-[34vh] w-[40vw] rotate-[10deg] rounded-[3rem] border border-primary/10 bg-white/26 dark:border-white/10 dark:bg-white/[0.03]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(176,129,26,0.16),transparent_25%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(160,120,255,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(93,65,170,0.24),transparent_25%)]" />
      </div>

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
                <span className="pointer-events-none absolute left-[0.1em] top-[-2.7em] rotate-[35deg]">
                  <motion.span
                    initial={{ opacity: 0, scaleY: 0.7 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                    className="block h-[9.2em] w-[0.06em] origin-top rounded-full bg-foreground/100 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
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
              className="mt-8 max-w-xl space-y-4"
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

          <div className="relative z-10 mt-14 grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-end">
            {/* This copy explains the direction without crowding the front page. */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.28 }}
              className="max-w-sm"
            >
              <p className="font-display text-[10px] tracking-[0.34em] uppercase text-muted-foreground">
                Selected Paths
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The homepage stays restrained and cinematic, while the denser interactions
                can move deeper into the project pages where they have more room to breathe.
              </p>
            </motion.div>

            {/* These pills replace the circle menu with a cleaner, more polished navigation system. */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.34 }}
              className="flex flex-wrap gap-4 lg:justify-end"
            >
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group min-w-[12rem] rounded-full border border-primary/20 bg-white/46 px-6 py-4 shadow-[0_18px_50px_rgba(175,139,54,0.10)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/68 hover:shadow-[0_24px_70px_rgba(175,139,54,0.16)] dark:bg-white/[0.07] dark:shadow-[0_22px_60px_rgba(10,6,22,0.58)] dark:hover:bg-white/[0.11]"
                >
                  <p className="font-display text-[10px] tracking-[0.32em] uppercase text-primary/80">
                    {item.summary}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-6">
                    <span className="text-2xl text-foreground">{item.label}</span>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
