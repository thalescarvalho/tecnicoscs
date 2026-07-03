import React from "react";
import { AbsoluteFill, Series, useVideoConfig } from "remotion";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { Intro } from "./scenes/Intro";
import { Step1Menu } from "./scenes/Step1Menu";
import { Step2Cliente } from "./scenes/Step2Cliente";
import { Step3Detalhes } from "./scenes/Step3Detalhes";
import { Step4Produtos } from "./scenes/Step4Produtos";
import { Step5Enviar } from "./scenes/Step5Enviar";
import { Outro } from "./scenes/Outro";
import { COLORS } from "./theme";

loadPoppins("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
loadPlayfair("normal", { weights: ["700", "900"], subsets: ["latin"] });

const D = {
  intro: 75,
  step1: 90,
  step2: 120,
  step3: 120,
  step4: 120,
  step5: 105,
  outro: 90,
};

export const TOTAL_DURATION =
  D.intro + D.step1 + D.step2 + D.step3 + D.step4 + D.step5 + D.outro;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "Poppins, sans-serif" }}>
      <Series>
        <Series.Sequence durationInFrames={D.intro}><Intro /></Series.Sequence>
        <Series.Sequence durationInFrames={D.step1}><Step1Menu /></Series.Sequence>
        <Series.Sequence durationInFrames={D.step2}><Step2Cliente /></Series.Sequence>
        <Series.Sequence durationInFrames={D.step3}><Step3Detalhes /></Series.Sequence>
        <Series.Sequence durationInFrames={D.step4}><Step4Produtos /></Series.Sequence>
        <Series.Sequence durationInFrames={D.step5}><Step5Enviar /></Series.Sequence>
        <Series.Sequence durationInFrames={D.outro}><Outro /></Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
