import numpy as np
from PIL import Image, ImageDraw, ImageFilter
N=1024
def bg(t):
    yy,xx=np.mgrid[0:N,0:N]; g=np.exp(-((xx-330)**2+(yy-280)**2)/(2*480**2))
    if t=='lunar': c0,c1=np.array([8,10,18]),np.array([30,36,54])
    elif t=='aurum': c0,c1=np.array([5,5,7]),np.array([28,22,12])
    else: c0,c1=np.array([214,196,164]),np.array([236,224,200])
    img=c0+(c1-c0)*g[...,None]
    return img
def mask(pts,w,blur=0,poly=False):
    L=Image.new('L',(N,N)); d=ImageDraw.Draw(L)
    (d.polygon(pts,fill=255) if poly else d.line(pts,fill=255,width=w,joint='curve'))
    return np.asarray(L.filter(ImageFilter.GaussianBlur(blur)) if blur else L,dtype=float)/255
def comp(img,layers,dark):
    for m,col,k in layers:
        c=np.array(col,float)
        if dark: img=img+m[...,None]*c*k
        else: a=np.clip(m*k,0,1)[...,None]; img=img*(1-a)+c*a
    return Image.fromarray(img.clip(0,255).astype('uint8'))
def proj(x,y,z,s0,a,b,p=0.0):
    a=np.radians(a); b=np.radians(b)
    X=x*np.cos(a)+z*np.sin(a); Z=-x*np.sin(a)+z*np.cos(a)
    Y=y*np.cos(b)-Z*np.sin(b); Z2=y*np.sin(b)+Z*np.cos(b)
    s=s0/np.maximum(1+p*Z2,0.25); return N/2+X*s, N/2-Y*s
def clip(px,py):
    ok=(px>-120)&(px<N+120)&(py>-120)&(py<N+120); return list(zip(px[ok],py[ok]))
GOLD=(255,170,40); BLUE=(70,170,255); WHITE=(255,250,235)
def vision(t):
    dark=t!='lapis'; L=[]
    for v in [(1,0,0),(0,1,0),(0,0,1)]:
        s=np.linspace(-8,8,3000); pts=clip(*proj(*[s*c for c in v],s0=380,a=45,b=35.264))
        if dark:  # lightsaber: wide coloured blade glow + gold blade + white-hot core
            L+=[(mask(pts,30,40),BLUE,0.45),(mask(pts,22,16),GOLD,0.55),(mask(pts,16,5),GOLD,0.6),(mask(pts,9,2),(255,220,150),0.7),(mask(pts,4,1),WHITE,0.9)]
        else:
            L+=[(mask(pts,30,34),BLUE,0.22),(mask(pts,22,12),(214,150,40),0.45),(mask(pts,14,2),(196,138,34),1.0),(mask(pts,5,1),(255,238,190),0.9)]
    return comp(bg(t),L,dark)
NAT={'lunar':((255,152,124),(31,160,240)),'aurum':((255,196,90),(235,235,240)),'lapis':((190,132,30),(11,42,90))}
def nature(t):
    dark=t!='lapis'; E,B=NAT[t]; L=[]
    tt=np.linspace(-4,4,4000); f=0.55*np.sin(2*np.pi*tt/1.4)   # extends past edges
    P=lambda x,y,z: proj(x,y,z,s0=470,a=-28,b=16)
    ax=clip(*P(tt,0*tt,0*tt))
    for col,yz in [(B,(0*tt,f)),(E,(f,0*tt))]:
        pc=clip(*P(tt,*yz)); sheet=mask(pc+ax[::-1],0,2,poly=True)
        if dark: L+=[(sheet,col,0.32),(mask(pc,10,22),col,0.8),(mask(pc,10,6),col,0.8),(mask(pc,9),col,1.0),(mask(pc,3),tuple(min(255,c//2+128) for c in col),1.0)]
        else: L+=[(sheet,col,0.25),(mask(pc,10,14),col,0.3),(mask(pc,8),col,1.0)]
    L+=[(mask(ax,2),(190,196,210) if dark else (120,105,80),0.9)]
    return comp(bg(t),L,dark)
for t in ['lunar','lapis','aurum']:
    vision(t).save(f'v6-vision-{t}.png'); nature(t).save(f'v6-nature-{t}.png')
