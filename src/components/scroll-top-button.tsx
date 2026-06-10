import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.92 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-4 z-50 inline-flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:bg-white/14 sm:bottom-6 sm:right-6"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
