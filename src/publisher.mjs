export async function publishBundle(b,{base=process.env.SITE_URL,token=process.env.SITE_SERVICE_TOKEN}={}){
 if(!base&&!token)return {status:'not_requested'};if(!base||!token)throw Error('Incomplete Site publication configuration');
 const origin=new URL(base);if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash)throw Error('SITE_URL must be an HTTPS origin');
 async function request(path,method='GET',data){const r=await fetch(new URL(path,origin),{method,redirect:'error',headers:{'OAI-Sites-Authorization':'Bearer '+token,'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Site request failed: '+r.status);return r.json();}
 // No secrets in logs. URLs target one configured private Site only.
 for(const j of b.jobs){await request('/api/jobs/'+j.id,'PUT',j);const actual=await request('/api/jobs/'+j.id);for(const key of ['markdown','topic'])if(actual[key]!==j[key])throw Error('Site job verification failed');if(j.publishedDate!==null&&(actual.publishedDate!==j.publishedDate||actual.publishedDatePrecision!==j.publishedDatePrecision))throw Error('Site date verification failed');}
 await request('/api/reports/'+b.report.id,'PUT',b.report);const r=await request('/api/reports/'+b.report.id);if(r.markdown!==b.report.markdown||JSON.stringify(r.companies)!==JSON.stringify(b.report.companies))throw Error('Site report verification failed');
 const reports=await request('/api/reports');if(!reports.some(r=>r.id===b.report.id))throw Error('Report index verification failed');return {status:'verified'};
}
