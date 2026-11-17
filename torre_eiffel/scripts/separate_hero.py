"""U2Net person matte, ROI cleanup, and OpenCV inpaint for independent 2.5D layers."""
import json,os
from pathlib import Path
import cv2,numpy as np
from PIL import Image
from rembg import new_session,remove
root=Path(__file__).resolve().parents[1];folder=root/'public/layers';folder.mkdir(exist_ok=True)
# Normalized hero regions, reviewed against out/ingest_contact_sheet.jpg.
regions=[(.04,.13,.85,.96),(.05,.19,.76,.98),(.05,.25,.94,.99),(.26,.12,.96,.97),(.25,.26,.81,.92),(.27,.21,.91,.95),(.04,.10,.92,.99),(.05,.19,.63,.96),(.21,.30,.76,.94),(.17,.22,.88,.97),(.42,.40,.88,.82),(.16,.18,.81,.98),(.02,.04,.99,.98),(.14,.12,.96,.99),(.10,.13,.84,.96)]
session=new_session(os.environ.get('SEGMENT_MODEL','u2net'),providers=['CPUExecutionProvider'])
manifest=[]
for idx,box in enumerate(regions,1):
 if os.environ.get("ONLY_SCENE") and idx!=int(os.environ["ONLY_SCENE"]):continue
 source=root/f'public/scenes/{idx:02}.jpg';rgb=np.asarray(Image.open(source).convert('RGB'));h,w=rgb.shape[:2]
 x0,y0,x1,y1=[int(v*dim) for v,dim in zip(box,[w,h,w,h])]
 roi=rgb[y0:y1,x0:x1]
 raw=np.asarray(remove(Image.fromarray(roi),session=session,only_mask=True))
 alpha=np.zeros((h,w),np.uint8);alpha[y0:y1,x0:x1]=raw
 alpha=np.where(alpha>105,255,0).astype(np.uint8)
 count,labels,stats,_=cv2.connectedComponentsWithStats(alpha,8)
 components=sorted(range(1,count),key=lambda i:int(stats[i,cv2.CC_STAT_AREA]),reverse=True)
 clean=np.zeros_like(alpha)
 for component in components[:2]:
  if stats[component,cv2.CC_STAT_AREA]>h*w*.004:clean[labels==component]=255
 if cv2.countNonZero(clean)<h*w*.008:
  # GrabCut fallback constrained to the reviewed protagonist region.
  mask=np.full((h,w),cv2.GC_BGD,np.uint8);mask[y0:y1,x0:x1]=cv2.GC_PR_FGD
  inside=(x0+int((x1-x0)*.24),y0+int((y1-y0)*.18),int((x1-x0)*.50),int((y1-y0)*.64))
  cv2.rectangle(mask,inside,cv2.GC_FGD,-1)
  cv2.grabCut(rgb,mask,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),5,cv2.GC_INIT_WITH_MASK)
  clean=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
 clean=cv2.morphologyEx(clean,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8));clean=cv2.GaussianBlur(clean,(5,5),0.8)
 ys,xs=np.where(clean>96);margin=14
 bx0=max(0,int(xs.min())-margin);by0=max(0,int(ys.min())-margin);bx1=min(w,int(xs.max())+margin+1);by1=min(h,int(ys.max())+margin+1)
 rgba=np.dstack((rgb,clean))[by0:by1,bx0:bx1];Image.fromarray(rgba,'RGBA').save(folder/f'hero_{idx:02}.png')
 hole=cv2.dilate((clean>32).astype(np.uint8),np.ones((17,17),np.uint8),iterations=1)
 # Inpaint at half resolution to avoid huge gaps and reduce runtime.
 small=cv2.resize(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),(w//4,h//4));smallmask=cv2.resize(hole,(w//4,h//4),interpolation=cv2.INTER_NEAREST)
 filled=cv2.inpaint(small,smallmask,9,cv2.INPAINT_TELEA)
 filled=cv2.resize(filled,(w,h),interpolation=cv2.INTER_CUBIC)
 cv2.imwrite(str(folder/f'bg_{idx:02}.jpg'),filled,[cv2.IMWRITE_JPEG_QUALITY,95])
 item={'scene':idx,'bbox':[bx0,by0,bx1,by1],'source_size':[w,h],'hero_area_fraction':round(float(np.mean(clean>96)),4)};manifest.append(item)
 print(item,flush=True)
if os.environ.get('ONLY_SCENE'):
 old=json.loads((folder/'hero_manifest.json').read_text());old[int(os.environ['ONLY_SCENE'])-1]=manifest[0];manifest=old
(folder/'hero_manifest.json').write_text(json.dumps(manifest,indent=2))
