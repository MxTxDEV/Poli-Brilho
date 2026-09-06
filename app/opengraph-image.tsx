import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
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
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#f5f5f4",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 10,
            color: "#c7c9cc",
            marginBottom: 24,
          }}
        >
          POLIBRILHO
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          BRILHO DE VERDADE.
        </div>
        <div style={{ fontSize: 26, color: "#9a9a9d", marginTop: 28 }}>
          Sabão Polibrilho · 500g
        </div>
      </div>
    ),
    { ...size }
  );
}
