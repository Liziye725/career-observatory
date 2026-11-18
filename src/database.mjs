// ASSISTANT implementation A-002: SQLite adapter for the existing R2 object contract.
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
export function openDatabase(filename=path.join(process.env.DATA_DIR||'.data','career.sqlite')){
 if(filename!==':memory:')mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});
 const db=new DatabaseSync(filename);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 db.exec(readFileSync(new URL('../database/migrations/001_initial.sql',import.meta.url),'utf8'));return db;
}
const keyOK=k=>/^(jobs\/[a-z0-9][a-z0-9_-]{1,120}|reports\/\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?)\.json$/.test(k);
export function bucket(db){return {
 async get(key){if(!keyOK(key))throw Error('Invalid storage key');const r=db.prepare('SELECT value FROM objects WHERE key=?').get(key);return r?{json:async()=>JSON.parse(r.value)}:null;},
 async put(key,value,options){if(!keyOK(key))throw Error('Invalid storage key');const v=JSON.parse(value),now=new Date().toISOString(),own=!db.isTransaction;
  if(own)db.exec('BEGIN IMMEDIATE');
  try{
   const old=db.prepare('SELECT value FROM objects WHERE key=?').get(key);
   if(old)db.prepare('INSERT INTO object_revisions(object_key,value,saved_at) VALUES(?,?,?)').run(key,old.value,now);
   db.prepare('INSERT INTO objects VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,metadata=excluded.metadata,updated_at=excluded.updated_at').run(key,value,JSON.stringify(options?.customMetadata||{}),now);
   if(key.startsWith('jobs/'))db.prepare('INSERT INTO job_index VALUES(?,?,?,?,?,?,?) ON CONFLICT(job_id) DO UPDATE SET company=excluded.company,title=excluded.title,topic=excluded.topic,published_date=excluded.published_date,updated_at=excluded.updated_at').run(v.id,v.company,v.title,v.topic,v.publishedDate,v.firstSeenAt,v.updatedAt);
   if(own)db.exec('COMMIT');
  }catch(e){if(own)db.exec('ROLLBACK');throw e;}
 },
 async list({prefix='' }={}){const rows=db.prepare('SELECT key,metadata FROM objects WHERE substr(key,1,?)=? ORDER BY key').all(prefix.length,prefix);return {objects:rows.map(r=>({key:r.key,customMetadata:JSON.parse(r.metadata)})),truncated:false};}
};}
