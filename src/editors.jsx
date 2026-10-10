import React, {useRef, useState} from 'react';
import {Camera, Pen, Plus, X, CalendarBlank, PawPrint, ListChecks, ClipboardText} from '@phosphor-icons/react';
import {visitEditDraft} from './domain.js';
import {petImage, taskNames, compressPhoto} from './international.js';

export function PhotoEditor({src, label, onChange, lang, onBusy=()=>{}, disabled=false}) {
  const file=useRef();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const L=(en,zh)=>lang==='en'?en:zh;
  return <div className="editable-photo">
    <img src={src} alt={label}/>
    <button type="button" className="photo-edit-button" disabled={busy||disabled} onClick={()=>file.current.click()}><Camera size={17}/>{busy?L('Processing…','处理中…'):label}</button>
    <input ref={file} hidden aria-label={label} type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{
      const selected=e.target.files[0];if(!selected)return;
      setBusy(true);onBusy(true);setError('');
      try{onChange(await compressPhoto(selected,1000));}catch{setError(L('Choose a JPG, PNG or WebP image under 10 MB.','请选择小于10MB的 JPG、PNG 或 WebP 图片。'));}
      finally{setBusy(false);onBusy(false);e.target.value='';}
    }}/>
    {error&&<p role="alert" className="form-error">{error}</p>}
  </div>;
}

export function VisitEditor({state,visitId,section='time',lang,Frame,onClose,onSave}) {
  const L=(en,zh)=>lang==='en'?en:zh;
  const [draft,setDraft]=useState(()=>visitEditDraft(state,visitId));
  const [active,setActive]=useState(section),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [sync,setSync]=useState(()=>!!state.clients.find(c=>c.id===draft.clientId)?.isExample);
  const extraPhotos=useRef();
  const completed=draft.status==='completed';
  const patch=(key,value)=>setDraft(d=>({...d,[key]:value}));
  const petPatch=(key,value)=>setDraft(d=>({...d,handover:{...d.handover,[key]:value}}));
  const names=taskNames(draft.handover,lang);
  const sections=[['time','Date & time','日期时间',CalendarBlank],['profile','Pet & owner','宠物资料',PawPrint],['tasks','Care tasks','照顾任务',ListChecks],['record','Photos & notes','照片记录',ClipboardText]];
  const profileFields=[['name','Pet name(s)','宠物名字'],['owner','Owner name','主人称呼'],['breed','Breed / description','品种 / 描述'],['age','Age','年龄'],['area','Address / neighbourhood','地址 / 小区'],['contact','Contact number','联系电话']];
  const careFields=[['note','Key reminder','重点提醒'],['food','Food & portions','喂养说明'],['water','Water','饮水要求'],['clean','Cleaning','清洁要求'],['care','Companionship & home checks','陪伴与居家注意']];
  const makeField=(key,en,zh,type='text',required=false)=> <label className="field" key={key}>{L(en,zh)}<input name={key} type={type} required={required} value={draft[key]||''} onInput={e=>patch(key,e.target.value)} onChange={e=>patch(key,e.target.value)}/></label>;
  return <Frame title={completed?L('Revise completed visit','修订已完成服务'):L('Edit this visit','编辑本次服务')} subtitle={L('Change any detail, then save once.','照片、资料、任务和时间，都可以在这里修改。')} onClose={busy?()=>{}:onClose} wide>
    <form className="visit-editor" onSubmit={e=>{e.preventDefault();const visibleTimes=Object.fromEntries(new FormData(e.currentTarget));setError(onSave({...draft,...visibleTimes},sync)||'');}}>
      <nav className="editor-sections" aria-label={L('Editing sections','编辑内容分区')}>{sections.map(([key,en,zh,Icon])=><button key={key} type="button" aria-pressed={active===key} className={active===key?'selected':''} onClick={()=>setActive(key)}><Icon size={19}/>{L(en,zh)}</button>)}</nav>
      <div className="editor-section-body">
      {active==='time'&&<>
        <h3>{L('When is this visit?','这次服务安排在什么时候？')}</h3>
        <div className="form-grid">{makeField('date','Visit date','服务日期','date',true)}<div className="field visit-context"><span>{L('Pet','服务宠物')}</span><strong>{draft.handover.name}</strong></div>{makeField('time','Scheduled start','预约开始','time',true)}{makeField('end','Scheduled end','预约结束','time',true)}</div>
        {draft.status!=='pending'&&<><h3 className="section-spacer">{L('Actual visit times','实际照顾时间')}</h3><div className="form-grid">{makeField('startedAt','Actual start','实际开始','time',completed)}{makeField('finishedAt','Actual end','实际结束','time',completed)}</div></>}
        <p className="editor-help">{L('Only this visit moves. Other visits stay where they are; overlapping bookings are checked before saving.','只修改这一次服务，其他日期保持原安排。保存时会检查是否与已有服务冲突。')}</p>
      </>}
      {active==='profile'&&<>
        <div className="profile-edit-lead"><PhotoEditor src={petImage(draft.handover.photo)} label={L('Change pet photo','更换宠物照片')} onChange={p=>petPatch('photo',p)} lang={lang} disabled={busy} onBusy={setBusy}/><div><h3>{L('Make it their own','换成真实的宠物资料')}</h3><p className="editor-help">{L('Changes appear in this visit immediately after saving.','保存后，本次服务会立即显示新照片和新资料。')}</p></div></div>
        <div className="form-grid">{profileFields.map(([key,en,zh])=><label className="field" key={key}>{L(en,zh)}<input value={draft.handover[key]||''} required={['name','owner'].includes(key)} maxLength={key==='area'?120:60} type={key==='contact'?'tel':'text'} onChange={e=>petPatch(key,e.target.value)}/></label>)}
          <label className="field">{L('Pet type','宠物类型')}<select value={draft.handover.species||'cat'} onChange={e=>petPatch('species',e.target.value)}><option value="cat">{L('Cat','猫咪')}</option><option value="dog">{L('Dog','狗狗')}</option></select></label>
          <label className="field">{L('Number of pets','宠物数量')}<input type="number" min="1" max="20" required value={draft.handover.count??1} onChange={e=>petPatch('count',e.target.value)}/></label>
        </div>
        <label className="scope-choice"><input type="checkbox" checked={sync} onChange={e=>setSync(e.target.checked)}/><span><strong>{L('Also update this client and upcoming visits','同时更新客户档案和待开始的服务')}</strong><small>{L('Other visits already started and older reports keep their records.','其他正在进行的服务与已发布报告保留各自记录。')}</small></span></label>
      </>}
      {active==='tasks'&&<>
        <div className="editor-section-heading"><h3>{L('Your care checklist','照顾任务清单')}</h3><span>{names.length}{L(' tasks',' 项任务')}</span></div>
        <p className="editor-help">{L('Edit task names, add or remove a task, and record what was completed.','修改任务名称，添加或移除任务，也可以更正完成情况。')}</p>
        <div className="editable-task-list">{names.map((name,i)=><div className="editable-task-row" key={i}><input type="checkbox" aria-label={L(`Task ${i+1} completed`,`任务${i+1}已完成`)} checked={!!draft.checks[i]} onChange={e=>patch('checks',draft.checks.map((v,j)=>i===j?e.target.checked:v))}/><input required maxLength={80} aria-label={L(`Task ${i+1} name`,`任务${i+1}名称`)} value={name} onChange={e=>petPatch('tasks',names.map((v,j)=>i===j?e.target.value:v))}/><button type="button" className="icon-button" aria-label={L(`Remove task ${i+1}`,`移除任务${i+1}`)} disabled={names.length===1} onClick={()=>setDraft(d=>({...d,handover:{...d.handover,tasks:names.filter((_,j)=>i!==j)},checks:d.checks.filter((_,j)=>i!==j)}))}><X size={19}/></button></div>)}</div>
        <button type="button" className="outline" disabled={names.length>=20} onClick={()=>setDraft(d=>({...d,handover:{...d.handover,tasks:[...names,'']},checks:[...d.checks,false]}))}><Plus size={17}/>{L('Add task','添加任务')}</button>
        <h3 className="section-spacer">{L('Care instructions','具体照顾说明')}</h3>
        <div className="care-fields">{careFields.map(([key,en,zh])=><label className="field" key={key}>{L(en,zh)}<textarea aria-label={L(en,zh)} value={draft.handover[key]||''} maxLength={500} onChange={e=>petPatch(key,e.target.value)}/></label>)}</div>
      </>}
      {active==='record'&&<>
        <div className="editor-section-heading"><h3>{L('Visit photos','本次服务照片')}</h3><span>{draft.photos.length}/6</span></div>
        <div className="editor-visit-photos">{draft.photos.map((p,i)=><div key={i}><PhotoEditor src={p} label={L(`Replace photo ${i+1}`,`更换照片${i+1}`)} lang={lang} disabled={busy} onBusy={setBusy} onChange={photo=>setDraft(d=>({...d,photos:d.photos.map((v,j)=>j===i?photo:v)}))}/><button type="button" className="text-action remove-photo-text" onClick={()=>patch('photos',draft.photos.filter((_,j)=>j!==i))}><X size={15}/>{L('Remove photo','移除照片')}</button></div>)}</div>
        <button type="button" className="outline" disabled={busy||draft.photos.length>=6} onClick={()=>extraPhotos.current.click()}><Plus size={18}/>{L('Add photos','添加照片')}</button>
        <input hidden ref={extraPhotos} aria-label={L('Upload visit photos','上传服务照片')} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={async e=>{const files=[...e.target.files];if(!files.length)return;if(files.length+draft.photos.length>6){setError(L('Keep up to 6 photos per visit.','每次服务最多保留6张照片。'));e.target.value='';return;}setBusy(true);try{const photos=[];for(const f of files)photos.push(await compressPhoto(f));setDraft(d=>({...d,photos:[...d.photos,...photos]}));setError('');}catch{setError(L('Choose supported images under 10 MB each.','请选择小于10MB的有效图片。'));}finally{setBusy(false);e.target.value='';}}}/>
        <label className="field section-spacer">{L('Observations','观察备注')}<textarea aria-label={L('Observations','观察备注')} value={draft.notes} maxLength={300} onChange={e=>patch('notes',e.target.value)}/></label>
        <label className="field">{L('Exception / unfinished task','异常 / 未完成说明')}<textarea aria-label={L('Exception / unfinished task','异常 / 未完成说明')} value={draft.exception} maxLength={500} onChange={e=>patch('exception',e.target.value)}/></label>
        {completed&&<label className="field">{L('Report sign-off','报告签名')}<input maxLength={100} value={draft.signature||''} onChange={e=>patch('signature',e.target.value)}/></label>}
      </>}
      </div>
      {error&&<p role="alert" className="form-error">{error}</p>}
      {completed&&<p className="editor-help revision-note">{L('Saving creates a revision and keeps the previous report. Owner acknowledgement resets for this revision.','保存后生成修订版并保留原报告，主人确认状态会重新开始。')}</p>}
      <div className="modal-actions editor-save"><button type="button" className="outline" disabled={busy} onClick={onClose}>{L('Cancel','取消')}</button><button className="primary" disabled={busy}>{busy?L('Processing photos…','正在处理照片…'):completed?L('Save revision','保存修订'):L('Save changes','保存修改')}</button></div>
    </form>
  </Frame>;
}
