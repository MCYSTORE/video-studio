from pathlib import Path
from PIL import Image,ImageDraw
import cv2,json
root=Path(__file__).resolve().parents[1];timeline=json.loads((root/'alignment/timeline.json').read_text())
video=root/'out/torre_eiffel_1080p.mp4';cap=cv2.VideoCapture(str(video))
sheet=Image.new('RGB',(1500,1680),'#101722');draw=ImageDraw.Draw(sheet)
for i,s in enumerate(timeline['scenes']):
 f=(s['startFrame']+s['endFrame'])//2;cap.set(cv2.CAP_PROP_POS_FRAMES,f);ok,img=cap.read();assert ok
 image=Image.fromarray(cv2.cvtColor(img,cv2.COLOR_BGR2RGB));image.save(root/f'out/.work/scene_{i+1:02}.jpg')
 image.thumbnail((300,533));x=i%5*300;y=i//5*560;sheet.paste(image,(x,y));draw.text((x+6,y+538),f"{i+1:02} | {f/30:.3f}s | frame {f}",fill='white')
sheet.save(root/'out/review_contact_sheet.jpg')
loop=Image.new('RGB',(1080,992),'#101722');d=ImageDraw.Draw(loop)
for i,f in enumerate([0,timeline['durationInFrames']-1]):
 cap.set(cv2.CAP_PROP_POS_FRAMES,f);ok,img=cap.read();assert ok
 image=Image.fromarray(cv2.cvtColor(img,cv2.COLOR_BGR2RGB));image.thumbnail((540,960));loop.paste(image,(540*i,0));d.text((540*i+10,970),f'Frame {f}',fill='white')
loop.save(root/'out/loop_check.jpg');cap.release()
