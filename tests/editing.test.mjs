import test from 'node:test';
import assert from 'node:assert/strict';
import {visitEditDraft,saveVisitEdit,newVisit,publishReport} from '../src/domain.js';
import {localizedSeed,taskNames,plainReport} from '../src/international.js';

test('rescheduling excludes the edited visit but rejects real conflicts without mutation',()=>{
 const state=localizedSeed('en'),original=structuredClone(state);
 const draft=visitEditDraft(state,'v2');
 assert.equal(saveVisitEdit(state,'v2',draft).visits[1].time,'11:00');
 draft.time='09:30';draft.end='10:30';
 assert.throws(()=>saveVisitEdit(state,'v2',draft),/已有服务/);
 draft.date='2026-02-30';assert.throws(()=>saveVisitEdit(state,'v2',draft),/有效/);
 assert.deepEqual(state,original);
 draft.date='2026-09-20';draft.time='14:00';draft.end='15:00';
 const changed=saveVisitEdit(state,'v2',draft);
 assert.equal(changed.visits[1].date,'2026-09-20');assert.equal(changed.visits[0].date,state.visits[0].date);
});
test('explicit visit editing updates active snapshot and optionally future visits, preserving other histories',()=>{
 const state=localizedSeed('en');state.visits.push({...structuredClone(state.visits[1]),id:'future',status:'pending',date:'2026-09-20'});
 const draft=visitEditDraft(state,'v2');draft.handover.name='Pepper';draft.handover.photo='data:image/jpeg;base64,example';
 const local=saveVisitEdit(state,'v2',draft,false,'12:00');
 assert.equal(local.visits[1].handover.name,'Pepper');assert.equal(local.clients[1].name,'Oliver');
 const synced=saveVisitEdit(state,'v2',draft,true,'12:00');
 assert.equal(synced.clients[1].name,'Pepper');assert.equal(synced.visits.at(-1).handover.photo,draft.handover.photo);
 assert.deepEqual(synced.reports,state.reports);assert.deepEqual(synced.visits[0],state.visits[0]);
});
test('completed corrections retain full previous reports and reset owner acknowledgement',()=>{
 const state=localizedSeed('en'),old=structuredClone(state.reports[0]);
 const draft=visitEditDraft(state,'v1');draft.handover.name='Milo';draft.notes='Corrected observation';draft.time='08:00';draft.end='09:00';draft.startedAt='08:05';draft.finishedAt='08:45';draft.photos=['data:image/jpeg;base64,replacement'];draft.signature='Studio signature';
 const next=saveVisitEdit(state,'v1',draft,false,'13:00'),report=next.reports[0];
 assert.deepEqual(report.revisions,[old]);assert.equal(report.revision,2);assert.equal(report.viewed,false);assert.equal(report.acknowledged,false);assert.equal(report.reply,'');
 assert.equal(report.time,'08:05');assert.equal(report.name,'Milo');assert.equal(report.signature,'Studio signature');
 assert.match(plainReport(report,'en'),/Corrected observation/);assert.match(plainReport(report,'en'),/Studio signature/);
 assert.deepEqual(state.reports[0],old);
 const again=saveVisitEdit(next,'v1',visitEditDraft(next,'v1'),false,'14:00');
 assert.equal(again.reports[0].revisions.length,2);assert.equal(again.reports[0].revisions[1].revisions,undefined);
});
test('custom task lists survive scheduling, report rendering and corrected completion',()=>{
 const state=localizedSeed('en');const draft=visitEditDraft(state,'v2');draft.handover.tasks=['Brush coat','Clean bowl','Refill fountain'];draft.checks=[true,true,false];
 const updated=saveVisitEdit(state,'v2',draft,true);
 assert.deepEqual(taskNames(updated.visits[1].handover,'zh'),draft.handover.tasks);
 assert.equal(newVisit(updated.clients[1],{date:'2026-10-01',time:'09:00',end:'10:00'}).checks.length,3);
 updated.visits[1].exception='Owner asked to skip the fountain.';
 const published=publishReport(updated,'v2','12:00');assert.match(plainReport(published.reports[0],'en'),/Not completed · Refill fountain/);
 const correction=visitEditDraft(published,'v2');correction.exception='';
 assert.throws(()=>saveVisitEdit(published,'v2',correction),/原因/);
 correction.handover.tasks=[''];correction.checks=[true];assert.throws(()=>saveVisitEdit(published,'v2',correction),/任务/);
});
