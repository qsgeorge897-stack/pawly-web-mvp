import React, {useEffect, useRef, useState} from 'react';
import {ArrowRight, Bell, Camera, CaretDown, CaretLeft, CaretRight, Check, CheckCircle, ClipboardText, DownloadSimple, GearSix, Globe, PawPrint, Pen, Plus, SealCheck, User, X} from '@phosphor-icons/react';
import {addDays, weekOf} from './domain.js';
import {dateText, petImage, taskNames, localizeDemoContent} from './international.js';
import {PhotoEditor} from './editors.jsx';

export function useMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const change = () => setMobile(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return mobile;
}

export function MobileWorkspace({lang, date, setDate, visits, visit, pet, status, onSelect, onNew, onEdit, onGuide, onPhoto, onUpload, uploading, patchVisit, onReport, saveError, Frame}) {
  const L = (en, zh) => lang === 'en' ? en : zh;
  const [section, setSection] = useState('tasks');
  const [choosing, setChoosing] = useState(false);
  const file = useRef();
  const locked = visit?.status === 'completed';
  const upcoming = visit?.status === 'pending';
  const sections = [['tasks', L('Tasks', '任务')], ['photos', L('Photos', '照片') + (visit?.photos.length ? ` ${visit.photos.length}` : '')], ['notes', L('Notes', '备注')]];
  return <section className="mobile-workspace">
    <div className="m-context"><span>{dateText(date, lang)}</span><button aria-haspopup="dialog" onClick={() => setChoosing(true)}>{L(`${visits.length} visits`, `今日安排 ${visits.length} 次`)}<CaretDown size={17}/></button></div>
    {visit ? <>
      <div className="m-pet-hero">
        <div className="m-pet-copy"><h1>{L(locked ? 'All done, ' : upcoming ? 'Meet ' : 'Caring for ', locked ? '已照顾好' : upcoming ? '准备照顾' : '正在照顾')}{pet.name}</h1><p>{pet.breed} · {pet.age}</p><button className="m-visit-time" onClick={() => onEdit('time')} aria-label={L('Edit visit date and time', '修改服务日期与时间')}><span>{visit.startedAt || visit.time} · <em>{status(visit.status)}</em></span><Pen size={13}/></button></div>
        <button className="m-pet-photo" onClick={() => onEdit('profile')} aria-label={L('Edit pet details and photo', '修改宠物资料与照片')}><img src={petImage(pet.photo)} alt={pet.name}/><span><Pen size={12}/></span></button>
      </div>
      <button className="m-reminder" onClick={onGuide}><Bell size={22}/><span>{pet.note || L('Open the care guide', '查看照顾交接说明')}</span><CaretRight size={19}/></button>
      <div className="m-record-tabs" role="tablist" aria-label={L('Visit record', '本次记录')} onKeyDown={e => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault(); const i = sections.findIndex(([id]) => id === section);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
        setSection(sections[next][0]); e.currentTarget.querySelectorAll('[role=tab]')[next].focus();
      }}>{sections.map(([id, text]) => <button key={id} id={'visit-tab-' + id} role="tab" aria-selected={section === id} aria-controls={'visit-panel-' + id} tabIndex={section === id ? 0 : -1} onClick={() => setSection(id)}>{text}</button>)}</div>
      <div role="tabpanel" id={'visit-panel-' + section} aria-labelledby={'visit-tab-' + section} className="m-record-panel">
        {section === 'tasks' && <>
          <div className="m-section-title"><h2>{L('Care checklist', '照顾任务')}</h2><span>{visit.checks.filter(Boolean).length}/{visit.checks.length} {L('done', '已完成')}</span></div>
          <div className="m-task-list">{taskNames(pet, lang).map((task, i) => <label className={'task-row ' + (visit.checks[i] ? 'checked' : '')} key={i}><input type="checkbox" checked={!!visit.checks[i]} disabled={locked || upcoming} onChange={() => {const checks = [...visit.checks]; checks[i] = !checks[i]; patchVisit({checks});}}/><span className="check-box">{visit.checks[i] && <Check size={19} weight="bold"/>}</span><span>{task}</span></label>)}</div>
          <div className="m-task-help"><p>{upcoming ? L('Review the guide, then start your visit.', '查看交接后，点击下方开始到访') : locked ? L('Report saved. You can revise it if needed.', '报告已保存，需要时可修订记录') : L('Add a note for anything unfinished.', '未完成的任务，可在备注中说明')}</p><button onClick={() => onEdit('tasks')} aria-label={L('Edit task names', '编辑任务名称')}><Pen size={16}/></button></div>
        </>}
        {section === 'photos' && <>
          <div className="m-section-title"><h2>{L('Visit photos', '照顾照片')}</h2><span>{visit.photos.length}/6</span></div>
          {visit.photos.length ? <div className="photo-grid">{visit.photos.map((src, i) => <div className="record-photo" key={i}><button aria-label={L(`View photo ${i + 1}`, `查看照片 ${i + 1}`)} onClick={() => onPhoto(src)}><img src={src} alt={L(`Visit photo ${i + 1}`, `照顾照片 ${i + 1}`)}/></button>{!locked && <button className="remove-photo" aria-label={L(`Remove photo ${i + 1}`, `删除照片 ${i + 1}`)} onClick={() => patchVisit({photos: visit.photos.filter((_, j) => i !== j)})}><X size={17}/></button>}</div>)}</div> : <div className="m-photo-empty"><Camera size={34}/><p>{L('A little moment to share with the owner.', '留下一张照片，让主人更安心')}</p></div>}
          {!locked && <button className="upload-button" disabled={uploading || visit.photos.length >= 6} onClick={() => file.current.click()}><Camera size={21}/>{uploading ? L('Adding photos…', '正在添加照片…') : L('Add photos', '上传照片')}</button>}
          <input ref={file} hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => {onUpload([...e.target.files]); e.target.value = '';}}/>
          <p className="m-help">{L('Up to 6 photos · JPG, PNG or WebP', '最多 6 张照片 · 支持 JPG、PNG、WebP')}</p>
          {locked && <button className="text-action" onClick={() => onEdit('record')}><Pen/>{L('Revise photos & notes', '修订照片与备注')}</button>}
        </>}
        {section === 'notes' && <>
          <div className="m-section-title"><h2>{L('A few observations', '观察备注')}</h2><span>{L('Auto-saved', '自动保存')}</span></div>
          <label className="m-note-field"><span>{L('How was your little friend?', '今天它怎么样')}</span><textarea aria-label={L('Observations', '观察备注')} maxLength={300} value={visit.notes} readOnly={locked} onChange={e => patchVisit({notes: e.target.value})} placeholder={L('Mood, meals and little moments…', '记录精神状态、进食情况和小细节…')}/><small>{visit.notes.length}/300</small></label>
          <label className="m-note-field"><span>{L('Unfinished tasks & follow-up', '未完成说明与待跟进事项')}</span><textarea aria-label={L('Unfinished tasks & follow-up', '未完成说明与待跟进事项')} maxLength={500} value={visit.exception} readOnly={locked} onChange={e => patchVisit({exception: e.target.value})} placeholder={L('Explain any unchecked tasks before publishing.', '如有未勾选任务，请在发布前补充原因')}/><small>{visit.exception.length}/500</small></label>
          <p className={'m-help ' + (saveError ? 'danger' : '')}>{saveError ? L('Not saved. Device storage is full.', '尚未保存，本机存储空间不足') : L('Saved on this device', '已保存在本机')} {visit.savedAt}</p>
          {locked && <button className="text-action" onClick={() => onEdit('record')}><Pen/>{L('Revise notes', '修订备注')}</button>}
        </>}
      </div>
      <div className="m-primary-dock"><button className="primary full" disabled={uploading} onClick={() => upcoming ? patchVisit({status: 'active', startedAt: new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}) : onReport()}>{upcoming ? L('Start visit', '开始到访') : locked ? L('View care report', '查看照顾报告') : L('Preview care report', '预览照顾报告')}<ArrowRight size={23}/></button></div>
    </> : <div className="m-empty-day"><PawPrint size={43}/><h1>{L('A little breathing room', '今天，留一点空白')}</h1><p>{L('Choose another date or schedule your next visit.', '切换日期，或安排下一次照顾')}</p><button className="primary" onClick={onNew}><Plus/>{L('New visit', '新建服务')}</button></div>}
    {choosing && <Frame title={L('Your visits', '选择服务')} onClose={() => setChoosing(false)}><label className="field">{L('View date', '查看日期')}<input type="date" value={date} onChange={e => e.target.value && setDate(e.target.value)}/></label><div className="m-visit-list">{visits.map(v => <button key={v.id} className={v.id === visit?.id ? 'chosen' : ''} onClick={() => {onSelect(v.id); setSection('tasks'); setChoosing(false); window.scrollTo(0, 0);}}><img src={petImage(v.handover.photo)} alt=""/><span><strong>{v.handover.name}</strong><small>{v.time}–{v.end} · {status(v.status)}</small></span>{v.id === visit?.id ? <CheckCircle weight="fill"/> : <CaretRight/>}</button>)}</div>{!visits.length && <p className="m-help">{L('No visits on this date.', '这一天还没有安排')}</p>}<button className="primary full" onClick={() => {setChoosing(false); onNew();}}><Plus/>{L('New visit', '新建服务')}</button></Frame>}
  </section>;
}

export function MobileSchedule({lang, db, date, setDate, status, matches, onOpen, onEdit, onNew}) {
  const L = (en, zh) => lang === 'en' ? en : zh;
  const days = weekOf(date);
  const visits = db.visits.filter(v => v.date === date && v.status !== 'cancelled' && matches(db.clients.find(c => c.id === v.clientId))).sort((a, b) => a.time.localeCompare(b.time));
  return <section className="m-schedule">
    <div className="m-week-heading"><button aria-label={L('Previous week', '上一周')} onClick={() => setDate(addDays(date, -7))}><CaretLeft/></button><strong>{dateText(days[0], lang)} — {dateText(days[6], lang)}</strong><button aria-label={L('Next week', '下一周')} onClick={() => setDate(addDays(date, 7))}><CaretRight/></button></div>
    <div className="m-week-strip">{days.map(d => <button key={d} aria-pressed={date === d} aria-label={dateText(d, lang)} onClick={() => setDate(d)}><span>{new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'zh-CN', {weekday: 'narrow'}).format(new Date(d + 'T12:00:00'))}</span><strong>{Number(d.slice(-2))}</strong><i className={db.visits.some(v => v.date === d && v.status !== 'cancelled') ? 'has-visits' : ''}/></button>)}</div>
    <div className="m-section-title"><h2>{L('Daily schedule', '当日安排')}</h2><span>{L(`${visits.length} visits`, `${visits.length} 次服务`)}</span></div>
    <div className="m-schedule-list">{visits.map(v => <article key={v.id}><div className="m-schedule-time"><strong>{v.time}</strong><span>{v.end}</span></div><div className="m-schedule-card"><button className="m-schedule-open" onClick={() => onOpen(v)}><img src={petImage(v.handover.photo)} alt=""/><div><h3>{v.handover.name}</h3><p>{v.handover.owner} · {v.handover.area}</p><span className={'badge ' + (v.status === 'completed' ? 'green' : 'amber')}>{status(v.status)}</span></div><CaretRight/></button><button className="m-schedule-edit" onClick={() => onEdit(v.id)}><Pen size={15}/>{L('Edit details & time', '修改资料与时间')}</button></div></article>)}</div>
    {!visits.length && <div className="m-photo-empty"><PawPrint size={32}/><p>{L('No visits yet. Make a little plan.', '这一天还没有安排，添加一份新的托付吧')}</p></div>}
    <button className="outline full" onClick={() => onNew(date)}><Plus/>{L('Schedule a visit', '安排到访')}</button>
  </section>;
}

export function MobileSettings({lang, db, setDb, onExport, download, notify, onPlans, onLanguage, onAbout}) {
  const L = (en, zh) => lang === 'en' ? en : zh;
  const [group, setGroup] = useState(null), [draft, setDraft] = useState(db.settings), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => setDraft(d => localizeDemoContent({...db, settings: d}, lang).settings), [lang]);
  const open = id => {setDraft(db.settings); setError(''); setGroup(id); window.scrollTo(0, 0);};
  const fields = group === 'profile' ? [['name', 'Your name', '你的称呼', 40], ['studio', 'Studio name', '工作室名称', 60], ['signature', 'Report sign-off', '报告签名', 100]] : [['brandName', 'Studio display name (optional)', '工作室展示名（选填）', 24], ['workTitle', 'Workspace welcome title', '工作台欢迎语', 80], ['tagline', 'A short welcome message', '欢迎语下的说明', 120]];
  const titles = {profile: L('Studio profile', '工作室资料'), appearance: L('Appearance & preferences', '外观与偏好'), backup: L('Data & backup', '数据与备份')};
  if (group) return <section className="m-settings-detail"><button className="m-back" onClick={() => setGroup(null)}><CaretLeft/>{L('My studio', '我的')}</button><h1>{titles[group]}</h1>{group === 'backup' ? <>
    <div className="m-settings-note"><DownloadSimple size={29}/><h2>{L('Keep a copy of your work', '留一份照顾记录')}</h2><p>{L('Excel for schedules and accounts. PDF for a report you can send to an owner.', '用 Excel 整理服务安排，用 PDF 保存并发送照顾报告。')}</p><button className="primary full" onClick={onExport}>{L('Export Excel / PDF', '导出 Excel / PDF')}</button></div>
    <div className="m-settings-note"><h2>{L('Original data backup', '原始数据备份')}</h2><p>{L('Includes clients, visits, photos, settings and report history. Stored in this browser; it does not sync across devices.', '包含客户、服务、照片、设置和报告历史版本。数据保存在当前浏览器，不会跨设备同步。')}</p><button className="outline full" onClick={() => {download('pawly-backup.json', JSON.stringify(db, null, 2)); notify(L('Backup downloaded.', '备份已下载'));}}>{L('Download JSON backup', '下载 JSON 备份')}</button></div>
    </> : <form onSubmit={e => {e.preventDefault(); if (!draft.name?.trim() || !draft.studio?.trim()) return setError(L('Enter your name and studio name.', '请填写称呼和工作室名称')); setDb(s => ({...s, settings: {...s.settings, ...Object.fromEntries(fields.map(([key]) => [key, draft[key]])), ...(group === 'profile' ? {avatar: draft.avatar} : {})}})); setGroup(null); notify(L('Changes saved.', '修改已保存'));}}>
      {group === 'profile' && <div className="m-avatar-editor"><PhotoEditor src={draft.avatar || '/assets/sitter.jpg'} label={L('Change avatar', '更换头像')} lang={lang} onBusy={setBusy} onChange={avatar => setDraft(d => ({...d, avatar}))}/></div>}
      {fields.map(([key, en, zh, max]) => <label className="field" key={key}>{L(en, zh)}<input name={key} maxLength={max} required={['name', 'studio'].includes(key)} value={draft[key] ?? ''} onChange={e => setDraft(d => ({...d, [key]: e.target.value}))}/></label>)}
      <p className="m-help">{group === 'profile' ? L('New reports use this sign-off. Existing reports keep their history.', '新报告会使用这个签名，已完成报告保留原有记录。') : L('Welcome text appears on the desktop workspace. On phones, care tasks come first.', '欢迎语显示在电脑工作台，手机版优先展示照顾任务。')}</p>
      {group === 'appearance' && <label className="m-preference"><input type="checkbox" checked={!!db.settings.compact} onChange={() => setDb(s => ({...s, settings: {...s.settings, compact: !s.settings.compact}}))}/><span>{L('Compact desktop lists', '电脑端列表紧凑显示')}</span></label>}
      {error && <p role="alert" className="form-error">{error}</p>}<button className="primary full" disabled={busy}>{L('Save changes', '保存修改')}</button>
    </form>}</section>;
  const rows = [[User, 'Studio profile', '工作室资料', 'Photo, name and report sign-off', '头像、称呼与报告签名', () => open('profile')], [GearSix, 'Appearance & preferences', '外观与偏好', 'Personalise your workspace', '定制工作台的文字与显示', () => open('appearance')], [DownloadSimple, 'Export Excel / PDF', '导出 Excel / PDF', 'Free during beta', '内测期间免费使用', onExport], [ClipboardText, 'Data & backup', '数据与备份', 'Keep a copy on your device', '下载完整记录，妥善保存', () => open('backup')], [Globe, 'Language', '语言', 'English · switch to 中文', '简体中文 · 切换为 English', onLanguage], [SealCheck, 'Services & help', '服务与帮助', 'What is available in Pawly', '查看已实现的功能与后续规划', onPlans]];
  return <section className="m-my-studio"><h1>{L('My studio', '我的工作室')}</h1><button className="m-my-profile" onClick={() => open('profile')}><img src={db.settings.avatar || '/assets/sitter.jpg'} alt=""/><div><h2>{db.settings.name}</h2><p>{db.settings.brandName || db.settings.studio}</p></div><Pen size={19}/></button><div className="m-settings-menu">{rows.map(([Icon, en, zh, enSmall, zhSmall, action]) => <button key={en} onClick={action}><Icon size={23}/><span><strong>{L(en, zh)}</strong><small>{L(enSmall, zhSmall)}</small></span><CaretRight size={17}/></button>)}</div><button className="m-about" onClick={onAbout}>Pawly · {L('Free beta · About', '免费内测 · 体验说明')}</button></section>;
}
