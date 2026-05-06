<div align="center">
  <img src="src/assets/logo.svg" alt="Yuefu Logo" width="120" />
  <h1>乐府 (Yuefu)</h1>
  <p><b>AI 驱动的乐谱识别与可视化演奏引擎</b></p>

  <p>
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D.svg" alt="Vue 3"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg" alt="TypeScript"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7.x-646CFF.svg" alt="Vite"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4.svg" alt="TailwindCSS"></a>
  </p>
</div>

## 简介

**乐府**是一款面向音乐学习者的智能乐谱识别与演奏工具。用户上传纸质乐谱图片后，系统通过 AI 光学音乐识别（OMR）技术自动解析五线谱结构，生成可交互的数字乐谱，并支持实时音频播放与可视化演奏演示。

核心定位是降低五线谱的识谱门槛，实现「即拍即听、所见即所听」。

## 功能特性

| 模块 | 说明 |
|------|------|
| **乐谱识别** | 上传乐谱图片，AI 自动识别音符、节拍与结构 |
| **乐谱可视化** | 基于 OpenSheetMusicDisplay 渲染高精度五线谱 |
| **实时演奏** | 使用 Tone.js 合成音频，支持播放控制与速度调节 |
| **AI 音乐创作** | 基于识别结果进行风格转换与智能编配 |
| **乐谱库管理** | 本地浏览、编辑与组织识别后的乐谱 |

## 技术栈

| 领域 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 样式 | TailwindCSS v4 |
| UI 组件 | Ant Design Vue |
| 乐谱渲染 | OpenSheetMusicDisplay |
| 音频合成 | Tone.js |
| 构建工具 | Vite + vue-tsc |
| 代码质量 | ESLint + Oxlint + Prettier |

## 项目结构

```
src/
├── api/              # API 接口与 WebSocket
├── assets/           # 静态资源（图片、样式、字体）
├── components/       # 可复用组件
│   ├── ActionCards.vue
│   ├── CoreScanCard.vue
│   ├── HeroSection.vue
│   ├── RecentScoresList.vue
│   ├── ScoreEditor.vue
│   ├── ScoreUploader.vue
│   └── SurveyModal.vue
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
└── views/            # 页面视图
    ├── LandingView.vue      # 落地页
    ├── HomeView.vue         # 工作台
    ├── ScoreView.vue        # 乐谱库
    ├── PlayView.vue         # 演奏页
    ├── AiMusicView.vue      # AI 创作
    └── AboutView.vue        # 关于
```

## 本地开发

**环境要求**
- Node.js: `^20.19.0 || >=22.12.0`
- pnpm (推荐)

**启动步骤**

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.development
# 按需修改 VITE_API_BASE_URL 与 VITE_PROXY_TARGET

# 3. 启动开发服务器
pnpm dev
```

**常用命令**

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（含热更新） |
| `pnpm build` | 类型检查并构建生产包 |
| `pnpm preview` | 预览生产构建 |
| `pnpm lint` | 运行 ESLint + Oxlint |
| `pnpm format` | 运行 Prettier 格式化 |
| `pnpm type-check` | 运行 TypeScript 类型检查 |

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 基础路径 | `/api` |
| `VITE_PROXY_TARGET` | 开发代理目标地址 | — |

## 浏览器支持

- Chrome / Edge (最新 2 个版本)
- Firefox (最新 2 个版本)
- Safari (最新 2 个版本)

## 许可证

[MIT License](LICENSE) © 2024-2026 乐府团队
