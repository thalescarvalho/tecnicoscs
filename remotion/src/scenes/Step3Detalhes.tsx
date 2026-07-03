import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { PhoneFrame, StepBadge, Header } from "../components";

const typed = (text: string, frame: number, start: number, cps: number = 40) => {
  const chars = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  return text.slice(0, chars);
};

export const Step3Detalhes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const titulo = typed("Desmanche padaria centro", frame, 10, 40);
  const tipoOpen = frame > 55 && frame < 78;
  const tipoSelected = frame >= 78;
  const dataAppear = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: "clamp" });

  const tipos = ["Desmanche", "Trabalho técnico", "Suporte", "Apresentação"];

  return (
    <AbsoluteFill style={{ padding: "80px 60px", alignItems: "center", gap: 30 }}>
      <div style={{ opacity: enter, alignSelf: "flex-start", marginLeft: 40 }}>
        <StepBadge n={3} label="Detalhes do serviço" />
      </div>

      <div style={{ transform: "scale(0.85)", opacity: enter, marginTop: -10 }}>
        <PhoneFrame>
          <Header title="Agendar Trabalho" />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 10 }}>Título *</div>
              <div style={{ padding: "22px 24px", background: "white", borderRadius: 20, border: `2px solid ${COLORS.border}`, fontSize: 26, color: COLORS.ink, minHeight: 32 }}>
                {titulo}
                {frame < 55 && titulo.length < 24 && Math.floor(frame / 8) % 2 === 0 && <span style={{ color: COLORS.primary }}>|</span>}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 10 }}>Tipo de trabalho *</div>
              <div style={{
                padding: "22px 24px", background: tipoSelected ? `${COLORS.primary}18` : "white", borderRadius: 20,
                border: `${tipoOpen || tipoSelected ? 3 : 2}px solid ${tipoOpen || tipoSelected ? COLORS.primary : COLORS.border}`,
                fontSize: 26, color: tipoSelected ? COLORS.primary : COLORS.muted,
                fontWeight: tipoSelected ? 700 : 400,
                display: "flex", justifyContent: "space-between",
              }}>
                <span>{tipoSelected ? "Trabalho técnico" : "Selecione"}</span>
                <span>{tipoOpen ? "▲" : "▼"}</span>
              </div>
              {tipoOpen && (
                <div style={{
                  marginTop: 8, background: "white", borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.15)", border: `1px solid ${COLORS.border}`,
                }}>
                  {tipos.map((t, i) => (
                    <div key={i} style={{
                      padding: "20px 24px", fontSize: 24,
                      background: t === "Trabalho técnico" && frame > 70 ? `${COLORS.primary}33` : "transparent",
                      color: COLORS.ink, borderBottom: i < tipos.length - 1 ? `1px solid ${COLORS.border}` : "none",
                      fontWeight: t === "Trabalho técnico" ? 700 : 500,
                    }}>{t}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ opacity: dataAppear, transform: `translateY(${(1 - dataAppear) * 20}px)` }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 10 }}>Data prevista *</div>
              <div style={{
                padding: "22px 24px", background: "white", borderRadius: 20,
                border: `2px solid ${COLORS.border}`, fontSize: 26, color: COLORS.ink,
                display: "flex", justifyContent: "space-between",
              }}>
                <span>15/07/2026</span>
                <span>📅</span>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
