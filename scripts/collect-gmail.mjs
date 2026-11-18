import {openDatabase} from '../src/database.mjs';import {collectGmail} from '../src/gmail.mjs';
const days=Number(process.argv[2]||7);if(!Number.isInteger(days)||days<1)throw Error('days must be a positive integer');const db=openDatabase();
try{const c=await collectGmail(db,days);console.log(JSON.stringify({days,messages:c.messages.length,persisted:true}));}finally{db.close();}
