import sys,os; sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')); import fyt_style
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, FancyArrow

K='#1a1a1a'; G='#6e6e6e'; D='#555555'; L='#9a9a9a'
def canvas():
    f=plt.figure(figsize=(10.8,10.8),dpi=100); a=f.add_axes([0,0,1,1]); a.set_xlim(0,100); a.set_ylim(0,100); a.axis('off'); return f,a
def foot(a): fyt_style.footer(a)

# 1. Same direction, opposite gifts: grayscale sphere pierced by an arrow
import numpy as np
from matplotlib.patches import Ellipse
f,a=canvas()
a.text(50,88,"Same direction.",ha='center',fontsize=44,weight='bold',color=K)
a.text(50,79,"Opposite gifts.",ha='center',fontsize=44,weight='bold',color=K)
cx,cy,R=50,50,15
# soft shadow on the ground, cast toward where the arrow points (right)
for i in range(14):
    a.add_patch(Ellipse((cx+9,cy-R-2.2),R*2.3-i*1.3,4.2-i*0.25,fc='black',alpha=0.025,lw=0,zorder=1))
# arrow tail, behind the sphere
ang=np.radians(28); ux,uy=np.cos(ang),np.sin(ang)
x0,y0=cx-34*ux,cy-34*uy; x1,y1=cx+31*ux,cy+31*uy
a.plot([x0,cx],[y0,cy],color=K,lw=5,solid_capstyle='butt',zorder=2)
# shaded sphere: left half lighter (you), right half darker (them)
n=600; xs=np.linspace(-1,1,n); X,Y=np.meshgrid(xs,xs[::-1]); Z2=1-X**2-Y**2; m=Z2>=0
Z=np.sqrt(np.clip(Z2,0,1)); LV=np.array([-0.55,0.6,0.58]); LV/=np.linalg.norm(LV)
sh=np.clip(X*LV[0]+Y*LV[1]+Z*LV[2],0,1)
base=np.where(X<0,0.93,0.55); amb=np.where(X<0,0.30,0.12)
v=amb+(base-amb)*sh+0.10*sh**30
img=np.ones((n,n,4)); img[...,0]=img[...,1]=img[...,2]=np.clip(v,0,1); img[...,3]=m
a.imshow(img,extent=(cx-R,cx+R,cy-R,cy+R),zorder=3,interpolation='bilinear')
a.add_patch(Circle((cx,cy),R,fill=False,ec=K,lw=2,zorder=4))
# the seam between the two halves, curved like a meridian
t=np.linspace(-np.pi/2,np.pi/2,200)
a.plot(cx+R*0.12*np.cos(t),cy+R*np.sin(t),color=K,lw=1.5,zorder=4)
a.text(cx-7.5,cy+1.5,"YOU",ha='center',va='center',fontsize=16,weight='bold',color=K,zorder=5)
a.text(cx+7.5,cy+1.5,"THEM",ha='center',va='center',fontsize=16,weight='bold',color='white',zorder=5)
# arrow exits the sphere and keeps going
ex,ey=cx+R*ux,cy+R*uy
a.plot([ex,x1-3.2*ux],[ey,y1-3.2*uy],color=K,lw=5,solid_capstyle='butt',zorder=5)
a.add_patch(FancyArrow(x1-3.4*ux,y1-3.4*uy,0.01*ux,0.01*uy,width=0,head_width=4.2,head_length=4,length_includes_head=False,color=K,zorder=5))
a.add_patch(Circle((ex,ey),0.9,fc=K,ec=K,zorder=5))
a.text(50,25,"one whole, moving one way",ha='center',fontsize=14,color=K)
a.plot([10,90],[20,20],color=L,lw=1.5)
a.plot([50,50],[8.5,17],color=L,lw=1.5)
a.text(30,15,"SAME",ha='center',fontsize=15,weight='bold',color=K)
a.text(30,10.5,"where you're going",ha='center',fontsize=14,color=D)
a.text(70,15,"OPPOSITE",ha='center',fontsize=15,weight='bold',color=K)
a.text(70,10.5,"what you each bring",ha='center',fontsize=14,color=D)
foot(a); f.savefig("1-same-direction-opposite-gifts.png"); plt.close(f)

# shared: small shaded sphere (light = you, dark = what you don't have)
def sphere(a,cx,cy,R,base,amb,z=3,split=False):
    n=300; xs=np.linspace(-1,1,n); X,Y=np.meshgrid(xs,xs[::-1]); Z2=1-X**2-Y**2; m=Z2>=0
    Z=np.sqrt(np.clip(Z2,0,1)); LV=np.array([-0.55,0.6,0.58]); LV/=np.linalg.norm(LV)
    sh=np.clip(X*LV[0]+Y*LV[1]+Z*LV[2],0,1)
    if split: b=np.where(X<0,0.93,0.55); am=np.where(X<0,0.30,0.12)
    else: b,am=base,amb
    v=am+(b-am)*sh+0.10*sh**30
    img=np.ones((n,n,4)); img[...,0]=img[...,1]=img[...,2]=np.clip(v,0,1); img[...,3]=m
    for k in range(8): a.add_patch(Ellipse((cx+R*0.35,cy-R-0.6),R*2.0-k*0.18*R,R*0.35-k*0.03*R,fc='black',alpha=0.03,lw=0,zorder=z-1))
    a.imshow(img,extent=(cx-R,cx+R,cy-R,cy+R),zorder=z,interpolation='bilinear')
    a.add_patch(Circle((cx,cy),R,fill=False,ec=K,lw=1.6,zorder=z+1))
    if split:
        t=np.linspace(-np.pi/2,np.pi/2,100); a.plot(cx+R*0.12*np.cos(t),cy+R*np.sin(t),color=K,lw=1.2,zorder=z+1)
YOU=(0.95,0.35); THEM=(0.45,0.08)
def step(a,x0,x1,y,col=L): a.plot([x0,x1],[y,y],color=col,lw=2.5,solid_capstyle='round',zorder=2)

# 2. Who complements you: three kinds of match, one visual grammar
f,a=canvas()
a.text(50,88,"Who complements you",ha='center',fontsize=42,weight='bold',color=K)
rows=[("COLLABORATOR","Same direction.\nOpposite gifts."),
      ("IDEAL CLIENT","Like you.\nStuck where you broke through."),
      ("LEARNING PARTNER","Native at what\nyou're here to learn.")]
gx=17
for i,(h,t) in enumerate(rows):
    y=65-i*20.5
    if i==0:
        sphere(a,gx,y,5.6,0,0,split=True)
        a.annotate('',xy=(gx+11,y+2.2),xytext=(gx-11,y-2.2),arrowprops=dict(arrowstyle='-|>',color=K,lw=2.2,mutation_scale=18),zorder=1)
    elif i==1:
        # you, a step above; them, like you, on the step you left
        step(a,gx-11,gx-1,y-5); step(a,gx+1,gx+11,y-1)
        a.plot([gx-1,gx+1],[y-5,y-1],color=L,lw=2.5,zorder=2)
        sphere(a,gx+6,y+2.6,3.6,*YOU); sphere(a,gx-6,y-1.4,3.6,*YOU)
    else:
        # them, dark and native, a step above you
        step(a,gx-11,gx-1,y-5); step(a,gx+1,gx+11,y-1)
        a.plot([gx-1,gx+1],[y-5,y-1],color=L,lw=2.5,zorder=2)
        sphere(a,gx-6,y-1.4,3.6,*YOU); sphere(a,gx+6,y+2.6,3.6,*THEM)
    a.text(35,y+3.5,h,fontsize=20,weight='bold',va='center',color=K)
    a.text(35,y-3.6,t,fontsize=17,va='center',linespacing=1.3,color=D)
foot(a); f.savefig("2-who-complements-you.png"); plt.close(f)

# 3. Professional matchmaking tools: how deep each one sees
f,a=canvas()
a.text(50,88,"Professional matchmaking tools",ha='center',fontsize=36,weight='bold',color=K)
top,bot,nl=70,22,6; h=(top-bot)/nl
tones=['#f5f5f5','#ebebeb','#dedede','#cfcfcf','#bebebe','#acacac']
for k in range(nl):
    y1=top-k*h
    a.add_patch(Rectangle((8,y1-h),84,h,fc=tones[k],ec='white',lw=2.5,zorder=1))
cols=[(22,"LinkedIn","titles",1,L,4),(50,"Boardy","stated interests",2,L,4),(78,"Find Your Top Talent","six layers of who you are",6,K,7)]
for x,n,d,dep,c,lw in cols:
    a.text(x,74,n,ha='center',fontsize=17 if dep<6 else 16,weight='bold',color=K)
    tip=top-dep*h+h*0.22; my=top-dep*h+h*0.5
    a.plot([x,x],[72.2,tip+2.4],color=c,lw=lw,solid_capstyle='butt',zorder=3)
    a.add_patch(FancyArrow(x,tip+2.6,0,-0.01,width=0,head_width=3.2 if dep<6 else 4,head_length=2.6,length_includes_head=False,color=c,zorder=3))
    if dep<6: a.text(x+3,my,d,ha='left',va='center',fontsize=15,color=K,zorder=4)
    else: a.text(x-3.5,my,d,ha='right',va='center',fontsize=15,weight='bold',color=K,zorder=4)
a.text(50,14,"The code can be copied. The profiles can't.",ha='center',fontsize=18,weight='bold',color=K)
foot(a); f.savefig("3-professional-matchmaking-tools.png"); plt.close(f)
