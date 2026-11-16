import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SCENES, SceneConfig } from './storyData';

const SceneLayer: React.FC<{ scene: SceneConfig }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.round(scene.startSec * fps);
  const endFrame = Math.round(scene.endSec * fps);
  const durationFrames = Math.max(1, endFrame - startFrame);
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame >= durationFrames) return null;

  const progress = localFrame / durationFrames;

  let scale = 1.05;
  let translateX = 0;
  let translateY = 0;

  if (scene.cameraMotion === 'zoom-in') {
    scale = interpolate(progress, [0, 1], [1.02, 1.18]);
  } else if (scene.cameraMotion === 'zoom-out') {
    scale = interpolate(progress, [0, 1], [1.18, 1.02]);
  } else if (scene.cameraMotion === 'pan-left') {
    scale = 1.12;
    translateX = interpolate(progress, [0, 1], [25, -25]);
  } else if (scene.cameraMotion === 'pan-right') {
    scale = 1.12;
    translateX = interpolate(progress, [0, 1], [-25, 25]);
  } else if (scene.cameraMotion === 'impact-shake') {
    scale = interpolate(progress, [0, 0.2, 1], [1.26, 1.15, 1.06]);
    const decay = Math.max(0, 1 - progress * 2.5);
    translateX = Math.sin(localFrame * 2.5) * 20 * decay;
    translateY = Math.cos(localFrame * 3.1) * 15 * decay;
  }

  const flashOpacity =
    scene.isPatternInterrupt && localFrame < 4
      ? interpolate(localFrame, [0, 4], [0.45, 0])
      : 0;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000' }}>
      <Img
        src={staticFile(scene.image)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      />
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const KineticCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const activeScene = SCENES.find(
    (s) => currentSec >= s.startSec && currentSec < s.endSec
  );
  if (!activeScene) return null;

  const activeCaption = activeScene.captions.find(
    (c) => currentSec >= c.startSec && currentSec < c.endSec
  );
  if (!activeCaption) return null;

  const capStartFrame = Math.round(activeCaption.startSec * fps);
  const pop = spring({
    frame: frame - capStartFrame,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });

  const parts = activeCaption.highlight
    ? activeCaption.text.split(activeCaption.highlight)
    : [activeCaption.text];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '19%',
        left: '6%',
        right: '6%',
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        transform: `scale(${interpolate(pop, [0, 1], [0.75, 1])})`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: 68,
          fontWeight: 900,
          lineHeight: 1.1,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          WebkitTextStroke: '3px #000000',
          textShadow: '0px 6px 14px rgba(0,0,0,0.85)',
        }}
      >
        {parts.length > 1 ? (
          <>
            {parts[0]}
            <span style={{ color: '#FFE600' }}>{activeCaption.highlight}</span>
            {parts[1]}
          </>
        ) : (
          activeCaption.text
        )}
      </div>
    </div>
  );
};

export const StickmanShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/voiceover.mp3')} volume={1.0} />
      <Audio src={staticFile('audio/bgm.mp3')} volume={0.14} />

      {SCENES.map((scene) => (
        <React.Fragment key={scene.id}>
          <SceneLayer scene={scene} />
          {scene.sfx && (
            <Sequence from={Math.round(scene.sfx.startSec * fps)}>
              <Audio src={staticFile(scene.sfx.file)} volume={scene.sfx.volume} />
            </Sequence>
          )}
        </React.Fragment>
      ))}

      <KineticCaptions />
    </AbsoluteFill>
  );
};
