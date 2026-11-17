import json,os,subprocess
import numpy as np
from pathlib import Path
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parents[1]
model=WhisperModel('small',device='cpu',compute_type='int8',download_root=os.environ.get('WHISPER_MODEL_DIR',str(root/'.cache/whisper')),cpu_threads=4)
pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(root/'public/audio/voiceover.mp3'),'-ar','16000','-ac','1','-f','f32le','-'])
audio=np.frombuffer(pcm,dtype=np.float32)
segments,info=model.transcribe(audio,language='es',beam_size=5,word_timestamps=True,vad_filter=False,initial_prompt='Victor Lustig vendió la Torre Eiffel en París en 1925. Chatarreros, André Poisson.')
results=[]
for s in segments:
 print(f'{s.start:.2f}–{s.end:.2f}: {s.text}',flush=True)
 results.append({'start':s.start,'end':s.end,'text':s.text,'words':[{'word':w.word.strip(),'start':w.start,'end':w.end,'probability':w.probability} for w in s.words]})
(root/'alignment/whisper.words.json').write_text(json.dumps({'engine':'faster-whisper small CPU int8','language':info.language,'duration':info.duration,'segments':results},ensure_ascii=False,indent=2))
