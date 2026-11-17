"""Copy reviewed selections without modifying the user's originals."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];repo=root.parent
manifest=json.loads((root/'alignment/asset_manifest.json').read_text())
for scene in manifest['scenes']:
 source=repo/scene['source'];destination=root/scene['destination'];destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,destination)
 scene['sha256']=hashlib.sha256(source.read_bytes()).hexdigest()
audio=[('Voz-torre-1.mp3','public/audio/voiceover.mp3'),('Midnight_Capers.mp3','public/audio/bgm.mp3'),('Bright_cartoon_light_#3-1794914490783.mp3','public/sfx/sfx_ding.mp3'),('Vintage_mechanical_c_#1-1794914742681.mp3','public/sfx/sfx_cash.mp3')]
manifest['audio']=[]
for source,dest in audio:
 p=repo/source;d=root/dest;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d);manifest['audio'].append({'source':source,'destination':dest,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(root/'alignment/asset_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
files=sorted(repo.glob('Stickman*.jpg'));sheet=Image.new('RGB',(1200,2200),'#151515');draw=ImageDraw.Draw(sheet)
for i,path in enumerate(files):
 image=Image.open(path);image.thumbnail((290,505));x=i%4*300;y=i//4*550;sheet.paste(image,(x,y));draw.text((x+4,y+506),f'{i+1}: '+path.name.replace('Stickman_','')[:31],fill='white')
(root/'out').mkdir(exist_ok=True);sheet.save(root/'out/ingest_contact_sheet.jpg')
