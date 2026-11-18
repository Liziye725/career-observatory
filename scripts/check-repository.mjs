import {readdir,readFile} from 'node:fs/promises';import path from 'node:path';
const excluded=new Set(['.git','node_modules','dist','.data','.local-data','backups','research-output']);let count=0;
async function walk(root){for(const e of await readdir(root,{withFileTypes:true})){if(excluded.has(e.name))continue;const p=path.join(root,e.name);if(e.isDirectory()){await walk(p);continue;}count++;if(/\.(sqlite|db|pdf)$/.test(e.name)||e.name==='.env')throw Error('Private data file in source: '+p);
 const s=await readFile(p,'utf8');if(/(?:gh[pousr]_[a-zA-Z0-9]{30,}|sk-proj-[a-zA-Z0-9_-]{20,}|BEGIN[ ]PRIVATE[ ]KEY)/.test(s))throw Error('Potential credential: '+p);
 if(p.endsWith('.md'))for(const m of s.matchAll(/\]\(([^)]+)\)/g)){const link=m[1].split('#')[0];if(!link||/^(https?:|skill:|mailto:)/.test(link)||link.includes('{'))continue;try{await readFile(path.resolve(path.dirname(p),link));}catch{throw Error('Broken local Markdown link: '+p+' -> '+link);}}
 }}await walk('.');console.log('Source files checked:',count);
