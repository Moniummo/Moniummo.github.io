import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface NavButtonProps {
  to: string;
  label: string;
  index: number;
}

const NavButton = ({ to, label }: NavButtonProps) => {
  return (
    <div>
      <Link
        to={to}
        className="group flex items-center gap-3 font-display text-sm tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
      >
        <span className="block w-8 h-px bg-muted-foreground group-hover:w-16 group-hover:bg-primary transition-all duration-300" />
        {label}
      </Link>
    </div>
  );
};

export default NavButton;
