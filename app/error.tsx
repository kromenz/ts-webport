"use client";

import { ArrowClockwise, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

import SystemMessage from "@/src/components/SystemMessage/SystemMessage";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorBoundary = ({ error, reset }: Props) => {
  useEffect(() => {
    // The boundary swallows the throw, so without this nothing reaches the
    // browser console or Vercel's client logs.
    console.error(error);
  }, [error]);

  return (
    <SystemMessage
      shell="node"
      command="node ./portfolio"
      // In production Next redacts server-side messages, so the fallback is
      // the string most visitors will actually see.
      stderr={`Uncaught ${error.message || "exception during render"}`}
      exitCode="500"
      note="this one is on my side, not yours."
      actions={
        <>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 ring-2 ring-transparent transition-[color,box-shadow,background-color] hover:bg-transparent hover:text-white hover:ring-white focus-visible:outline-none focus-visible:ring-green-primary">
            <ArrowClockwise className="h-4 w-4" weight="bold" aria-hidden />
            retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-white/80 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:border-green-primary">
            <ArrowLeft className="h-4 w-4" weight="bold" aria-hidden />
            cd ~
          </Link>
        </>
      }>
      {error.digest ? (
        <p className="text-foreground/45">
          <span className="text-foreground/30">{"//"}</span> ref:{" "}
          <span className="text-foreground/70">{error.digest}</span>
        </p>
      ) : undefined}
    </SystemMessage>
  );
};

export default ErrorBoundary;
