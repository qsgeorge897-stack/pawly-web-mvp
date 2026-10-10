import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeed,publishReport} from '../src/domain.js';
import {templates,makeClient,saveClient,localizedSeed,migrateState,localizeDemoContent,taskNames,plainReport} from '../src/international.js';
test('reusable templates create independent clients without inherited identity',()=>{
 const t=templates('en')[0],original=structuredClone(t);
 const a=makeClient(t,{...t,name:'  Poppy  ',owner:'  Demo Owner  ',area:'',contact:'',count:'2'});
 const b=makeClient(t,{name:'Willow',owner:'Another Demo Owner',count:1});
 assert.equal(a.name,'Poppy');assert.equal(a.owner,'Demo Owner');assert.equal(a.count,2);
 assert.notEqual(a.id,b.id);assert.equal(a.isExample,false);assert.equal(a.isTemplate,undefined);
 assert.equal(b.area,'');assert.equal(b.contact,'');assert.equal(b.food,t.food);
 assert.deepEqual(t,original);assert.equal(templates('en')[0].name,'Milo & Luna');
});
test('migration preserves old custom data and history',()=>{
 const state=createSeed();state.clients[0].name='A real client';const oldVisits=structuredClone(state.visits),oldReports=structuredClone(state.reports);
 const result=migrateState(state);assert.equal(result.clients[0].isExample,false);assert.equal(result.clients[1].isExample,true);
 assert.deepEqual(result.visits,oldVisits);assert.deepEqual(result.reports,oldReports);
});
test('care edits update future visits but preserve active and published snapshots',()=>{
 const state=localizedSeed('en'),c=state.clients[1];
 state.visits.push({...structuredClone(state.visits[1]),id:'future',status:'pending'});
 const updated=saveClient(state,{...c,name:'Updated name',photo:'new.jpg',food:'New instruction',isExample:false});
 assert.equal(updated.visits.find(v=>v.id==='future').handover.name,'Updated name');
 assert.equal(updated.visits.find(v=>v.id==='v2').handover.name,'Oliver');
 assert.deepEqual(updated.reports,state.reports);assert.equal(updated.clients[1].confirmed,false);
 updated.visits.find(v=>v.id==='v2').checks=[true,true,true,true,true];
 const published=publishReport(updated,'v2','12:00');assert.equal(published.reports[0].name,'Oliver');
 assert.equal(published.reports[0].handover.name,'Oliver');
});
test('species overrides old demo identity and English exports use the report snapshot',()=>{
 assert.equal(taskNames({id:'c4',species:'cat'},'en')[2],'Clean the litter tray');
 assert.equal(taskNames({species:'dog'},'en')[2],'Clean the feeding area');
 const r=localizedSeed('en').reports[0];const text=plainReport(r,'en');
 assert.match(text,/Milo & Luna — care report/);assert.match(text,/Done · Serve food/);assert.doesNotMatch(text,/已完成|照顾记录/);
});
test('switching language translates existing example profiles, visit snapshots and small print',()=>{
 const zh=localizedSeed('zh'),original=structuredClone(zh),en=localizeDemoContent(zh,'en');
 assert.equal(en.clients[1].name,'Oliver');assert.equal(en.visits[1].handover.age,'3 years');
 assert.equal(en.visits[1].notes,'Bright and relaxed today. Oliver ate his usual meal.');
 assert.equal(en.reports[0].name,'Milo & Luna');assert.equal(en.reports[0].reply,'Thank you — they look so happy!');
 assert.equal(en.settings.studio,'Little Moments Pet Care');assert.equal(en.settings.signature,'Small moments. Thoughtful care.');
 assert.deepEqual(localizeDemoContent(en,'zh'),zh);assert.deepEqual(zh,original);
});
test('example localization preserves custom clients, entered notes, timestamps and historical edits',()=>{
 const state=localizedSeed('zh');state.clients[0]={...state.clients[0],name:'真实客户的猫',isExample:false};
 state.visits[1].notes='我手写的观察';state.visits[1].date='2026-11-20';state.visits[1].time='10:45';
 state.reports[0].handover={...state.clients[0]};state.reports[0].name='真实客户的猫';state.reports[0].notes='历史报告原文';
 state.settings.studio='我的真实工作室';state.settings.signature='自定义寄语';
 const original=structuredClone(state),en=localizeDemoContent(state,'en');
 assert.deepEqual(en.clients[0],original.clients[0]);assert.deepEqual(en.reports,original.reports);
 assert.equal(en.visits[1].notes,'我手写的观察');assert.equal(en.visits[1].date,'2026-11-20');assert.equal(en.visits[1].time,'10:45');
 assert.equal(en.settings.studio,'我的真实工作室');assert.equal(en.settings.signature,'自定义寄语');
 assert.deepEqual(localizeDemoContent(en,'zh'),state);assert.deepEqual(state,original);
});
test('Pawly replaces legacy display branding in both languages without replacing custom studios or history',()=>{
 for(const brandName of ['宠托小本','宠物小本','petcare notes','Petcare Notes']) {
  const old=localizedSeed('zh');old.settings.brandName=brandName;
  old.reports[0].signature='来自原来的工作室';
  for(const lang of ['zh','en']) {
   const result=localizeDemoContent(old,lang);
   assert.equal(result.settings.brandName,'Pawly');
   assert.equal(result.reports[0].signature,'来自原来的工作室');
  }
  assert.equal(old.settings.brandName,brandName);
 }
 const custom=localizedSeed('zh');custom.settings.brandName='Momo care';custom.settings.studio='我的工作室';
 const result=localizeDemoContent(custom,'en');
 assert.equal(result.settings.brandName,'Momo care');assert.equal(result.settings.studio,'我的工作室');
});
