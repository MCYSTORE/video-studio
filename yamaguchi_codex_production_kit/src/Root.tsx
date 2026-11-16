import React from 'react';
import { Composition } from 'remotion';
import { StickmanShort } from './StickmanShort';
import { SHORT_FPS, TOTAL_DURATION_SEC } from './storyData';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StickmanShort"
        component={StickmanShort}
        durationInFrames={Math.round(TOTAL_DURATION_SEC * SHORT_FPS)}
        fps={SHORT_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
