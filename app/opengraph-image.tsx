import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#05070B",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            color: "#18F0FF",
            fontFamily: "monospace",
          }}
        >
          LIVE SPORTS / REAL-TIME
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#F5F7FA",
            letterSpacing: -2,
            marginTop: 16,
          }}
        >
          VELOR
        </div>
        <div style={{ fontSize: 32, color: "#8993A4", marginTop: 16 }}>
          Live scores, match intelligence, standings and player data.
        </div>
      </div>
    ),
    { ...size }
  );
}
