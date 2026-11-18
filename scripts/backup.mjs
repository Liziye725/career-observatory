import {mkdir} from 'node:fs/promises';import path from 'node:path';import {openDatabase} from '../src/database.mjs';
await mkdir('backups',{recursive:true,mode:0o700});const db=openDatabase();const target=path.resolve('backups',`career-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
try{db.prepare('VACUUM INTO ?').run(target);console.log(target);}finally{db.close();}
