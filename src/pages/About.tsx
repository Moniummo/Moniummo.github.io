import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

interface ConnectLink {
  label: string;
  value: string;
  href: string;
}

const aboutParagraphs = [
  "I am a Biomedical Engineering student at the University of California, Irvine with a strong interest in building and understanding complex systems. I am drawn to problems that sit at the intersection of physical systems, data, and computation, where solutions require both analytical thinking and hands-on implementation.",
  "My work spans research and engineering projects that focus on extracting structure from complex environments. In research, I develop computational pipelines to analyze neuroimaging data, designing methods to isolate meaningful signals from high-noise datasets. This involves thinking carefully about how data is generated, how it should be processed, and how to ensure that results remain physically and scientifically meaningful. At the same time, I have worked in experimental settings with biological systems, which has given me an appreciation for real-world constraints, variability, and the gap between theory and implementation.",
  "Outside of research, I enjoy designing systems from the ground up. I have worked on embedded sensing architectures that integrate high-frequency sensor data, wireless communication, and real-time processing, as well as mechanical systems that require careful consideration of constraints, tolerances, and performance tradeoffs. Across these projects, I focus on system-level design: how individual components interact, where failure points arise, and how to build solutions that are both efficient and robust.",
  "What motivates me most is the process of learning new tools and applying them to unfamiliar problems. I am comfortable working across disciplines, picking up new concepts quickly, and iterating through uncertainty until a system works. Whether the problem is computational, mechanical, or experimental, I approach it with the same mindset: break it down, understand the fundamentals, and build a solution that holds up under real conditions.",
];

const connectLinks: ConnectLink[] = [
  {
    label: "Email",
    value: "reacharkan@gmail.com",
    href: "mailto:reacharkan@gmail.com",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/arkan-dave-0263572a3",
    href: "https://www.linkedin.com/in/arkan-dave-0263572a3/",
  },
  {
    label: "GitHub",
    value: "github.com/Moniummo",
    href: "https://github.com/Moniummo",
  },
];

const About = () => {
  return (
    <PageLayout title="About Me" mainClassName="max-w-5xl px-5 sm:px-7">
      <h1 className="font-display mb-8 text-4xl font-bold text-foreground md:text-5xl">
        About Me
      </h1>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[3rem] border border-white/30 bg-white/32 p-5 shadow-[0_26px_90px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_30px_100px_rgba(8,5,18,0.5)] sm:p-7"
      >
        <div className="rounded-[2.2rem] border border-white/24 bg-white/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">
            Biomedical Engineering | UC Irvine
          </p>
          <h2 className="mt-3 text-2xl text-foreground sm:text-3xl">
            Building systems that hold up in the real world
          </h2>

          <div className="mt-6 space-y-4">
            {aboutParagraphs.map((paragraph, index) => (
              <motion.article
                key={paragraph}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.07, duration: 0.42 }}
                className="rounded-[1.75rem] border border-white/24 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03] sm:p-5"
              >
                <p className="font-body leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              </motion.article>
            ))}

            <motion.article
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.42 }}
              className="rounded-[1.75rem] border border-white/24 bg-white/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03] sm:p-5"
            >
              <p className="font-display text-xs uppercase tracking-[0.24em] text-foreground/90">
                Connect
              </p>
              <div className="mt-3 space-y-4">
                {connectLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="block overflow-hidden rounded-[2rem] border border-white/22 bg-white/24 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/34 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  >
                    <p className="font-display text-[10px] uppercase tracking-[0.22em] text-primary/78">
                      {link.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed break-words text-muted-foreground">
                      {link.value}
                    </p>
                  </a>
                ))}
              </div>
            </motion.article>
          </div>
        </div>
      </motion.section>
    </PageLayout>
  );
};

export default About;
