export const TASKS = ['添加猫粮', '更换饮水', '清理猫砂', '陪伴与观察', '检查门窗'];
export function tasksFor(client) { if(Array.isArray(client?.tasks)&&client.tasks.length)return client.tasks;return client?.species === 'dog' || (!client?.species && client?.id === 'c4') ? ['添加狗粮','更换饮水','清洁地垫','外出与陪伴','检查门窗'] : TASKS; }
export const TODAY = '2026-09-09';
export const STATUS = { pending: '待开始', active: '进行中', completed: '已完成', cancelled: '已取消' };
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export function dateLabel(date) { const d = new Date(date + 'T12:00:00'); return `${d.getMonth()+1}月${d.getDate()}日 ${['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]}`; }
export function addDays(date, n) { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function weekOf(date) { const day = new Date(date + 'T12:00:00').getDay(); const start = addDays(date, -(day || 7) + 1); return Array.from({length:7}, (_,i) => addDays(start,i)); }
export function createSeed() {
  const clients = [
    {id:'c1',name:'小橘与汤圆',breed:'橘猫与布偶',age:'2岁 / 1岁',owner:'周女士',area:'春江花园',photo:'pair.jpg',count:2,note:'汤圆吃饭慢，请分开放置食盆。',food:'每只猫一平勺猫粮，分别放在两个食盆。',water:'清洗并补满客厅两个水碗。',clean:'清理两个猫砂盆，垃圾带至楼下。',care:'陪伴至少10分钟，离开前确认两只猫的位置。',contact:'',confirmed:true,version:1},
    {id:'c2',name:'团团',breed:'英短',age:'3岁',owner:'陈女士',area:'阳光里',photo:'tuantuan.jpg',count:1,note:'离开前检查阳台窗。',food:'柜内猫粮，每次一平勺。请勿额外喂零食。',water:'换一碗新鲜饮水，水碗在餐桌旁。',clean:'清理阳台猫砂盆，补足猫砂。',care:'团团有些慢热，先让它闻一闻你。离开前检查阳台窗。',contact:'',confirmed:true,version:1},
    {id:'c3',name:'豆包',breed:'橘猫',age:'1岁',owner:'王女士',area:'和园小区',photo:'doubao.jpg',count:1,note:'进门时注意，豆包喜欢跟着人出门。',food:'按照量杯刻度添加猫粮。',water:'清洗水碗后补充新鲜水。',clean:'清理客厅猫砂盆。',care:'逗猫棒在书架上，使用后收好。',contact:'',confirmed:false,version:1},
    {id:'c4',name:'小白',species:'dog',breed:'马尔济斯',age:'2岁',owner:'林先生',area:'花间公寓',photo:'xiaobai.jpg',count:1,note:'出门请先扣好牵引绳。',food:'使用主人准备好的当日食物。',water:'饮水机补水。',clean:'清洁地垫。',care:'外出后擦干净脚掌。',contact:'',confirmed:true,version:1}
  ];
  const visits = clients.map((c,i)=>({id:'v'+(i+1),clientId:c.id,date:TODAY,time:['09:00','11:00','15:00','17:00'][i],end:['10:00','12:00','16:00','18:00'][i],status:i===0?'completed':i===1?'active':'pending',startedAt:i===1?'11:06':i===0?'09:03':'',checks:TASKS.map((_,j)=>i===0||i===1&&j<2),notes:i===1?'今天精神不错，已正常进食。':i===0?'两只猫都已正常进食，食盆和水碗已清洁。':'',exception:'',photos:i<2?['/assets/food.jpg','/assets/'+c.photo]:[],handover:JSON.parse(JSON.stringify(c)),savedAt:'11:28'}));
  visits.push({...JSON.parse(JSON.stringify(visits[2])),id:'v5',date:addDays(TODAY,1)});
  return {schemaVersion:1,clients,visits,reports:[{id:'r1',visitId:'v1',clientId:'c1',name:'小橘与汤圆',date:TODAY,time:'09:00',end:'09:42',createdAt:'09:42',checks:[true,true,true,true,true],notes:visits[0].notes,exception:'',photos:visits[0].photos,viewed:true,acknowledged:true,reply:'收到啦，谢谢照顾它们！',handover:visits[0].handover}],settings:{name:'林小满',studio:'小满的照顾工作室',signature:'平凡的陪伴，也是重要的事。',compact:false}};
}
export function newVisit(client, data) {
  return {id:uid(),clientId:client.id,date:data.date,time:data.time,end:data.end,status:'pending',checks:tasksFor(client).map(()=>false),notes:'',exception:'',photos:[],startedAt:'',handover:JSON.parse(JSON.stringify(client)),savedAt:''};
}
export function validateService(data) {
  if (!data.date || !data.time || !data.end) return '请填写服务日期和时间。';
  const validDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d+'T12:00:00')) && addDays(d,0) === d;
  if(!validDate(data.date) || (data.through && !validDate(data.through))) return '请选择有效的服务日期。';
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.end)) return '请选择有效的服务时间。';
  if (data.end <= data.time) return '结束时间需要晚于开始时间。';
  if (data.through && data.through < data.date) return '结束日期不能早于开始日期。';
  if(data.through && (new Date(data.through)-new Date(data.date))/86400000>30) return '一次最多安排31天服务。';
  return '';
}
export function publishReport(state, visitId, now='') {
  const visit = state.visits.find(v=>v.id===visitId);
  if(!visit || visit.status==='cancelled') throw new Error('这次服务无法发布报告。');
  if(visit.status==='pending') throw new Error('请先开始到访。');
  if(state.reports.some(r=>r.visitId===visitId)) return state;
  if(visit.checks.some(v=>!v)&&!visit.exception.trim()) throw new Error('请说明未完成任务的原因，再发布报告。');
  const client=state.clients.find(c=>c.id===visit.clientId);
  const report={id:uid(),visitId,clientId:client.id,name:visit.handover?.name||client.name,date:visit.date,time:visit.startedAt||visit.time,end:visit.finishedAt||now,createdAt:now,checks:[...visit.checks],notes:visit.notes,exception:visit.exception,photos:[...visit.photos],handover:JSON.parse(JSON.stringify(visit.handover)),signature:state.settings.signature,revision:1,viewed:false,acknowledged:false,reply:''};
  return {...state,visits:state.visits.map(v=>v.id===visitId?{...v,status:'completed'}:v),reports:[report,...state.reports]};
}
export function reportText(r) { return `${r.name}的照顾记录\n${dateLabel(r.date)} ${r.time}—${r.end}\n\n${tasksFor(r.handover).map((t,i)=>`${r.checks[i]?'已完成':'未完成'} · ${t}`).join('\n')}\n\n观察记录：${r.notes||'无补充记录'}${r.exception?'\n异常 / 未完成说明：'+r.exception:''}\n\n${r.signature??'来自Pawly'}`; }

export function visitEditDraft(state, id) {
  const v=state.visits.find(x=>x.id===id);
  if(!v) throw Error('找不到这次服务。');
  const r=state.reports.find(x=>x.visitId===id);
  return JSON.parse(JSON.stringify({...v,handover:v.handover||state.clients.find(c=>c.id===v.clientId),startedAt:r?.time||v.startedAt||'',finishedAt:r?.end||v.finishedAt||'',signature:r?.signature??state.settings.signature??''}));
}

export function saveVisitEdit(state, id, draft, syncClient=false, now='') {
  const old=state.visits.find(v=>v.id===id);
  if(!old||old.status==='cancelled') throw Error('找不到这次服务。');
  const invalid=validateService({date:draft.date,time:draft.time,end:draft.end});
  if(invalid)throw Error(invalid);
  if(state.visits.some(v=>v.id!==id&&v.status!=='cancelled'&&v.date===draft.date&&v.time<draft.end&&v.end>draft.time))throw Error('这个时间段已有服务，请调整时间。');
  const pet={...draft.handover,id:old.clientId,name:(draft.handover?.name||'').trim(),owner:(draft.handover?.owner||'').trim(),isExample:false};
  if(!pet.name||!pet.owner)throw Error('请填写宠物名字和主人称呼。');
  if(!Number.isInteger(Number(pet.count))||Number(pet.count)<1||Number(pet.count)>20)throw Error('宠物数量请填写1至20的整数。');
  pet.count=Number(pet.count);
  const tasks=tasksFor(pet).map(t=>String(t).trim());
  if(!tasks.length||tasks.length>20||tasks.some(t=>!t||t.length>80))throw Error('请填写1至20项任务，每项不超过80字。');
  if(!Array.isArray(draft.checks)||draft.checks.length!==tasks.length)throw Error('任务完成情况与清单不一致，请重新检查。');
  if(pet.tasks)pet.tasks=tasks;
  if(!Array.isArray(draft.photos)||draft.photos.length>6)throw Error('每次到访最多添加6张照片。');
  const validTime=t=>!t||/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  if(!validTime(draft.startedAt)||!validTime(draft.finishedAt))throw Error('请填写有效的实际开始和结束时间。');
  if(draft.finishedAt&&(!draft.startedAt||draft.finishedAt<=draft.startedAt))throw Error('实际结束时间需要晚于实际开始时间。');
  if(old.status==='completed'&&(!draft.startedAt||!draft.finishedAt))throw Error('已完成的服务需要填写实际开始和结束时间。');
  if(old.status==='completed'&&draft.checks.some(x=>!x)&&!(draft.exception||'').trim())throw Error('请说明未完成任务的原因，再保存修订。');
  pet.confirmed=JSON.stringify(pet)!==JSON.stringify(old.handover)?false:pet.confirmed;
  const v={...old,date:draft.date,time:draft.time,end:draft.end,startedAt:draft.startedAt||'',finishedAt:draft.finishedAt||'',handover:pet,checks:draft.checks.map(Boolean),notes:draft.notes||'',exception:draft.exception||'',photos:[...draft.photos],savedAt:now};
  const oldClient=state.clients.find(c=>c.id===old.clientId);
  const updatedClient=syncClient?{...oldClient,...pet,version:(oldClient.version||1)+1,confirmed:false}:oldClient;
  const visits=state.visits.map(x=>x.id===id?v:syncClient&&x.clientId===old.clientId&&x.status==='pending'?{...x,handover:JSON.parse(JSON.stringify(updatedClient)),checks:tasksFor(updatedClient).map(()=>false)}:x);
  const reports=state.reports.map(r=>{
    if(r.visitId!==id)return r;
    const {revisions,...previous}=r;
    return {...r,name:pet.name,date:v.date,time:v.startedAt||v.time,end:v.finishedAt||v.end,checks:[...v.checks],notes:v.notes,exception:v.exception,photos:[...v.photos],handover:JSON.parse(JSON.stringify(pet)),signature:draft.signature??r.signature,revision:(r.revision||1)+1,revisions:[...(revisions||[]),JSON.parse(JSON.stringify(previous))],revisedAt:now,viewed:false,acknowledged:false,reply:''};
  });
  return {...state,clients:syncClient?state.clients.map(c=>c.id===old.clientId?updatedClient:c):state.clients,visits,reports};
}
