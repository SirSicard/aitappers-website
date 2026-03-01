"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoAnimated } from "./logo";

const STORAGE_KEY = "aitappers-intro-seen";

export function IntroAnimation({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setIntroComplete(true);
      return;
    }

    // Only play once per session
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) {
      setIntroComplete(true);
      return;
    }

    // Play the intro
    setShowIntro(true);
    setIntroComplete(false);
    sessionStorage.setItem(STORAGE_KEY, "1");

    // Auto-complete after animation duration
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence
        onExitComplete={() => setIntroComplete(true)}
      >
        {showIntro && (
          <motion.div
            key="intro-splash"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoAnimated size={80} color="hsl(var(--foreground))" />
          </motion.div>
        )}
      </AnimatePresence>

      {introComplete ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      ) : (
        <div className="opacity-0">{children}</div>
      )}
    </>
  );
}
