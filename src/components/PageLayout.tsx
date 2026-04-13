import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout = ({ title, children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,187,96,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(172,130,34,0.08),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(148,111,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(91,54,173,0.16),transparent_26%)]" />
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-primary/20 bg-background/80 px-6 py-5 shadow-[0_18px_60px_rgba(176,140,48,0.08)] backdrop-blur-md transition-colors duration-500 dark:shadow-[0_24px_80px_rgba(8,5,18,0.55)] sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xs tracking-[0.3em] uppercase text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden font-display text-xs tracking-[0.3em] uppercase text-muted-foreground sm:inline">
            {title}
          </span>
          <ThemeToggle />
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-4xl px-6 pb-20 pt-28 sm:px-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default PageLayout;
