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

from PIL import ImageOps
PATCH={'cube':('cut-cube.png',(70,65,160,150)),'octa':('cut-octa.png',(105,95,185,175)),'icosa':('cut-icosa.png',(80,70,145,135)),
       'dodeca':('cut-fish2.png',(190,100,280,190)),'tetra':('cut-fish2.png',(360,35,440,105))}
STR={'cube':1.3,'octa':1.0,'icosa':1.3,'dodeca':1.0,'tetra':1.2}
TEX={}
for k,(fn,b) in PATCH.items():
    t=np.asarray(ImageOps.grayscale(Image.open(fn).convert('RGB').crop(b)).resize((256,256),Image.LANCZOS),float)/255
    hp=t-np.asarray(Image.fromarray((t*255).astype('uint8')).filter(ImageFilter.GaussianBlur(24)),float)/255  # keep surface detail, drop photo lighting
    TEX[k]=Image.fromarray(np.clip(128+hp*STR[k]*220,0,255).astype('uint8'))
def tex_face(img,k,pts,val,n):
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    x0,y0=int(min(xs))-2,int(min(ys))-2; x1,y1=int(max(xs))+3,int(max(ys))+3; w,h=x1-x0,y1-y0
    ang=[np.pi/2+2*np.pi*i/n for i in range(n)]
    uv=np.array([(128+118*np.cos(a),128-118*np.sin(a)) for a in ang])
    X=np.array([(p[0]-x0,p[1]-y0,1) for p in pts]); A,*_=np.linalg.lstsq(X,uv,rcond=None)
    warped=np.asarray(TEX[k].transform((w,h),Image.AFFINE,data=(A[0,0],A[1,0],A[2,0],A[0,1],A[1,1],A[2,1]),resample=Image.BICUBIC,fillcolor=128),float)
    v=np.clip(val*255*(1+(warped-128)/220),0,255).astype('uint8')
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).polygon([(p[0]-x0,p[1]-y0) for p in pts],fill=255)
    img.paste(Image.fromarray(v).convert('RGB'),(x0,y0),m)
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
            val=min(1,0.30+0.64*lam+0.16*spec)
            pts=[(x+P[i,0]*R,y-P[i,1]*R) for i in idx]
            tex_face(img,k,pts,val,len(idx)); dr.line(pts+[pts[0]],fill=(40,40,40),width=int(1.0*SS),joint='curve')
    footer(img)
    img.resize((1080,1080),Image.LANCZOS).save(f'frames/{f:04d}.png')
    if f==0: img.resize((1080,1080),Image.LANCZOS).save('solids-textured-still.png')
subprocess.run('ffmpeg -y -loglevel error -framerate 30 -i frames/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart solids-textured.mp4',shell=True,check=True)
subprocess.run('ffmpeg -y -loglevel error -framerate 30 -i frames/%04d.png -vf "fps=20,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer" solids-textured.gif',shell=True,check=True)
