import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectGmail} from '../src/gmail.mjs';
test('collector includes all verified senders',async()=>{
 const original=globalThis.fetch;let query;
 globalThis.fetch=async url=>{query=new URL(url).searchParams.get('q');return {ok:true,json:async()=>({messages:[]})};};
 try {await collectGmail({},7,'synthetic');assert.match(query,/from:jobalerts-noreply@linkedin.com/);assert.match(query,/from:jobs-noreply@linkedin.com/);assert.match(query,/from:mailservice@jobindex.dk/);}finally{globalThis.fetch=original;}
});
test('transient Gmail failures stop after two attempts',async()=>{
 const original=globalThis.fetch;let count=0;
 globalThis.fetch=async()=>{count++;return {ok:false,status:503};};
 try {await assert.rejects(collectGmail({},7,'synthetic'),/503/);assert.equal(count,2);}finally{globalThis.fetch=original;}
});
