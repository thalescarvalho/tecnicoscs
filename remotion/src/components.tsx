import React from "react";
import { COLORS } from "./theme";

export const PhoneFrame: React.FC<{ children: React.ReactNode; scale?: number }> = ({
  children,
  scale = 1,
}) => {
  return (
    <div
      style={{
        width: 640,
        height: 1320,
        borderRadius: 72,
        background: "#111827",
        padding: 18,
        boxShadow: "0 40px 80px rgba(0,0,0,0.25), 0 0 0 6px #292524",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 58,
          background: COLORS.bg,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* status bar */}
        <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", fontSize: 18, fontWeight: 700, color: COLORS.ink }}>
          <span>09:41</span>
          <span>●●●</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export const StepBadge: React.FC<{ n: number; label: string }> = ({ n, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{
      width: 68, height: 68, borderRadius: 34, background: COLORS.primary,
      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 34, fontWeight: 800, boxShadow: `0 8px 20px ${COLORS.primary}55`,
    }}>{n}</div>
    <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.ink, letterSpacing: -0.5 }}>{label}</div>
  </div>
);

export const Header: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: "12px 32px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
    <div style={{ fontSize: 14, color: COLORS.muted, fontWeight: 600, letterSpacing: 1 }}>FINÍSSIMO</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.ink, marginTop: 4 }}>{title}</div>
  </div>
);
