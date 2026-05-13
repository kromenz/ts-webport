import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14141a",
          color: "#34d399",
          fontSize: 110,
          fontWeight: 700,
          letterSpacing: "-4px",
          borderRadius: 36,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}>
        {">_"}
      </div>
    ),
    size,
  );
}
