import { type ReactNode } from "react";
import { motion } from "motion/react";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
