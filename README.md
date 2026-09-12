# SocialPulse (记忆脉搏)

SocialPulse 是一个轻量级、专注于个人人脉与互动记忆整理的 Web 应用原型。

帮助你记住身边重要的人是谁、彼此之间发生过什么互动，以及关于TA需要记住的关键细节。

## 🌟 核心功能

1. **人物列表与多维检索**：支持按姓名、所属机构、职位、标签和城市实时筛选。
2. **人物档案详情**：清晰呈现人物简介、关键事实要点与标签。
3. **互动历史时间轴**：按时间倒序排列互动记录，标注互动方式（线下碰面、电话、消息、邮件、视频会议等）与提取的事实。
4. **手动添加人物**：便捷录入新人物的基础信息与关键记忆点。
5. **结构化记忆导入 (Schema 1.0)**：
   - 支持粘贴 AI 生成的结构化 JSON 格式。
   - 自动校验字段完整性与数据格式。
   - 提供直观的导入预览与确认机制。
   - **同名联系人识别**：当检测到同名联系人时，自动将互动记录关联至已有档案，避免重复创建人物。
6. **本地数据持久化**：基于 `localStorage` 自动保存与还原数据。

7. **✨ AI 整理（Cloudflare Workers AI）**：
   - 在「导入结构化记忆」中直接输入一段自然语言，由 Worker 端 `POST /api/extract` 调用 Workers AI 生成 Schema 1.0 JSON。
   - 结果会填入同一个预览/确认流程，仍需人工确认后才保存；手动粘贴 JSON 保留为离线备援。
   - 模型由 `wrangler.jsonc` 的 `AI_MODEL` 变量决定（默认 `@cf/meta/llama-3.3-70b-instruct-fp8-fast`），可在 Cloudflare Dashboard 覆写。

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式方案**：原生现代 CSS (简洁双栏响应式布局)
- **代码规范**：Oxlint

## 🚀 启动与开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 本地联调 Worker + Workers AI（需先 npm run build；另开终端跑 npm run dev 时 /api 会代理到 :8787）
npm run cf:dev

# 手动部署到 Cloudflare（通常由 GitHub 推送自动触发，无需手动执行）
npm run deploy
```

## ☁️ Cloudflare 部署

项目以 **Cloudflare Worker + Static Assets** 形式部署，配置见 `wrangler.jsonc`：

- `worker/index.ts`：Worker 入口，处理 `/api/extract`，其余请求交给静态资源（SPA fallback）。
- `assets.directory = ./dist`，`ai.binding = AI`（Workers AI）。
- Dashboard 构建命令 `npm run build`，部署命令 `npx wrangler deploy`。
