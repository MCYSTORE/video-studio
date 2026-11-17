import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import timeline from '../alignment/timeline.json';
import envelope from '../alignment/voice_envelope.json';
import heroManifest from '../public/layers/hero_manifest.json';
import './style.css';

export const FPS = 30;
export const DURATION = timeline.durationInFrames;
const clamp = (n:number, a=0, b=1) => Math.max(a,Math.min(b,n));
const interrupts = timeline.patternInterruptFrames;
const palette=['#ffe6ab','#d7edff','#fff0b4','#ffd6a0','#ffeac7','#dbeaff','#fff2b4','#ffe4a6','#b4d4ff','#b5d6ff','#ffe7bc','#ffca82','#e0eaff','#e6edff','#ffdca4'];

function World({sceneIndex,local,progress,punch,whip,loopBlend}:{sceneIndex:number;local:number;progress:number;punch:number;whip:number;loopBlend:number}) {
  const frame=useCurrentFrame();
  const {camera}=useThree();
  const id=String(sceneIndex+1).padStart(2,'0');
  const [front,back,alpha,opening,hero,cleanBg]=useLoader(THREE.TextureLoader,[staticFile(`scenes/${id}.jpg`),staticFile(`layers/${id}_back.jpg`),staticFile('layers/focus.png'),staticFile('scenes/01.jpg'),staticFile(`layers/hero_${id}.png`),staticFile(`layers/bg_${id}.jpg`)]);
  useMemo(()=>{[front,back,opening,hero,cleanBg].forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;});},[front,back,opening,hero,cleanBg]);
  const direction=sceneIndex%2 ? 1:-1;
  const voice=envelope.values[Math.min(frame,envelope.values.length-1)] ?? 0;
  const meta=heroManifest[sceneIndex];
  const [x0,y0,x1,y1]=meta.bbox;const [imageW,imageH]=meta.source_size;
  const heroW=3.96*(x1-x0)/imageW,heroH=7.04*(y1-y0)/imageH;
  const heroX=3.96*((x0+x1)/2/imageW-.5),heroY=7.04*(.5-(y0+y1)/2/imageH);
  const beats=[177,447,1017];
  const rebound=beats.reduce((v,b)=>Math.max(v,frame>=b&&frame<b+21?Math.abs(1-spring({frame:frame-b,fps:FPS,config:{stiffness:170,damping:9,mass:.55}})):0),0);
  const breath=Math.sin(frame*.115)*.012;
  const talk=Math.sin(frame*.38)*voice*.026;
  const heroScaleX=1+breath+voice*.022+rebound*.10;
  const heroScaleY=1-breath+voice*.045-rebound*.075;
  const billPositions=useMemo(()=>Array.from({length:15},(_,i)=>({x:((i*.754877)%1-.5)*3.4,y:((i*.569841)%1)*7,depth:.5+(i%3)*.14})),[]);
  const shakeBeats=timeline.sfx.map(s=>s.frame);
  const impulse=shakeBeats.reduce((v,f)=>Math.max(v,frame>=f&&frame<f+22?Math.abs(1-spring({frame:frame-f,fps:FPS,config:{damping:11,stiffness:190,mass:0.6}})):0),0);
  const arc=Math.sin(progress*Math.PI)*direction;
  useLayoutEffect(()=>{
    // Perspective, dolly, restrained orbit and deterministic elastic impact.
    const dolly=0.24*progress + punch*0.35;
    camera.position.set((arc*0.075+whip*0.2+Math.sin(frame*2.3)*impulse*0.035)*(1-loopBlend),(0.015*Math.sin(frame/75)+Math.cos(frame*2.7)*impulse*0.025)*(1-loopBlend),6-dolly*(1-loopBlend));
    camera.lookAt(arc*0.025*(1-loopBlend),0.015,0);
    camera.updateProjectionMatrix();
  },[camera,frame,progress,punch,whip,arc,impulse,loopBlend]);
  const t=frame/FPS;
  const dots=useMemo(()=>Array.from({length:42},(_,i)=>({x:((i*0.61803398875)%1-0.5)*3.4,y:((i*0.41421356237)%1-0.5)*6.4,r:0.003+(i%5)*0.0014,speed:0.025+(i%7)*0.01})),[]);
  return <>
    <ambientLight intensity={2.0}/>
    <directionalLight position={[-3,5,6]} intensity={0.8} color={palette[sceneIndex]} castShadow shadow-mapSize={[512,512]} shadow-bias={-0.001}/>
    <directionalLight position={[4,-1,3]} intensity={0.22} color="#b9d9ff"/>
    <group rotation={[0,arc*0.004,Math.sin(t*0.4)*0.0015*(1-loopBlend)+(sceneIndex===10?Math.sin(frame*2.4)*.003:0)]}>
      {/* Background at real Z=-1.5; scaled to share the framing of the subject. */}
      <mesh position={[0,0,-1.5]} receiveShadow>
        <planeGeometry args={[5.04,8.96]}/>
        <meshLambertMaterial map={back} toneMapped={false} color="#eeeeee"/>
      </mesh>
      {/* Inpainted plate and independently animated transparent protagonist. */}
      <mesh position={[0,0,0]} receiveShadow>
        <planeGeometry args={[3.96,7.04]}/>
        <meshLambertMaterial map={cleanBg} toneMapped={false} color="#eeeeee"/>
      </mesh>
      {sceneIndex===2&&Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9+t*.65;return <mesh key={`ray${i}`} position={[Math.cos(a)*.36,1.73+Math.sin(a)*.36,.09]} rotation={[0,0,a]}><planeGeometry args={[.045,.45]}/><meshBasicMaterial color="#fff27a" transparent opacity={.25+.18*Math.sin(t*4+i)} depthWrite={false}/></mesh>})}
      <group position={[heroX,heroY+breath*.7+voice*.028+rebound*.22+(sceneIndex===10?Math.sin(frame*2.4)*.018:0),.27]} rotation={[0,0,talk+Math.sin(frame*.04)*.008+rebound*.09]} scale={[heroScaleX,heroScaleY,1]}>
        <mesh castShadow><planeGeometry args={[heroW,heroH]}/><meshBasicMaterial map={hero} transparent alphaTest={.015} toneMapped={false} depthWrite={false}/></mesh>
      </group>
      {(sceneIndex===7||sceneIndex===11)&&billPositions.map((p,i)=>{
        const fall=((p.y-t*(.75+(i%5)*.08))%7+7)%7-3.5;
        return <mesh key={`bill${i}`} position={[p.x,fall,p.depth]} rotation={[.3*Math.sin(t+i),t*(1.8+i*.13),.45*Math.sin(t*2+i)]}>
          <planeGeometry args={[.18,.085]}/><meshBasicMaterial color={i%3===0?'#b6e96b':'#58b978'} side={THREE.DoubleSide} transparent opacity={.72} depthWrite={false}/>
        </mesh>})}
      {sceneIndex===8&&Array.from({length:11},(_,i)=>{
        const rise=((t*.55+i*.61)%4.2),spread=Math.sin(t*1.4+i)*.11;
        return <mesh key={`smoke${i}`} position={[.32+spread+rise*.08,-1.08+rise,.65]} scale={[1+rise*.6,1+rise*.6,1]}>
          <circleGeometry args={[.075+(i%3)*.027,12]}/><meshBasicMaterial color="#f2f5ec" transparent opacity={Math.max(0,.31-rise*.065)} depthWrite={false}/>
        </mesh>})}
      {sceneIndex===10&&Array.from({length:10},(_,i)=>{
        const sweep=((t*2.3+i*.51)%4.5)-2.25;
        return <mesh key={`speed${i}`} position={[sweep,((i*.618)%1-.5)*5,.64]} rotation={[0,0,-.17]}><planeGeometry args={[.32+(i%3)*.14,.012]}/><meshBasicMaterial color="#fff3c4" transparent opacity={.30} depthWrite={false}/></mesh>
      })}
      {loopBlend>0&&<mesh position={[0,0,0.002]}>
        <planeGeometry args={[3.96,7.04]}/>
        <meshLambertMaterial map={opening} transparent opacity={loopBlend} toneMapped={false} color="#eeeeee"/>
      </mesh>}
    </group>
    {/* Foreground atmosphere at Z=+1.2, moving every frame. */}
    <group position={[0,0,1.2]}>
      {dots.map((p,i)=><mesh key={i} position={[p.x+Math.sin(t*0.3+i)*0.04,((p.y+t*p.speed+3.2)%6.4)-3.2,Math.sin(i)*0.06]}>
        <circleGeometry args={[p.r*(1+punch*0.8),6]}/>
        <meshBasicMaterial color={i%6===0?'#fff8df':'#ffd37a'} transparent opacity={0.24+Math.sin(t*1.4+i)*0.17} depthWrite={false} blending={THREE.AdditiveBlending}/>
      </mesh>)}
    </group>
  </>;
}

function KineticCaption(){
  const frame=useCurrentFrame();
  const block=timeline.captions.find(c=>frame>=c.startFrame&&frame<c.endFrame);
  if(!block) return null;
  const entrance=spring({frame:frame-block.startFrame,fps:FPS,config:{damping:15,stiffness:240,mass:0.65}});
  return <div className="caption-zone" style={{transform:`translateY(${(1-entrance)*20}px) scale(${0.94+entrance*0.06})`,opacity:clamp(entrance*2)}}>
    <div className="caption-block">
      {block.words.map((word,i)=>{
        const active=frame>=word.startFrame&&frame<word.endFrame;
        const pop=spring({frame:Math.max(0,frame-word.startFrame),fps:FPS,config:{damping:12,stiffness:310,mass:0.45}});
        return <span key={`${block.startFrame}-${i}`} className={`caption-word ${i===block.highlight?'key-word':''}`} style={{transform:`scale(${active?1+0.07*Math.sin(clamp(pop)*Math.PI):1})`,color:active||i===block.highlight?'#FFE600':'#fff'}}>{word.text}</span>;
      })}
    </div>
  </div>;
}

export const TorreEiffelShort:React.FC=()=>{
  const frame=useCurrentFrame();const {width,height}=useVideoConfig();
  const [fontHandle]=useState(()=>delayRender('Loading local caption font'));
  useEffect(()=>{document.fonts.load('800 61px OpenSans').then(()=>continueRender(fontHandle)).catch(cancelRender);},[fontHandle]);
  const sceneIndex=Math.max(0,timeline.scenes.findIndex(s=>frame>=s.startFrame&&frame<s.endFrame));
  const scene=timeline.scenes[sceneIndex];const local=frame-scene.startFrame;
  const progress=clamp(local/Math.max(1,scene.endFrame-scene.startFrame-1));
  const hit=interrupts.reduce((v,f)=>Math.max(v,frame>=f&&frame<f+20?1-spring({frame:frame-f,fps:FPS,config:{damping:12,stiffness:180,mass:0.5}}):0),0);
  const punch=Math.max(0,hit);
  const flash=interrupts.some(f=>frame>=f&&frame<f+3);
  const whip=sceneIndex>0&&local<6?Math.sin(local/6*Math.PI)*(1-local/6)*(sceneIndex%2?1:-1):0;
  // The final photographic blend meets the opening without an end card or black frame.
  const loopBlend=interpolate(frame,[DURATION-9,DURATION-1],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const musicVolume=(f:number)=>{
    const edgeIn=clamp(f/5);const edgeOut=clamp((DURATION-1-f)/10);
    const voice=timeline.captions.reduce((max,c)=>Math.max(max,clamp((f-c.startFrame+6)/6)*clamp((c.endFrame+8-f)/8)),0);
    return (0.17-0.03*voice)*edgeIn*edgeOut;
  };
  return <AbsoluteFill style={{backgroundColor:'#15222a'}}>
    <ThreeCanvas width={width} height={height} camera={{position:[0,0,6],fov:60,near:0.1,far:30}} shadows gl={{antialias:false,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true}} dpr={1}>
      <World sceneIndex={sceneIndex} local={local} progress={progress} punch={punch} whip={whip} loopBlend={loopBlend}/>
    </ThreeCanvas>
    <AbsoluteFill className="vignette"/>
    <div className="location"><span className="location-dot"/>PARÍS <span className="location-separator">/</span> 1925</div>
    <div className="episode-mark">EL FRAUDE DE LA TORRE EIFFEL</div>
    <div className="story-progress"><div style={{width:`${100*(frame+1)/DURATION}%`}}/></div>
    <KineticCaption/>
    {flash&&<AbsoluteFill style={{background:'radial-gradient(ellipse at 45% 35%,rgba(255,248,218,0.58),rgba(255,209,91,0.18))',mixBlendMode:'screen'}}/>}
    {Math.abs(whip)>0.05&&<AbsoluteFill style={{background:'linear-gradient(90deg,transparent,rgba(255,223,161,.10),transparent)',transform:`translateX(${whip*80}px)`}}/>}
    <Audio src={staticFile('audio/voiceover.mp3')} volume={1}/>
    <Audio src={staticFile('audio/bgm.mp3')} volume={musicVolume} loop/>
    {timeline.sfx.map(s=><Sequence key={s.file} from={s.frame} layout="none"><Audio src={staticFile(s.file)} volume={s.volume}/></Sequence>)}
  </AbsoluteFill>;
};
