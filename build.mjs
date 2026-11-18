import {mkdir,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});
let code=await readFile('worker/index.js','utf8');
code=code.replace("import {topics,validateJob} from './jobs.js';",await readFile('worker/jobs.js','utf8'));
const client=(await readFile('client.js','utf8')).replace('__MARKDOWN__',await readFile('markdown-client.js','utf8'));
code=code.replace('__PAGE__',JSON.stringify((await readFile('index.html','utf8')).replace('__CLIENT__',client))).replace('__WORKFLOW__',JSON.stringify(JSON.parse(await readFile('workflow.json','utf8'))));
await writeFile('dist/server/index.js',code);
