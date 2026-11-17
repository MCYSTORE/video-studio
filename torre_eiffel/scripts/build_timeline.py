"""Build the frame schedule from reviewed Whisper words and semantic anchors."""
import json,math,re,subprocess,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FPS=30

def norm(s):
 return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(c)!='Mn' and (c.isalnum() or c==' ')).strip()
def load_words():
 raw=json.loads((ROOT/'alignment/whisper.words.json').read_text())
 words=[w.copy() for seg in raw['segments'] for w in seg['words']]
 corrections=ROOT/'alignment/word_corrections.json'
 for fix in json.loads(corrections.read_text()) if corrections.exists() else []:
  words[fix['index']]['word']=fix['text']
 # Whisper split the single spoken numeral into two tokens; keep it as one caption word.
 merged=[];i=0
 while i<len(words):
  if i+1<len(words) and words[i]['word']=='7' and words[i+1]['word']=='.000':
   merged.append({**words[i],'word':'7.000','end':words[i+1]['end']});i+=2
  else:merged.append(words[i]);i+=1
 return [w for w in merged if not (w['start']<.7 and norm(w['word']) in ['ah','eh','oh','a'])]
def find_phrase(words,phrase,start_index=0):
 needle=norm(phrase).split()
 for i in range(start_index,len(words)-len(needle)+1):
  if [norm(w['word']) for w in words[i:i+len(needle)]]==needle:return i
 raise ValueError(f'Anchor not found: {phrase}')
def build():
 words=load_words();anchors=json.loads((ROOT/'alignment/scene_anchors.json').read_text())
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(ROOT/'public/audio/voiceover.mp3')],text=True))
 frames=math.ceil(duration*FPS)
 scenes=[];prev=0
 for scene in anchors:
  ix=find_phrase(words,scene['phrase'],prev) if scene['id']>1 else 0
  frame=max(0,round(words[ix]['start']*FPS)-3) if scene['id']>1 else 0
  scenes.append({**scene,'anchorWordIndex':ix,'wordStartSeconds':words[ix]['start'],'startFrame':frame,'endFrame':frames})
  if len(scenes)>1:scenes[-2]['endFrame']=frame
  prev=ix
 assert len(scenes)==15 and all(s['startFrame']<s['endFrame'] for s in scenes)
 # Punctuation-aware 2–4 word phrases; rebalance singletons.
 chunks=[];chunk=[]
 for w in words:
  chunk.append(w)
  if len(chunk)==4 or (len(chunk)>=2 and re.search(r'[.,;:!?…]$',w['word'])):
   chunks.append(chunk);chunk=[]
 if chunk:
  if len(chunk)==1 and len(chunks[-1])<=3:chunks[-1]+=chunk
  elif len(chunk)==1:chunk.insert(0,chunks[-1].pop());chunks.append(chunk)
  else:chunks.append(chunk)
 captions=[]
 stop=set('el la los las un una unos unas de del en que a al y o le lo su sus se por para con es este esta esto ese esa no fue pero porque como hasta otra vez tu te me'.split())
 for chunk in chunks:
  candidates=[(len(w['word']),i) for i,w in enumerate(chunk) if norm(w['word']) not in stop]
  highlight=max(candidates or [(len(w['word']),i) for i,w in enumerate(chunk)])[1]
  captions.append({'startFrame':max(0,round(chunk[0]['start']*FPS)-3),'endFrame':min(frames,round(chunk[-1]['end']*FPS)+2),'highlight':highlight,'words':[{'text':w['word'],'startFrame':max(0,round(w['start']*FPS)-3),'endFrame':max(1,round(w['end']*FPS)-3)} for w in chunk]})
 for i,c in enumerate(captions[:-1]):c['endFrame']=captions[i+1]['startFrame']
 captions[-1]['endFrame']=frames
 sfx=[]
 for phrase,file,volume in [('idea absurda','sfx/sfx_ding.mp3',.45),('vendio otra vez','sfx/sfx_cash.mp3',.5)]:
  ix=find_phrase(words,phrase)
  sfx.append({'file':file,'frame':max(0,round(words[ix]['start']*FPS)-3),'volume':volume,'phrase':phrase,'anchorWordIndex':ix,'wordStartSeconds':words[ix]['start']})
 out={'fps':FPS,'sourceDurationSeconds':duration,'durationInFrames':frames,'quantizationErrorMilliseconds':round((frames/FPS-duration)*1000,3),'anticipationFrames':3,'patternInterruptFrames':[s*FPS-3 for s in [6,12,18,24,30,36]],'scenes':scenes,'captions':captions,'sfx':sfx}
 (ROOT/'alignment/timeline.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
 (ROOT/'alignment/voiceover.reviewed.words.json').write_text(json.dumps(words,ensure_ascii=False,indent=2))
 print(json.dumps({'duration':duration,'frames':frames,'scenes':[(s['id'],s['phrase'],s['startFrame']/FPS) for s in scenes],'sfx':sfx,'captions':len(captions)},ensure_ascii=False,indent=2))
if __name__=='__main__':build()
