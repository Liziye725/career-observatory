export const topics={
 'ai-engineering':'AI / GenAI 工程',
 'data-science':'数据科学 / 商业分析',
 'ml-platform':'ML 平台 / MLOps',
 'data-engineering':'数据工程',
 'industrial-ai':'工业 AI / 计算机视觉',
 'leadership':'技术领导 / 产品与战略',
 'other':'其他 / 待分类'
};
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const url=v=>{try{return ['https:','http:'].includes(new URL(v).protocol);}catch{return false;}};
export function validateJob(v,id,old=null){
 // Preserve evidenced publication dates when a later scrape has no date (U-012).
 if(old?.publishedDate&&v.publishedDate===null&&v.publishedDatePrecision==='unknown'){
  v={...v};for(const k of ['publishedDate','publishedDatePrecision','publishedDateSourceUrl','publishedDateEvidence','publishedDateObservedAt'])v[k]=old[k];
 }

 if(!/^[a-z0-9][a-z0-9_-]{1,120}$/.test(id)||v.id!==id)throw Error('岗位 ID 无效');
 for(const k of ['title','company','summary','markdown'])if(typeof v[k]!=='string'||!v[k].trim())throw Error('缺少 '+k);
 if(v.title.length>200||v.company.length>100||v.summary.length>1200||v.markdown.length>200000)throw Error('岗位内容过长');
 if(!Object.hasOwn(topics,v.topic))throw Error('主题无效');
 if(!['open','closed','unknown','conflicting'].includes(v.jobStatus))throw Error('招聘状态无效');
 if(!['partial','complete','pilot'].includes(v.analysisStatus))throw Error('分析状态无效');
 if(!url(v.sourceUrl))throw Error('需要岗位来源链接');
 if(v.publishedDate!==null&&!date(v.publishedDate))throw Error('发布日期需要 YYYY-MM-DD 或 null');
 if(!['exact','estimated','unknown'].includes(v.publishedDatePrecision))throw Error('日期精度无效');
 if((v.publishedDate===null)!==(v.publishedDatePrecision==='unknown'))throw Error('未知发布日期必须使用 null 和 unknown');
 if(v.publishedDate!==null&&(!url(v.publishedDateSourceUrl)||typeof v.publishedDateEvidence!=='string'||!v.publishedDateEvidence.trim()))throw Error('发布日期需要来源与证据');
 if(v.publishedDatePrecision==='estimated'&&!date(v.publishedDateObservedAt))throw Error('相对日期换算需要观察日期');
 if(v.reportId&&!/^\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?$/.test(v.reportId))throw Error('报告 ID 无效');
 const tags=Array.isArray(v.tags)?v.tags:[];if(tags.length>15||tags.some(t=>typeof t!=='string'||t.length>60))throw Error('标签格式无效');
 const now=new Date().toISOString();
 return {id,title:v.title,company:v.company,summary:v.summary,markdown:v.markdown,topic:v.topic,tags,sourceUrl:v.sourceUrl,jobStatus:v.jobStatus,analysisStatus:v.analysisStatus,publishedDate:v.publishedDate,publishedDatePrecision:v.publishedDatePrecision,publishedDateSourceUrl:v.publishedDateSourceUrl||null,publishedDateEvidence:v.publishedDateEvidence||'',publishedDateObservedAt:v.publishedDateObservedAt||null,firstSeenAt:old?.firstSeenAt||now,updatedAt:now,reportIds:[...new Set([...(old?.reportIds||[]),...(v.reportId?[v.reportId]:[])])].slice(-100)};
}
