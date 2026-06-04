"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL = "andrerafael892@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/rafael-andr%C3%A9/";
const GITHUB_URL = "https://github.com/kromenz";

type Stage =
  | "menu"
  | "field-email"
  | "field-subject"
  | "field-message"
  | "confirm"
  | "sending"
  | "result";

type Tone = "info" | "muted" | "accent" | "user" | "error" | "success";

type Line = {
  id: number;
  text: string;
  tone: Tone;
};

const TONE_CLASS: Record<Tone, string> = {
  info: "text-foreground/80",
  muted: "text-foreground/45",
  accent: "text-green-primary/90",
  user: "text-foreground",
  error: "text-red-400",
  success: "text-green-primary",
};

const WELCOME: Omit<Line, "id">[] = [
  { text: "$ ./contact", tone: "accent" },
  { text: "", tone: "muted" },
  { text: "Welcome. How would you like to reach out?", tone: "info" },
  { text: "", tone: "muted" },
  { text: "  [1] email     — send me a message directly", tone: "info" },
  { text: "  [2] linkedin  — open my profile in a new tab", tone: "info" },
  { text: "  [3] github    — open my profile in a new tab", tone: "info" },
  { text: "  [4] copy      — copy my email to clipboard", tone: "info" },
  { text: "", tone: "muted" },
  { text: "// type a number and press Enter", tone: "muted" },
];

const promptFor = (stage: Stage): string => {
  switch (stage) {
    case "menu":
      return ">";
    case "field-email":
      return "? your email >";
    case "field-subject":
      return "? subject    >";
    case "field-message":
      return "? message    >";
    case "confirm":
      return "send this? [y/N] >";
    case "sending":
      return "...";
    case "result":
      return "$";
  }
};

const makeWelcome = (): Line[] => WELCOME.map((l, i) => ({ ...l, id: i + 1 }));

const ContactTerminal = () => {
  const [history, setHistory] = useState<Line[]>(() => makeWelcome());
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<Stage>("menu");
  const [form, setForm] = useState({ from: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [hp, setHp] = useState("");
  const mountedAtRef = useRef(Date.now());
  const counterRef = useRef(WELCOME.length);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const append = useCallback((lines: Omit<Line, "id">[]) => {
    // Assign IDs OUTSIDE the updater so the updater stays pure (Strict Mode safe).
    const withIds: Line[] = lines.map((l) => ({
      ...l,
      id: ++counterRef.current,
    }));
    setHistory((prev) => [...prev, ...withIds]);
  }, []);

  const resetHistory = useCallback(() => {
    counterRef.current = WELCOME.length;
    setHistory(makeWelcome());
  }, []);

  const appendUserEcho = useCallback(
    (stageAtSubmit: Stage, value: string) => {
      append([
        {
          text: `${promptFor(stageAtSubmit)} ${value}`,
          tone: "user",
        },
      ]);
    },
    [append],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [history, stage, busy]);

  const focusInput = () => inputRef.current?.focus();

  const resetToMenu = useCallback(() => {
    setForm({ from: "", subject: "", message: "" });
    setStage("menu");
    append([
      { text: "", tone: "muted" },
      { text: "// back to menu", tone: "muted" },
      {
        text: "  [1] email   [2] linkedin   [3] github   [4] copy",
        tone: "info",
      },
    ]);
  }, [append]);

  const handleMenu = useCallback(
    (value: string) => {
      const choice = value.trim().toLowerCase();
      if (choice === "1" || choice === "email") {
        append([
          { text: "channel: email. type :back to cancel.", tone: "muted" },
        ]);
        setStage("field-email");
        return;
      }
      if (choice === "2" || choice === "linkedin") {
        append([
          { text: "opening linkedin in a new tab... ✓", tone: "success" },
        ]);
        if (typeof window !== "undefined") {
          window.open(LINKEDIN_URL, "_blank", "noopener,noreferrer");
        }
        return;
      }
      if (choice === "3" || choice === "github") {
        append([{ text: "opening github in a new tab... ✓", tone: "success" }]);
        if (typeof window !== "undefined") {
          window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
        }
        return;
      }
      if (choice === "4" || choice === "copy") {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard
            .writeText(EMAIL)
            .then(() =>
              append([
                {
                  text: `${EMAIL} copied to clipboard ✓`,
                  tone: "success",
                },
              ]),
            )
            .catch(() =>
              append([
                {
                  text: "failed to copy — clipboard blocked.",
                  tone: "error",
                },
              ]),
            );
        } else {
          append([{ text: "clipboard not available.", tone: "error" }]);
        }
        return;
      }
      if (choice === "help" || choice === "?") {
        append([
          { text: "commands: 1, 2, 3, 4, help, :back, :clear", tone: "muted" },
        ]);
        return;
      }
      if (choice === ":clear") {
        resetHistory();
        return;
      }
      append([
        {
          text: `unknown option: "${value}". type 1, 2, 3 or 4.`,
          tone: "error",
        },
      ]);
    },
    [append, resetHistory],
  );

  const showPreview = useCallback(
    (next: { from: string; subject: string; message: string }) => {
      append([
        { text: "", tone: "muted" },
        { text: "─── preview ───────────────────────", tone: "muted" },
        { text: `from:    ${next.from}`, tone: "info" },
        { text: `subject: ${next.subject}`, tone: "info" },
        { text: `message: ${next.message}`, tone: "info" },
        { text: "───────────────────────────────────", tone: "muted" },
      ]);
    },
    [append],
  );

  const sendEmail = useCallback(
    async (data: { from: string; subject: string; message: string }) => {
      setBusy(true);
      setStage("sending");
      append([{ text: "sending...", tone: "muted" }]);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...data,
            hp,
            ts: mountedAtRef.current,
          }),
        });

        const contentType = res.headers.get("content-type") ?? "";
        let payload: { ok?: boolean; error?: string } = {};
        let rawText = "";

        if (contentType.includes("application/json")) {
          try {
            payload = (await res.json()) as typeof payload;
          } catch {
            rawText = await res.text().catch(() => "");
          }
        } else {
          rawText = await res.text().catch(() => "");
        }

        if (!res.ok || !payload.ok) {
          const detail =
            payload.error ??
            (rawText
              ? `HTTP ${res.status} · ${rawText.slice(0, 140)}`
              : `HTTP ${res.status}`);
          append([
            { text: `✗ failed: ${detail}`, tone: "error" },
            { text: "type :back to try again.", tone: "muted" },
          ]);
          if (typeof console !== "undefined") {
            console.error("[contact] send failed", {
              status: res.status,
              payload,
              rawText,
            });
          }
        } else {
          append([
            {
              text: "✓ message sent. I'll get back to you soon.",
              tone: "success",
            },
            { text: "", tone: "muted" },
            { text: "// type :back to return to menu", tone: "muted" },
          ]);
        }
      } catch (err) {
        const detail = err instanceof Error ? err.message : "network error";
        append([
          { text: `✗ failed: ${detail}`, tone: "error" },
          { text: "type :back to try again.", tone: "muted" },
        ]);
        if (typeof console !== "undefined") {
          console.error("[contact] fetch failed", err);
        }
      } finally {
        setBusy(false);
        setStage("result");
      }
    },
    [append, hp],
  );

  const submit = () => {
    if (busy) return;
    const raw = input;
    const value = raw.trim();
    const stageAtSubmit = stage;
    setInput("");

    if (stageAtSubmit === "result") {
      if (value === ":back" || value === ":menu") {
        resetToMenu();
        return;
      }
      appendUserEcho(stageAtSubmit, raw);
      append([{ text: "type :back to return to menu.", tone: "muted" }]);
      return;
    }

    appendUserEcho(stageAtSubmit, raw);

    if (value === ":back" || value === ":cancel") {
      resetToMenu();
      return;
    }
    if (value === ":clear") {
      resetHistory();
      return;
    }

    if (stageAtSubmit === "menu") {
      handleMenu(value);
      return;
    }
    if (stageAtSubmit === "field-email") {
      if (!EMAIL_RE.test(value)) {
        append([{ text: "✗ invalid email format. try again.", tone: "error" }]);
        return;
      }
      setForm((f) => ({ ...f, from: value }));
      setStage("field-subject");
      return;
    }
    if (stageAtSubmit === "field-subject") {
      if (value.length < 1) {
        append([{ text: "✗ subject is required.", tone: "error" }]);
        return;
      }
      if (value.length > 200) {
        append([
          { text: "✗ subject too long (max 200 chars).", tone: "error" },
        ]);
        return;
      }
      setForm((f) => ({ ...f, subject: value }));
      setStage("field-message");
      return;
    }
    if (stageAtSubmit === "field-message") {
      if (value.length < 5) {
        append([{ text: "✗ message too short (min 5 chars).", tone: "error" }]);
        return;
      }
      if (value.length > 5000) {
        append([
          { text: "✗ message too long (max 5000 chars).", tone: "error" },
        ]);
        return;
      }
      const next = { ...form, message: value };
      setForm(next);
      showPreview(next);
      setStage("confirm");
      return;
    }
    if (stageAtSubmit === "confirm") {
      const v = value.toLowerCase();
      if (v === "y" || v === "yes") {
        void sendEmail(form);
        return;
      }
      append([{ text: "cancelled.", tone: "muted" }]);
      resetToMenu();
      return;
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const placeholder = useMemo(() => {
    switch (stage) {
      case "menu":
        return "1, 2, 3 or 4…";
      case "field-email":
        return "you@example.com";
      case "field-subject":
        return "what's it about?";
      case "field-message":
        return "type your message…";
      case "confirm":
        return "y / n";
      case "sending":
        return "";
      case "result":
        return ":back to send another";
    }
  }, [stage]);

  return (
    <div
      onClick={focusInput}
      className="flex flex-col bg-black/30 border border-white/10 rounded-lg overflow-hidden font-mono text-sm cursor-text">
      <div
        ref={scrollRef}
        className="px-4 py-3 h-[320px] sm:h-[360px] overflow-y-auto scrollbar-custom flex flex-col gap-0.5 leading-relaxed">
        {history.map((line) => (
          <pre
            key={line.id}
            className={`whitespace-pre-wrap wrap-break-word m-0 font-mono text-[13px] ${TONE_CLASS[line.tone]}`}>
            {line.text || " "}
          </pre>
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/10 bg-white/3">
        <span
          className={`shrink-0 select-none font-mono text-[13px] ${
            stage === "result" ? "text-green-primary/80" : "text-green-primary"
          }`}>
          {promptFor(stage)}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={busy || stage === "sending"}
          aria-label="Terminal input"
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/30 font-mono text-[13px] disabled:opacity-50"
        />
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
    </div>
  );
};

export default ContactTerminal;
