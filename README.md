# Pawly · 中英双语宠物照顾工作台

面向独立宠物照护人和小型工作室的响应式 Web MVP，由朱家熠结合 AI 辅助开发完成。把宠物照顾要求、服务排期、到访任务和服务报告放在同一工作台中。

- [在线体验（中文）](https://petcare-notes.qsgeorge897.chatgpt.site/?lang=zh)
- [在线体验（英文）](https://petcare-notes.qsgeorge897.chatgpt.site/?lang=en)
- [Figma 设计稿](https://www.figma.com/design/8HeGRKUmHSoxVLAeglgcIr)（访问取决于文件分享权限）

## 已实现

- 中英双语、桌面三栏工作台及手机单栏/底部导航。
- 可编辑宠物照顾模板、独立客户档案和服务排期。
- 到访任务勾选、照片及观察记录、异常说明。
- 完成服务后生成报告；报告修订保留历史快照。
- 服务/客户筛选、Excel 多工作表导出、单份照片 PDF 报告及 JSON 备份。
- 浏览器本地保存；`?design=1` 为不持久化的独立演示模式。

## 技术与结构

React 19、Vite、JavaScript、CSS；ExcelJS、pdf-lib、html2canvas、Phosphor Icons。

| 位置 | 用途 |
| --- | --- |
| `src/domain.js` | 服务安排、任务校验、完成报告和修订逻辑 |
| `src/international.js` | 中英双语与示例数据迁移 |
| `src/App.jsx` / `src/Mobile.jsx` | 桌面及移动工作流 |
| `src/export-data.js` / `src/export-files.js` | 筛选、Excel/PDF 导出 |
| `tests/` | 编辑、历史保护、双语、导出与渲染回归测试 |

## 本地运行

使用 Node.js 20+ 和 npm：

```sh
npm install
npm run dev
npm test
npm run build
```

打开 `http://127.0.0.1:4173/?design=1&lang=zh`。生产构建输出为 `dist/client/`。也可使用 pnpm 安装现有锁文件中的依赖。

## 范围与隐私

这是可交互的 Web MVP，不是已上架的原生 App。当前没有账号认证、云端同步、真实跨设备主人确认、自动派单或支付。模板、报告、确认状态均包含演示内容，不能作为真实订单、收入或用户量证明。用户自行输入的数据保存在其浏览器，不随本仓库上传。

公开仓库由已保存的网站源代码整理而来，移除了部署身份配置、私人开发笔记及历史 Git 元数据；试用页联系地址改为不可投递的占位符。原在线演示未修改。原项目引用的微信小程序和工作区外部测试不在此次 Web 源码导出范围内，因此运行脚本已调整为独立 Web 版本。

## 素材与使用

保留网站已有的示例图片以展示实际界面。本导出未附带素材原始授权凭证，不声明图片获得额外的开源再分发或商用许可。代码公开用于作品展示；未添加开放源代码许可证，第三方依赖遵循其各自许可证。生产使用前应核对素材权利并替换示例内容。
