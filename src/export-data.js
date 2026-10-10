import {taskNames} from './international.js';

export const exportFileName=(value,fallback='petcare')=>String(value||fallback).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').trim().slice(0,100)||fallback;
export const excelDate=value=>value?new Date(value+'T00:00:00.000Z'):null;
export const excelTime=value=>/^\d{2}:\d{2}$/.test(value||'')?(Number(value.slice(0,2))*60+Number(value.slice(3)))/1440:null;

export function exportData(state,{from='',to='',clientId='',lang='zh'}={}) {
  if(from&&to&&from>to)throw Error('dateRange');
  const L=(en,zh)=>lang==='en'?en:zh;
  const inside=x=>(!from||x.date>=from)&&(!to||x.date<=to)&&(!clientId||x.clientId===clientId);
  const visits=state.visits.filter(inside).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const reports=state.reports.filter(inside).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const relevant=new Set([...visits,...reports].map(v=>v.clientId));
  const clients=state.clients.filter(c=>clientId?c.id===clientId:from||to?relevant.has(c.id):true);
  const pet=v=>v.handover||state.clients.find(c=>c.id===v.clientId)||{};
  const status=s=>({pending:L('Upcoming','待开始'),active:L('In progress','进行中'),completed:L('Completed','已完成'),cancelled:L('Cancelled','已取消')}[s]||s);
  return {
    visits,reports,clients,
    sheets:[
      {name:L('Visits','服务安排'),headers:[L('Visit ID','服务编号'),L('Date','服务日期'),L('Pet','宠物'),L('Owner','主人'),L('Scheduled start','预约开始'),L('Scheduled end','预约结束'),L('Actual start','实际开始'),L('Actual end','实际结束'),L('Status','状态'),L('Address','地址 / 小区'),L('Completed tasks','已完成任务'),L('Total tasks','任务总数'),L('Notes','观察备注'),L('Exception','异常说明')],widths:[22,16,24,18,16,16,16,16,16,32,16,16,48,48],dateColumns:[2],timeColumns:[5,6,7,8],rows:visits.map(v=>[v.id,excelDate(v.date),pet(v).name,pet(v).owner,excelTime(v.time),excelTime(v.end),excelTime(v.startedAt),excelTime(v.finishedAt||reports.find(r=>r.visitId===v.id)?.end),status(v.status),pet(v).area,v.checks.filter(Boolean).length,v.checks.length,v.notes,v.exception])},
      {name:L('Clients','客户资料'),headers:[L('Pet','宠物'),L('Owner','主人'),L('Contact','联系方式'),L('Address','地址 / 小区'),L('Breed','品种 / 描述'),L('Age','年龄'),L('Pet count','宠物数量'),L('Reminder','重点提醒'),L('Food','喂养说明'),L('Water','饮水要求'),L('Cleaning','清洁要求'),L('Care','陪伴与居家注意')],widths:[24,18,24,34,24,16,14,48,48,38,38,48],rows:clients.map(c=>[c.name,c.owner,String(c.contact||''),c.area,c.breed,c.age,Number(c.count)||1,c.note,c.food,c.water,c.clean,c.care])},
      {name:L('Task details','任务明细'),headers:[L('Visit ID','服务编号'),L('Date','服务日期'),L('Pet','宠物'),L('Task','任务名称'),L('Completed','完成情况')],widths:[22,16,24,50,18],dateColumns:[2],rows:visits.flatMap(v=>taskNames(pet(v),lang).map((name,i)=>[v.id,excelDate(v.date),pet(v).name,name,v.checks[i]?L('Done','已完成'):L('Not completed','未完成')]))},
      {name:L('Care reports','服务报告'),headers:[L('Report ID','报告编号'),L('Visit ID','服务编号'),L('Date','服务日期'),L('Pet','宠物'),L('Actual start','实际开始'),L('Actual end','实际结束'),L('Revision','版本'),L('Photo count','照片数量'),L('Observations','观察记录'),L('Exception','异常说明'),L('Sign-off','报告签名')],widths:[22,22,16,24,16,16,12,14,50,48,40],dateColumns:[3],timeColumns:[5,6],rows:reports.map(r=>[r.id,r.visitId,excelDate(r.date),r.name,excelTime(r.time),excelTime(r.end),r.revision||1,r.photos.length,r.notes,r.exception,r.signature||''])}
    ]
  };
}
