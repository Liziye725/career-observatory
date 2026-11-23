// USER U-020: persistent shared improvement ledger. ASSISTANT A-012: append-only R2 events.
const ledgerProjects={career:'招聘与职业成长',ai:'AI 观察站',ceo:'CEO 公司研究',power:'权力账本',drives:'电机驱动课程',system:'运行系统'};
const ledgerKinds=['run','problem','improvement','feedback','batch'];
const ledgerStatuses=['open','blocked','in_progress','resolved','proposed','testing','validated','rejected','recorded','applied','partial','complete','failed'];
const ledgerJson=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
function ledgerId(v){return typeof v==='string'&&/^[a-z0-9][a-z0-9-]{1,119}$/.test(v);}
export function validateLedgerEvent(v,id){
 if(!v||typeof v!=='object'||Array.isArray(v)||v.id!==id||!ledgerId(id)||!ledgerId(v.subject))throw Error('记录编号无效');
 if(!Object.hasOwn(ledgerProjects,v.project)||!ledgerKinds.includes(v.kind)||!ledgerStatuses.includes(v.status)||!['user','assistant'].includes(v.author))throw Error('记录分类无效');
 for(const [k,max] of [['title',180],['summary',1200],['markdown',60000]])if(typeof v[k]!=='string'||!v[k].trim()||v[k].length>max)throw Error('记录内容无效：'+k);
 if(v.relatedRun!==null&&!ledgerId(v.relatedRun))throw Error('运行关联无效');
 if(typeof v.observedAt!=='string'||!Number.isFinite(Date.parse(v.observedAt))||new Date(v.observedAt).toISOString()!==v.observedAt)throw Error('观察时间无效');
 const metrics={};const allowed=['completedCompanies','targetCompanies','reusedSources','attempts','durationSeconds'];
 if(!v.metrics||typeof v.metrics!=='object'||Array.isArray(v.metrics)||Object.keys(v.metrics).some(k=>!allowed.includes(k)))throw Error('度量字段无效');
 for(const k of allowed)if(Object.hasOwn(v.metrics,k)){const n=v.metrics[k];if(n!==null&&(!Number.isSafeInteger(n)||n<0||n>10000000))throw Error('度量数值无效');metrics[k]=n;}
 return {id,project:v.project,kind:v.kind,subject:v.subject,status:v.status,author:v.author,title:v.title,summary:v.summary,markdown:v.markdown,relatedRun:v.relatedRun,observedAt:v.observedAt,metrics};
}
async function ledgerAll(bucket){
 let cursor;const events=[];
 do{const batch=await bucket.list({prefix:'ledger/events/',include:['customMetadata'],cursor});
 for(const o of batch.objects){const index=JSON.parse(o.customMetadata?.index||'null');if(index)events.push(index);}
 cursor=batch.truncated?batch.cursor:undefined;
 }while(cursor);
 return events.sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
}
function ledgerLatest(events){
 const grouped=new Map();
 for(const e of events){const key=[e.project,e.kind,e.subject].join('/');const prev=grouped.get(key);grouped.set(key,{...e,eventCount:(prev?.eventCount||0)+1});}
 return [...grouped.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));
}
async function ledgerRoute(request,env){
 const u=new URL(request.url),p=u.pathname;
 if(!p.startsWith('/api/ledger'))return null;
 if(!env.BUCKET)return ledgerJson({error:'账本存储尚未连接'},503);
 if(p==='/api/ledger'&&request.method==='GET'){
 let events=await ledgerAll(env.BUCKET);for(const k of ['project','kind','subject'])if(u.searchParams.has(k))events=events.filter(e=>e[k]===u.searchParams.get(k));
 let items=ledgerLatest(events);if(u.searchParams.has('status'))items=items.filter(e=>e.status===u.searchParams.get('status'));
 return ledgerJson({projects:ledgerProjects,items,events:u.searchParams.has('subject')?events:undefined,totalEvents:events.length,storage:'r2-append-only-json-v1'});
 }
 if(p==='/api/ledger/export.md'&&request.method==='GET'){
 let events=await ledgerAll(env.BUCKET);if(u.searchParams.has('project'))events=events.filter(e=>e.project===u.searchParams.get('project'));
 const lines=['# 运行与改进账本','',`导出时间：${new Date().toISOString()}`,'','本导出包含私人内容，请勿提交公开仓库。',''];
 for(const e of events){const o=await env.BUCKET.get('ledger/events/'+e.id+'.json');if(!o)continue;const v=await o.json();lines.push(`## ${v.title}`,'',`${ledgerProjects[v.project]} · ${v.kind} · ${v.status} · ${v.observedAt}`,'',v.markdown,'');}
 return new Response(lines.join('\n'),{headers:{'content-type':'text/markdown; charset=utf-8','cache-control':'no-store','content-disposition':'attachment; filename="improvement-ledger.md"'}});
 }
 const m=p.match(/^\/api\/ledger\/events\/([a-z0-9-]+)$/);if(!m||!ledgerId(m[1]))return ledgerJson({error:'账本接口不存在'},404);
 const id=m[1],key='ledger/events/'+id+'.json';
 if(request.method==='GET'){const o=await env.BUCKET.get(key);return o?ledgerJson(await o.json()):ledgerJson({error:'记录不存在'},404);}
 if(request.method!=='PUT')return ledgerJson({error:'只支持读取与追加'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==u.origin)return ledgerJson({error:'跨站写入被拒绝'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return ledgerJson({error:'仅接受JSON'},415);
 const raw=await request.text();if(raw.length>80000)return ledgerJson({error:'记录过长'},413);
 const event=validateLedgerEvent(JSON.parse(raw),id);
 const compare=async old=>{
 const value=await old.json();const {createdAt,...canonical}=value;
 return JSON.stringify(canonical)===JSON.stringify(event)?ledgerJson({ok:true,id,idempotent:true}):ledgerJson({error:'此记录已存在且内容不同；请追加新记录保留历史'},409);
 };
 const old=await env.BUCKET.get(key);if(old)return compare(old);
 const data={...event,createdAt:new Date().toISOString()};
 const index={id,project:data.project,kind:data.kind,subject:data.subject,status:data.status,title:data.title.slice(0,100),summary:data.summary.slice(0,140),createdAt:data.createdAt};
 const written=await env.BUCKET.put(key,JSON.stringify(data),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{index:JSON.stringify(index)}});
 if(!written){const winner=await env.BUCKET.get(key);return winner?compare(winner):ledgerJson({error:'并发写入冲突，请重试同一记录'},409);}
 return ledgerJson({ok:true,id,idempotent:false},201);
}
