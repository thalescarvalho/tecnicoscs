import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { PhoneFrame, StepBadge, Header } from "../components";

const typed = (text: string, frame: number, start: number, cps: number = 40) => {
  const chars = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  return text.slice(0, chars);
};

export const Step4Produtos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  const prod1 = typed("Sorveteira industrial", frame, 10, 45);
  const qtd1 = frame > 32 ? "1" : "";
  const showItem1 = frame >= 40;
  const prod2 = typed("Batedeira planetária", frame, 55, 45);
  const qtd2 = frame > 78 ? "2" : "";
  const showItem2 = frame >= 85;
  const highlightAdd = interpolate(frame, [30, 40], [0, 1], { extrapolateRight: "clamp" });

  const item = (name: string, qty: string, delay: number) => {
    const local = frame - delay;
    const s = spring({ frame: local, fps, config: { damping: 14 } });
    return (
      <div style={{
        padding: "18px 22px", background: `${COLORS.accent}22`, borderRadius: 16,
        border: `1px solid ${COLORS.accent}55`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transform: `scale(${s}) translateX(${(1 - s) * -30}px)`, opacity: s,
      }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: COLORS.ink }}>{name}</span>
        <span style={{ fontSize: 22, color: COLORS.primary, fontWeight: 700 }}>{qty}x</span>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ padding: "80px 60px", alignItems: "center", gap: 30 }}>
      <div style={{ opacity: enter, alignSelf: "flex-start", marginLeft: 40 }}>
        <StepBadge n={4} label="Adicione produtos" />
      </div>

      <div style={{ transform: "scale(0.85)", opacity: enter, marginTop: -10 }}>
        <PhoneFrame>
          <Header title="Produtos a trabalhar" />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            {showItem1 && item("Sorveteira industrial", "1", 40)}
            {showItem2 && item("Batedeira planetária", "2", 85)}

            <div style={{
              padding: 20, background: "white", borderRadius: 20,
              border: `2px dashed ${COLORS.border}`,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <div style={{
                flex: 1, padding: "18px 20px", background: COLORS.bg, borderRadius: 14,
                fontSize: 22, color: COLORS.ink, minHeight: 28,
              }}>
                {showItem2 ? "" : (showItem1 ? prod2 : prod1)}
                {((frame < 32 && !showItem1) || (frame > 55 && frame < 78 && showItem1 && !showItem2)) && Math.floor(frame / 8) % 2 === 0 && (
                  <span style={{ color: COLORS.primary }}>|</span>
                )}
              </div>
              <div style={{
                width: 70, padding: "18px 0", background: COLORS.bg, borderRadius: 14,
                fontSize: 22, color: COLORS.ink, textAlign: "center", fontWeight: 700,
              }}>{showItem2 ? "" : (showItem1 ? qtd2 : qtd1)}</div>
              <div style={{
                width: 68, height: 68, borderRadius: 20,
                background: COLORS.primary, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40, fontWeight: 700,
                transform: `scale(${1 + highlightAdd * 0.1})`,
                boxShadow: `0 8px 20px ${COLORS.primary}55`,
              }}>+</div>
            </div>

            <div style={{
              padding: 18, background: `${COLORS.accent}22`, borderRadius: 14,
              opacity: interpolate(frame, [95, 115], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.bgDeep }}>
                ⚖️ O peso será preenchido depois pelo técnico
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
