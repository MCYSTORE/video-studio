#!/usr/bin/env python3
"""Audit decoded frames and EBU R128 true peak; exits nonzero on failed gates."""
import argparse,datetime,hashlib,json,re,subprocess,sys
from fractions import Fraction
from pathlib import Path
import cv2,numpy as np

def run(*args):
 return subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,check=True)
def probe(path):
 return json.loads(run('ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)).stdout)
def audit(path,root):
 timeline=json.loads((root/'alignment/timeline.json').read_text());meta=probe(path)
 v=next(s for s in meta['streams'] if s['codec_type']=='video');a=next(s for s in meta['streams'] if s['codec_type']=='audio')
 rate=float(Fraction(v['avg_frame_rate']));cap=cv2.VideoCapture(str(path))
 means=[];black=[];white=[];freeze=[];exact=[];prev=None;run_start=0;exact_start=0;max_run=1;max_exact=1
 frame=0
 while True:
  ok,img=cap.read()
  if not ok:break
  gray=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY);means.append(float(gray.mean()))
  if means[-1]<4 and float(np.mean(gray<12))>.99:black.append(frame)
  if means[-1]>245 and float(np.mean(gray>235))>.99:white.append(frame)
  if prev is not None:
   delta=float(cv2.absdiff(gray,prev).mean())
   if delta>=.05:
    length=frame-run_start;max_run=max(max_run,length)
    if length>3:freeze.append({'startFrame':run_start,'length':length})
    run_start=frame
   if not np.array_equal(gray,prev):
    length=frame-exact_start;max_exact=max(max_exact,length)
    if length>3:exact.append({'startFrame':exact_start,'length':length})
    exact_start=frame
  prev=gray;frame+=1
 cap.release()
 for start,out,kind in [(run_start,freeze,'near'),(exact_start,exact,'exact')]:
  length=frame-start
  if kind=='near':max_run=max(max_run,length)
  else:max_exact=max(max_exact,length)
  if length>3:out.append({'startFrame':start,'length':length})
 allowed=set()
 for f in timeline['patternInterruptFrames']:
  allowed.update(range(f-1,f+5))
 planned=[]
 for f in timeline['patternInterruptFrames']:
  baseline=max(float(np.median(means[f-3:f])),float(np.median(means[f+3:f+6])))
  lift=[round(means[k]-baseline,3) for k in range(f,f+3)]
  planned.append({'startFrame':f,'length':3,'luma_lift':lift,'visible':min(lift)>3})
 # Short isolated exposure spikes; hard cuts persist and do not become isolated exposure spikes.
 flashes=[]
 for i in range(3,len(means)-3):
  if i in allowed:continue
  prior=float(np.median(means[i-3:i]));after=float(np.median(means[i+1:i+4]))
  if means[i]-max(prior,after)>22:flashes.append(i)
 meter=run('ffmpeg','-hide_banner','-i',str(path),'-af','ebur128=peak=true','-f','null','-').stderr
 log=path.with_suffix('.ebur128.log');log.write_text(meter)
 summary=meter.rsplit('Summary:',1)[-1]
 peak=float(re.search(r'Peak:\s+(-?[\d.]+)',summary).group(1));lufs=float(re.search(r'I:\s+(-?[\d.]+)',summary).group(1))
 voice=float(probe(root/'public/audio/voiceover.mp3')['format']['duration'])
 duration=float(v.get('duration',meta['format']['duration']));audio_duration=float(a.get('duration',meta['format']['duration']))
 caption_errors=[c for c in timeline['captions'] if not 2<=len(c['words'])<=4]
 gates={'dimensions':(v['width'],v['height'])==(1080,1920),'fps':abs(rate-30)<1e-6,'frame_count':frame==timeline['durationInFrames'],'no_identical_freezes':not exact,'no_near_freezes':not freeze,'no_black_frames':not black,'no_unplanned_exposure_spikes':not flashes,'planned_three_frame_flashes_visible':all(p['visible'] for p in planned),'no_unplanned_white_frames':not [f for f in white if f not in allowed],'true_peak_at_most_minus_1_dbtp':peak<=-1.0,'duration_within_one_frame_of_voice':abs(duration-voice)<=1/rate,'av_duration_within_one_frame':abs(duration-audio_duration)<=1/rate,'captions_two_to_four_words':not caption_errors,'h264_aac':v['codec_name']=='h264' and a['codec_name']=='aac'}
 return {'file':str(path.name),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':all(gates.values()),'gates':gates,'video':{'width':v['width'],'height':v['height'],'fps':rate,'decoded_frames':frame,'duration_seconds':duration,'voice_source_duration_seconds':voice,'duration_difference_ms':round((duration-voice)*1000,3),'audio_duration_seconds':audio_duration},'frames':{'identical_runs_over_three':exact,'max_identical_run':max_exact,'near_freeze_runs_over_three':freeze,'max_near_identical_run':max_run,'near_freeze_mad_threshold':.05,'black_frames':black,'unplanned_white_frames':[f for f in white if f not in allowed],'unplanned_exposure_spikes':flashes,'flash_detection':'Isolated luma spikes >22/255 outside planned flash windows. This is a heuristic; contact sheet is also manually reviewed.','allowed_flash_frames':timeline['patternInterruptFrames'],'planned_flash_measurements':planned},'audio':{'true_peak_dbtp':peak,'integrated_lufs':lufs,'codec':a['codec_name'],'bit_rate':a.get('bit_rate'),'meter':'FFmpeg ebur128 peak=true','log':log.name},'timing':{'alignment':'Whisper small word timestamps, manually corrected text; 30 fps quantization is not sample-accurate linguistic ground truth.','visual_anticipation_frames':3,'caption_count':len(timeline['captions']),'scene_count':len(timeline['scenes'])}}

def audit_preview(path,master,expected_frames):
 meta=probe(path);v=next(s for s in meta['streams'] if s['codec_type']=='video')
 def aac_hash(p):
  data=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-c:a','copy','-f','adts','-'])
  return hashlib.sha256(data).hexdigest()
 fps=float(Fraction(v['avg_frame_rate']));master_duration=float(next(s for s in probe(master)['streams'] if s['codec_type']=='video')['duration'])
 same_audio=aac_hash(path)==aac_hash(master)
 gates={'preview_h264_720x1280_30fps':v['codec_name']=='h264' and (v['width'],v['height'])==(720,1280) and abs(fps-30)<1e-6,'preview_frame_count':int(v['nb_frames'])==expected_frames,'preview_duration_matches_master':abs(float(v['duration'])-master_duration)<1e-6,'preview_uses_same_aac_packets':same_audio}
 return {'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'width':v['width'],'height':v['height'],'fps':fps,'duration_seconds':float(v['duration']),'same_aac_packets_as_master':same_audio},gates

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('video',type=Path);args=parser.parse_args();root=Path(__file__).resolve().parent
 result=audit(args.video,root)
 preview=args.video.parent/'preview_720p.mp4'
 if preview.exists():
  result['preview'],preview_gates=audit_preview(preview,args.video,result['video']['decoded_frames']);result['gates'].update(preview_gates);result['passed']=all(result['gates'].values())
 out=args.video.parent/'qa_report.json';out.write_text(json.dumps(result,ensure_ascii=False,indent=2))
 md=['# Torre Eiffel — QA',f"\nResultado: **{'PASS' if result['passed'] else 'FAIL'}**",f"\nArchivo: `{result['file']}`",'\n| Prueba | Resultado |','|---|---|']
 md += [f"| {k} | {'PASS' if v else 'FAIL'} |" for k,v in result['gates'].items()]
 md += [f"\nDuración: {result['video']['duration_seconds']:.6f} s; voz: {result['video']['voice_source_duration_seconds']:.6f} s; diferencia: {result['video']['duration_difference_ms']} ms.",f"\nPico verdadero: {result['audio']['true_peak_dbtp']} dBTP. Loudness: {result['audio']['integrated_lufs']} LUFS.",'\nSe decodifican todos los fotogramas. Detección de flashes por luminancia, con ventanas programadas documentadas.','\nLa alineación de Whisper estima el inicio de cada palabra. El montaje aplica −3 fotogramas a esos inicios y cuantiza a 30 fps.']
 (out.parent/'qa_report.md').write_text('\n'.join(md)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['passed'] else 1)
