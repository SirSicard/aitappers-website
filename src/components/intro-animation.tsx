"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ParticleSystem, GridWipeOverlay } from "./particle-system";

const STORAGE_KEY = "aitappers-intro-seen";

export function IntroAnimation({ children }: { children: React.ReactNode }) {
  const [skipIntro, setSkipIntro] = useState(true); // Default true, set false after check
  const [introComplete, setIntroComplete] = useState(true);
  const [showWipe, setShowWipe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setSkipIntro(true);
      setIntroComplete(true);
      return;
    }

    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) {
      setSkipIntro(true);
      setIntroComplete(true);
      return;
    }

    // Play intro
    setSkipIntro(false);
    setIntroComplete(false);
    sessionStorage.setItem(STORAGE_KEY, "1");

    // Trigger grid wipe after scatter(500) + assemble(1000) + hold(500) = 2000ms
    const wipeTimer = setTimeout(() => {
      setShowWipe(true);
    }, 2000);

    return () => clearTimeout(wipeTimer);
  }, []);

  const handleIntroComplete = useCallback(() => {
    // Small delay to let wipe tiles finish animating
    setTimeout(() => {
      setIntroComplete(true);
      setShowWipe(false);
    }, 600);
  }, []);

  if (!mounted) {
    // SSR: render children hidden, no canvas
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <>
      <ParticleSystem skipIntro={skipIntro} onIntroComplete={handleIntroComplete} />
      <GridWipeOverlay active={showWipe} progress={0} />

      {introComplete ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      ) : (
        <div className="opacity-0 pointer-events-none">{children}</div>
      )}
    </>
  );
}
