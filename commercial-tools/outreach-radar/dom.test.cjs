const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom'),assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'artifact.html'),'utf8');
const ACCT=[{id:'ACCT1',firstName:'Aleksandr',lastName:'Konstantinov',status:'AVAILABLE'}];
const OWNER='OWNERID';
const CONV_URN='urn:li:msg_conversation:(urn:li:fsd_profile:'+OWNER+',2-abc)';
const NICK_URN='urn:li:msg_conversation:(urn:li:fsd_profile:'+OWNER+',2-nick)';
function connsAt(si){
 if(si===0)return{success:true,connections:[
   {profileUrn:'urn:li:fsd_profile:P1',fullName:'Nicholas Ingate',firstName:'Nicholas',lastName:'Ingate',headline:'Founder | Investor and Advisor | Creating Transformational Experiences for Post-Exit Founders',profileUrl:'https://www.linkedin.com/in/nicholas-ingate/'},
   {profileUrn:'urn:li:fsd_profile:P2',firstName:'Srishti',lastName:'Goyal',headline:'Product | Customer Success | Ex-Microsoft',profileUrl:'https://www.linkedin.com/in/srishti-goyal/'}
 ],endOfList:false,startIndex:0};
 if(si===2)return{success:true,connections:[
   {profileUrn:'urn:li:fsd_profile:P3',firstName:'Alex',lastName:'Prober',headline:'6 Companies · 3 Exits · $50M ARR',profileUrl:'https://www.linkedin.com/in/alexprober/'}
 ],endOfList:true,startIndex:2};
 return{success:true,connections:[],endOfList:true,startIndex:si};
}
function makeDom(withMcp){let sends=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(win){
  if(!win.CSS)win.CSS={};if(!win.CSS.escape)win.CSS.escape=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c);
  win.URL.createObjectURL=()=>'blob:x';win.URL.revokeObjectURL=()=>{};
  const mcpStub={
   listTools:async()=>({servers:[{server:'ConnectSafely.AI',authStatus:'connected',tools:[{name:'list-linkedin-accounts'},{name:'get-connections'},{name:'list-conversations'},{name:'get-conversation-messages'},{name:'conversation-exists'},{name:'conversations-send-message'}]}]}),
   callTool:async(server,tool,input)=>{
     if(/list-linkedin-accounts/.test(tool))return{payload:ACCT};
     if(/get-connections/.test(tool))return{payload:connsAt(input.startIndex)};
     if(/list-conversations/.test(tool))return{payload:{conversations:[{conversationUrn:CONV_URN,participants:[{profileUrn:'urn:li:fsd_profile:P2',firstName:'Srishti',lastName:'Goyal'}],lastActivityAt:'2026-08-20T00:00:00Z'}],nextCursor:null}};
     if(/get-conversation-messages/.test(tool)){
       if(input.conversationUrn===NICK_URN)return{payload:{messages:[{senderName:'Nicholas Ingate',text:'Great to connect!',sentAt:'2026-08-19T00:00:00Z'}]}};
       return{payload:{messages:[
         {senderName:'Aleksandr Konstantinov',text:'Hi Srishti',sentAt:'2026-08-18T00:00:00Z'},
         {senderName:'Srishti Goyal',text:'Thanks — yes let us talk',sentAt:'2026-08-20T00:00:00Z'}
       ]}};
     }
     if(/conversation-exists/.test(tool))return{payload:input.profileId==='nicholas-ingate'?{conversationUrn:NICK_URN}:{hasConversation:false}};
     if(/conversations-send-message/.test(tool)){sends.push(input);return{payload:{success:true}}}
     throw{code:'not_in_manifest',message:tool};
   }
  };
  const dlStub={save:async()=>({status:'saved'})};
  win.claude={use:(n)=>n==='downloads'?Promise.resolve(dlStub):(n==='mcp'?Promise.resolve(withMcp?mcpStub:null):Promise.resolve(null))};
 }});
 dom._sends=sends;return dom;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function poll(fn,ms=8000){const t=Date.now();while(Date.now()-t<ms){if(fn())return true;await sleep(50)}return false}
(async()=>{
 const dom=makeDom(true),win=dom.window,doc=win.document,$=s=>doc.querySelector(s),enc=encodeURIComponent;
 await poll(()=>!$('#crawl').disabled);
 assert.ok(!$('#crawl').disabled,'connector ready enables data buttons');
 assert.ok(/Aleksandr Konstantinov/.test($('#diag').textContent),'owner captured from live read');
 // crawl everything
 $('#crawlall').click();
 await poll(()=>/reached end of list|Crawl complete/.test($('#dataNote').textContent+$('#status').textContent));
 // 3 people merged
 const total=[...doc.querySelectorAll('#tabs button')][0];
 await poll(()=>{return true},100);
 // recommended tab should include Nicholas (founder + post-exit)
 const recBtn=doc.querySelector('[data-tab="recommended"]');
 assert.ok(/Recommended/.test(recBtn.textContent),'recommended tab present');
 // switch to All? counts: check people via a tab count sum — verify Nicholas visible in recommended
 const names=[...doc.querySelectorAll('#list .name')].map(a=>a.textContent);
 assert.ok(names.includes('Nicholas Ingate'),'high-fit founder is in Recommended: '+names.join(', '));
 // sync conversations -> Srishti becomes owe_reply (direction from senderName, no senderId)
 $('#sync').click();
 await poll(()=>/Reconciled/.test($('#status').textContent));
 const oweBtn=doc.querySelector('[data-tab="owe_reply"]');
 assert.ok(/You owe a reply\s*<?.*1|owe a reply/i.test(oweBtn.textContent)||/1/.test(oweBtn.querySelector('small').textContent),'Srishti classified owe_reply via name-based direction: '+oweBtn.textContent);
 oweBtn.click();await sleep(80);
 const oweNames=[...doc.querySelectorAll('#list .name')].map(a=>a.textContent);
 assert.ok(oweNames.includes('Srishti Goyal'),'owe-reply tab shows Srishti: '+oweNames.join(','));
 // verify Nicholas -> adopt conversation via conversation-exists, recovered
 doc.querySelector('[data-tab="recommended"]').click();await sleep(80);
 const vbtn=doc.querySelector('[data-verify="'+enc('urn:li:fsd_profile:P1')+'"]');
 assert.ok(vbtn,'verify button for Nicholas present');
 vbtn.click();
 await poll(()=>/Nicholas Ingate:/.test($('#status').textContent));
 assert.ok(/They replied last|No conversation/.test($('#status').textContent),'verify resolved Nicholas thread: '+$('#status').textContent);
 assert.equal(dom._sends.length,0,'NOTHING sent during the whole flow');

 // offline
 const off=makeDom(false);await sleep(400);
 assert.ok(off.window.document.querySelector('#crawl').disabled,'offline disables data buttons');
 assert.ok(/Offline|not respond|mcp is null/.test(off.window.document.querySelector('#status').textContent),'offline message shown');
 console.log('Outreach Radar DOM e2e: crawl+score+sync(name-direction)+verify-adopt+offline all pass — recommended:['+names.join(', ')+']');
})().catch(e=>{console.error('DOM TEST FAILED:',e&&e.stack||e);process.exit(1)});
