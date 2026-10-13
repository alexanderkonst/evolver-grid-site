# Grayscale cutout of Sasha's handmade solids on pure white; his cross layout, tightened.
import sys,os; sys.path.insert(0,'..'); import fyt_style
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import numpy as np, matplotlib.pyplot as plt
pieces={'octa':((660,290),'cut-octa.png'),'cube':((215,870),'cut-cube.png'),'fish':((560,860),'cut-fish2.png'),'icosa':((630,1530),'cut-icosa.png')}
S=2160; sc=0.62*2
sphere=(790,1000)            # dodecahedron = centre of the cross
C=(S/2,S/2-40)
def tgt(x,y,k):
    dx,dy=x-sphere[0],y-sphere[1]
    if k in('octa','icosa'): dy*=0.62
    if k=='cube': dx*=0.9
    return C[0]+dx*sc, C[1]+dy*sc
canvas=Image.new('RGBA',(S,S),(255,255,255,255))
for k,((x,y),fn) in pieces.items():
    im=Image.open(fn).convert('RGBA'); a=im.split()[3]
    g=ImageOps.grayscale(im.convert('RGB')); g=ImageEnhance.Contrast(g).enhance(1.25); g=ImageOps.autocontrast(g,cutoff=1)
    p=Image.merge('RGBA',(g,g,g,a)); w,h=p.size; p=p.resize((int(w*sc),int(h*sc)),Image.LANCZOS)
    tx,ty=tgt(x+w/2,y+h/2,k); px,py=int(tx-w*sc/2),int(ty-h*sc/2)
    sh=Image.new('RGBA',p.size,(0,0,0,0)); sh.putalpha(p.split()[3].point(lambda v:int(v*0.28))); sh=sh.filter(ImageFilter.GaussianBlur(20))
    canvas.alpha_composite(sh,(px+16,py+26)); canvas.alpha_composite(p,(px,py))
img=canvas.convert('RGB').resize((1080,1080),Image.LANCZOS)
f=plt.figure(figsize=(10.8,10.8),dpi=100); a=f.add_axes([0,0,1,1]); a.imshow(np.asarray(img),extent=(0,100,0,100)); a.set_xlim(0,100); a.set_ylim(0,100); a.axis('off')
fyt_style.footer(a); f.savefig('solids-handmade.png'); plt.close(f)
