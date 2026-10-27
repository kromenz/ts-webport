"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useSound } from "@/src/lib/useSound";
import { useSiteReducedMotion } from "@/src/lib/motion";
import { shortHash } from "@/src/lib/gitGraph";
import { CONTACT_FOCUS_EVENT } from "@/src/components/CommandPalette/Shell";
import { CV_URL } from "@/src/components/Navbar/NavbarContent";
import { pushFrames, pushResult, validateCommit } from "@/src/lib/commitPush";

const EMAIL = "andrerafael892@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/rafael-andr%C3%A9/";
const GITHUB_URL = "https://github.com/kromenz";

const SUBJECT_SOFT_MAX = 50;
const LINE_PX = 24;
const MIN_BODY_ROWS = 4;

// "⌘" on Apple platforms, "Ctrl" elsewhere. The server snapshot is empty so
// the first client render matches the SSR output.
const noopSubscribe = () => () => {};
const getModKey = () =>
  /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
    ? "⌘"
    : "Ctrl";
const getServerModKey = () => "";

type Phase = "idle" | "sending" | "done";

const chipBase =
  "inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-xs font-mono outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-primary/60";
const chipGhost = `${chipBase} border-white/10 bg-white/5 text-foreground/75 hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-green-primary`;

const CommitComposer = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [resultLines, setResultLines] = useState<string[]>([]);
  const [delivered, setDelivered] = useState(false);
  const [bodyRows, setBodyRows] = useState(MIN_BODY_ROWS);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const sendingRef = useRef(false);
  const mountedAtRef = useRef(0);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reduced = useSiteReducedMotion();
  const { click, beep } = useSound();
  const modKey = useSyncExternalStore(
    noopSubscribe,
    getModKey,
    getServerModKey,
  );

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const stopTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopTick();
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [stopTick],
  );

  // The Ctrl+K shell asks for focus here; the glitch jump owns scrolling.
  useEffect(() => {
    const onFocus = () => subjectRef.current?.focus({ preventScroll: true });
    window.addEventListener(CONTACT_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(CONTACT_FOCUS_EVENT, onFocus);
  }, []);

  const fitBody = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = "auto";
    const rows = Math.max(MIN_BODY_ROWS, Math.ceil(el.scrollHeight / LINE_PX));
    el.style.height = `${rows * LINE_PX}px`;
    setBodyRows(rows);
  }, []);

  // Re-fit when the editor's width changes (window resize, rotation).
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      let lastW = el.clientWidth;
      ro = new ResizeObserver(() => {
        if (el.clientWidth === lastW) return;
        lastW = el.clientWidth;
        fitBody();
      });
      ro.observe(el);
    }
    window.addEventListener("resize", fitBody);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", fitBody);
    };
  }, [fitBody]);

  const push = useCallback(async () => {
    if (sendingRef.current) return;
    const problems = validateCommit({ subject, message, from });
    if (problems.length) {
      setErrors(problems);
      setPhase("idle");
      setResultLines([]);
      beep(true);
      return;
    }
    sendingRef.current = true;
    setErrors([]);
    setResultLines([]);
    setDelivered(false);
    setPhase("sending");
    beep();

    stopTick();
    if (reduced) {
      setProgress(0.9);
    } else {
      setProgress(0);
      tickRef.current = setInterval(() => {
        setProgress((p) => Math.min(0.9, p + (0.9 - p) * 0.12 + 0.01));
      }, 80);
    }

    const hash = shortHash(`${subject.trim()}${from.trim()}`);
    let ok = false;
    let error: string | undefined;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from: from.trim(),
          subject: subject.trim(),
          message: message.trim(),
          hp,
          ts: mountedAtRef.current,
        }),
      });
      let payload: { ok?: boolean; error?: string } = {};
      try {
        payload = (await res.json()) as typeof payload;
      } catch {
        /* non-JSON body: fall back to the status */
      }
      ok = res.ok && !!payload.ok;
      if (!ok) error = payload.error ?? `HTTP ${res.status}`;
    } catch {
      error = "network error";
    } finally {
      sendingRef.current = false;
    }

    stopTick();
    setProgress(1);
    setResultLines(pushResult(ok, hash, error));
    setDelivered(ok);
    setPhase("done");
    if (ok) {
      beep();
      setSubject("");
      setMessage("");
      setFrom("");
      requestAnimationFrame(fitBody);
    } else {
      beep(true);
    }
  }, [subject, message, from, hp, reduced, beep, stopTick, fitBody]);

  const newCommit = () => {
    setPhase("idle");
    setProgress(0);
    setResultLines([]);
    setErrors([]);
    subjectRef.current?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!e.repeat) void push();
      return;
    }
    const tag = (e.target as HTMLElement).tagName;
    if (
      (tag === "INPUT" || tag === "TEXTAREA") &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      click(true);
    }
  };

  const copyEmail = async () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    let next: "copied" | "failed" = "copied";
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      next = "failed";
    }
    setCopyState(next);
    copyTimerRef.current = setTimeout(
      () => setCopyState("idle"),
      next === "failed" ? 6000 : 1500,
    );
  };

  const logLines = [
    ...pushFrames(progress),
    ...(phase === "done" ? resultLines : []),
  ];
  const rowCls =
    "flex items-start gap-3 px-3 rounded-sm transition-colors focus-within:bg-white/4";
  const gutterCls =
    "w-5 shrink-0 select-none text-right text-[13px] leading-6 text-foreground/25 tabular-nums";
  const fieldCls =
    "min-w-0 flex-1 bg-transparent outline-none text-[13px] leading-6 text-foreground placeholder:text-foreground/30 caret-green-primary font-mono";

  return (
    <div
      onKeyDown={onKeyDown}
      className="font-mono text-[13px]"
      style={{ fontVariantLigatures: "none" }}
    >
      <div className="rounded-lg border border-white/10 bg-black/30 py-2">
        <div className={rowCls}>
          <span className={gutterCls} aria-hidden>
            1
          </span>
          <input
            ref={subjectRef}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
            aria-label="Commit subject"
            placeholder="Let's build something"
            className={fieldCls}
          />
          <span
            className={`shrink-0 text-[11px] leading-6 tabular-nums ${
              subject.length > SUBJECT_SOFT_MAX
                ? "text-amber-400"
                : "text-foreground/35"
            }`}
            aria-hidden
          >
            {subject.length}/{SUBJECT_SOFT_MAX}
          </span>
        </div>
        <div className={rowCls} aria-hidden>
          <span className={gutterCls}>2</span>
          <span className="h-6" />
        </div>
        <div className={rowCls}>
          <span className={gutterCls} aria-hidden>
            {Array.from({ length: bodyRows }, (_, i) => (
              <span key={i} className="block">
                {3 + i}
              </span>
            ))}
          </span>
          <textarea
            ref={bodyRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              fitBody();
            }}
            rows={MIN_BODY_ROWS}
            spellCheck={false}
            aria-label="Commit message body"
            placeholder="Hi Rafael, …"
            style={{ height: bodyRows * LINE_PX }}
            className={`${fieldCls} resize-none overflow-hidden`}
          />
        </div>
        <div className={rowCls}>
          <span className={gutterCls} aria-hidden>
            {3 + bodyRows}
          </span>
          <label className="flex min-w-0 flex-1 items-center text-[13px] leading-6">
            <span className="shrink-0 select-none text-foreground/40">
              # from:&nbsp;
            </span>
            <input
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              autoComplete="email"
              spellCheck={false}
              aria-label="Your email"
              placeholder="you@company.com"
              className={fieldCls}
            />
          </label>
        </div>
        {/* honeypot — hidden from real users */}
        <input
          type="text"
          tabIndex={-1}
          aria-hidden
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          autoComplete="off"
        />
      </div>

      {errors.length > 0 && (
        <div role="alert" className="mt-3 space-y-0.5 text-red-400">
          {errors.map((line) => (
            <p key={line} className="m-0">
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void push()}
          aria-disabled={phase === "sending"}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          className={`${chipBase} w-full sm:w-auto border-green-primary/50 bg-green-primary/15 text-green-primary hover:bg-green-primary/25 aria-disabled:opacity-50 aria-disabled:cursor-default`}
        >
          <span suppressHydrationWarning>
            {modKey ? `${modKey}↵ push` : "↵ push"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => void copyEmail()}
          className={chipGhost}
        >
          {copyState === "copied" ? "✓ copied" : "copy email"}
        </button>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={chipGhost}
        >
          linkedin
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={chipGhost}
        >
          github
        </a>
        <a
          href={CV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={chipGhost}
        >
          cv
        </a>
      </div>

      {copyState === "failed" && (
        <p className="mt-2 mb-0 select-all text-foreground/70">
          clipboard blocked — {EMAIL}
        </p>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {copyState === "copied"
          ? "email address copied"
          : copyState === "failed"
            ? "clipboard blocked, email address shown below"
            : phase === "sending"
              ? "pushing…"
              : phase === "done"
                ? delivered
                  ? "delivered"
                  : (resultLines[0] ?? "push failed")
                : ""}
      </div>

      {phase !== "idle" && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 px-4 py-3 leading-relaxed">
          <div aria-hidden>
            {logLines.map((line, i) => {
              const tone =
                line.startsWith("!") || line.startsWith("error")
                  ? "text-red-400"
                  : line.startsWith("$") || line.includes("✓")
                    ? "text-green-primary"
                    : "text-foreground/75";
              return (
                <pre
                  key={i}
                  className={`m-0 whitespace-pre-wrap break-words font-mono ${tone}`}
                >
                  {line}
                </pre>
              );
            })}
          </div>
          {phase === "done" && (
            <button
              type="button"
              onClick={newCommit}
              className={`${chipGhost} mt-3`}
            >
              {delivered ? "new commit" : "dismiss"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommitComposer;
