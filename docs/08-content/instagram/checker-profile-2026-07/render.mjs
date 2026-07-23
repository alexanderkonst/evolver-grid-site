import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const out = path.join(here, 'output');
const logo = path.join(root, 'src/assets/you-be-original-lockup.webp');
const profilePhoto = path.join(root, 'src/assets/profile-photo.png');
const fonts = path.join(root, 'public/fonts');
const logoData = `data:image/webp;base64,${(await fs.readFile(logo)).toString('base64')}`;
const profilePhotoData = `data:image/png;base64,${(await fs.readFile(profilePhoto)).toString('base64')}`;

const START = [
  ['law', 'Your career is capped by how well you know yourself.'],
  ['symptom', 'You feel it as a ceiling.', 'New strategies. More effort. Same results.'],
  ['law', "It’s a law:", 'you cannot build a professional life more precise than your self-understanding.'],
  ['outside', 'So everyone optimizes the outside.', 'Résumé. Niche. Funnel. All downstream.'],
  ['move', 'The ceiling is not fixed.', 'It moves when your self-understanding does.'],
  ['words', 'It starts with words.', 'Say exactly what you do better than others, and doors appear that were always there.'],
  ['doors', 'Every level of clarity opens options that already existed.', 'That is how careers jump.'],
  ['cta', '45 minutes, free.', 'You leave with your transition named and your strongest direction on the table.', 'LINK IN BIO'],
];

const PROOF = [
  ['proof-title', 'Verbatim.', 'From real session transcripts.'],
  ['quote', '“We set a strategic corridor for building a business which I never had before. I feel very big confidence.”', 'SERGEY JAY MAKAROV'],
  ['quote', '“I was 100% inside your structure and never felt the need to change the methodology.”', 'SERGEY JAY MAKAROV'],
  ['quote', '«Плейбук без AI — документы на полке. AI без плейбука — ерунда. Вместе — космический инструмент.»', 'SERGEY JAY MAKAROV'],
  ['quote', '“The gold is under the dust. It’s uplifting me so much and giving me psychological and emotional stability. It’s a real breakthrough.”', 'SANDRA OTTO'],
  ['quote', '“Thank you for opening my eyes to things that maybe I’m pushing away—to not embody or execute or own.”', 'KARIME KURI'],
  ['proof-end', 'Every word, word for word.', 'More: findyourtoptalent.com/ignite'],
];

const METHOD = [
  ['frame', '01', 'THE CEILING', 'Nothing grows past how well it knows itself. A person. A company. A civilization.'],
  ['frame', '02', 'THE WATERFALL', 'Uniqueness → myth → tribe → offer → channel. Change the top; everything downstream re-runs.'],
  ['frame', '03', 'THE LOOP', 'Articulate → see → enter → repeat. Words open doors. Walking through moves the ceiling.'],
  ['frame', '04', 'THE TWO FUELS', 'Expression runs on a renewable: excitement. Imitation runs on a depletable: grind.'],
  ['frame', '05', 'THE LADDER', 'Free taste → paid step → infrastructure. Every scale buys the same shape.'],
  ['frame', '06', 'THE NETWORK', 'Sovereigns, 100% self-owned, connected by agreements. Alignment lives in the edges.'],
  ['method-end', 'This is the whole method.', 'The playbook is public.', 'findyourtoptalent.com'],
];

const WORK = [
  ['door', '01 · FREE', 'DIRECTION CALL', '45 minutes. Your transition named and your strongest direction on the table.'],
  ['door', '02 · $555', 'PRODUCTIZE YOURSELF', 'Leave with exact words, your business on one page, and a magnetic story.'],
  ['door', '03 · $1,111', 'BUILT', 'Packaged. Distributed. Your first ten conversations begun.'],
  ['cta', 'One door to start.', 'The Direction Call.', 'LINK IN BIO'],
];

const ME = [
  ['me', 'MIT → ventures → years of professional fog.', 'I found the law the hard way: the outside cannot become clearer than the inside.'],
  ['me', 'I ran the method on myself first.', 'This business is the result.'],
  ['me-photo', 'SASHA KONSTANTINOV', 'Founder · builder · living in Mexico'],
  ['me', 'My work is to help people meet the work only they can do.', 'START WITH THE FREE DIRECTION CALL'],
];

const COVERS = [
  ['start', 'breach'], ['proof', 'quotes'], ['method', 'cascade'], ['work', 'steps'], ['me', 'octa']
];

const esc = (s='') => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const glyph = (kind) => ({
  breach:'<path d="M110 270h150m60 0h150"/><path d="M260 270l30-50 30 50"/>',
  quotes:'<path d="M160 190h90v100h-110v-60q0-40 20-40zm180 0h90v100H320v-60q0-40 20-40z"/>',
  cascade:'<circle cx="180" cy="170" r="12"/><circle cx="240" cy="220" r="12"/><circle cx="300" cy="270" r="12"/><circle cx="360" cy="320" r="12"/><circle cx="420" cy="370" r="12"/><circle cx="480" cy="420" r="12"/>',
  steps:'<path d="M130 390h110V310h110v-80h110v-80"/>',
  octa:'<path d="M300 120l150 180-150 180-150-180zM300 120v360M150 300h300M300 120L150 300l150 180 150-180z"/>',
}[kind] || '');

function ornament(type) {
  if (type === 'quote' || type === 'proof-title') return '<div class="orb quote-orb">“</div>';
  if (type === 'frame') return '<div class="axis"><i></i><i></i><i></i><i></i><i></i><i></i></div>';
  if (type === 'door' || type === 'doors') return '<div class="portal"><span></span></div>';
  if (type === 'outside') return '<div class="waterfall">UNIQUENESS<br>↓<br>MYTH<br>↓<br>TRIBE<br>↓<br>OFFER<br>↓<br>CHANNEL</div>';
  if (type === 'words') return '<div class="gold-word">NAME IT</div>';
  if (type === 'me-photo') return `<div class="portrait"><img src="${profilePhotoData}" alt=""></div>`;
  return '<div class="orb"><div class="horizon"></div></div>';
}

function brand() { return `<div class="brand"><img src="${logoData}"><span>findyourtoptalent.com</span></div>`; }

function slideHtml(data, ratio, setName, index) {
  const [type, a='', b='', c=''] = data;
  const story = ratio === 'story';
  const body = type === 'quote'
    ? `<div class="quote">${esc(a)}</div><div class="attribution">${esc(b)}</div>`
    : type === 'frame'
      ? `<div class="eyebrow">FRAME ${esc(a)} / 06</div><h1>${esc(b)}</h1><p>${esc(c)}</p>`
      : `<div class="eyebrow">${setName}</div><h1>${esc(a)}</h1>${b ? `<p>${esc(b)}</p>` : ''}${c ? `<div class="action">${esc(c)}</div>` : ''}`;
  return doc(`${story?'story':'feed'} slide-page`, `<main>${ornament(type)}<section>${body}</section>${brand()}<div class="folio">${String(index+1).padStart(2,'0')}</div></main>`, story ? [1080,1920] : [1080,1350]);
}

function coverHtml(name, kind) {
  return doc('cover', `<main><div class="cover-glyph"><svg viewBox="0 0 600 600">${glyph(kind)}</svg></div><div class="cover-name">${name.toUpperCase()}</div></main>`, [1080,1080]);
}

function pinnedHtml(name, subtitle, kind) {
  return doc('feed pinned', `<main><div class="pin-kicker">PINNED / ${name.toUpperCase()}</div><div class="cover-glyph pin"><svg viewBox="0 0 600 600">${glyph(kind)}</svg></div><section><h1>${name}</h1><p>${subtitle}</p></section>${brand()}</main>`, [1080,1350]);
}

function mockupHtml() {
  const circles = COVERS.map(([n,k]) => `<div class="mock-hi"><div><svg viewBox="0 0 600 600">${glyph(k)}</svg></div><b>${n.toUpperCase()}</b></div>`).join('');
  return doc('mockup', `<main><div class="phone"><header><strong>sashakonstantinov</strong><span>•••</span></header><div class="profile"><div class="avatar">SK</div><div><h2>Sasha Konstantinov</h2><p>Next-Chapter Positioning</p></div></div><div class="bio">Your career is capped by how well you know yourself.<br>I raise the ceiling: exact words, direction, offer.<br>MIT MBA · 🇲🇽</div><div class="link">↗ Direction Call</div><div class="highlights">${circles}</div><div class="grid"><div>THE<br>CEILING</div><div>VERBATIM<br>PROOF</div><div>SIX<br>FRAMES</div></div></div></main>`, [1350,1080]);
}

function doc(cls, content, [w,h]) { return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Cormorant;src:url(file://${fonts}/CormorantGaramond-Regular.ttf)}
@font-face{font-family:Cormorant;src:url(file://${fonts}/CormorantGaramond-Bold.ttf);font-weight:700}
@font-face{font-family:Source;src:url(file://${fonts}/SourceSerif4-Regular.ttf)}
*{box-sizing:border-box}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}body{background:#071426;color:#f2ead9;font-family:Source}
main{position:relative;width:100%;height:100%;overflow:hidden;background:radial-gradient(circle at 72% 18%,rgba(45,84,134,.38),transparent 30%),radial-gradient(circle at 24% 74%,rgba(184,137,44,.10),transparent 24%),linear-gradient(145deg,#07111f 0%,#0b1d35 58%,#081526 100%)}
main:before{content:"";position:absolute;inset:0;opacity:.16;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}
section{position:absolute;z-index:2;left:9%;right:9%;top:15%;max-width:880px}.story section{top:18%;left:10%;right:10%}.eyebrow,.pin-kicker{font:700 24px/1 Source;letter-spacing:.24em;color:#cda84e;text-transform:uppercase;margin-bottom:54px}.story .eyebrow{font-size:27px;margin-bottom:70px}h1{font:700 82px/.98 Cormorant;margin:0;letter-spacing:-.025em;text-wrap:balance}.story h1{font-size:104px}p{font:400 38px/1.38 Source;margin:50px 0 0;max-width:820px;color:#d9deea;text-wrap:balance}.story p{font-size:45px;line-height:1.42}.action{display:inline-block;margin-top:62px;border-top:1px solid #cda84e;padding-top:18px;font:700 23px Source;letter-spacing:.2em;color:#e8c76f}.brand{position:absolute;z-index:3;left:9%;right:9%;bottom:7%;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(205,168,78,.45);padding-top:22px}.brand img{width:190px;height:54px;object-fit:contain;object-position:left center;filter:sepia(1) saturate(.8) brightness(1.25)}.brand span{font-size:19px;letter-spacing:.12em;color:#d9c68d}.folio{position:absolute;right:4%;top:4%;font:16px Source;color:#cda84e;letter-spacing:.2em}.orb{position:absolute;right:-12%;bottom:12%;width:700px;height:700px;border:1px solid rgba(205,168,78,.5);border-radius:50%;box-shadow:0 0 90px rgba(46,99,159,.22) inset}.story .orb{right:-25%;bottom:18%;width:980px;height:980px}.horizon{position:absolute;left:-50%;right:0;top:50%;border-top:1px solid rgba(205,168,78,.42)}.quote{font:400 65px/1.12 Cormorant;letter-spacing:-.02em;max-width:900px}.story .quote{font-size:82px}.attribution{margin-top:60px;font:700 20px Source;letter-spacing:.22em;color:#cda84e}.quote-orb{display:flex;align-items:center;justify-content:center;font:400 420px Cormorant;color:rgba(205,168,78,.12);border-color:rgba(205,168,78,.2)}.axis{position:absolute;right:10%;bottom:19%;width:230px;height:480px;border-left:1px solid rgba(205,168,78,.4)}.axis i{display:block;width:13px;height:13px;border:1px solid #cda84e;border-radius:50%;margin:58px 0 0 -7px;background:#0b1d35}.portal{position:absolute;right:8%;bottom:16%;width:330px;height:520px;border:1px solid #cda84e;border-radius:170px 170px 0 0;box-shadow:0 0 80px rgba(60,116,184,.25) inset}.portal span{position:absolute;width:130px;height:260px;left:100px;bottom:0;background:linear-gradient(0deg,#e7c770,#6f94c1 52%,transparent);filter:blur(14px);opacity:.45}.waterfall{position:absolute;right:10%;bottom:18%;font:700 22px/1.65 Source;letter-spacing:.16em;text-align:center;color:rgba(205,168,78,.75)}.gold-word{position:absolute;right:4%;bottom:22%;font:700 150px/.8 Cormorant;color:rgba(205,168,78,.09);transform:rotate(-90deg)}.portrait{position:absolute;right:10%;bottom:15%;width:330px;height:500px}.head{position:absolute;width:115px;height:140px;border:1px solid #cda84e;border-radius:55% 55% 45% 45%;left:108px;top:20px}.body{position:absolute;width:310px;height:330px;border:1px solid #cda84e;border-radius:48% 48% 0 0;left:10px;bottom:0}.cover-glyph{position:absolute;width:54%;height:54%;left:23%;top:20%;border:1px solid rgba(205,168,78,.24);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 110px rgba(56,105,165,.28) inset}.cover-glyph svg{width:64%;height:64%;fill:none;stroke:#d5ae50;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.cover-name{position:absolute;bottom:13%;width:100%;text-align:center;font:700 28px Source;letter-spacing:.35em;color:#d5ae50}.pin-kicker{position:absolute;left:8%;top:8%;z-index:3}.cover-glyph.pin{width:44%;height:35%;left:48%;top:12%}.pinned section{top:48%;left:9%;right:9%}.pinned h1{font-size:120px}.pinned p{font-size:30px;color:#cda84e;letter-spacing:.08em;text-transform:uppercase}.mockup main{padding:45px}.phone{width:100%;height:100%;background:#f7f3ea;color:#071426;border-radius:42px;padding:40px 54px;box-shadow:0 30px 100px #0008}.phone header{display:flex;justify-content:space-between;font:700 22px Source}.profile{display:flex;align-items:center;gap:26px;margin-top:38px}.profile h2{font:700 32px Cormorant;margin:0}.profile p{font-size:18px;margin:4px 0;color:#41506a}.avatar{width:105px;height:105px;border-radius:50%;background:#0b1d35;color:#d5ae50;display:grid;place-items:center;font:700 30px Cormorant;border:2px solid #d5ae50}.bio{font:21px/1.45 Source;margin-top:24px}.link{font:700 18px Source;color:#9b7427;margin-top:16px}.highlights{display:flex;gap:28px;margin-top:34px}.mock-hi{text-align:center;font:12px Source;letter-spacing:.12em}.mock-hi>div{width:110px;height:110px;border-radius:50%;background:#0a1628;border:2px solid #cda84e;padding:22px;margin-bottom:9px}.mock-hi svg{width:100%;height:100%;stroke:#d5ae50;fill:none;stroke-width:6}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:35px}.grid div{height:265px;background:linear-gradient(145deg,#07111f,#18375d);color:#f2ead9;display:grid;place-items:center;text-align:center;font:700 34px/1 Cormorant;border-top:3px solid #cda84e}
.portrait{right:8%;bottom:15%;width:390px;height:390px;border-radius:50%;overflow:hidden;border:1px solid #cda84e;box-shadow:0 0 90px rgba(69,122,185,.34)}.portrait img{width:100%;height:100%;object-fit:cover}
</style></head><body class="${cls}">${content}</body></html>`; }

await fs.mkdir(out, { recursive:true });
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
async function shot(html, file, size) {
  await fs.mkdir(path.dirname(file), {recursive:true});
  await page.setViewportSize(size);
  await page.setContent(html, {waitUntil:'load'});
  await page.screenshot({path:file, type:'png'});
}
for (const [set, slides] of [['start',START],['proof',PROOF],['method',METHOD]]) {
  for (const ratio of ['feed','story']) for (let i=0;i<slides.length;i++) {
    const size = ratio==='feed' ? {width:1080,height:1350} : {width:1080,height:1920};
    await shot(slideHtml(slides[i],ratio,set,i), path.join(out,ratio,`${set}-${String(i+1).padStart(2,'0')}.png`), size);
  }
}
for (const [set, slides] of [['work',WORK],['me',ME]]) for (let i=0;i<slides.length;i++)
  await shot(slideHtml(slides[i],'story',set,i),path.join(out,'story',`${set}-${String(i+1).padStart(2,'0')}.png`),{width:1080,height:1920});
for (const [name,kind] of COVERS) await shot(coverHtml(name,kind),path.join(out,'highlight-covers',`${name}.png`),{width:1080,height:1080});
for (const [name,sub,kind] of [['The Ceiling','The law under every career','breach'],['Proof','Words from real transcripts','quotes'],['The Method','Six frames. Nothing hidden.','cascade']])
  await shot(pinnedHtml(name,sub,kind),path.join(out,'feed',`pinned-${name.toLowerCase().replaceAll(' ','-')}.png`),{width:1080,height:1350});
for (const ratio of ['feed','story']) {
  const size = ratio === 'feed' ? {width:1080,height:1350} : {width:1080,height:1920};
  await shot(slideHtml(['cta','Start with clarity.','45 minutes. Your transition named. Your strongest direction on the table.','LINK IN BIO'],ratio,'START HERE',0),path.join(out,ratio,'cta-universal.png'),size);
}
await shot(mockupHtml(),path.join(out,'mockup','checker-profile.png'),{width:1350,height:1080});
await browser.close();
console.log(`Rendered assets to ${out}`);
