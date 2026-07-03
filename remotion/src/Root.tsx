import { Composition } from "remotion";
import { MainVideo, TOTAL_DURATION } from "./MainVideo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
