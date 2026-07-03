import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const points = [
    "Cliente rápido com autocompletar",
    "Tipo e data corretos",
    "Produtos pré-cadastrados",
    "Gestor aprova em segundos",
  ];

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 70% 20%, ${COLORS.primary}66, transparent 55%), radial-gradient(circle at 20% 90%, ${COLORS.accent}55, transparent 60%), ${COLORS.bgDeep}`,
      padding: 100, justifyContent: "center", alignItems: "center", textAlign: "center",
    }}>
      <div style={{ transform: `scale(${s})`, opacity }}>
        <div style={{
          fontFamily: "Playfair Display, serif", fontWeight: 900, color: "white",
          fontSize: 130, lineHeight: 1, letterSpacing: -3, marginBottom: 50,
        }}>
          Pronto!<br/>
          <span style={{ color: COLORS.accent, fontStyle: "italic" }}>Simples assim.</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 40, width: "100%", maxWidth: 700 }}>
        {points.map((p, i) => {
          const local = frame - (25 + i * 8);
          const ls = spring({ frame: local, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              padding: "22px 28px", background: "#FFFFFF15", borderRadius: 20,
              border: `1px solid ${COLORS.accent}44`,
              transform: `translateX(${(1 - ls) * -40}px)`, opacity: ls,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 22, background: COLORS.accent,
                color: COLORS.bgDeep, fontWeight: 800, fontSize: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✓</div>
              <div style={{ fontSize: 28, color: "white", fontWeight: 600, textAlign: "left" }}>{p}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
