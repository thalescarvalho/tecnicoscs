import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { PhoneFrame, StepBadge, Header } from "../components";

export const Step5Enviar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const btnPulse = 1 + Math.sin(frame / 6) * 0.03;
  const tap = interpolate(frame, [35, 45, 55], [1, 0.92, 1], { extrapolateRight: "clamp" });
  const successScale = spring({ frame: frame - 55, fps, config: { damping: 10 } });
  const showSuccess = frame > 55;

  return (
    <AbsoluteFill style={{ padding: "80px 60px", alignItems: "center", gap: 30 }}>
      <div style={{ opacity: enter, alignSelf: "flex-start", marginLeft: 40 }}>
        <StepBadge n={5} label="Enviar para aprovação" />
      </div>

      <div style={{ transform: "scale(0.85)", opacity: enter, marginTop: -10 }}>
        <PhoneFrame>
          <Header title="Revisar e enviar" />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              ["Cliente", "Padaria do João"],
              ["Tipo", "Trabalho técnico"],
              ["Data", "15/07/2026"],
              ["Produtos", "2 itens"],
            ].map(([k, v], i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "18px 22px", background: "white", borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
              }}>
                <span style={{ fontSize: 22, color: COLORS.muted, fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 22, color: COLORS.ink, fontWeight: 700 }}>{v}</span>
              </div>
            ))}

            <div style={{
              marginTop: 24,
              padding: "28px", background: COLORS.primary, borderRadius: 24,
              textAlign: "center", color: "white", fontSize: 32, fontWeight: 800,
              transform: `scale(${tap * (showSuccess ? 0.95 : btnPulse)})`,
              boxShadow: `0 16px 40px ${COLORS.primary}66`,
              opacity: showSuccess ? 0.7 : 1,
            }}>
              Agendar Trabalho
            </div>

            {showSuccess && (
              <div style={{
                marginTop: 12,
                padding: "24px", background: `${COLORS.ok}15`, borderRadius: 20,
                border: `2px solid ${COLORS.ok}`,
                transform: `scale(${successScale})`,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 28, background: COLORS.ok,
                  color: "white", fontSize: 32, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✓</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink }}>Enviado!</div>
                  <div style={{ fontSize: 18, color: COLORS.muted }}>Aguardando aprovação do gestor</div>
                </div>
              </div>
            )}
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
