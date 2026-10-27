"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  complete,
  runCommand,
  truncateEcho,
  type ShellEffect,
  type ShellLine,
} from "@/src/lib/shell/commands";
import { glitchJump } from "@/src/lib/glitchJump";
import { useSiteReducedMotion } from "@/src/lib/motion";
import { useSound } from "@/src/lib/useSound";
import { useCrt } from "@/src/lib/useCrt";

export const SHELL_OPEN_EVENT = "shell:open";
export const CONTACT_FOCUS_EVENT = "contact:focus";

/** Opens the shell from anywhere (the navbar button uses this). */
export function openShell() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SHELL_OPEN_EVENT));
  }
}

type OutLine = {
  id: number;
  text: string;
  tone: ShellLine["tone"] | "user";
  href?: string;
};

const TONE_CLASS: Record<OutLine["tone"], string> = {
  info: "text-foreground/80",
  muted: "text-foreground/45",
  accent: "text-green-primary/90",
  user: "text-foreground",
  error: "text-red-400",
  link: "text-[#7dd3fc] underline underline-offset-2 hover:text-green-primary",
};

const PROMPT = "rafael@portfolio:~$";
const QUICK = ["help", "ls projects", "cat about.txt", "sudo hire-me"];
const FOCUSABLE = 'button, [href], input, [tabindex]:not([tabindex="-1"])';

const bootShowing = () => !!document.documentElement.dataset.boot;

/** Focus the contact input once the contact section exists (after a route change). */
function focusContactWhenReady(tries = 30) {
  const attempt = (left: number) => {
    if (document.getElementById("contact")) {
      window.setTimeout(
        () => window.dispatchEvent(new Event(CONTACT_FOCUS_EVENT)),
        120,
      );
    } else if (left > 0) {
      window.setTimeout(() => attempt(left - 1), 100);
    }
  };
  attempt(tries);
}

export default function Shell() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<OutLine[]>([]);
  const idRef = useRef(0);
  const histRef = useRef<string[]>([]);
  const histIdx = useRef(0);
  const draftRef = useRef("");
  const prevFocus = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);

  const reduced = useSiteReducedMotion();
  const sound = useSound();
  const crt = useCrt();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const append = useCallback((items: Omit<OutLine, "id">[]) => {
    const withIds = items.map((l) => ({ ...l, id: ++idRef.current }));
    setLines((prev) => [...prev, ...withIds]);
  }, []);

  const show = useCallback(() => {
    if (openRef.current || bootShowing()) return;
    prevFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setLines((prev) => {
      if (prev.length) return prev;
      const hello = runCommand("neofetch", { history: [] }).lines;
      const items: Omit<OutLine, "id">[] = [
        ...hello,
        { text: "", tone: "muted" },
        { text: "type 'help', or press Tab to complete.", tone: "muted" },
      ];
      return items.map((l) => ({ ...l, id: ++idRef.current }));
    });
    setOpen(true);
  }, []);

  const hide = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    const back = prevFocus.current;
    prevFocus.current = null;
    if (restoreFocus && back && document.contains(back)) {
      back.focus({ preventScroll: true });
    }
  }, []);

  // Global shortcut and external open requests.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "k"
      ) {
        // Always swallow the browser's own binding (focus address bar/search).
        e.preventDefault();
        if (openRef.current) hide(true);
        else show();
        return;
      }
      // Escape is handled here, not on the dialog, so it still closes after a
      // click left focus on <body>.
      if (e.key === "Escape" && openRef.current) {
        e.preventDefault();
        e.stopPropagation();
        hide(true);
      }
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey, true);
    window.addEventListener(SHELL_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener(SHELL_OPEN_EVENT, onOpen);
    };
  }, [show, hide]);

  // Focus the input on open; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  const applyEffect = useCallback(
    (effect: ShellEffect) => {
      if (effect.kind === "clear") {
        setLines([]);
      } else if (effect.kind === "crt") {
        crt.set(effect.on);
      } else if (effect.kind === "goto") {
        hide(false);
        if (pathname === "/") {
          glitchJump("contact");
          // Focus uses preventScroll, so it cannot fight the jump; wait for
          // the glitch to finish so the field is already on screen.
          window.setTimeout(
            () => window.dispatchEvent(new Event(CONTACT_FOCUS_EVENT)),
            reduced ? 0 : 450,
          );
        } else {
          router.push("/#contact");
          focusContactWhenReady();
        }
      }
    },
    [crt, hide, pathname, reduced, router],
  );

  const run = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (value) {
        append([
          { text: `${PROMPT} ${truncateEcho(value)}`, tone: "user" },
        ]);
      }
      if (!value) return;
      const result = runCommand(value, { history: histRef.current });
      histRef.current.push(value);
      histIdx.current = histRef.current.length;
      if (result.lines.length) append(result.lines);
      if (result.lines.some((l) => l.tone === "error")) sound.beep(true);
      if (result.effect) applyEffect(result.effect);
    },
    [append, applyEffect, sound],
  );

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sound.click();
      const v = input;
      setInput("");
      draftRef.current = "";
      run(v);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = histRef.current;
      if (!h.length) return;
      if (histIdx.current === h.length) draftRef.current = input;
      histIdx.current = Math.max(0, histIdx.current - 1);
      setInput(h[histIdx.current]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = histRef.current;
      if (histIdx.current >= h.length) return;
      histIdx.current += 1;
      setInput(
        histIdx.current >= h.length ? draftRef.current : h[histIdx.current],
      );
      return;
    }
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      sound.click(true);
      const hits = complete(input);
      if (hits.length === 1) {
        const only = hits[0];
        setInput(/\s/.test(only) ? only : `${only} `);
      } else if (hits.length > 1) {
        append([{ text: hits.join("  "), tone: "muted" }]);
      }
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) sound.click();
  };

  // Tab outside the input cycles inside the dialog. In the input Tab
  // completes instead, so focus can never leave through it.
  const onDialogKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    // Shift+Tab from the input moves backwards natively.
    if (e.key !== "Tab" || e.target === inputRef.current) return;
    const items = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-90 flex items-start justify-center bg-black/60 px-3 pt-[10vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) hide(true);
      }}>
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shell-title"
        tabIndex={-1}
        onKeyDown={onDialogKey}
        onClick={(e) => {
          // A click on chrome (title bar, padding) must not strand focus on
          // the dialog or <body>; give it back to the prompt unless the user
          // is selecting text or hit something interactive.
          const t = e.target as HTMLElement;
          if (t.closest("input,button,a,textarea,select")) return;
          if (!window.getSelection()?.isCollapsed) return;
          inputRef.current?.focus({ preventScroll: true });
        }}
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.14, ease: "easeOut" }}
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg outline-none border border-white/10 bg-background font-mono text-sm shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/3 px-4 py-2">
          <h2
            id="shell-title"
            className="text-xs font-normal text-foreground/45">
            ~/rafael — shell
          </h2>
          <button
            type="button"
            onClick={() => hide(true)}
            aria-label="Close shell"
            className="rounded px-1.5 text-xs text-foreground/45 outline-none transition-colors hover:text-green-primary focus-visible:ring-2 focus-visible:ring-green-primary/60">
            esc
          </button>
        </div>

        <div
          ref={outRef}
          role="log"
          aria-live="polite"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
          className="scrollbar-custom flex h-[min(52vh,380px)] flex-col gap-0.5 overflow-y-auto px-4 py-3 leading-relaxed [font-variant-ligatures:none]">
          {lines.map((l) => {
            const cls = `m-0 whitespace-pre-wrap wrap-break-word font-mono text-[13px] [font-variant-ligatures:none] ${TONE_CLASS[l.tone]}`;
            return l.href ? (
              <a
                key={l.id}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cls} block outline-none focus-visible:ring-2 focus-visible:ring-green-primary/60`}>
                {l.text}
              </a>
            ) : (
              <pre key={l.id} className={cls}>
                {l.text || " "}
              </pre>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                sound.click();
                run(q);
                inputRef.current?.focus({ preventScroll: true });
              }}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-foreground/70 outline-none transition-colors hover:border-green-primary/40 hover:text-green-primary focus-visible:ring-2 focus-visible:ring-green-primary/60">
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 bg-white/3 px-4 py-2.5">
          <span className="shrink-0 select-none text-[13px] text-green-primary">
            {PROMPT}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              histIdx.current = histRef.current.length;
            }}
            onKeyDown={onInputKey}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Shell command"
            placeholder="help"
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:text-foreground/30"
          />
        </div>
      </motion.div>
    </div>
  );
}
