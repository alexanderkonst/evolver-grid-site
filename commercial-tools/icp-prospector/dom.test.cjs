const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom'),assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'artifact.html'),'utf8');
const seed=require('./icp-prospector-live-seed.json');
const ACCOUNTS=[{id:'6a8a0799761c128b5ff19417',firstName:'Aleksandr',lastName:'Konstantinov',status:'AVAILABLE'}];
const SEARCH={success:true,people:[
 {profileUrn:"urn:li:fsd_profile:AAA",firstName:"Kent",lastName:"Daniel",headline:"Founder, Vanguard Tech | Strategic Partnerships",location:"SF Bay Area",connectionDegree:"2nd",profileUrl:"x",isOpenToWork:false,currentPosition:"Founder"},
 {profileUrn:"urn:li:fsd_profile:BBB",firstName:"Ava",lastName:"Stone",headline:"Former founder · on sabbatical · exploring what's next",location:"London, UK",connectionDegree:"2nd",profileUrl:"y",isOpenToWork:false},
 {profileUrn:"urn:li:fsd_profile:CCC",firstName:"Rex",lastName:"Hunt",headline:"Recruiter · talent acquisition",location:"Remote",connectionDegree:"3rd+",profileUrl:"z",isOpenToWork:true}
],hasMore:true};
const DISCOVERED='ConnectSafely AI';
function makeDom(mcpMode){
 let connectCalls=[],serverSeen=new Set(),saved=[];
 const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(win){
  if(!win.CSS)win.CSS={};if(!win.CSS.escape)win.CSS.escape=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c);
  win.URL.createObjectURL=()=>'blob:x';win.URL.revokeObjectURL=()=>{};
  const mcpStub={
    listTools:async()=>({servers:[{server:DISCOVERED,authStatus:'connected',tools:[{name:'list-linkedin-accounts'},{name:'search-people'},{name:'send-connection-request'}]}]}),
    callTool:async(server,tool,input)=>{serverSeen.add(server);if(/list-linkedin-accounts/.test(tool))return{payload:ACCOUNTS};if(/search-people/.test(tool))return{payload:SEARCH};if(/send-connection-request/.test(tool)){connectCalls.push(input);return{payload:{success:true}}}throw{code:'not_in_manifest',message:'x'}}
  };
  const dlStub={save:async(r)=>{saved.push(r);return{status:'saved'}}};
  win.claude={use:(n)=>{
    if(n==='downloads')return Promise.resolve(dlStub);
    if(n!=='mcp')return Promise.resolve(null);
    if(mcpMode==='ok')return Promise.resolve(mcpStub);
    if(mcpMode==='null')return Promise.resolve(null);
    if(mcpMode==='reject')return Promise.reject({code:'not_granted',message:'MCP not granted'});
    if(mcpMode==='hang')return new Promise(()=>{});
  }};
 }});
 dom._connectCalls=connectCalls;dom._serverSeen=serverSeen;dom._saved=saved;return dom;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function poll(fn,ms=6000){const t=Date.now();while(Date.now()-t<ms){if(fn())return true;await sleep(40)}return false}
(async()=>{
 // ===== OK path: live connector works =====
 const dom=makeDom('ok'),win=dom.window,doc=win.document,$=s=>doc.querySelector(s);
 await poll(()=>!$('#run').disabled);
 const diag=$('#diag').textContent;
 assert.ok(/list-linkedin-accounts OK via "ConnectSafely AI"/.test(diag),"discovers name + live read OK");
 doc.querySelectorAll('[data-icp]').forEach((c,i)=>c.checked=(i===0));
 const ta=doc.querySelector('[data-terms="post_exit_founders"]');ta.value="former founder sabbatical";ta.dispatchEvent(new win.Event('change',{bubbles:true}));
 $('#run').click();
 await poll(()=>$('#peopleCount').textContent==='3'&&!$('#run').disabled);
 assert.equal($('#peopleCount').textContent,'3',"3 people from live search");
 assert.ok(dom._serverSeen.has('ConnectSafely AI'),"used discovered server");
 const fr=doc.querySelector('#results tr'),u=fr.getAttribute('data-urn');
 fr.querySelector('[data-connect]').click();
 await poll(()=>/Send request\?/.test(doc.querySelector('tr[data-urn="'+win.CSS.escape(u)+'"] [data-cell=action]').textContent));
 doc.querySelector('tr[data-urn="'+win.CSS.escape(u)+'"] [data-cell=action] [data-yes]').click();
 await poll(()=>/Requested/.test(doc.querySelector('tr[data-urn="'+win.CSS.escape(u)+'"]').textContent));
 assert.equal(dom._connectCalls.length,1,"connector-OK mode sends in-page");

 // ===== imported-ledger mode (connector unavailable) =====
 const di=makeDom('null'),iw=di.window,idoc=iw.document,i$=s=>idoc.querySelector(s);
 await poll(()=>i$('#run').disabled&&/mcp is null/.test(i$('#bridgeStatus').textContent));
 assert.ok(i$('#run').disabled,"Run disabled without connector");
 // Restore the real seed
 const inp=i$('#restore');Object.defineProperty(inp,'files',{value:[{name:'seed.json',text:async()=>JSON.stringify(seed)}],configurable:true});
 inp.dispatchEvent(new iw.Event('change',{bubbles:true}));
 await poll(()=>+i$('#peopleCount').textContent>=5,4000);
 assert.ok(+i$('#peopleCount').textContent>=5,"Restore populated ledger in imported mode ("+i$('#peopleCount').textContent+")");
 // queue a connect — must NOT send in-page
 const irow=idoc.querySelector('#results tr'),iu=irow.getAttribute('data-urn');
 irow.querySelector('[data-connect]').click();
 await poll(()=>/Send request\?/.test(idoc.querySelector('tr[data-urn="'+iw.CSS.escape(iu)+'"] [data-cell=action]').textContent));
 idoc.querySelector('tr[data-urn="'+iw.CSS.escape(iu)+'"] [data-cell=action] [data-yes]').click();
 await sleep(150);
 assert.ok(/Queued ▸ export/.test(idoc.querySelector('tr[data-urn="'+iw.CSS.escape(iu)+'"] [data-cell=action]').textContent),"imported: Queued ▸ export");
 assert.equal(di._connectCalls.length,0,"imported mode sends NOTHING from the page");
 // export the connect queue
 i$('#exportqueue').click();
 await poll(()=>di._saved.some(s=>/connect-queue\.json/.test(s.filename)),2000);
 const q=di._saved.find(s=>/connect-queue\.json/.test(s.filename));
 assert.ok(q,"connect queue exported via downloads");
 assert.equal(JSON.parse(q.data).requests.length,1,"queue carries the 1 request");

 // ===== reject grant =====
 const dr=makeDom('reject');await sleep(300);
 assert.ok(/REJECTED/.test(dr.window.document.querySelector('#diag').textContent)&&dr.window.document.querySelector('#run').disabled,"reject → disabled + shown");

 // ===== 9s timeout on use() =====
 const dh=makeDom('hang');
 assert.ok(await poll(()=>/did not respond within 9/.test(dh.window.document.querySelector('#bridgeStatus').textContent),13000),"use() hits 9s timeout");

 console.log("Tool 1 e2e: OK-send + imported-ledger(Restore/queue/export) + reject + 9s-timeout all pass");
})().catch(e=>{console.error("DOM TEST FAILED:",e&&e.stack||e);process.exit(1)});
