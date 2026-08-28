const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom'),assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'artifact.html'),'utf8');
const ACCT=[{id:'ACCT1',firstName:'Aleksandr',lastName:'Konstantinov',status:'AVAILABLE'}];
const LABELS={labels:[{id:'INBOX'},{id:'SENT'}]};
const GMAIL={threads:[
 {id:'t1',subject:'Intro',messages:[{sender:'personalytics@gmail.com',toRecipients:['Ada Lovelace <ada@example.com>','no-reply@x.com'],date:'2026-08-22T00:00:00Z',id:'m1'}]},
 {id:'t2',subject:'Hello',messages:[{sender:'personalytics@gmail.com',toRecipients:['Solo Emailer <solo@example.com>'],date:'2026-08-23T00:00:00Z',id:'m2'}]}
],nextPageToken:null};
const LEDGER={records:[
 {profileUrn:'urn:li:fsd_profile:P1',name:'Ada Lovelace',headline:'Founder, Bright Field',icpId:'post_exit_founders',score:80,conversation:{lastActivityAt:'2026-08-20T00:00:00Z',direction:'theirs',messages:[{dir:'theirs',text:'Thanks for the note!'}]},conversationUrn:'urn:li:msg_conversation:(urn:li:fsd_profile:OWNER,2-a)'},
 {profileUrn:'urn:li:fsd_profile:P2',name:'Booked Person',headline:'Investor',state:{category:'investor'},conversation:{lastActivityAt:'2026-08-24T00:00:00Z',direction:'theirs',messages:[{dir:'theirs',text:'Booked via cal.com, looking forward to our call'}]},conversationUrn:'urn:li:msg_conversation:(urn:li:fsd_profile:OWNER,2-b)'}
]};
function makeDom(withMcp){let drafts=[],sends=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(win){
  if(!win.CSS)win.CSS={};if(!win.CSS.escape)win.CSS.escape=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c);
  win.URL.createObjectURL=()=>'blob:x';win.URL.revokeObjectURL=()=>{};
  const mcpStub={
   listTools:async()=>({servers:[
     {server:'ConnectSafely.AI',authStatus:'connected',tools:[{name:'list-linkedin-accounts'},{name:'list-conversations'},{name:'get-conversation-messages'},{name:'conversations-send-message'}]},
     {server:'Gmail',authStatus:'connected',tools:[{name:'search_threads'},{name:'create_draft'},{name:'list_labels'}]}
   ]}),
   callTool:async(server,tool,input)=>{
     if(tool==='list-linkedin-accounts')return{payload:ACCT};
     if(tool==='list-conversations')return{payload:{conversations:[],nextCursor:null}};
     if(tool==='list_labels')return{payload:LABELS};
     if(tool==='search_threads')return{payload:input.pageToken?{threads:[],nextPageToken:null}:GMAIL};
     if(tool==='create_draft'){drafts.push(input);return{payload:{id:'draft1',threadId:'t2'}}}
     if(tool==='conversations-send-message'){sends.push(input);return{payload:{success:true}}}
     throw{code:'not_in_manifest',message:tool};
   }
  };
  win.claude={use:(n)=>n==='downloads'?Promise.resolve({save:async()=>({status:'saved'})}):(n==='mcp'?Promise.resolve(withMcp?mcpStub:null):Promise.resolve(null))};
 }});
 dom._drafts=drafts;dom._sends=sends;return dom;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function poll(fn,ms=8000){const t=Date.now();while(Date.now()-t<ms){if(fn())return true;await sleep(50)}return false}
(async()=>{
 const dom=makeDom(true),win=dom.window,doc=win.document,$=s=>doc.querySelector(s),enc=encodeURIComponent;
 await poll(()=>!$('#liSync').disabled&&!$('#emailSync').disabled);
 assert.ok(/Aleksandr Konstantinov/.test($('#diag').textContent),"LinkedIn live read in diag");
 assert.ok(/Gmail reachable/.test($('#diag').textContent),"Gmail live read in diag");
 assert.ok(/LinkedIn ready/.test($('#status').textContent)&&/Gmail ready/.test($('#status').textContent),"status shows both ready");
 assert.equal($('#ownerEmail').value,'personalytics@gmail.com','owner email defaulted');
 // import Tool 2 ledger
 const inp=$('#import');Object.defineProperty(inp,'files',{value:[{name:'l.json',text:async()=>JSON.stringify(LEDGER)}],configurable:true});
 inp.dispatchEvent(new win.Event('change',{bubbles:true}));
 await poll(()=>/imported/.test($('#status').textContent));
 // Booked Person auto-snoozed
 const snoozedTab=doc.querySelector('[data-tab="snoozed"]');
 assert.ok(/1|2/.test(snoozedTab.querySelector('small').textContent),'a booked meeting auto-snoozed: '+snoozedTab.textContent);
 // gmail sync -> Ada merges (email+linkedin), Solo added, no-reply excluded, owner excluded
 $('#emailSync').click();
 await poll(()=>/Merged .* Gmail/.test($('#status').textContent));
 doc.querySelector('[data-tab="active"]').click();await sleep(80);
 const names=[...doc.querySelectorAll('#list .name')].map(a=>a.textContent);
 assert.ok(names.includes('Ada Lovelace'),'Ada present: '+names.join(','));
 assert.ok(names.includes('Solo Emailer'),'Solo (external email) present');
 assert.ok(!names.some(n=>/no-?reply/i.test(n)),'junk no-reply excluded');
 // Ada shows BOTH channels (cross-channel merge to one card)
 const adaRow=[...doc.querySelectorAll('#list .contact')].find(r=>/Ada Lovelace/.test(r.textContent));
 const adaChannels=[...adaRow.querySelectorAll('.channel')].map(x=>x.textContent);
 assert.ok(adaChannels.includes('linkedin')&&adaChannels.includes('email'),'Ada merged across channels: '+adaChannels.join(','));
 // email draft (not send) for Solo
 const solo=[...doc.querySelectorAll('#list .contact')].find(r=>/Solo Emailer/.test(r.textContent));
 solo.querySelector('[data-draft]').click();await sleep(60);
 const draftBtn=solo.querySelector('[data-send]');assert.ok(/Create Gmail draft/.test(draftBtn.textContent),'email contact offers Gmail DRAFT (not send): '+draftBtn.textContent);
 draftBtn.click();await sleep(40);
 // inline confirm Yes
 const yes=solo.querySelector('.status .primary');assert.ok(yes,'inline confirm shown');yes.click();
 await poll(()=>dom._drafts.length>=1);
 assert.equal(dom._drafts.length,1,'exactly one Gmail draft created');
 assert.equal(dom._drafts[0].to[0],'solo@example.com','draft addressed to external');
 assert.equal(dom._sends.length,0,'NOTHING sent (email = draft only, no LinkedIn send)');
 // pipeline kanban renders
 doc.querySelector('[data-tab="pipeline"]').click();await sleep(60);
 assert.ok(!doc.querySelector('#kanban').classList.contains('hidden'),'pipeline kanban visible');
 assert.ok(doc.querySelectorAll('#kanban .kcol').length===6,'6 category columns');

 // offline
 const off=makeDom(false);await sleep(400);
 assert.ok(off.window.document.querySelector('#liSync').disabled,'offline disables LinkedIn sync');
 assert.ok(off.window.document.querySelector('#emailSync').disabled,'offline disables Gmail sync');
 console.log('Relationship Hub DOM e2e: dual-diagnose + import + booking-autosnooze + gmail-exclusions + cross-channel-merge + email-draft-not-send + kanban + offline all pass — active:['+names.join(', ')+']');
})().catch(e=>{console.error('DOM TEST FAILED:',e&&e.stack||e);process.exit(1)});
