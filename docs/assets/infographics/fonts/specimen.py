import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties as FP
fs=[("Fraunces.ttf","Fraunces","warm serif, soft edges"),("InstrumentSerif-Regular.ttf","Instrument Serif","elegant, editorial"),("YoungSerif-Regular.ttf","Young Serif","sturdy, human"),("SpaceGrotesk.ttf","Space Grotesk","clean, a bit odd"),("Caveat.ttf","Caveat","handwritten, light"),("Gaegu-Bold.ttf","Gaegu","handwritten, childlike")]
f=plt.figure(figsize=(10.8,13.5),dpi=100); a=f.add_axes([0,0,1,1]); a.set_xlim(0,100); a.set_ylim(0,100); a.axis('off')
for i,(fn,n,d) in enumerate(fs):
    y=92-i*15.5
    a.text(7,y,f"{i+1}. {n}",fontsize=13,color='#777',fontproperties=FP(fname='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') if False else None)
    a.text(7,y-3,d,fontsize=11,color='#999')
    a.text(7,y-10,"Same direction. Opposite gifts.",fontsize=40,color='#1a1a1a',fontproperties=FP(fname=fn))
f.savefig("specimen.png")
