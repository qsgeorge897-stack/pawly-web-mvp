import {createSeed, uid, TODAY, addDays} from './domain.js';
export const RELEASE_DATE='2026-09-14';
export const STORAGE_KEY='petcare-studio-v1';
export const petImage=p=>!p?'/assets/tuantuan.jpg':/^(data:|blob:|https?:|\/)/.test(p)?p:'/assets/'+p;
export const taskNames=(c,lang='zh')=>Array.isArray(c?.tasks)&&c.tasks.length?c.tasks:c?.species==='dog'||(!c?.species&&c?.id==='c4') ? (lang==='en'?['Serve food','Refresh water','Clean the feeding area','Walk & companionship','Check doors & windows']:['添加狗粮','更换饮水','清洁地垫','外出与陪伴','检查门窗']) : (lang==='en'?['Serve food','Refresh water','Clean the litter tray','Play & observe','Check doors & windows']:['添加猫粮','更换饮水','清理猫砂','陪伴与观察','检查门窗']);
const EN=[
 {name:'Milo & Luna',breed:'Two-cat household',age:'2 & 1 years',owner:'Sarah',area:'Tiong Bahru',note:'Serve meals separately. Luna eats slowly.',food:'Confirm each cat’s portion and food with the owner. Place bowls separately.',water:'Wash and refill both water bowls.',clean:'Scoop both litter trays and bag the waste.',care:'Check both cats are safely indoors before leaving.'},
 {name:'Oliver',breed:'British Shorthair',age:'3 years',owner:'Emma',area:'River Valley',note:'Check the balcony window before leaving.',food:'Confirm the usual food and portion with the owner. No extra treats.',water:'Wash the bowl and refill with fresh water.',clean:'Scoop the litter tray and top up as instructed.',care:'Let Oliver approach at his own pace. Check the balcony window.'},
 {name:'Maple',breed:'Domestic Shorthair',age:'1 year',owner:'Alex',area:'Katong',note:'Watch the front door — Maple is curious.',food:'Follow the owner’s confirmed feeding instructions.',water:'Clean and refill the water bowl.',clean:'Scoop the living-room litter tray.',care:'Use the wand toy, then put it safely away.'},
 {name:'Coco',breed:'Maltese',age:'2 years',owner:'James',area:'Holland Village',note:'Secure the lead before opening the door.',food:'Use the meal prepared by the owner.',water:'Refill the drinking bowl.',clean:'Clean the feeding area.',care:'Confirm the walk route and duration. Wipe paws afterwards.'}
];
export function templates(lang='zh'){
 const seed=createSeed();return seed.clients.map((c,i)=>({...c,...(lang==='en'?EN[i]:{}),id:'template-'+(i+1),sourceId:c.id,isTemplate:true,confirmed:false,title:lang==='en'?['Two-cat home','Calm indoor cat','Curious young cat','Small-dog visit'][i]:['多猫家庭','安静的室内猫','活泼幼猫','小型犬到访'][i],species:i===3?'dog':'cat'}));
}
export function migrateState(state){
 if(!state||state.schemaVersion!==1||!Array.isArray(state.clients)||!Array.isArray(state.visits)||!Array.isArray(state.reports))throw Error('Invalid backup');
 const defaults=createSeed();return {...state,templateVersion:1,clients:state.clients.map(c=>({...c,species:c.species||(c.id==='c4'?'dog':'cat'),isExample:c.isExample??defaults.clients.some(x=>x.id===c.id&&x.name===c.name)})),settings:{...defaults.settings,...state.settings}};
}
export function localizedSeed(lang='zh'){
 const s=createSeed();s.clients=s.clients.map((c,i)=>({...c,...(lang==='en'?EN[i]:{}),isExample:true,species:i===3?'dog':'cat'}));
 s.visits=s.visits.map(v=>({...v,date:addDays(RELEASE_DATE,v.date===TODAY?0:1),handover:structuredClone(s.clients.find(c=>c.id===v.clientId)),notes:lang==='en'?(v.id==='v1'?'Both cats ate well. Bowls and litter trays are clean.':v.id==='v2'?'Bright and relaxed today. Oliver ate his usual meal.':''):v.notes}));
 s.reports=s.reports.map(r=>({...r,date:RELEASE_DATE,name:s.clients.find(c=>c.id===r.clientId).name,handover:structuredClone(s.clients.find(c=>c.id===r.clientId)),notes:s.visits.find(v=>v.id===r.visitId).notes,reply:lang==='en'?'Thank you — they look so happy!':r.reply}));
 if(lang==='en')s.settings={...s.settings,name:'Sophie',studio:'Little Moments Pet Care',signature:'Small moments. Thoughtful care.'};return migrateState(s);
}
export function localizeDemoContent(state,lang='zh'){
 const zh=localizedSeed('zh'),en=localizedSeed('en'),target=lang==='en'?en:zh;
 const translateFields=(value,a,b,t)=>{
  if(!value||!a||!b||!t)return value;
  const result={...value};
  for(const key of Object.keys(t))if(typeof t[key]==='string'&&(value[key]===a[key]||value[key]===b[key]))result[key]=t[key];
  return result;
 };
 const profile=p=>{
  const index=zh.clients.findIndex(c=>c.id===p?.id);
  if(index<0||p.isExample===false)return p;
  if(p.isExample!==true&&![zh.clients[index].name,en.clients[index].name].includes(p.name))return p;
  return translateFields(p,zh.clients[index],en.clients[index],target.clients[index]);
 };
 const record=(r,kind)=>{
  const index=zh[kind].findIndex(x=>x.id===r.id),handover=profile(r.handover);
  if(index<0||handover===r.handover)return r;
  const translated=translateFields(r,zh[kind][index],en[kind][index],target[kind][index]);
  return {...translated,handover,...(r.revisions?{revisions:r.revisions.map(old=>record(old,kind))}:{})};
 };
 const settings=translateFields(state.settings,zh.settings,en.settings,target.settings);
 if(['宠托小本','宠物小本','petcare notes','Petcare Notes','PETCARE NOTES'].includes(settings.brandName))settings.brandName='Pawly';
 const settingDefaults={workTitle:['把每一次照顾，放在心上','Every visit, thoughtfully done.'],tagline:['愿每一只小动物都有被好好照顾的日子。','Small moments. Thoughtful care.']};
 for(const [key,values] of Object.entries(settingDefaults))if(values.includes(settings[key])||(key==='workTitle'&&settings[key]==='把每一次照顾，放在心上。'))settings[key]=values[lang==='en'?1:0];
 return {...state,clients:state.clients.map(profile),visits:state.visits.map(r=>record(r,'visits')),reports:state.reports.map(r=>record(r,'reports')),settings};
}
export function makeClient(template,values){
 const {id,title,sourceId,isTemplate,owner,area,contact,...care}=template||{};
 const {isTemplate:omitTemplate,title:omitTitle,sourceId:omitSource,...profile}=values;
 return {...care,...profile,id:uid(),owner:values.owner?.trim()||'',name:values.name?.trim()||'',area:values.area?.trim()||'',contact:values.contact||'',isExample:false,confirmed:false,version:1,count:Number(values.count)||1,templateId:id||null};
}
export function saveClient(state,updated){
 const old=state.clients.find(c=>c.id===updated.id);if(!old)return {...state,clients:[...state.clients,updated]};
 const careChanged=['name','species','photo','note','food','water','clean','care'].some(k=>old[k]!==updated[k]);
 const c={...old,...updated,confirmed:careChanged?false:updated.confirmed??old.confirmed,version:careChanged?(old.version||1)+1:old.version};
 return {...state,clients:state.clients.map(x=>x.id===c.id?c:x),visits:state.visits.map(v=>v.clientId===c.id&&v.status==='pending'?{...v,handover:structuredClone(c)}:v)};
}
export function dateText(date,lang='zh') {return new Intl.DateTimeFormat(lang==='en'?'en-GB':'zh-CN',{month:'short',day:'numeric',weekday:'short'}).format(new Date(date+'T12:00:00'));}
export function plainReport(r,lang='zh'){
 const head=lang==='en'?`${r.name} — care report`:`${r.name}的照顾记录`;
 return `${head}\n${dateText(r.date,lang)} ${r.time}–${r.end}\n\n${taskNames(r.handover,lang).map((t,i)=>`${r.checks[i]?(lang==='en'?'Done':'已完成'):(lang==='en'?'Not completed':'未完成')} · ${t}`).join('\n')}\n\n${r.notes||''}${r.exception?'\n\n'+(lang==='en'?'Exception: ':'异常说明：')+r.exception:''}\n\n${r.signature??'Pawly'}`;
}
export async function compressPhoto(file,max=1200){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('format');if(file.size>10*1024*1024)throw Error('size');
 return new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(file);image.onload=()=>{const scale=Math.min(1,max/image.width,max/image.height),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve(canvas.toDataURL('image/jpeg',.78))};image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('image'))};image.src=url;});
}
export const pricing={USD:{symbol:'US$',solo:12,studio:29},SGD:{symbol:'S$',solo:16,studio:39},EUR:{symbol:'€',solo:12,studio:29},MYR:{symbol:'RM',solo:39,studio:99}};
