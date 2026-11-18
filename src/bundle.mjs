import worker,{validate} from '../dist/server/index.js';
import {validateJob} from '../worker/jobs.js';
import {bucket} from './database.mjs';
export function validateBundle(b){
 if(!b||b.version!==1||!Array.isArray(b.jobs)||!b.jobs.length)throw Error('Expected bundle version 1 with jobs');
 validate(b.report,b.report?.id);const ids=new Set();
 for(const j of b.jobs){validateJob(j,j.id);if(ids.has(j.id))throw Error('Duplicate job');ids.add(j.id);if(j.reportId!==b.report.id)throw Error('Job/report mismatch');}
 const companies=new Set(b.jobs.map(j=>j.company));if(companies.size!==b.report.companies.length||b.report.companies.some(c=>!companies.has(c)))throw Error('Company coverage mismatch');
 // U-014: identity stays in fields/link destinations, not reader-facing prose.
 for(const j of b.jobs){for(const text of [b.report.markdown,b.report.title,b.report.summary,...b.jobs.flatMap(x=>[x.title,x.summary,x.markdown,x.publishedDateEvidence])]){
  const visible=String(text||'').replace(/\]\([^)]*\)/g,'](link)').replace(/https?:\/\/\S+/g,'');
  if(visible.includes(j.id))throw Error('Internal job ID appears in visible report text');
 }}
 for(const s of b.sources||[]){const u=new URL(s.url);if(!['http:','https:'].includes(u.protocol)||!s.id||!s.kind||!s.retrievedAt)throw Error('Invalid evidence source');}
 for(const f of b.financialFacts||[]){if(!Number.isFinite(f.value)||!f.locator||!f.definition||!(b.sources||[]).some(s=>s.id===f.sourceId))throw Error('Invalid financial evidence');}
 return b;
}
export async function importBundle(db,input,runKey){const b=validateBundle(input),BUCKET=bucket(db);db.exec('BEGIN IMMEDIATE');try{
 for(const j of b.jobs){const r=await worker.fetch(new Request('http://localhost/api/jobs/'+j.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(j)}),{BUCKET});if(!r.ok)throw Error((await r.json()).error);}
 const r=await worker.fetch(new Request('http://localhost/api/reports/'+b.report.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(b.report)}),{BUCKET});if(!r.ok)throw Error((await r.json()).error);
 for(const s of b.sources||[])db.prepare('INSERT INTO sources VALUES(?,?,?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET url=excluded.url,kind=excluded.kind,retrieved_at=excluded.retrieved_at,content_hash=excluded.content_hash,locator=excluded.locator').run(s.id,s.url,s.kind,s.retrievedAt,s.contentHash||null,s.locator||null);
 for(const f of b.financialFacts||[])db.prepare('INSERT INTO financial_facts VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(fact_id) DO UPDATE SET value=excluded.value,source_id=excluded.source_id,locator=excluded.locator,definition=excluded.definition').run(f.id,f.company,f.entityScope,f.period,f.currency,f.unit,f.metric,f.value,f.sourceId,f.locator,f.definition);
 if(runKey)for(const j of b.jobs)db.prepare('INSERT OR IGNORE INTO run_jobs VALUES(?,?)').run(runKey,j.id);
 db.exec('COMMIT');return {jobs:b.jobs.length,companies:b.report.companies.length,status:b.report.status};
 }catch(e){db.exec('ROLLBACK');throw e;}}
