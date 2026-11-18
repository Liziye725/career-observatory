import {readFile} from 'node:fs/promises';import {openDatabase} from '../src/database.mjs';import {importBundle} from '../src/bundle.mjs';
const file=process.argv[2];if(!file)throw Error('Usage: node scripts/import-bundle.mjs bundle.json');
const db=openDatabase();try{console.log(await importBundle(db,JSON.parse(await readFile(file,'utf8'))));}finally{db.close();}
