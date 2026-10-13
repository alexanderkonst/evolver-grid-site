"""House style for all infographics: Space Grotesk, all lowercase, grayscale."""
import os, matplotlib
matplotlib.use("Agg")
from matplotlib import font_manager as fm
import matplotlib.axes
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),"fonts")
for w in (400,500,700): fm.fontManager.addfont(os.path.join(D,f"SpaceGrotesk-{w}.ttf"))
matplotlib.rcParams['font.family']='Space Grotesk'
matplotlib.rcParams['font.weight']=400
_t=matplotlib.axes.Axes.text
def _lower(self,x,y,s,*a,**k):
    if k.get('weight')=='bold': k['weight']=700
    return _t(self,x,y,str(s).lower(),*a,**k)
matplotlib.axes.Axes.text=_lower

# Footer: grayscale FYT octahedron mark to the left of the site name, pair centered.
import numpy as _np
from PIL import Image as _Image
_A=os.path.join(os.path.dirname(os.path.abspath(__file__)),"assets")
_MARK=None
def footer(a,text="findyourtoptalent.com",y=4,size=13,color='#555555',mark_h=3.4,gap=1.0):
    global _MARK
    if _MARK is None:
        im=_Image.open(os.path.join(_A,"fyt-mark-gray.png")); im=im.crop(im.getbbox()); _MARK=_np.asarray(im)
    f=a.figure; t=a.text(50,y,text,ha='center',va='baseline',fontsize=size,color=color)
    f.canvas.draw(); bb=t.get_window_extent().transformed(a.transData.inverted())
    w=bb.x1-bb.x0; mh=mark_h; mw=mh*_MARK.shape[1]/_MARK.shape[0]
    # aspect: data units are square on these square canvases
    total=mw+gap+w; x0=50-total/2
    t.set_position((x0+mw+gap+w/2,y))
    yc=(bb.y0+bb.y1)/2
    a.imshow(_MARK,extent=(x0,x0+mw,yc-mh/2,yc+mh/2),zorder=10,interpolation='antialiased')
    a.set_xlim(0,100); a.set_ylim(0,100)
    return t
