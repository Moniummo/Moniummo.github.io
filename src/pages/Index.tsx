import { motion } from "framer-motion";
import NavButton from "@/components/ui/nav-button";

const navItems = [
  { to: "/projects", label: "Projects" },
  { to: "/resume", label: "Resume" },
  { to: "/research", label: "Research" },
  { to: "/about", label: "About Me" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between px-8 py-10">
      {/* Name - top left */}
      <motion.h1
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-script text-6xl sm:text-7xl md:text-8xl text-foreground"
      >
        Arkan Dave
      </motion.h1>

      {/* Bottom section */}
      <div className="flex items-end justify-between">
        {/* Nav buttons - bottom left */}
        <div className="flex flex-col gap-5">
          {navItems.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              <NavButton to={item.to} label={item.label} index={i} />
            </motion.div>
          ))}
        </div>

        {/* Subtitle - bottom right */}
        <motion.p
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="font-display text-sm tracking-widest uppercase text-muted-foreground"
        >
          Biomedical Engineer
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
