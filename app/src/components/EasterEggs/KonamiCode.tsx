"use client";

import { useEffect, useRef } from "react";
import { useCrt } from "@/src/lib/useCrt";

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
  const { on, toggle } = useCrt();
  // Refs keep the key listener mounted once while seeing the latest values.
  const onRef = useRef(on);
  const toggleRef = useRef(toggle);
  useEffect(() => {
    onRef.current = on;
    toggleRef.current = toggle;
  });

  useEffect(() => {
    let buffer: string[] = [];
    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    let toast: HTMLDivElement | null = null;

    const activate = () => {
      const next = !onRef.current;
      // Keep the ref current so a second activation before re-render flips back.
      onRef.current = next;
      toggleRef.current();
      console.log(
        "%c🎮 crt mode: " + (next ? "on" : "off"),
        "color:#34d399;font-weight:700;font-family:ui-monospace,monospace;font-size:13px;",
      );
      toast?.remove();
      toast = document.createElement("div");
      toast.textContent = `// crt mode: ${next ? "on" : "off"}`;
      toast.className = "konami-toast";
      document.body.appendChild(toast);
      if (toastTimer) clearTimeout(toastTimer);
      const mine = toast;
      toastTimer = setTimeout(() => mine.remove(), 4000);
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
      toast?.remove();
    };
  }, []);

  return null;
};

export default KonamiCode;
