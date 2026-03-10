"use client";

import { useState, useEffect } from "react";
import { AuthGate } from "@/components/discovery/auth-gate";
import { DiscoveryIntro } from "@/components/discovery/intro";
import { DiscoveryContent } from "@/components/discovery/content";

const STORAGE_KEY = "aitappers-discovery-auth";

export default function DiscoveryPage() {
  const [authed, setAuthed] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
      setIntroComplete(true);
    }
  }, []);

  function handleAuth() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setAuthed(true);
  }

  if (!mounted) return null;

  if (!authed) {
    return <AuthGate onSuccess={handleAuth} />;
  }

  if (!introComplete) {
    return <DiscoveryIntro onComplete={() => setIntroComplete(true)} />;
  }

  return <DiscoveryContent />;
}
