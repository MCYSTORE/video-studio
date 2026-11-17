"""Preserve supplied illustrations, split sharp center/soft periphery into Z planes.
No invented background or semantic subject cutout: source art is flattened.
"""
from pathlib import Path
import cv2,numpy as np
root=Path(__file__).resolve().parents[1]
out=root/'public/layers';out.mkdir(exist_ok=True)
w,h=1080,1920
y,x=np.mgrid[0:h,0:w].astype('float32');x=(x-w/2)/(w/2);y=(y-h/2)/(h/2)
# Only outer 7% loses opacity. Main drawings remain sharp and intact.
r=np.maximum(abs(x),abs(y));alpha=np.clip((1-r)/.07,0,1);alpha=alpha*alpha*(3-2*alpha)
cv2.imwrite(str(out/'focus.png'),(alpha*255).astype('uint8'))
for src in sorted((root/'public/scenes').glob('*.jpg')):
 im=cv2.imread(str(src));im=cv2.resize(im,(w,h),interpolation=cv2.INTER_AREA)
 soft=cv2.GaussianBlur(im,(0,0),3)
 cv2.imwrite(str(out/f'{src.stem}_back.jpg'),soft,[cv2.IMWRITE_JPEG_QUALITY,95])
 print(src.name,flush=True)
