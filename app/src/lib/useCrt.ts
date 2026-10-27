"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CrtApi = {
  on: boolean;
  toggle(): void;
  set(v: boolean): void;
};

const NOOP_CRT: CrtApi = { on: false, toggle() {}, set() {} };

const CrtContext = createContext<CrtApi>(NOOP_CRT);

/**
 * CRT mode lives in memory for the page lifetime only (no storage). The
 * provider sits in the root layout, so it survives client navigations.
 */
export function CrtProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("crt-on", on);
  }, [on]);

  useEffect(
    () => () => document.documentElement.classList.remove("crt-on"),
    [],
  );

  const toggle = useCallback(() => setOn((v) => !v), []);
  const set = useCallback((v: boolean) => setOn(v), []);

  const value = useMemo(() => ({ on, toggle, set }), [on, toggle, set]);
  return createElement(CrtContext.Provider, { value }, children);
}

export function useCrt(): CrtApi {
  return useContext(CrtContext);
}
