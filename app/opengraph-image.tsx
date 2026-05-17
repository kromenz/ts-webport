import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rafael André — Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#34d399";
const FG = "#e2e8f0";
const BG = "#14141a";

const OpengraphImage = async () => {
  return new ImageResponse(
    (
      <div
        style={{
          background: BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          color: FG,
          position: "relative",
        }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 15% 20%, rgba(52,211,153,0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(52,211,153,0.12), transparent 50%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 1,
          }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "rgba(248,113,113,0.7)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "rgba(250,204,21,0.7)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: GREEN,
            }}
          />
          <div style={{ marginLeft: 16, fontSize: 22, color: "#94a3b8" }}>
            portfolio.sh
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div style={{ fontSize: 28, color: GREEN, marginBottom: 12 }}>
            $ whoami
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
            }}>
            Rafael André
          </div>
          <div style={{ fontSize: 42, color: "#94a3b8", marginTop: 16 }}>
            Full Stack Developer
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#64748b",
            zIndex: 1,
          }}>
          <div>github.com/kromenz</div>
          <div style={{ color: GREEN }}>~/portfolio</div>
        </div>
      </div>
    ),
    { ...size },
  );
};

export default OpengraphImage;
