from PIL import Image
from rembg import remove, new_session
im=Image.open('IMG_3010.webp').convert('RGB')
boxes={'octa':(660,290,940,590),'cube':(215,870,445,1100),'fish':(560,860,1450,1170),'icosa':(630,1530,840,1740)}
s=new_session('isnet-general-use')
for k,b in boxes.items():
    c=im.crop(b); o=remove(c,session=s); o.save(f'cut-{k}.png'); print(k,o.getbbox())
