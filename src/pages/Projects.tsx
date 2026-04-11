import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const projects = [
  {
    title: "Project One",
    description: "A brief description of your first engineering project. Replace with your actual project details.",
    tags: ["CAD", "Prototyping", "Testing"],
    year: "2024",
  },
  {
    title: "Project Two",
    description: "A brief description of your second engineering project. Replace with your actual project details.",
    tags: ["MATLAB", "Signal Processing"],
    year: "2023",
  },
  {
    title: "Project Three",
    description: "A brief description of your third engineering project. Replace with your actual project details.",
    tags: ["Biomaterials", "Lab Work"],
    year: "2023",
  },
];

const Projects = () => {
  return (
    <PageLayout title="Projects">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-12">
        Engineering Projects
      </h1>
      <div className="space-y-12">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="border-b border-border pb-10"
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {project.title}
              </h2>
              <span className="font-display text-sm text-muted-foreground">
                {project.year}
              </span>
            </div>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              {project.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-display text-xs tracking-wider uppercase px-3 py-1 border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Projects;
