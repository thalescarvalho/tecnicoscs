import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const sub = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [20, 40], [30, 0], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [65, 75], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 30% 20%, ${COLORS.accent}55, transparent 60%), radial-gradient(circle at 80% 90%, ${COLORS.primary}66, transparent 55%), ${COLORS.bgDeep}`,
      alignItems: "center", justifyContent: "center", padding: 80, opacity: out,
    }}>
      <div style={{ transform: `scale(${scale})`, opacity, textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "12px 28px", borderRadius: 999,
          background: "#FFFFFF22", color: COLORS.accent, fontSize: 28, fontWeight: 700,
          letterSpacing: 3, marginBottom: 40, border: `2px solid ${COLORS.accent}66`,
        }}>TUTORIAL VENDEDOR</div>
        <div style={{
          fontFamily: "Playfair Display, serif", fontWeight: 900, color: "white",
          fontSize: 140, lineHeight: 1, letterSpacing: -3,
        }}>
          Como<br/>agendar<br/>
          <span style={{ color: COLORS.accent, fontStyle: "italic" }}>trabalhos</span>
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 140, left: 0, right: 0, textAlign: "center",
        opacity: sub, transform: `translateY(${subY}px)`,
      }}>
        <div style={{ color: "white", fontSize: 40, fontWeight: 600, opacity: 0.9 }}>
          em 5 passos rápidos
        </div>
      </div>
    </AbsoluteFill>
  );
};
