"use client";

import { useEffect } from "react";

const BANNER = String.raw`
  ____         __            _      _              _
 |  _ \ __ _ / _| __ _  ___| |    / \   _ __   __| |_ __ ___
 | |_) / _\ | |_ / _\ |/ _ \ |   / _ \ | '_ \ / _\ | '__/ _ \
 |  _ < (_| |  _| (_| |  __/ |  / ___ \| | | | (_| | | |  __/
 |_| \_\__,_|_|  \__,_|\___|_| /_/   \_\_| |_|\__,_|_|  \___|
`;

const ConsoleBanner = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as unknown as { __ra_banner__?: boolean }).__ra_banner__) return;
    (window as unknown as { __ra_banner__?: boolean }).__ra_banner__ = true;

    const accent =
      "color:#34d399;font-family:ui-monospace,monospace;font-size:11px;line-height:1.1;";
    const headline =
      "color:#34d399;font-weight:700;font-size:13px;font-family:ui-monospace,monospace;";
    const body =
      "color:#e2e8f0;font-size:12px;font-family:ui-monospace,monospace;";
    const muted =
      "color:#888;font-style:italic;font-size:11px;font-family:ui-monospace,monospace;";

    console.log(`%c${BANNER}`, accent);
    console.log("%cHey there — like what you see?", headline);
    console.log("%c> mail   andrerafael892@gmail.com", body);
    console.log("%c> github github.com/kromenz", body);
    console.log("%c> linkedin linkedin.com/in/rafael-andré", body);
    console.log("%cpsst… try the konami code 🎮", muted);
  }, []);

  return null;
};

export default ConsoleBanner;
