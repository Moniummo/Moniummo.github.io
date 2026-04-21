import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

interface CvEntry {
  title: string;
  date?: string;
  subtitle?: string;
  details?: string[];
}

interface ResumeSectionAnchor {
  id: string;
  label: string;
}

const education: CvEntry[] = [
  {
    title: "UC Irvine",
    date: "Sep 2025 - Mar 2027",
    subtitle: "Bachelor of Science in Biomedical Engineering (Pre-Med Track)",
    details: ["GPA: 3.92 / 4.0 (current)"],
  },
  {
    title: "Mt. San Antonio College",
    date: "Aug 2022 - May 2025",
    subtitle: "Pre-transfer coursework in STEM",
    details: ["GPA: 3.9"],
  },
];

const researchExperience: CvEntry[] = [
  {
    title: "Brewer Laboratory | University of California, Irvine | CA",
    date: "Sep 2025 - Present",
    details: [
      "Conducted rat brain dissections and primary neuronal culture using sterile techniques to study neuronal physiology.",
      "Designed and proposed an independent research project investigating the origins of local field potentials (LFPs), examining axonal contributions versus traditional models emphasizing subthreshold presynaptic currents.",
      "Authored a competitive Undergraduate Research Opportunities Program proposal and was awarded a $500 research grant.",
      "Engaged in literature review, experimental planning, and theoretical discussion with faculty and lab members.",
    ],
  },
  {
    title: "Frostig Laboratory | University of California, Irvine | CA",
    date: "Sep 2025 - Present",
    details: [
      "Developed and applied MATLAB-based image analysis pipelines for cerebral vessel identification in brain imaging datasets.",
      "Implemented vessel segmentation, region-of-interest filtering, and false-positive reduction strategies.",
      "Assisted with quantitative analysis and visualization of vascular features across grouped datasets.",
    ],
  },
  {
    title: "Kruggel Laboratory | University of California, Irvine | CA",
    date: "Sep 2025 - Present",
    details: [
      "Utilized existing Python-based analysis pipelines to process and analyze fetal cranial imaging data.",
      "Assisted with computational workflows for data preprocessing and morphological analysis under supervision.",
      "Gained exposure to large-scale neuroanatomical data analysis in a computational research environment.",
    ],
  },
];

const teachingExperience: CvEntry[] = [
  {
    title: "Prosector | Mt. San Antonio College | CA",
    date: "Aug 2024 - May 2025",
    details: [
      "Selected into a competitive program requiring a 4.0 GPA in Anatomy and Physiology.",
      "Performed detailed cadaveric dissections to prepare instructional specimens for laboratory teaching.",
      "Presented anatomical structures and guided students in identifying muscles, nerves, vasculature, and organ systems.",
      "Reinforced spatial and functional relationships through hands-on instruction and explanation.",
      "Supported student learning by answering questions and clarifying anatomical concepts during lab sessions.",
    ],
  },
];

const projects: CvEntry[] = [
  {
    title: "Esonic - 3D spatial music control system",
    subtitle: "ESP32, IMUs, UWB, Arduino, Python",
    details: [
      "Designed and implemented a wearable glove-based system to capture 3D hand motion using inertial measurement units and ultra-wideband positioning.",
      "Developed Arduino firmware for ESP32 microcontrollers and Python scripts for real-time data processing and spatial mapping.",
      "Integrated accelerometer and gyroscope data to enable continuous spatial control of musical parameters.",
      "Conducted iterative testing and troubleshooting to improve the reliability and responsiveness of the system.",
    ],
  },
  {
    title: "Neuroimaging Vessel Segmentation and Analysis (MATLAB)",
    subtitle: "MATLAB",
    details: [
      "Developed MATLAB programs to identify and isolate cerebral blood vessels from neuroimaging datasets.",
      "Implemented region-specific filtering, including identification of the middle cerebral artery, to reduce vascular false positives.",
      "Parsed and processed grouped imaging datasets to improve signal specificity and consistency across analyses.",
    ],
  },
  {
    title: "Thermal Cost Modeling Using Environmental Sensor Data",
    subtitle: "MATLAB",
    details: [
      "Designed an experimental setup using multiple enclosures to model residential heat retention under varying thermal conditions.",
      "Collected and analyzed temperature, humidity, and light sensor data over a two-week period.",
      "Developed MATLAB simulations to estimate heating requirements and energy costs needed to maintain a constant temperature.",
      "Compared thermal behavior across configurations with differing effective heat capacities.",
    ],
  },
  {
    title: "Mechanical Design and Fabrication Projects",
    subtitle: "SolidWorks, Autodesk Inventor, 3D Printing",
    details: [
      "Designed and assembled a fully articulated bicycle model with functional gears, pedals, bearings, and mechanical constraints.",
      "Designed and fabricated a coin-sorting mechanism using CAD modeling and additive manufacturing techniques.",
      "Applied tolerancing, iteration, and design-for-manufacturability principles throughout the design process.",
    ],
  },
  {
    title: "NickAI Conversational LLM",
    subtitle: "Python, QLoRA, LLaMA 8B, PEFT, FastAPI, Discord API",
    details: [
      "Built an end-to-end conversational AI pipeline from dataset preparation through fine-tuning and local deployment.",
      "Fine-tuned a LLaMA 8B model using parameter-efficient training methods to preserve style and reduce hardware load.",
      "Integrated private web and Discord interfaces to support real-time inference and multi-platform interaction.",
    ],
  },
  {
    title: "RoboSub AUV Integration",
    subtitle: "Systems Engineering, Controls, Perception, Embedded Integration",
    details: [
      "Led cross-functional system integration for an autonomous underwater vehicle by coordinating mechanical, electrical, controls, and perception teams.",
      "Defined subsystem interface constraints and resolved bottlenecks affecting end-to-end mission reliability.",
      "Improved validation workflow through staged integration testing and issue triage across coupled hardware/software pipelines.",
    ],
  },
  {
    title: "Portfolio Website Engineering",
    subtitle: "React, TypeScript, Tailwind, Framer Motion, Responsive UI",
    details: [
      "Designed and implemented this portfolio as a modular web application with reusable components and data-driven content structure.",
      "Built responsive navigation and interaction systems optimized for desktop and mobile workflows.",
      "Applied iterative performance optimization, media compression, and route-level loading improvements for production deployment.",
    ],
  },
];

const professionalExperience: CvEntry[] = [
  {
    title: "Project Manager Intern | IT Startup (Consulting Company) | CA",
    date: "Aug 2021 - May 2024",
    details: [
      "Coordinated multiple client projects using proprietary project management software to track deliverables and timelines.",
      "Communicated regularly with clients and internal consulting teams to schedule meetings and ensure alignment on project milestones.",
      "Prepared professional slide decks summarizing project progress, deliverables, and upcoming deadlines.",
      "Supported workflow organization and documentation across concurrent consulting engagements.",
    ],
  },
  {
    title: "Restaurant Manager | Philly's Best Cheesesteaks | San Clemente, CA",
    date: "Jun 2022 - Sep 2025",
    details: [
      "Managed daily operations, staff scheduling, and training in a high-volume restaurant environment.",
      "Oversaw financial tasks, including vendor payments, inventory coordination, and basic accounting responsibilities.",
      "Led and supervised a multilingual team, resolving operational issues under time pressure.",
      "Maintained consistent service quality while balancing academic and professional commitments.",
    ],
  },
];

const volunteering: CvEntry[] = [
  {
    title: "Community Support Volunteer | Skid Row, Los Angeles, CA",
    details: [
      "Assisted in distributing food, clothing, and essential supplies to underserved populations.",
      "Supported on-site coordination efforts to ensure efficient and respectful service delivery.",
    ],
  },
  {
    title: "Middle School Tutor",
    details: [
      "Volunteered as a tutor in math, science, and English for middle school students.",
      "Helped students strengthen foundational academic skills through individualized support.",
    ],
  },
  {
    title: "Event Volunteer - Piano Competition",
    details: [
      "Assisted with event logistics and participant coordination during a regional piano competition.",
    ],
  },
];

const honors: CvEntry[] = [
  {
    title: "Undergraduate Research Opportunities Program (UROP) Fellow, University of California, Irvine",
    details: ["Awarded a $500 competitive undergraduate research grant."],
  },
  {
    title: "Prosection Certification, Mt. San Antonio College",
    details: [
      "Awarded upon selection into and completion of a competitive anatomy prosection program.",
    ],
  },
];

const technicalSkills = [
  "MATLAB",
  "Python",
  "C",
  "Arduino",
  "ESP32",
  "IMUs",
  "Environmental Sensors",
  "Neuroimaging Data Analysis",
  "Vessel Segmentation",
  "Region-of-Interest Filtering",
  "3D Visualization",
  "SolidWorks",
  "Autodesk Inventor",
  "AutoCAD",
  "3D Printing",
  "Linux",
];

const interests = ["Composition", "Piano", "Guitar", "Rock Climbing", "Breakdancing", "Chess"];

const resumeSections: ResumeSectionAnchor[] = [
  { id: "contact", label: "Contact" },
  { id: "education", label: "Education" },
  { id: "research", label: "Research" },
  { id: "teaching", label: "Teaching" },
  { id: "projects", label: "Projects" },
  { id: "professional", label: "Experience" },
  { id: "service", label: "Service" },
  { id: "honors", label: "Honors" },
  { id: "skills", label: "Skills" },
  { id: "interests", label: "Interests" },
];

const sectionShellClass =
  "rounded-[2.4rem] border border-white/28 bg-white/30 p-6 shadow-[0_22px_70px_rgba(173,133,37,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_28px_90px_rgba(8,5,18,0.5)] sm:p-8";

const renderEntries = (entries: CvEntry[]) =>
  entries.map((entry) => (
    <article
      key={`${entry.title}-${entry.date ?? "no-date"}`}
      className="border-b border-white/26 pb-6 last:border-b-0 last:pb-0 dark:border-white/10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-foreground">{entry.title}</h3>
        {entry.date ? (
          <span className="font-display text-sm text-muted-foreground whitespace-nowrap">
            {entry.date}
          </span>
        ) : null}
      </div>
      {entry.subtitle ? <p className="mt-1 font-body text-muted-foreground">{entry.subtitle}</p> : null}
      {entry.details?.length ? (
        <ul className="mt-3 space-y-2">
          {entry.details.map((detail) => (
            <li key={detail} className="relative pl-4 font-body text-muted-foreground">
              <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  ));

const Resume = () => {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileAnchorScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileAnchorButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeSectionId, setActiveSectionId] = useState(resumeSections[0].id);
  const lastSectionId = resumeSections[resumeSections.length - 1]?.id ?? resumeSections[0].id;
  const activeSectionIndex = Math.max(
    resumeSections.findIndex((section) => section.id === activeSectionId),
    0
  );
  const desktopAnchorRowHeight = 48;
  const desktopAnchorGap = 10;

  useEffect(() => {
    let frameId = 0;

    const updateActiveSection = () => {
      const doc = document.documentElement;
      const distanceFromBottom = doc.scrollHeight - (window.scrollY + window.innerHeight);
      if (distanceFromBottom <= 20) {
        setActiveSectionId((current) => (current === lastSectionId ? current : lastSectionId));
        return;
      }

      const scanLine = window.innerHeight * 0.45;
      let steppedId = resumeSections[0].id;
      let crossedAny = false;

      for (const section of resumeSections) {
        const element = sectionRefs.current[section.id];
        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top <= scanLine) {
          steppedId = section.id;
          crossedAny = true;
        } else {
          break;
        }
      }

      if (crossedAny) {
        setActiveSectionId((current) => (current === steppedId ? current : steppedId));
        return;
      }

      let nearestId = resumeSections[0].id;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const section of resumeSections) {
        const element = sectionRefs.current[section.id];
        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - scanLine);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestId = section.id;
        }
      }

      setActiveSectionId((current) => (current === nearestId ? current : nearestId));
    };

    const queueUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, [lastSectionId]);

  useEffect(() => {
    const scrollContainer = mobileAnchorScrollRef.current;
    const activeButton = mobileAnchorButtonRefs.current[activeSectionId];
    if (!scrollContainer || !activeButton) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft =
      activeButton.offsetLeft - scrollContainer.clientWidth / 2 + activeButton.offsetWidth / 2;

    scrollContainer.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeSectionId]);

  const setSectionRef = (id: string) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const scrollToSection = (id: string) => {
    const sectionNode = document.getElementById(id) ?? sectionRefs.current[id];
    sectionNode?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageLayout title="CV" mainClassName="max-w-[74rem] px-6 pb-36 pt-28 sm:px-8 xl:pb-20 xl:pl-[14rem]">
      <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
        <div className="w-[11.75rem] rounded-[2rem] border border-white/22 bg-white/30 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_20px_58px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_rgba(8,5,18,0.5)]">
          <div
            className="relative"
            style={{
              height:
                resumeSections.length * desktopAnchorRowHeight +
                (resumeSections.length - 1) * desktopAnchorGap,
            }}
          >
            <motion.div
              className="pointer-events-none absolute left-0 right-0 rounded-full border border-white/34 bg-white/52 shadow-[0_10px_24px_rgba(173,133,37,0.14)] dark:border-white/22 dark:bg-white/[0.16]"
              style={{ height: desktopAnchorRowHeight }}
              initial={false}
              animate={{ y: activeSectionIndex * (desktopAnchorRowHeight + desktopAnchorGap) }}
              transition={{ type: "spring", stiffness: 440, damping: 16, mass: 0.58 }}
            />

            <div className="relative flex flex-col" style={{ gap: desktopAnchorGap }}>
            {resumeSections.map((section) => {
              const isActive = section.id === activeSectionId;

              return (
                <motion.button
                  key={section.id}
                  type="button"
                  aria-label={`Jump to ${section.label}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => scrollToSection(section.id)}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.3 : 0.96,
                    y: isActive ? -1.25 : 0,
                    opacity: isActive ? 1 : 0.9,
                  }}
                  transition={{ type: "spring", stiffness: 430, damping: 20, mass: 0.56 }}
                  style={{ height: desktopAnchorRowHeight }}
                  className={`relative z-10 flex w-full items-center justify-center rounded-full px-3 text-center transition-colors duration-300 ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground dark:text-muted-foreground"
                  }`}
                >
                  <span className="font-display text-[11px] uppercase tracking-[0.16em]">
                    {section.label}
                  </span>
                </motion.button>
              );
            })}
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed bottom-4 left-1/2 z-40 w-[min(94vw,42rem)] -translate-x-1/2 xl:hidden">
        <div className="rounded-[1.5rem] border border-white/22 bg-white/30 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_38px_rgba(173,133,37,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
          <div ref={mobileAnchorScrollRef} className="flex gap-2 overflow-x-auto pb-1">
            {resumeSections.map((section) => {
              const isActive = section.id === activeSectionId;

              return (
                <motion.button
                  key={`mobile-${section.id}`}
                  type="button"
                  ref={(node) => {
                    mobileAnchorButtonRefs.current[section.id] = node;
                  }}
                  onClick={() => scrollToSection(section.id)}
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 0.96, y: isActive ? -1.25 : 0, opacity: isActive ? 1 : 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 20, mass: 0.55 }}
                  className={`shrink-0 rounded-full border px-3 py-2.5 font-display text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                    isActive
                      ? "border-white/38 bg-white/54 text-foreground dark:border-white/22 dark:bg-white/[0.15]"
                      : "border-white/22 bg-white/28 text-muted-foreground dark:border-white/12 dark:bg-white/[0.08]"
                  }`}
                >
                  {section.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <header
        ref={setSectionRef("contact")}
        id="contact"
        className="mb-8 scroll-mt-28 rounded-[2.8rem] border border-white/32 bg-white/34 p-6 shadow-[0_26px_80px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_30px_100px_rgba(8,5,18,0.52)] sm:p-8"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">CV</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
          Curriculum Vitae
        </h1>
        <div className="mt-6 border-t border-white/26 pt-5 dark:border-white/10">
          <h2 className="font-display text-lg font-bold text-foreground">Arkan Dave</h2>
          <p className="mt-2 font-body text-muted-foreground">
            (909) 859 - 4733 | reacharkan@gmail.com | CA
          </p>
        </div>
      </header>

      <section ref={setSectionRef("education")} id="education" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">Education</h2>
          <div className="mt-5 space-y-6">{renderEntries(education)}</div>
        </div>
      </section>

      <section ref={setSectionRef("research")} id="research" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Research Experience
          </h2>
          <div className="mt-5 space-y-6">{renderEntries(researchExperience)}</div>
        </div>
      </section>

      <section ref={setSectionRef("teaching")} id="teaching" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Teaching and Instructional Experience
          </h2>
          <div className="mt-5 space-y-6">{renderEntries(teachingExperience)}</div>
        </div>
      </section>

      <section ref={setSectionRef("projects")} id="projects" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">Projects</h2>
          <div className="mt-5 space-y-6">{renderEntries(projects)}</div>
        </div>
      </section>

      <section ref={setSectionRef("professional")} id="professional" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Professional Experience
          </h2>
          <div className="mt-5 space-y-6">{renderEntries(professionalExperience)}</div>
        </div>
      </section>

      <section ref={setSectionRef("service")} id="service" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Service and Volunteering
          </h2>
          <div className="mt-5 space-y-6">{renderEntries(volunteering)}</div>
        </div>
      </section>

      <section ref={setSectionRef("honors")} id="honors" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Honors and Awards
          </h2>
          <div className="mt-5 space-y-6">{renderEntries(honors)}</div>
        </div>
      </section>

      <section ref={setSectionRef("skills")} id="skills" className="mb-8 scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Technical Skills
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {technicalSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/28 bg-white/36 px-3.5 py-1.5 font-display text-xs uppercase tracking-[0.18em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:border-white/12 dark:bg-white/[0.06]"
              >
                {skill}
              </span>
            ))}
            <Link
              to="/cv/app-development"
              className="cursor-default rounded-full border border-white/28 bg-white/36 px-3.5 py-1.5 font-display text-xs uppercase tracking-[0.18em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:border-white/12 dark:bg-white/[0.06]"
            >
              App Development
            </Link>
          </div>
        </div>
      </section>

      <section ref={setSectionRef("interests")} id="interests" className="scroll-mt-28">
        <div className={sectionShellClass}>
          <h2 className="font-display text-sm uppercase tracking-[0.32em] text-primary/85">
            Interests and Hobbies
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {interests.map((interest) => (
              interest === "Chess" ? (
                <a
                  key={interest}
                  href="https://www.chess.com/member/moniummo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/28 bg-white/36 px-3.5 py-1.5 font-display text-xs uppercase tracking-[0.18em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-colors hover:bg-white/48 hover:text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]"
                >
                  {interest}
                </a>
              ) : (
                <span
                  key={interest}
                  className="rounded-full border border-white/28 bg-white/36 px-3.5 py-1.5 font-display text-xs uppercase tracking-[0.18em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:border-white/12 dark:bg-white/[0.06]"
                >
                  {interest}
                </span>
              )
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Resume;
