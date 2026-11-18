import {topics,validateJob} from './jobs.js';
const page=__PAGE__;
const workflow=__WORKFLOW__;
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
export function validate(v,id){
 if(!v||typeof v!=='object'||v.id!==id||!/^\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?$/.test(id))throw Error('报告 ID 必须是日期或日期加后缀');
 if(typeof v.title!=='string'||!v.title.trim()||v.title.length>160)throw Error('缺少标题');
 if(typeof v.markdown!=='string'||!v.markdown.trim()||v.markdown.length>400000)throw Error('报告内容为空或过长');
 if(!['pilot','partial','complete','failed'].includes(v.status))throw Error('未知报告状态');
 if(!Array.isArray(v.companies)||v.companies.some(c=>typeof c!=='string'||c.length>100))throw Error('公司列表格式错误');
 if(new Set(v.companies.map(c=>c.trim().toLowerCase())).size!==v.companies.length)throw Error('公司名称重复');
 if(v.status==='complete'&&v.companies.length<6)throw Error('正式报告至少需要六家不同公司');
 if(typeof v.summary!=='string'||v.summary.length>1200)throw Error('需要简短摘要');
 return {id,title:v.title,markdown:v.markdown,status:v.status,companies:v.companies,summary:v.summary,period:typeof v.period==='string'?v.period:'',financialCoverage:typeof v.financialCoverage==='string'?v.financialCoverage:'未标注',updatedAt:new Date().toISOString()};
}
export default {async fetch(request,env){
 const u=new URL(request.url),p=u.pathname;
 try{
 if(p==='/api/workflow'&&request.method==='GET')return json(workflow);
 if(p.startsWith('/api/')&&!env.BUCKET)return json({error:'归档存储尚未连接'},503);
 if(p==='/api/topics'&&request.method==='GET')return json(topics);
 if(p==='/api/jobs'&&request.method==='GET'){
 let cursor,all=[];do{const r=await env.BUCKET.list({prefix:'jobs/',include:['customMetadata'],cursor});all.push(...r.objects.map(o=>JSON.parse(o.customMetadata?.index||'null')).filter(Boolean));cursor=r.truncated?r.cursor:undefined;}while(cursor);
 return json(all.sort((a,b)=>(b.publishedDate||'').localeCompare(a.publishedDate||'')||b.updatedAt.localeCompare(a.updatedAt)));
 }
 if(p.startsWith('/api/jobs/')){
 const id=decodeURIComponent(p.slice('/api/jobs/'.length));if(!/^[a-z0-9][a-z0-9_-]{1,120}$/.test(id))return json({error:'岗位 ID 无效'},400);
 const key='jobs/'+id+'.json';
 if(request.method==='GET'){const o=await env.BUCKET.get(key);return o?json(await o.json()):json({error:'岗位不存在'},404);}
 if(request.method==='PUT'){
 const origin=request.headers.get('origin');if(origin&&origin!==u.origin)return json({error:'跨站写入被拒绝'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'仅接受 JSON'},415);
 const raw=await request.text();if(raw.length>250000)return json({error:'内容过大'},413);
 const previous=await env.BUCKET.get(key);const old=previous?await previous.json():null;
 const job=validateJob(JSON.parse(raw),id,old);const {markdown,reportIds,...index}=job;
 await env.BUCKET.put(key,JSON.stringify(job),{httpMetadata:{contentType:'application/json'},customMetadata:{index:JSON.stringify(index)}});
 return json({ok:true,id,url:'/#job='+id});
 }
 return json({error:'不支持此方法'},405);
 }
 if(p==='/api/reports'&&request.method==='GET'){
 let cursor,all=[];do{const r=await env.BUCKET.list({prefix:'reports/',include:['customMetadata'],cursor});all.push(...r.objects.map(o=>JSON.parse(o.customMetadata?.index||'null')).filter(Boolean));cursor=r.truncated?r.cursor:undefined;}while(cursor);
 return json(all.sort((a,b)=>b.id.localeCompare(a.id)));
 }
 if(p.startsWith('/api/reports/')){
 const id=decodeURIComponent(p.slice('/api/reports/'.length));if(!/^\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?$/.test(id))return json({error:'无效 ID'},400);
 if(request.method==='GET'){const o=await env.BUCKET.get('reports/'+id+'.json');return o?json(await o.json()):json({error:'报告不存在'},404);}
 if(request.method==='PUT'){
 // This shared archive is owner-private. Sites dispatch authenticates both visitors and service callers.
 const origin=request.headers.get('origin');if(origin&&origin!==u.origin)return json({error:'跨站写入被拒绝'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'仅接受 JSON'},415);
 const raw=await request.text();if(raw.length>500000)return json({error:'内容过大'},413);
 const report=validate(JSON.parse(raw),id);const {markdown,...index}=report;
 await env.BUCKET.put('reports/'+id+'.json',JSON.stringify(report),{httpMetadata:{contentType:'application/json'},customMetadata:{index:JSON.stringify(index)}});
 return json({ok:true,id,url:'/#report='+id});
 }
 return json({error:'不支持此方法'},405);
 }
 if(p.startsWith('/api/'))return json({error:'接口不存在'},404);
 return new Response(page,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'"}});
 }catch(e){return json({error: e.message||'请求失败'},400);}
}};
