import React, {lazy, Suspense} from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./mobile.css";

// Keep the invitation lightweight; load the workbench only when it is opened.
const isPilot = new URLSearchParams(location.search).get('view') === 'pilot';
const Page = lazy(() => isPilot ? import('./Pilot.jsx') : import('./App.jsx').then(module => ({default: module.App})));
const loading = new URLSearchParams(location.search).get('lang') === 'zh' ? '正在打开 Pawly…' : 'Opening Pawly…';

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<p role="status" style={{padding:'32px',fontSize:'16px'}}>{loading}</p>}><Page /></Suspense>
  </React.StrictMode>,
);
