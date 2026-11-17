"""Decode original voice to frame-synchronous RMS for deterministic character motion."""
import json,subprocess
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]
timeline=json.loads((root/'alignment/timeline.json').read_text())
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(root/'public/audio/voiceover.mp3'),'-ac','1','-ar','48000','-f','f32le','-'])
samples=np.frombuffer(raw,dtype=np.float32);hop=1600;values=[]
for frame in range(timeline['durationInFrames']):
 window=samples[frame*hop:(frame+1)*hop]
 rms=float(np.sqrt(np.mean(window*window))) if len(window) else 0
 values.append(rms)
reference=float(np.percentile(values,90))
normalized=[min(1,round(v/max(reference,1e-6),4)) for v in values]
smoothed=[round(.25*normalized[max(0,i-1)]+.5*v+.25*normalized[min(len(values)-1,i+1)],4) for i,v in enumerate(normalized)]
(root/'alignment/voice_envelope.json').write_text(json.dumps({'source':'public/audio/voiceover.mp3','fps':30,'method':'RMS of 1600 samples/frame at 48 kHz, 90th percentile normalization, three-frame smoothing','values':smoothed}))
print('Envelope frames:',len(smoothed),'p90 RMS:',reference)
