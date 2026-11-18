import test from 'node:test';import assert from 'node:assert/strict';import worker,{validateJob} from './dist/server/index.js';
const job={id:'demo-123',title:'AI Engineer',company:'Example',summary:'Example',markdown:'# Analysis',topic:'ai-engineering',tags:['Python'],sourceUrl:'https://example.org/job/123',jobStatus:'unknown',analysisStatus:'partial',publishedDate:null,publishedDatePrecision:'unknown',reportId:'2026-11-12'};
test('publication date needs valid date and evidence',()=>{
 assert.equal(validateJob(job,job.id).publishedDate,null);
 assert.throws(()=>validateJob({...job,publishedDate:'2026-02-30',publishedDatePrecision:'exact'},job.id));
 assert.throws(()=>validateJob({...job,publishedDate:'2026-11-01',publishedDatePrecision:'exact'},job.id));
 assert.throws(()=>validateJob({...job,topic:'invalid'},job.id));
 const dated={...job,publishedDate:'2026-11-01',publishedDatePrecision:'exact',publishedDateSourceUrl:job.sourceUrl,publishedDateEvidence:'Posted 1 November 2026'};
 assert.equal(validateJob(dated,job.id).publishedDate,'2026-11-01');
});
test('same job merges run history and moves topic without duplicating',async()=>{
 const map=new Map();const env={BUCKET:{put:async(k,v,o)=>map.set(k,{v,o}),get:async k=>map.has(k)?{json:async()=>JSON.parse(map.get(k).v)}:null,list:async({prefix})=>({objects:[...map.entries()].filter(([k])=>k.startsWith(prefix)).map(([key,v])=>({key,customMetadata:v.o.customMetadata})),truncated:false})}};
 const url='https://test.local/api/jobs/'+job.id;
 const put=async d=>{const r=await worker.fetch(new Request(url,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(d)}),env);assert.equal(r.status,200,await r.text());};
 await put(job);const first=await(await worker.fetch(new Request(url),env)).json();
 await put({...job,topic:'ml-platform',reportId:'2026-11-16'});
 const saved=await(await worker.fetch(new Request(url),env)).json();assert.equal(saved.firstSeenAt,first.firstSeenAt);assert.equal(saved.topic,'ml-platform');assert.deepEqual(saved.reportIds,['2026-11-12','2026-11-16']);assert.equal(map.size,1);
 const list=await(await worker.fetch(new Request('https://test.local/api/jobs'),env)).json();assert.equal(list.length,1);assert.equal(list[0].publishedDate,null);
});
