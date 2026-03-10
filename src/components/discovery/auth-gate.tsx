"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/logo";

interface AuthGateProps {
  onSuccess: () => void;
}

export function AuthGate({ onSuccess }: AuthGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (username === "bob" && password === "testing12345!") {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          x: shake ? [0, -8, 8, -8, 8, 0] : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <LogoMark size={40} color="hsl(36 87% 56%)" />
        </div>
        <p className="text-center text-sm text-muted-foreground mb-8">
          This area is restricted. Enter your credentials to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(false);
              }}
              placeholder="Username"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors"
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 text-center"
            >
              Invalid credentials.
            </motion.p>
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-lg bg-accent text-background font-medium text-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-[0_0_20px_hsla(36,87%,56%,0.3)]"
          >
            Continue
          </button>
        </form>
      </motion.div>
    </div>
  );
}
