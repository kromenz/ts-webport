import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-1px",
          borderRadius: 7,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}>
        {">_"}
      </div>
    ),
    size,
  );
}
