import React from 'react';
import {Composition} from 'remotion';
import {TorreEiffelShort,FPS,DURATION} from './TorreEiffelShort';
export const RemotionRoot:React.FC=()=> <Composition id="TorreEiffelShort" component={TorreEiffelShort} durationInFrames={DURATION} fps={FPS} width={1080} height={1920}/>;
