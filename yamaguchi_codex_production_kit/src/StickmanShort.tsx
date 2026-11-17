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
    </AbsoluteFill>
  );
};

const KineticCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const activeScene = SCENES.find(
    (s) => frame >= Math.round(s.startSec * fps) && frame < Math.round(s.endSec * fps)
  );
  if (!activeScene) return null;

  const activeCaption = activeScene.captions.find(
    (c) => frame >= Math.round(c.startSec * fps) && frame < Math.round(c.endSec * fps)
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
          fontFamily: 'ShortCaptions, sans-serif',
          fontSize: 64,
          fontWeight: 800,
          lineHeight: 1.1,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          WebkitTextStroke: '3px #000000',
          paintOrder: 'stroke fill',
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
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const phase = frame % (6 * fps);
  const flashOpacity = frame >= 6 * fps && phase < 4
    ? interpolate(phase, [0, 4], [0.45, 0]) : 0;
  // The final eight frames resolve to the exact opening image/framing.
  const loopBlend = interpolate(frame, [durationInFrames - 8, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <style>{`@font-face { font-family: ShortCaptions; src: url("${staticFile('fonts/OpenSans-ExtraBold.ttf')}"); font-weight: 800; }`}</style>
      <Audio src={staticFile('audio/voiceover.mp3')} volume={1.0} />
      <Audio src={staticFile('audio/bgm.mp3')} volume={(f) =>
        // Short edge fades prevent clicks at the loop; the bed stays at 0.14.
        0.14 * Math.min(1, f / 3, Math.max(0, (durationInFrames - 1 - f) / 3))
      } />

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
      {loopBlend > 0 && <AbsoluteFill style={{ overflow: 'hidden', opacity: loopBlend }}>
        <Img src={staticFile(SCENES[0].image)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }} />
      </AbsoluteFill>}
      {flashOpacity > 0 && <AbsoluteFill style={{ backgroundColor: '#FFF', opacity: flashOpacity }} />}
    </AbsoluteFill>
  );
};
