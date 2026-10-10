import React, {useEffect, useState} from 'react';
import {ArrowRight, Check, Copy, EnvelopeSimple, Globe, PawPrint} from '@phosphor-icons/react';
import './pilot.css';

// Public source uses an intentionally non-deliverable demo contact.
export const PILOT_EMAIL = 'hello@example.invalid';

export default function Pilot() {
  const [lang, setLang] = useState(() => new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('lang') === 'zh' ? 'zh' : 'en');
  const [copyStatus, setCopyStatus] = useState('');
  const L = (en, zh) => lang === 'en' ? en : zh;
  const demo = `/?design=1&lang=${lang}&view=work`;
  const workspace = `/?lang=${lang}&view=work`;
  const subject = L('Pawly Singapore sitter pilot', 'Pawly 新加坡照护人工具试用');
  const body = L(
    'Hi Pawly,\n\nI am interested in the sitter pilot.\n\nMy name / business:\nNeighbourhoods I cover:\nHow I organise visits today:\nOne thing I would like to make easier:\nI prefer: a few questions by email / a short call\n\nPlease reply to this email about the pilot.\n',
    '你好 Pawly，\n\n我想了解照护人工具试用。\n\n我的称呼 / 业务名称：\n服务片区：\n目前如何安排服务：\n希望变得更省心的一件事：\n我更方便：邮件文字交流 / 简短通话\n\n请通过这封邮件回复我有关试用的信息。\n'
  );
  const mailto = `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = L('Pawly · A little less admin, a little more care', 'Pawly · 少一点整理，多一点陪伴');
    const url = new URL(location.href);
    url.searchParams.set('view', 'pilot');
    url.searchParams.set('lang', lang);
    history.replaceState({}, '', url);
  }, [lang]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(PILOT_EMAIL);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('manual');
    }
  }

  const features = [
    ['01', L('Plan the visit', '安排好每次照顾'), L('Keep pet instructions, client details and visit times together. Start with a template and make it yours.', '把宠物习惯、客户资料与服务时间放在一起，从模板开始，按真实情况修改。')],
    ['02', L('Record the little things', '记下照顾的小细节'), L('Tick off care tasks, add photos and note anything the owner should know, right from your phone.', '用手机勾选任务、添加照片，记下需要告诉主人的观察和未完成事项。')],
    ['03', L('Leave a clear update', '留下一份清楚的报告'), L('Export a photo report as a PDF to send yourself. Use Excel when you need to organise your records.', '导出带照片的 PDF，亲自发给主人；需要整理服务记录时，也可以导出 Excel。')],
  ];
  const faqs = [
    [L('Who is this pilot for?', '这次试用适合谁？'), L('Independent pet sitters and small care businesses in Singapore who already arrange home visits. We are learning how Pawly fits your existing work; this pilot does not supply bookings or guarantee earnings.', '适合已经提供上门照护服务的新加坡独立照护人和小型工作室。我们想了解 Pawly 能否帮助你现有的工作；本次工具试用不提供客源，也不保证收入。')],
    [L('Is there a charge?', '试用需要付费吗？'), L('Current beta features are free. There is no card required, checkout or automatic renewal. If we introduce paid features later, the scope and price will be explained before you choose to buy.', '现有内测功能免费，无需银行卡，没有结账或自动续费。如果以后推出付费功能，会在你决定购买前明确说明范围和价格。')],
    [L('Where are my records saved?', '我的记录保存在哪里？'), L('The workbench saves records in this browser on this device. It does not sync to another device. Clearing browser data can remove them, so keep a JSON backup. The demo is separate and does not save changes after a reload.', '工作台记录保存在当前设备的当前浏览器中，暂时不会跨设备同步。清除浏览器数据可能导致记录丢失，请保留 JSON 备份。示例体验相互独立，刷新后不保留练习改动。')],
    [L('What happens when I get in touch?', '联系之后会发生什么？'), L('You can describe your workflow by email or arrange a short conversation. We may invite you to try Pawly and share feedback. Joining a conversation does not commit you to a subscription or require you to share client records.', '你可以通过邮件介绍工作流程，也可以约一次简短交流。我们可能邀请你试用并反馈；参与交流不代表订阅，也不需要提供客户记录。')],
  ];

  return <div className={`pilot-page ${lang === 'zh' ? 'pilot-zh' : ''}`}>
    <a className="pilot-skip" href="#pilot-main">{L('Skip to content', '跳至正文')}</a>
    <header className="pilot-header">
      <a className="pilot-brand" href={`/?view=pilot&lang=${lang}`} aria-label={L('Pawly pilot home', 'Pawly 试用首页')}>Pawly<PawPrint size={20} weight="fill" aria-hidden="true"/></a>
      <span className="pilot-header-label">{L('FOR THE PEOPLE WHO CARE', '为认真照顾它的人')}</span>
      <nav aria-label={L('Page navigation', '页面导航')}>
        <button className="pilot-language" onClick={() => {setLang(lang === 'en' ? 'zh' : 'en'); setCopyStatus('');}} aria-label={L('Switch to Chinese', '切换为英文')}><Globe size={18}/>{lang === 'en' ? '中文' : 'EN'}</button>
        <a className="pilot-workspace-link" href={workspace}>{L('Open workbench', '打开工作台')}<ArrowRight size={17}/></a>
      </nav>
    </header>

    <main id="pilot-main" className="pilot-main">
      <section className="pilot-hero" aria-labelledby="pilot-title">
        <div className="pilot-hero-copy">
          <p className="pilot-eyebrow">{L('SINGAPORE · SITTER PILOT', '新加坡 · 照护人工具试用')}</p>
          <h1 id="pilot-title">{lang === 'en' ? <>A little less admin.<br/><em>A little more care.</em></> : <>少一点整理，<em>多一点陪伴</em></>}</h1>
          <p className="pilot-intro">{L('Visits, care notes and photo reports, all in one calm workbench. Made for the pet sitters behind every thoughtful visit.', '把服务安排、照顾笔记和照片报告放在一个顺手的工作台里，让认真照顾宠物的人少一些重复整理。')}</p>
          <div className="pilot-actions"><a className="pilot-primary" href={demo}>{L('Try the demo', '体验示例')}<ArrowRight size={19}/></a><a className="pilot-text-link" href="#pilot-contact">{L('Join the sitter pilot', '联系参与试用')}</a></div>
          <p className="pilot-small">{L('Free beta · No sign-up for the demo', '内测免费 · 示例体验无需注册')}</p>
          <p className="pilot-device-note">{L('Records stay on your device. Cloud sync is not available yet.', '记录保存在当前设备，云同步尚未开放。')}</p>
        </div>
        <figure className="pilot-example">
          <figcaption><span>{L('A LITTLE LOOK INSIDE', '看一眼照顾记录')}</span><span>{L('Example report', '示例报告')}</span></figcaption>
          <img className="pilot-pet-photo" src="/assets/tuantuan.jpg" alt={L('A grey cat resting on a soft blanket', '灰色猫咪躺在柔软的毯子上')} width="720" height="480"/>
          <div className="pilot-example-note">
            <div className="pilot-note-title"><h2>{L('Oliver’s little update', '团团的照顾笔记')}</h2><PawPrint size={23} weight="light" aria-hidden="true"/></div>
            <ul>{[L('Food & fresh water', '添加猫粮，更换饮水'),L('A clean litter tray', '清理猫砂'),L('A little playtime', '陪伴玩耍')].map(t=><li key={t}><Check size={16} aria-hidden="true"/>{t}</li>)}</ul>
            <p>{L('“Bright and relaxed today. Enjoyed a little play, then settled down for a nap.”', '“今天精神不错，玩了一会儿，就安心地躺下睡着了。”')}</p>
            <a href={demo} className="pilot-example-link">{L('Try editing a sample visit', '试着修改一份示例记录')}<ArrowRight size={17}/></a>
          </div>
        </figure>
      </section>

      <section className="pilot-workflow" aria-label={L('How Pawly helps', 'Pawly 能帮你做什么')}>
        {features.map(([number,title,description])=><article key={number}><span className="pilot-step">{number}</span><h2>{title}</h2><p>{description}</p></article>)}
      </section>

      <section className="pilot-contact" id="pilot-contact" aria-labelledby="pilot-contact-title">
        <div><p className="pilot-eyebrow">{L('HELP SHAPE PAWLY', '一起把 Pawly 做得更顺手')}</p><h2 id="pilot-contact-title">{L('Your everyday work.', '从你的日常工作')}<br/>{L('Our starting point.', '开始了解')}</h2><p>{L('Already caring for pets in Singapore? Tell us how you plan visits and keep owners updated. A few messages or a short conversation is a good place to start.', '如果你已经在新加坡提供宠物照护，欢迎聊聊你怎样安排服务、怎样向主人汇报。几封邮件或一次简短交流，就可以开始。')}</p></div>
        <div className="pilot-contact-card">
          <h3>{L('Say hello by email', '通过邮件认识一下')}</h3>
          <p>{L('Introduce your business, the areas you cover and one thing you wish took less time.', '介绍一下你的业务、服务片区，以及一件希望更省时的事。')}</p>
          <a className="pilot-primary" href={mailto}><EnvelopeSimple size={20}/>{L('Email the Pawly team', '给 Pawly 发邮件')}</a>
          <p className="pilot-small">{L('Opens your email app with a short introduction template. Send it there to reach us.', '会打开邮件应用并填入简短介绍模板，需要你在邮件应用中点击发送。')}</p>
          <div className="pilot-email-row"><a href={`mailto:${PILOT_EMAIL}`} className="pilot-email-address">{PILOT_EMAIL}</a><button onClick={copyEmail} className="pilot-copy" aria-label={L('Copy email address', '复制邮箱地址')}><Copy size={18}/></button></div>
          <p role="status" className="pilot-copy-status">{copyStatus === 'copied' ? L('Email copied.', '邮箱已复制。') : copyStatus === 'manual' ? L('Please select and copy the email address above.', '请选中上方邮箱地址后手动复制。') : ''}</p>
          <details className="pilot-email-privacy"><summary>{L('About your email', '关于你的邮件信息')}</summary><p>{L('We use the information you choose to email us to reply, discuss the pilot and review your feedback. Please leave out client names, home addresses and access codes. To stop further contact or request deletion of your enquiry, email us at the same address. No mailing-list subscription is created on this page.', '你主动发来的信息用于回复、沟通试用和整理反馈。请不要发送客户姓名、家庭地址或门锁密码。需要停止联系或申请删除咨询信息，可通过同一邮箱提出。本页面不会为你开通邮件订阅。')}</p></details>
        </div>
      </section>

      <section className="pilot-faq" aria-labelledby="pilot-faq-title"><h2 id="pilot-faq-title">{L('Before you begin', '开始前，了解这些')}</h2><div>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    </main>
    <footer className="pilot-footer"><span className="pilot-footer-brand">Pawly<PawPrint size={17} weight="fill" aria-hidden="true"/></span><span>{L('A little visit. A lot of care.', '小小的到访，认真的照顾')}</span><a href={workspace}>{L('Go to your workbench', '前往你的工作台')}<ArrowRight size={16}/></a></footer>
  </div>;
}
