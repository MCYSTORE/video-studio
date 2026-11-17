import {execFileSync} from 'node:child_process';
import {mkdirSync,readFileSync,renameSync} from 'node:fs';
mkdirSync('out',{recursive:true});
const timeline=JSON.parse(readFileSync('alignment/timeline.json','utf8'));
const duration=timeline.durationInFrames/timeline.fps;
const samples=Math.round(duration*48000);
const ffmpeg=(args)=>execFileSync('ffmpeg',['-hide_banner','-y',...args],{stdio:'inherit'});
// Four-times oversampled peak limiter protects AAC reconstruction peaks.
ffmpeg(['-i','out/.work/master_raw.mp4','-map','0:v:0','-map','0:a:0','-c:v','copy','-af',`aresample=192000,alimiter=limit=0.8317638:attack=1:release=50:level=0:latency=1,aresample=48000,apad=whole_len=${samples},atrim=end_sample=${samples}`,'-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart','out/torre_eiffel_1080p.mp4']);
if(process.argv.includes('--audio-only')){
  ffmpeg(['-i','out/preview_720p.mp4','-i','out/torre_eiffel_1080p.mp4','-map','0:v:0','-map','1:a:0','-c','copy','-t',String(duration),'-movflags','+faststart','out/.work/preview_remux.mp4']);
  renameSync('out/.work/preview_remux.mp4','out/preview_720p.mp4');
}else{
  ffmpeg(['-i','out/torre_eiffel_1080p.mp4','-vf','scale=720:1280:flags=lanczos','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-c:a','copy','-t',String(duration),'-movflags','+faststart','out/preview_720p.mp4']);
}
