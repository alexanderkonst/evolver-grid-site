import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=2; W,H=1080*S,1620*S
HERE="/workspace/work/moon-style/"; F=HERE+"fonts/"
NT,NM,NL=(0x09,0x0d,0x13),(0x0e,0x14,0x1c),(0x12,0x1b,0x26)
INK=(0xe6,0xeb,0xf2); SILVER=(0xc8,0xd2,0xde); MUTED=(0x8d,0x9b,0xab); TEAL=(0x5e,0xc8,0xbd)
def serif(px,italic=False):
    f=ImageFont.truetype(F+("CormorantGaramond-Italic-VF.ttf" if italic else "CormorantGaramond-VF.ttf"),px*S)
    f.set_variation_by_name("Light Italic" if italic else "Light"); return f
def mono(px): return ImageFont.truetype(F+"IBMPlexMono-Light.ttf",px*S)
img=Image.new("RGB",(W,H)); d=ImageDraw.Draw(img)
for y in range(H):
    t=y/(H-1); a,b,u=(NT,NM,t/0.48) if t<0.48 else (NM,NL,(t-0.48)/0.52)
    d.line([(0,y),(W,y)],fill=tuple(round(a[i]+(b[i]-a[i])*u) for i in range(3)))
st=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(st); r=random.Random(7)
for _ in range(60):
    x,y=r.randint(40,W-40),r.randint(40,int(H*0.16)); rr=r.choice([1,1,1.5,2])*S
    sd.ellipse([x-rr,y-rr,x+rr,y+rr],fill=(0xee,0xf3,0xf8,r.randint(40,120)))
img.paste(st,(0,0),st); d=ImageDraw.Draw(img)
M=80*S
d.text((M,95*S),"THE GUARDIAN, ACROSS TRADITIONS",font=mono(17),fill=MUTED)
d.text((M,128*S),"One companion, many names",font=serif(66),fill=INK)
d.text((M,214*S),"Every deep tradition knows a being given to each person, who walks beside them.",font=serif(26,True),fill=SILVER)
rows=[("Christianity","Guardian angel","Given to each person; guides and protects"),
("Judaism / Kabbalah","Malakh, maggid","Messenger angel; the maggid, a heavenly teacher"),
("Islam","Hafaza, qarin","Angels who guard and record; the qarin, a companion"),
("Zoroastrianism","Fravashi","The soul's guardian, existing before birth"),
("Ancient Greece","Daimon","Chosen by the soul before birth (Plato)"),
("Rome","Genius, juno","A spirit born together with the person"),
("Western esotericism","Holy Guardian Angel","The higher self; goal of the Abramelin work"),
("Hinduism","Ishta-devata, antaryamin","The chosen deity; the inner ruler in the heart"),
("Tibetan Buddhism","Yidam","Personal deity of practice; co-born protectors"),
("Zen","No such figure","The original face: one's own nature, not a companion"),
("Japan (Shinto)","Shugoshin, ujigami","Guardian deity of a person and a clan"),
("Norse","Fylgja","A spirit that follows a person from birth"),
("Ancient Egypt","Ka","The spiritual double"),
("Yoruba","Ori","Personal destiny-guardian, chosen before birth"),
("Slavic","Dolya","The spirit of one's share, walking beside a person")]
y0=290*S; rh=70*S; c1,c2,c3=M,M+240*S,M+545*S
d.text((c1,y0),"TRADITION",font=mono(14),fill=MUTED); d.text((c2,y0),"NAME",font=mono(14),fill=MUTED); d.text((c3,y0),"ESSENCE",font=mono(14),fill=MUTED)
y=y0+34*S
def wrap(t,f,w):
    out,line=[], ""
    for wd in t.split():
        tt=(line+" "+wd).strip()
        if d.textlength(tt,font=f)<=w: line=tt
        else: out.append(line); line=wd
    out.append(line); return out
for tr,nm,es in rows:
    d.line([(M,y),(W-M,y)],fill=(0x2a,0x35,0x44),width=2)
    acc = TEAL if nm in ("Genius, juno","Daimon","Hafaza, qarin","Fylgja") else INK
    for i,l in enumerate(wrap(tr,serif(24),235*S)): d.text((c1,y+14*S+i*26*S),l,font=serif(24),fill=SILVER)
    for i,l in enumerate(wrap(nm,serif(26),255*S)): d.text((c2,y+12*S+i*27*S),l,font=serif(26),fill=acc)
    for i,l in enumerate(wrap(es,serif(23,True),W-M-c3)): d.text((c3,y+14*S+i*25*S),l,font=serif(23,True),fill=SILVER)
    y+=rh
d.line([(M,y),(W-M,y)],fill=(0x2a,0x35,0x44),width=2)
y+=40*S
for i,l in enumerate(wrap("Genius, daimon, qarin, fylgja: names of the guardian. Your AI is a different being, made by us, so it takes none of them.",serif(30),W-2*M)):
    d.text((M,y+i*36*S),l,font=serif(30),fill=INK)
mark=Image.open(HERE+"mark-1-crystal-moon.png").convert("RGB").resize((40*S,40*S),Image.LANCZOS)
mask=mark.convert("L").point(lambda v:0 if v<24 else min(255,int((v-24)*1.6)))
dom="findyourtoptalent.com"; f=mono(16); tw=d.textlength(dom,font=f)
fx=(W-(40*S+14*S+tw))/2; fy=H-75*S
img.paste(mark,(int(fx),int(fy)),mask); d.text((fx+54*S,fy+10*S),dom,font=f,fill=MUTED)
img.resize((1080,1620),Image.LANCZOS).save("guardian_across_traditions.png")
