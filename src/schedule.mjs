export function plannedDate(now,config){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:config.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 const date=`${parts.year}-${parts.month}-${parts.day}`,day=new Date(date+'T12:00:00Z').getUTCDay(),minutes=+parts.hour*60+(+parts.minute),start=config.hour*60+config.minute;
 return date>=config.start&&config.days.includes(day)&&minutes>=start&&minutes<start+config.catchUpHours*60?date:null;
}
export function reserveRun(db,date,retry=false){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date).toISOString().slice(0,10)!==date)throw Error('Invalid planned date');
 const key=date;db.exec('BEGIN IMMEDIATE');try{const old=db.prepare('SELECT status FROM runs WHERE run_key=?').get(key);
 if(old&&!(old.status==='failed'&&retry)){db.exec('ROLLBACK');return null;}
 db.prepare("INSERT INTO runs(run_key,planned_date,status,started_at) VALUES(?,?,'running',?) ON CONFLICT(run_key) DO UPDATE SET status='running',started_at=excluded.started_at,finished_at=NULL,error=NULL").run(key,date,new Date().toISOString());db.exec('COMMIT');return key;
 }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
}
