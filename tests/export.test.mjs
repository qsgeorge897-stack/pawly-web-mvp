import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {localizedSeed} from '../src/international.js';
import {exportData,exportFileName} from '../src/export-data.js';
import {makeWorkbook} from '../src/export-files.js';

test('date and client filters include their boundaries without changing saved records',()=>{
 const state=localizedSeed('zh'),before=structuredClone(state),date=state.visits[0].date,id=state.visits[0].clientId;
 const filtered=exportData(state,{from:date,to:date,clientId:id});
 assert.equal(filtered.visits.length,1);assert.equal(filtered.reports.length,1);assert.equal(filtered.clients.length,1);
 assert.equal(exportData(state,{from:'2099-01-01'}).clients.length,0);
 assert.equal(exportData(state).clients.length,4);
 assert.throws(()=>exportData(state,{from:'2026-10-01',to:'2026-09-01'}),/dateRange/);
 assert.deepEqual(state,before);
});

test('historical visits use snapshots and the report sheet exports the current revision',()=>{
 const state=localizedSeed('en'),oldName=state.visits[0].handover.name;
 state.clients[0].name='A new household name';state.reports[0].revision=3;
 state.reports[0].revisions=[{name:'An obsolete revision'}];
 const data=exportData(state,{lang:'en'});
 assert.equal(data.sheets[0].rows[0][2],oldName);
 assert.equal(data.sheets[1].rows[0][0],'A new household name');
 assert.equal(data.sheets[3].rows.length,1);assert.equal(data.sheets[3].rows[0][6],3);
 assert.equal(data.sheets[3].rows[0][7],state.reports[0].photos.length);
});

test('actual XLSX roundtrip retains editable dates, times, counts and literal contact text',async()=>{
 const state=localizedSeed('zh');state.clients[0].contact='00123456789';
 state.clients[1].name='=SUM(1,2)';state.clients[1].contact='@user-contact';
 const before=structuredClone(state),book=await makeWorkbook(state,{lang:'zh'});
 const bytes=await book.xlsx.writeBuffer(),loaded=new ExcelJS.Workbook();await loaded.xlsx.load(bytes);
 assert.deepEqual(loaded.worksheets.map(s=>s.name),['服务安排','客户资料','任务明细','服务报告']);
 const visits=loaded.getWorksheet('服务安排');
 assert.equal(visits.getCell('B5').value.toISOString().slice(0,10),state.visits[0].date);
 assert.equal(book.getWorksheet('服务安排').getCell('E5').value,9/24);
 assert.equal(visits.getCell('E5').value.toISOString().slice(11,16),'09:00');assert.equal(visits.getCell('E5').numFmt,'hh:mm');
 assert.equal(visits.getCell('L5').value,5);assert.equal(visits.views[0].ySplit,4);
 assert.ok(visits.autoFilter);
 const clients=loaded.getWorksheet('客户资料');
 assert.equal(clients.getCell('C5').value,'00123456789');
 assert.equal(clients.getCell('A6').value,'=SUM(1,2)');assert.equal(clients.getCell('A6').type,ExcelJS.ValueType.String);
 assert.equal(clients.getCell('C6').value,'@user-contact');
 assert.deepEqual(state,before);
 assert.equal(exportFileName('../a/b:*?'),'..-a-b---');
});

test('an empty export remains a valid workbook with headers in either language',async()=>{
 const state=localizedSeed('en');state.visits=[];state.clients=[];state.reports=[];
 const book=await makeWorkbook(state,{lang:'en'});
 assert.equal(book.worksheets.length,4);assert.equal(book.worksheets[0].getCell('A4').value,'Visit ID');
 assert.ok((await book.xlsx.writeBuffer()).length>1000);
});
