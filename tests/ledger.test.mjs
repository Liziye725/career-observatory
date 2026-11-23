import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import worker from '../dist/server/index.js';
import {openDatabase,bucket} from '../src/database.mjs';
const base='https://ledger.test';
const sample=(patch={})=>({id:'test-event-one',project:'career',kind:'problem',subject:'test-source-gap',status:'open',author:'assistant',title:'合成来源缺口',summary:'仅合成数据',markdown:'## 合成证据\n来源不可访问，条件改变再重试。',relatedRun:null,observedAt:'2026-01-01T00:00:00.000Z',metrics:{attempts:1},...patch});
const put=(env,event,headers={})=>worker.fetch(new Request(base+'/api/ledger/events/'+event.id,{method:'PUT',headers:{'content-type':'application/json',...headers},body:JSON.stringify(event)}),env);
const get=(env,url)=>worker.fetch(new Request(base+url),env);
test('private ledger survives DB reopen; retries are idempotent and conflicting changes cannot erase history',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'ledger-'));let db=openDatabase(path.join(dir,'db.sqlite'));
 try{let env={BUCKET:bucket(db)};assert.equal((await put(env,sample())).status,201);assert.equal((await put(env,sample())).status,200);
 assert.equal((await put(env,sample({markdown:'覆盖旧证据'}))).status,409);
 db.close();db=openDatabase(path.join(dir,'db.sqlite'));env={BUCKET:bucket(db)};
 assert.equal((await (await get(env,'/api/ledger/events/test-event-one')).json()).markdown,sample().markdown);
 assert.equal((await put(env,sample({id:'test-event-two',status:'resolved',markdown:'新方法恢复读取；旧记录保留。'}))).status,201);
 const view=await(await get(env,'/api/ledger?project=career&kind=problem&subject=test-source-gap')).json();assert.equal(view.totalEvents,2);assert.equal(view.items.length,1);assert.equal(view.items[0].status,'resolved');assert.equal(view.items[0].eventCount,2);
 const exported=await(await get(env,'/api/ledger/export.md')).text();assert.match(exported,/来源不可访问/);assert.match(exported,/新方法恢复读取/);
 }finally{db.close();await rm(dir,{recursive:true,force:true});}
});
test('feedback and project filtering; rejects foreign writes and malformed data',async()=>{
 const db=openDatabase(':memory:'),env={BUCKET:bucket(db)};try{
 assert.equal((await put(env,sample(),{origin:'https://foreign.test'})).status,403);
 assert.equal((await put(env,sample({project:'unknown'}))).status,400);
 assert.equal((await put(env,sample({metrics:{token:'secret'}}))).status,400);
 await put(env,sample());await put(env,sample({id:'test-feedback-one',project:'ai',kind:'feedback',author:'user',status:'recorded'}));
 const view=await(await get(env,'/api/ledger?project=ai')).json();assert.equal(view.totalEvents,1);assert.equal(view.items[0].kind,'feedback');
 assert.equal((await get(env,'/api/ledger/events/missing-one')).status,404);
 }finally{db.close();}
});
test('R2 conditional writes protect competing writers',async()=>{
 let current=null,entered=0,release;const barrier=new Promise(r=>release=r);
 const env={BUCKET:{get:async()=>{if(entered<2){entered++;if(entered===2)release();await barrier;return null;}return current?{json:async()=>JSON.parse(current)}:null;},put:async(k,v,options)=>{assert.equal(options.onlyIf.etagDoesNotMatch,'*');if(current)return null;current=v;return {key:k};}}};
 const results=await Promise.all([put(env,sample()),put(env,sample({markdown:'另一个并发版本'}))]);assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
});
test('metadata remains small; records are rendered as escaped text and export is private',async()=>{
 let meta;const env={BUCKET:{get:async()=>null,put:async(k,v,o)=>{meta=o.customMetadata;return {key:k};}}};
 const res=await put(env,sample({title:'测'.repeat(180),summary:'测'.repeat(1200)}));assert.equal(res.status,201);assert.ok(Buffer.byteLength(JSON.stringify(meta))<2048);
 const page=await(await get({},'/ledger')).text();assert.match(page,/escapeText\(e.markdown\)/);assert.match(page,/feedback/);
});
