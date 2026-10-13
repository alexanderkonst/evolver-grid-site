# Five platonic solids in Sasha's cross (dodecahedron at the centre), grayscale, slowly turning. Seamless loop.
import numpy as np, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.spatial import ConvexHull
sys.path.insert(0,'..')
p=(1+5**.5)/2
def solid(name):
    if name=='tetra': V=[(1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)]
    if name=='cube': V=[(x,y,z) for x in(-1,1) for y in(-1,1) for z in(-1,1)]
    if name=='octa': V=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
    if name=='icosa': V=[q for a in(-1,1) for b in(-p,p) for q in((0,a,b),(a,b,0),(b,0,a))]
    if name=='dodeca':
        V=[(x,y,z) for x in(-1,1) for y in(-1,1) for z in(-1,1)]+[q for a in(-1,1) for b in(-p,p) for q in((0,a/p,b),(a/p,b,0),(b,0,a/p))]
    V=np.array(V,float); V/=np.linalg.norm(V,axis=1).max()
    h=ConvexHull(V); faces={}
    for s,eq in zip(h.simplices,h.equations):
        key=tuple(np.round(eq[:3],4)); faces.setdefault(key,set()).update(s)
    F=[]
    for n,idx in faces.items():
        idx=list(idx); c=V[idx].mean(0); n=np.array(n)
        u=V[idx[0]]-c; u/=np.linalg.norm(u); w=np.cross(n,u)
        idx.sort(key=lambda i:np.arctan2((V[i]-c)@w,(V[i]-c)@u)); F.append((idx,n))
    return V,F
def rot(axis,t):
    a=np.array(axis,float); a/=np.linalg.norm(a); x,y,z=a; c,s=np.cos(t),np.sin(t); C=1-c
    return np.array([[c+x*x*C,x*y*C-z*s,x*z*C+y*s],[y*x*C+z*s,c+y*y*C,y*z*C-x*s],[z*x*C-y*s,z*y*C+x*s,c+z*z*C]])
SS=2; W=1080*SS; cx,cy,arm=540,500,250
items=[('dodeca',(cx,cy),118,(0.3,1,0.2),1),('octa',(cx,cy-arm),78,(0.2,1,0.4),-1),('cube',(cx-arm,cy),74,(1,1,0.3),1),
       ('tetra',(cx+arm,cy),84,(-0.4,1,0.5),-1),('icosa',(cx,cy+arm),80,(0.5,1,-0.2),1)]
G={k:solid(k) for k,*_ in items}
L=np.array([-0.5,0.7,0.8]); L/=np.linalg.norm(L)
N=240; os.makedirs('frames',exist_ok=True)
font=ImageFont.truetype('../fonts/SpaceGrotesk-400.ttf',13*SS*100//72)
mark=Image.open('../assets/fyt-mark-gray.png'); mark=mark.crop(mark.getbbox())
def footer(img):
    d=ImageDraw.Draw(img); t='findyourtoptalent.com'; tw=d.textlength(t,font=font); mh=int(3.4*10.8*SS); mw=mh
    m=mark.resize((mw,mh),Image.LANCZOS); gap=int(1.0*10.8*SS); x0=int(W/2-(mw+gap+tw)/2); yb=W-int(4*10.8*SS)
    asc,desc=font.getmetrics(); ty=yb-asc
    img.paste(m,(x0,int(ty+asc*0.62-mh/2+desc*0.0)),m); d.text((x0+mw+gap,ty),t,font=font,fill=(85,85,85))
for f in range(N):
    t=2*np.pi*f/N
    img=Image.new('RGB',(W,W),'white')
    # contact shadows
    sh=Image.new('L',(W,W),0); ds=ImageDraw.Draw(sh)
    for k,(x,y),R,ax,d in items:
        x,y,R=x*SS,y*SS,R*SS; ds.ellipse((x-R*0.9+R*0.25,y+R*1.18-R*0.16,x+R*0.9+R*0.25,y+R*1.18+R*0.16),fill=70)
    sh=sh.filter(ImageFilter.GaussianBlur(14*SS)); img.paste((0,0,0),mask=sh)
    dr=ImageDraw.Draw(img)
    for k,(x,y),R,ax,d in items:
        V,F=G[k]; M=rot(ax,d*t)@rot((1,0,0),0.45)
        P=V@M.T; x,y,R=x*SS,y*SS,R*SS
        for idx,n in sorted(F,key=lambda q:P[q[0]].mean(0)[2]):
            nn=M@n
            if nn[2]<=0: continue
            lam=max(0,nn@L); spec=max(0,(2*(nn@L)*nn-L)[2])**24
            g=int(255*min(1,0.30+0.64*lam+0.16*spec))
            pts=[(x+P[i,0]*R,y-P[i,1]*R) for i in idx]
            dr.polygon(pts,fill=(g,g,g)); dr.line(pts+[pts[0]],fill=(26,26,26),width=int(1.1*SS),joint='curve')
    footer(img)
    img.resize((1080,1080),Image.LANCZOS).save(f'frames/{f:04d}.png')
    if f==0: img.resize((1080,1080),Image.LANCZOS).save('solids-turning-still.png')
subprocess.run('ffmpeg -y -loglevel error -framerate 30 -i frames/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart solids-turning.mp4',shell=True,check=True)
subprocess.run('ffmpeg -y -loglevel error -framerate 30 -i frames/%04d.png -vf "fps=20,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer" solids-turning.gif',shell=True,check=True)
