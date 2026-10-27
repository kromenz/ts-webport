"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { makeBeep, makeClick } from "./sfx";

export const SOUND_KEY = "ra:sound";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Never throws; anything unreadable means sound off. */
export function readSoundPref(storage: StorageLike | null = defaultStorage()) {
  try {
    return storage?.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSoundPref(
  on: boolean,
  storage: StorageLike | null = defaultStorage(),
): void {
  try {
    storage?.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {
    /* storage unavailable: the preference just doesn't persist */
  }
}

export type SoundApi = {
  enabled: boolean;
  toggle(): void;
  click(soft?: boolean): void;
  beep(error?: boolean): void;
};

const NOOP_SOUND: SoundApi = {
  enabled: false,
  toggle() {},
  click() {},
  beep() {},
};

const SoundContext = createContext<SoundApi>(NOOP_SOUND);

type AudioCtor = typeof AudioContext;

function createAudioContext(): AudioContext | null {
  try {
    const Ctor: AudioCtor | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioCtor })
        .webkitAudioContext;
    return Ctor ? new Ctor() : null;
  } catch {
    return null;
  }
}

// Tiny external store for the preference. getServerSnapshot is false, so the
// server and the hydrating render show "sound off"; React then re-reads the
// client snapshot (the stored preference) right after hydration.
let pref: boolean | null = null;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};
const getSnapshot = () => (pref ??= readSoundPref());
const getServerSnapshot = () => false;
const setPref = (v: boolean) => {
  pref = v;
  writeSoundPref(v);
  listeners.forEach((l) => l());
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const ctxRef = useRef<AudioContext | null>(null);

  // The AudioContext is created on a user gesture only: in toggle() when
  // turning on, or lazily on the first click()/beep() when the preference
  // came from a previous visit.
  const getCtx = useCallback((): AudioContext | null => {
    if (!getSnapshot()) return null;
    if (!ctxRef.current) ctxRef.current = createAudioContext();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  }, []);

  const toggle = useCallback(() => {
    const next = !getSnapshot();
    setPref(next);
    if (next) getCtx();
  }, [getCtx]);

  const click = useCallback(
    (soft = false) => {
      const ctx = getCtx();
      if (ctx) makeClick(ctx, soft);
    },
    [getCtx],
  );

  const beep = useCallback(
    (error = false) => {
      const ctx = getCtx();
      if (ctx) makeBeep(ctx, error);
    },
    [getCtx],
  );

  const value = useMemo(
    () => ({ enabled, toggle, click, beep }),
    [enabled, toggle, click, beep],
  );
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  return useContext(SoundContext);
}
