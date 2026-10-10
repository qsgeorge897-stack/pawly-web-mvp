import ExcelJS from 'exceljs';
import {PDFDocument} from 'pdf-lib';
import html2canvas from 'html2canvas';
import {exportData,exportFileName} from './export-data.js';
import {petImage,taskNames} from './international.js';

export function saveDownload(filename,bytes,type){
  const blob=bytes instanceof Blob?bytes:new Blob([bytes],{type});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}

export async function makeWorkbook(state,options={}){
  const data=exportData(state,options),L=(en,zh)=>options.lang==='en'?en:zh;
  const workbook=new ExcelJS.Workbook();workbook.creator='Pawly';workbook.created=new Date();
  for(const table of data.sheets){
    const sheet=workbook.addWorksheet(table.name,{views:[{state:'frozen',ySplit:4}],pageSetup:{orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0}});
    sheet.columns=table.widths.map(width=>({width}));
    sheet.mergeCells(1,1,1,table.headers.length);sheet.getCell(1,1).value=`${state.settings.studio} · ${table.name}`;sheet.getRow(1).height=34;
    sheet.getCell(1,1).font={name:'Microsoft YaHei',size:17,bold:true,color:{argb:'FF8F472F'}};
    sheet.mergeCells(2,1,2,table.headers.length);sheet.getCell(2,1).value=L('Date range: ','日期范围：')+(options.from||L('All dates','不限'))+' — '+(options.to||L('All dates','不限'))+L(' · Photos are in PDF reports; Excel contains the latest records.',' · 照片请查看 PDF 报告；表格为最新记录。');sheet.getRow(2).height=28;sheet.getCell(2,1).font={name:'Microsoft YaHei',size:10,color:{argb:'FF6E5C4C'}};
    const header=sheet.getRow(4);header.values=table.headers;header.height=28;
    header.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFB96649'}};cell.font={name:'Microsoft YaHei',size:11,bold:true,color:{argb:'FFFFFFFF'}};cell.alignment={vertical:'middle',wrapText:true};});
    for(const values of table.rows){
      const row=sheet.addRow(values.map(v=>v??''));
      const lines=Math.max(1,...values.map((v,i)=>typeof v==='string'?v.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil([...line].reduce((n,c)=>n+(c.charCodeAt(0)>255?2:1),0)/Math.max(1,table.widths[i]-3))),0):1));
      row.height=Math.min(400,Math.max(28,lines*16+10));
      row.eachCell({includeEmpty:true},cell=>{cell.font={name:'Microsoft YaHei',size:11,color:{argb:'FF342C25'}};cell.alignment={vertical:'top',wrapText:true};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:row.number%2?'FFFBF5ED':'FFFFFFFF'}};});
      for(const col of table.dateColumns||[])row.getCell(col).numFmt='yyyy-mm-dd';
      for(const col of table.timeColumns||[])row.getCell(col).numFmt='hh:mm';
    }
    sheet.autoFilter={from:{row:4,column:1},to:{row:Math.max(4,sheet.rowCount),column:table.headers.length}};
    sheet.pageSetup.printTitlesRow='1:4';
  }
  return workbook;
}

export async function downloadWorkbook(state,options={}){
  const workbook=await makeWorkbook(state,options);
  const bytes=await workbook.xlsx.writeBuffer();
  const name=exportFileName(state.settings.studio)+'-'+(options.lang==='en'?'care-records':'服务记录')+'.xlsx';
  saveDownload(name,bytes,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const pdfPhoto=src=>globalThis.__PETCARE_OFFLINE_IMAGES__?.[src.split('/').at(-1)]||src;

export async function makeReportPdf(report,settings,lang='zh'){
  const L=(en,zh)=>lang==='en'?en:zh;
  const host=el('div',undefined,'pdf-export-host');host.setAttribute('aria-hidden','true');
  const sheets=[];let sheet,body;
  const newPage=()=>{
    sheet=el('section',undefined,'pdf-export-page');
    const header=el('header',undefined,'pdf-export-header');header.append(el('strong',settings.studio||'Pawly'),el('span',L('Care report','照顾报告')));sheet.append(header);
    body=el('div',undefined,'pdf-export-body');sheet.append(body);host.append(sheet);sheets.push(sheet);
  };
  const append=block=>{body.append(block);if(body.scrollHeight>930&&body.children.length>1){block.remove();newPage();body.append(block);}if(block.offsetHeight>930)throw Error('reportTooLong');};
  try{
    document.body.append(host);newPage();
    const hero=el('div',undefined,'pdf-report-hero'),photo=el('img',undefined,'pdf-hero-photo');photo.src=pdfPhoto(petImage(report.handover?.photo));photo.alt='';
    const intro=el('div');intro.append(el('h1',report.name),el('p',`${report.date} · ${report.time}–${report.end}`),el('p',`${report.handover?.breed||''} · ${report.handover?.age||''}`));hero.append(photo,intro);append(hero);
    append(el('h2',L('Care checklist','照顾任务')));
    taskNames(report.handover,lang).forEach((name,i)=>{const row=el('div',undefined,'pdf-task-row');row.append(el('span',name),el('strong',report.checks[i]?L('Done','已完成'):L('Not completed','未完成'),report.checks[i]?'pdf-done':'pdf-not-done'));append(row);});
    const note=(title,text)=>{if(!text)return;String(text).split('\n').forEach((line,i)=>{const b=el('section',undefined,'pdf-note');if(i===0)b.append(el('h2',title));b.append(el('p',line||'\u00a0'));append(b);});};
    note(L('Observations','观察记录'),report.notes||L('No additional observations.','本次暂无补充备注。'));note(L('Exception / unfinished tasks','异常 / 未完成说明'),report.exception);
    for(let i=0;i<report.photos.length;i+=2){
      const group=el('section',undefined,'pdf-photo-section');if(i===0)group.append(el('h2',L('A few moments from this visit','本次照顾照片')));
      const row=el('div',undefined,'pdf-photo-row');for(const src of report.photos.slice(i,i+2)){const img=el('img',undefined,'pdf-care-photo');img.src=pdfPhoto(src);img.alt='';row.append(img);}group.append(row);append(group);
    }
    note(L('From your sitter','照顾人寄语'),report.signature??settings.signature);
    sheets.forEach((p,i)=>{const footer=el('footer',undefined,'pdf-export-footer');footer.append(el('span',L(`Version ${report.revision||1}`,`第${report.revision||1}版`)),el('span',`${i+1} / ${sheets.length}`));p.append(footer);});
    await Promise.all([...host.querySelectorAll('img')].map(img=>new Promise((resolve,reject)=>{if(img.complete)return img.naturalWidth?resolve():reject(Error('photoUnavailable'));const timer=setTimeout(()=>reject(Error('photoUnavailable')),15000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(Error('photoUnavailable'));};})));
    // html2canvas supports background-size: cover, but not object-fit on images.
    for(const img of host.querySelectorAll('img')){const frame=el('div',undefined,img.className);frame.style.backgroundImage=`url(${JSON.stringify(img.src)})`;frame.style.backgroundSize=img.className==='pdf-hero-photo'?'cover':'contain';frame.style.backgroundPosition='center';frame.style.backgroundRepeat='no-repeat';frame.style.backgroundColor='#f7f1eb';img.replaceWith(frame);}
    const doc=await PDFDocument.create();doc.setTitle(`${report.name} · ${L('Care report','照顾报告')}`);doc.setAuthor(settings.studio||'Pawly');
    for(const p of sheets){const canvas=await html2canvas(p,{scale:2,backgroundColor:'#fffdfb',useCORS:true,logging:false,windowWidth:1100});const image=await doc.embedJpg(canvas.toDataURL('image/jpeg',0.94));const page=doc.addPage([595.28,841.89]);page.drawImage(image,{x:0,y:0,width:595.28,height:841.89});canvas.width=0;canvas.height=0;}
    return await doc.save();
  }finally{host.remove();}
}

export async function downloadReportPdf(report,settings,lang){
  const bytes=await makeReportPdf(report,settings,lang);
  saveDownload(`${exportFileName(report.name)}-${report.date}.pdf`,bytes,'application/pdf');
}
