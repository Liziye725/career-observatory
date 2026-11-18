import {readFile} from 'node:fs/promises';import {spawn} from 'node:child_process';import {plannedDate} from '../src/schedule.mjs';
const config=JSON.parse(await readFile(new URL('../config/schedule.json',import.meta.url),'utf8'));let active=false;
async function tick(){const date=plannedDate(new Date(),config);if(!date||active)return;active=true;const child=spawn(process.execPath,['scripts/run.mjs','--date',date],{stdio:'inherit'});child.on('error',()=>{active=false;});child.on('exit',()=>{active=false;});}
await tick();setInterval(tick,60000);console.log('Scheduler started; persistent host required.');
