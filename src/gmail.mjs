// A-003: independent read-only Gmail OAuth adapter. Live credentials not shipped.
export async function accessToken(){
 const fields={client_id:process.env.GMAIL_CLIENT_ID,client_secret:process.env.GMAIL_CLIENT_SECRET,refresh_token:process.env.GMAIL_REFRESH_TOKEN,grant_type:'refresh_token'};
 if(Object.values(fields).some(v=>!v))throw Error('Gmail OAuth configuration missing');
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams(fields),signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('Gmail OAuth refresh failed: '+r.status);return (await r.json()).access_token;
}
async function api(token,url){for(let i=0;i<2;i++){
 const r=await fetch(url,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});
 if(r.ok)return r.json();if(![429,500,502,503,504].includes(r.status)||i===1)throw Error('Gmail read failed: '+r.status);
 await new Promise(resolve=>setTimeout(resolve,1000*2**i));
}}
export function decodeParts(part){
 const plain=[],html=[];
 function visit(p){if(p.body?.data){const t=Buffer.from(p.body.data,'base64url').toString('utf8');if(p.mimeType==='text/plain')plain.push(t);else if(p.mimeType==='text/html')html.push(t);}for(const child of p.parts||[])visit(child);}
 visit(part);return plain.length?plain:html;
}
export async function collectGmail(db,days=7,token){token||=await accessToken();const query=`newer_than:${days}d {from:jobs-noreply@linkedin.com from:jobalerts-noreply@linkedin.com from:mailservice@jobindex.dk} -in:spam -in:trash`;let pageToken,ids=[];
 do{const u=new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');u.searchParams.set('q',query);u.searchParams.set('maxResults','100');if(pageToken)u.searchParams.set('pageToken',pageToken);const v=await api(token,u);ids.push(...(v.messages||[]).map(m=>m.id));pageToken=v.nextPageToken;}while(pageToken);
 const messages=[];for(const id of new Set(ids)){const m=await api(token,'https://gmail.googleapis.com/gmail/v1/users/me/messages/'+encodeURIComponent(id)+'?format=full');const hs=m.payload?.headers||[],header=n=>hs.find(h=>h.name.toLowerCase()===n)?.value||'';const receivedAt=new Date(Number(m.internalDate)).toISOString();const body=decodeParts(m.payload||{}).join('\n');
  db.prepare('INSERT INTO mail_messages VALUES(?,?,?,?,?,?) ON CONFLICT(message_id) DO UPDATE SET body=excluded.body,fetched_at=excluded.fetched_at').run(id,receivedAt,header('from'),header('subject'),body,new Date().toISOString());messages.push({messageId:id,receivedAt,sender:header('from'),subject:header('subject'),body});}
 return {query,days,messages};
}
