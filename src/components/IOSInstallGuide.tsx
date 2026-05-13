import { AnimatePresence, motion } from "framer-motion";
import { Share, Plus, X } from "lucide-react";

interface IOSInstallGuideProps {
  open: boolean;
  onClose: () => void;
}

const IOSInstallGuide = ({ open, onClose }: IOSInstallGuideProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/50"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-label="Add Eraya to Home Screen"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[90] bg-background rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl text-foreground">
                  Add Eraya to Home Screen
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow these 3 steps in Safari
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 mt-2">
              {[
                {
                  num: 1,
                  title: "Tap the Share button",
                  desc: "The share icon at the bottom of your Safari browser",
                  icon: <Share className="h-4 w-4 text-gold" />,
                },
                {
                  num: 2,
                  title: 'Scroll and tap "Add to Home Screen"',
                  desc: "Look for the + icon in the share menu list",
                  icon: <Plus className="h-4 w-4 text-gold" />,
                },
                {
                  num: 3,
                  title: 'Tap "Add"',
                  desc: "Eraya will appear on your home screen like a native app",
                  icon: null,
                },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <span
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-charcoal font-semibold text-sm"
                    style={{
                      background:
                        "var(--gradient-gold, linear-gradient(135deg, #E0C36B, #C9A84C))",
                    }}
                  >
                    {step.num}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {step.title}
                      {step.icon}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-gold/10 border border-gold/30 p-3">
              <p className="text-xs text-foreground">
                💡 Make sure you are using Safari browser on iPhone for this to
                work.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full py-3 rounded-full border border-gold text-gold text-sm font-medium hover:bg-gold/10 transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IOSInstallGuide;
