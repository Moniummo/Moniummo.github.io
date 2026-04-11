import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const papers = [
  {
    title: "Research Paper Title One",
    journal: "Journal Name, Vol. X, 2024",
    description: "Brief abstract or summary of your research contribution.",
  },
  {
    title: "Research Paper Title Two",
    journal: "Conference Proceedings, 2023",
    description: "Brief abstract or summary of your research contribution.",
  },
];

const Research = () => {
  return (
    <PageLayout title="Research">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-12">
        Research
      </h1>
      <div className="space-y-10">
        {papers.map((paper, i) => (
          <motion.div
            key={paper.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="border-b border-border pb-8"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              {paper.title}
            </h2>
            <p className="font-display text-sm text-primary mb-3">{paper.journal}</p>
            <p className="font-body text-muted-foreground leading-relaxed">
              {paper.description}
            </p>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Research;
