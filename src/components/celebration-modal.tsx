import { useState, useEffect } from "react";
import { Trophy, Sparkles, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CelebrationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("cupvision_final_celebration_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("cupvision_final_celebration_seen", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xs sm:max-w-sm bg-card border-border text-card-foreground shadow-2xl backdrop-blur-xl p-0 overflow-hidden rounded-2xl">
        {/* Header Hero Graphic */}
        <div className="relative bg-gradient-to-b from-primary/15 via-background to-card p-4 sm:p-5 text-center overflow-hidden border-b border-border">
          {/* Ambient Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2 shadow-sm">
              <Sparkles className="size-3 text-primary" />
              <span>Final • Site Archived</span>
            </div>

            {/* Trophy Icon */}
            <div className="relative my-1">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg animate-pulse" />
              <div className="relative size-12 sm:size-14 rounded-full bg-primary/20 border border-primary/40 p-0.5 shadow-md flex items-center justify-center">
                <div className="size-full rounded-full bg-card flex items-center justify-center border border-primary/30">
                  <Trophy className="size-6 sm:size-7 text-primary drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                </div>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight mt-2">
              Spain Champions! 🏆
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 max-w-xs leading-tight">
              Spain defeats Argentina 1-0 in Final.
            </p>
          </div>
        </div>

        {/* Scorecard & Retirement Notice */}
        <div className="p-4 space-y-4 bg-card">
          {/* Match Score Display */}
          <div className="bg-secondary/40 border border-border rounded-xl p-3 text-center shadow-inner">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Final Result
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Spain */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-2xl sm:text-3xl mb-0.5 select-none" role="img" aria-label="Spain">
                  🇪🇸
                </span>
                <span className="font-bold text-xs text-foreground">Spain</span>
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Winner</span>
              </div>

              {/* Score Box */}
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-primary/30 shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-primary">1</span>
                <span className="text-muted-foreground font-bold text-sm">-</span>
                <span className="text-xl sm:text-2xl font-black text-foreground">0</span>
              </div>

              {/* Argentina */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-2xl sm:text-3xl mb-0.5 select-none" role="img" aria-label="Argentina">
                  🇦🇷
                </span>
                <span className="font-bold text-xs text-foreground">Argentina</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Runner-up</span>
              </div>
            </div>
          </div>

          {/* Retirement Notice */}
          <div className="flex gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            <Info className="size-4 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-0.5">Site Archived</p>
              <p>
                Tournament finished. CupVision is now read-only archived.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-0.5">
            <button
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2 px-3 transition-all shadow-sm"
            >
              Close
            </button>
            <Link
              to="/bracket"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium text-xs py-2 px-3 transition-colors border border-border"
            >
              Bracket
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
