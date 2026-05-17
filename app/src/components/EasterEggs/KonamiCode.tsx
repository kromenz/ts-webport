"use client";

import { useEffect } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const KonamiCode = () => {
  useEffect(() => {
    let buffer: string[] = [];
    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    let modeTimer: ReturnType<typeof setTimeout> | null = null;

    const activate = () => {
      console.log(
        "%c🎮 konami unlocked",
        "color:#34d399;font-weight:700;font-family:ui-monospace,monospace;font-size:13px;",
      );
      document.body.classList.add("konami-rainbow");
      const toast = document.createElement("div");
      toast.textContent = "// konami unlocked //";
      toast.className = "konami-toast";
      document.body.appendChild(toast);
      if (toastTimer) clearTimeout(toastTimer);
      if (modeTimer) clearTimeout(modeTimer);
      toastTimer = setTimeout(() => toast.remove(), 4000);
      modeTimer = setTimeout(
        () => document.body.classList.remove("konami-rainbow"),
        8000,
      );
    };

    const onKey = (event: KeyboardEvent) => {
      const key =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      buffer.push(key);
      if (buffer.length > SEQUENCE.length) {
        buffer = buffer.slice(-SEQUENCE.length);
      }
      if (
        buffer.length === SEQUENCE.length &&
        buffer.every((k, i) => k === SEQUENCE[i])
      ) {
        activate();
        buffer = [];
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (toastTimer) clearTimeout(toastTimer);
      if (modeTimer) clearTimeout(modeTimer);
    };
  }, []);

  return null;
};

export default KonamiCode;
