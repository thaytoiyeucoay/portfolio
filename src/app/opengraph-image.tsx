import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Image() {
  const title = "Khánh Duy Bùi — AI Engineer & Developer";
  const subtitle = "Building intelligent systems with data & code";
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
          color: "white",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 60px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1, textAlign: "center" }}>{title}</div>
          <div style={{ marginTop: 16, fontSize: 28, opacity: 0.9 }}>{subtitle}</div>
          <div style={{ marginTop: 28, fontSize: 18, opacity: 0.7 }}>duybuiai.dev</div>
        </div>
      </div>
    ),
    size
  );
}
