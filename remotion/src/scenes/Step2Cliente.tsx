import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { PhoneFrame, StepBadge, Header } from "../components";

// Typewriter helper
const typed = (text: string, frame: number, start: number, cps: number = 40) => {
  const chars = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  return text.slice(0, chars);
};

export const Step2Cliente: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const nomeText = typed("Padaria do João", frame, 15, 35);
  const showSuggestion = frame > 45 && frame < 75;
  const enderecoText = typed("Rua das Flores, 123", frame, 78, 40);
  const highlight = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "80px 60px", alignItems: "center", gap: 30 }}>
      <div style={{ opacity: enter, alignSelf: "flex-start", marginLeft: 40 }}>
        <StepBadge n={2} label="Escolha o cliente" />
      </div>

      <div style={{ transform: "scale(0.85)", opacity: enter, marginTop: -10 }}>
        <PhoneFrame>
          <Header title="Agendar Trabalho" />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 12 }}>Nome do cliente *</div>
              <div style={{
                padding: "24px 24px", background: "white", borderRadius: 20,
                border: `3px solid ${COLORS.primary}${Math.round(highlight * 200).toString(16).padStart(2, "0")}`,
                fontSize: 28, color: COLORS.ink, minHeight: 34,
              }}>
                {nomeText}
                {frame < 45 && frame > 15 && Math.floor(frame / 8) % 2 === 0 && (
                  <span style={{ color: COLORS.primary }}>|</span>
                )}
              </div>
              {showSuggestion && (
                <div style={{
                  marginTop: 8, background: "white", borderRadius: 16,
                  border: `1px solid ${COLORS.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  padding: 16,
                }}>
                  <div style={{ padding: 12, background: `${COLORS.primary}22`, borderRadius: 12 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink }}>Padaria do João</div>
                    <div style={{ fontSize: 18, color: COLORS.muted }}>Rua das Flores, 123</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 12 }}>Endereço *</div>
              <div style={{
                padding: "24px 24px", background: "white", borderRadius: 20,
                border: `2px solid ${COLORS.border}`,
                fontSize: 28, color: COLORS.ink, minHeight: 34,
              }}>
                {enderecoText}
                {frame > 78 && enderecoText.length < 19 && Math.floor(frame / 8) % 2 === 0 && (
                  <span style={{ color: COLORS.primary }}>|</span>
                )}
              </div>
            </div>

            <div style={{
              padding: 20, background: `${COLORS.accent}22`, borderRadius: 16,
              border: `1px dashed ${COLORS.accent}`, opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.bgDeep }}>
                💡 Dica: comece a digitar para reusar clientes cadastrados
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
