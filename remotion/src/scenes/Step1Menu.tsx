import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { PhoneFrame, StepBadge } from "../components";

export const Step1Menu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const highlight = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const tapScale = interpolate(frame, [55, 65, 75], [1, 0.94, 1], { extrapolateRight: "clamp" });
  const cursorX = interpolate(frame, [10, 50], [500, 200], { extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [10, 50], [900, 620], { extrapolateRight: "clamp" });

  const items = [
    { label: "Meus Trabalhos", icon: "📋" },
    { label: "Agendar Trabalho", icon: "➕", active: true },
    { label: "Clientes", icon: "👥" },
  ];

  return (
    <AbsoluteFill style={{ padding: "80px 60px", alignItems: "center", justifyContent: "flex-start", gap: 40 }}>
      <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * -30}px)`, alignSelf: "flex-start", marginLeft: 40 }}>
        <StepBadge n={1} label="Abra o menu" />
      </div>

      <div style={{ transform: `scale(${0.85 * tapScale})`, opacity: enter, marginTop: -20 }}>
        <PhoneFrame>
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: COLORS.ink, letterSpacing: -1 }}>
              Olá, Vendedor 👋
            </div>
            <div style={{ fontSize: 22, color: COLORS.muted, marginBottom: 16 }}>
              O que vamos fazer hoje?
            </div>
            {items.map((it, i) => {
              const isActive = it.active;
              return (
                <div key={i} style={{
                  padding: "28px 28px",
                  borderRadius: 24,
                  background: isActive ? `${COLORS.primary}${Math.round(highlight * 255).toString(16).padStart(2, "0")}` : COLORS.card,
                  border: `2px solid ${isActive ? COLORS.primary : COLORS.border}`,
                  display: "flex", alignItems: "center", gap: 20,
                  boxShadow: isActive ? `0 12px 30px ${COLORS.primary}44` : "0 4px 12px rgba(0,0,0,0.04)",
                  transform: isActive ? `scale(${1 + highlight * 0.03})` : "scale(1)",
                }}>
                  <div style={{ fontSize: 36 }}>{it.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: isActive && highlight > 0.5 ? "white" : COLORS.ink }}>
                    {it.label}
                  </div>
                </div>
              );
            })}
          </div>
        </PhoneFrame>
      </div>
      {/* Cursor */}
      <div style={{
        position: "absolute", left: cursorX, top: cursorY, width: 44, height: 44,
        borderRadius: 22, background: "#000", opacity: 0.35,
        border: "3px solid white", pointerEvents: "none",
        transform: `scale(${interpolate(frame, [55, 65, 75], [1, 1.4, 1], { extrapolateRight: "clamp" })})`,
      }} />
    </AbsoluteFill>
  );
};
