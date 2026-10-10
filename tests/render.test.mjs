import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'vite';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
test('web workbench renders seed state, task controls, navigation and resolvable local assets',async()=>{
 await build({root,logLevel:'silent',build:{ssr:'src/App.jsx',outDir:'.qa-render',emptyOutDir:true}});
  const {App}=await import('../.qa-render/App.js');
  const html=renderToStaticMarkup(React.createElement(App));
  for(const expected of ['Pawly','Every visit, thoughtfully done.','Caring for','Oliver','Schedule','Clients &amp; pets','Care reports','Preview care report','New visit'])assert.ok(html.includes(expected),expected);
  assert.equal((html.match(/type="checkbox"/g)||[]).length,5);
  assert.equal((html.match(/checked=""/g)||[]).length,2);
  for(const [,src] of html.matchAll(/src="(\/assets\/[^"]+)"/g))assert.ok(existsSync(root+'public'+src),src);
});

test('an explicit Chinese entry remains Chinese when the default entry is English',async()=>{
 const {App}=await import('../.qa-render/App.js');const prior=globalThis.location;
 try {
  globalThis.location={search:'?lang=zh&design=1&view=work'};
  const html=renderToStaticMarkup(React.createElement(App));
  for(const expected of ['Pawly','把每一次照顾，放在心上','正在照顾','团团','预览服务报告'])assert.ok(html.includes(expected),expected);
 } finally {if(prior===undefined)delete globalThis.location;else globalThis.location=prior;}
});

test('English workspace, templates and pricing render their localized flows',async()=>{
 const {App}=await import('../.qa-render/App.js');
 const prior=globalThis.location;
 try {
  for(const [view,expected] of [['work',['Every visit, thoughtfully done.','Caring for','Oliver','Care checklist']],['clients',['Care templates','My clients','Milo &amp; Luna','Edit profile','Example · editable']],['plans',['Free beta','Excel','PDF','Not available yet']]]){
   globalThis.location={search:'?lang=en&design=1&view='+view};
   const html=renderToStaticMarkup(React.createElement(App));
   for(const text of expected)assert.ok(html.includes(text),view+': '+text);
  }
 } finally {if(prior===undefined)delete globalThis.location;else globalThis.location=prior;}
});
