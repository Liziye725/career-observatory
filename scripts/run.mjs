// A-004: orchestrates collection -> configured researcher -> validation -> DB -> publication.
import {readFile,mkdir,writeFile} from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
import {openDatabase} from '../src/database.mjs';import {collectGmail} from '../src/gmail.mjs';import {reserveRun} from '../src/schedule.mjs';import {importBundle,validateBundle} from '../src/bundle.mjs';import {publishBundle} from '../src/publisher.mjs';
const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
if(!args.includes('--date'))throw Error('Provide --date YYYY-MM-DD (planned Copenhagen date)');
const date=value('--date'),db=openDatabase(),key=reserveRun(db,date,args.includes('--retry'));
if(!key){console.log('This planned date is already running or succeeded.');db.close();process.exit(0);}
try{
 let bundle;
 if(args.includes('--bundle'))bundle=JSON.parse(await readFile(value('--bundle'),'utf8'));
 else{
  if(!process.env.RESEARCH_EXECUTABLE)throw Error('RESEARCH_EXECUTABLE not configured; no autonomous researcher is bundled');
  const root=path.resolve(process.env.DATA_DIR||'.data','runs',date);await mkdir(root,{recursive:true,mode:0o700});
  const instructions=await readFile(new URL('../instructions/RESEARCH.zh-CN.md',import.meta.url),'utf8');
  for(const days of [7,30,90,180,365]){
   const collected=await collectGmail(db,days);const input=path.join(root,`input-${days}.json`),output=path.join(root,`output-${days}.json`);
   const historicalJobs=db.prepare("SELECT value FROM objects WHERE key LIKE 'jobs/%'").all().map(r=>JSON.parse(r.value));
   await writeFile(input,JSON.stringify({version:1,plannedDate:date,instructions,collected,historicalJobs,outputContract:'docs/architecture/RESEARCHER-CONTRACT.md'}),{mode:0o600});
   // Fixed executable, argument array, no shell expansion. Researcher owns web/model integrations.
   await new Promise((resolve,reject)=>{const child=spawn(process.env.RESEARCH_EXECUTABLE,[input,output],{stdio:'inherit',shell:false});const timer=setTimeout(()=>child.kill('SIGTERM'),3600000);timer.unref();child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('exit',code=>{clearTimeout(timer);code===0?resolve():reject(Error('Research executable failed'));});});
   bundle=validateBundle(JSON.parse(await readFile(output,'utf8')));
   if(bundle.report.id!==date)throw Error('Research output planned date mismatch');
   if(bundle.report.companies.length>=6)break;
   if(days===365){bundle.report.status='partial';bundle.report.summary+=' 自动适配器已检查365天；更早历史与官网补充仍需研究执行器继续核查。';}
  }
 }
 if(bundle.report.id!==date)throw Error('Bundle planned date mismatch');validateBundle(bundle);
 const imported=await importBundle(db,bundle,key);const published=await publishBundle(bundle);
 db.prepare("UPDATE runs SET status='succeeded',finished_at=?,publication_status=? WHERE run_key=?").run(new Date().toISOString(),published.status,key);
 console.log(JSON.stringify({plannedDate:date,execution:'succeeded',researchQuality:bundle.report.status,publication:published.status,...imported}));
}catch(e){db.prepare("UPDATE runs SET status='failed',finished_at=?,error=? WHERE run_key=?").run(new Date().toISOString(),e.message.slice(0,500),key);console.error('Run failed:',e.message);process.exitCode=1;}finally{db.close();}
