<div align="center">
  <img src="src/assets/logo.svg" alt="Yuefu Logo" width="120" />
  <h1>Yuefu (乐府)</h1>
  <p><b>基于多模态大模型与智能 Agent 的 OMR 乐谱解析与高性能可视化引擎</b></p>
 
  
  <p>
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.x-brightgreen.svg" alt="Vue 3"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript"></a>
    <a href="https://spring.io/projects/spring-boot"><img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F.svg" alt="Spring Boot"></a>
    <a href="https://developer.android.com/jetpack/compose"><img src="https://img.shields.io/badge/Jetpack_Compose-Android-4285F4.svg" alt="Jetpack Compose"></a>
  </p>
</div>

## 📖 项目简介 (Introduction)

**乐府 (Yuefu)** 是一款面向音乐学习者的智能乐谱理解与即时预览工具。用户只需拍摄或导入纸质乐谱、扫描件，系统即可通过**端到端 AI 光学音乐识别 (OMR)** 技术自动将五线谱转化为结构化音乐数据，并即时生成可听音频与可视化演奏演示，实现**“即拍即听、所见即所听”**。

项目核心定位是满足用户“**听其大略**”的高频需求，极大地降低了五线谱的识谱门槛。同时，本项目不仅是一个跨平台应用，更深层次地融合了**视觉大模型**、**长链推理 (Long-chain reasoning)** 与**多 Agent 协同架构**，展现了极高的系统复杂度和前沿 AI 的落地深度。

## ✨ 核心特性与多 Agent 协同链路 (Core Features & AI Agents)

本项目打通了“**识别-试听-可视化-导出**”的完整闭环，并采用了创新的多 Agent 协同开发与运行范式，具备庞大的 Token 吞吐需求：

### 1. 解析 Agent（多模态长链图文推理）
摒弃传统的启发式 OMR 算法，本项目核心引入了基于 **Legato** 的端到端多模态视觉语言模型（如融合 Llama-3.2-11B-Vision 视觉编码器与 Transformer 自回归解码器）。
- **长上下文纠错**：解析 Agent 利用深度长链推理智能修正复杂的跨行、跨系统乐谱识别误差，实现从“乐谱图像”到“音乐语义序列 (ABC/MusicXML)”的直接映射。
- **双精度模型自适应**：
  - **正声 (Full Precision)**：全精度模型，满足极其苛刻的专业识别需求。
  - **清商 (Half Precision)**：半精度量化模型，极速响应，适合快速浏览主干结构。

### 2. 编码 Agent（底层架构与高性能渲染）
乐谱的底层渲染（OpenSheetMusicDisplay）和数据解析过程涉及庞大且复杂的 AST（抽象语法树）计算逻辑。开发过程中深度依赖代码生成 Agent 辅助构建：
- **钢琴瀑布流与高帧率渲染**：将音符解析为彩色下落条块，与虚拟钢琴键盘及合成音频严格同步（Canvas / 响应式状态）。
- **分布式云原生架构**：使用 Agent 辅助编写基于阿里云函数计算 (FC) Serverless 容器的弹性调度逻辑，以及 Spring Boot 的任务状态机。

### 3. 创作与重构 Agent（AI 音乐编配与逻辑保障）
- **AI 音乐编配**：支持将 OMR 识别后的结构化乐谱输入 AI 模型，结合提示词进行风格转换、乐器替换和即兴编配。
- **底层测试生成**：在开发 ABC 转 MusicXML 的自定义解析器时，利用 Agent 自动化生成严密的词法/语法分析节点代码与海量单元测试。

## 🏗️ 系统架构 (System Architecture)

系统采用 **C/S 架构 + Serverless** 三层弹性设计，支持高并发的 AI 推理请求：

- **客户端层 (Client)**：
  - **Web SPA**: Vue 3 + TypeScript + Vite 构建的交互式前端。
  - **Android App**: 基于 Jetpack Compose 构建的原生移动端。
- **后端服务层 (Server)**：
  - **Spring Boot**: 处理 RESTful API 路由、用户鉴权、任务状态管理、ABC 到 MusicXML 的格式流转换，以及 AI 编配的 WebSocket 代理。
- **云函数层 (Serverless)**：
  - **阿里云函数计算 (FC) + Docker**: 弹性部署庞大的 Legato OMR 端到端深度学习模型，支持 GPU 实例按需弹缩。

## 🚀 技术栈选型 (Tech Stack)

| 领域 | 核心技术 | 描述 |
|------|---------|------|
| **前端 (Web)** | Vue 3, TypeScript, Pinia, TailwindCSS | 响应式 Web 应用基座 |
| **前端 (移动)** | Android, Jetpack Compose, Room | 原生 Android 客户端与本地持久化 |
| **乐谱渲染** | OpenSheetMusicDisplay (OSMD) | 高性能 MusicXML 渲染 |
| **音频合成** | Tone.js, FluidSynth, Timidity++ | MIDI 软音源实时渲染引擎 |
| **后端网关** | Java, Spring Boot, Dom4j, Retrofit | 微服务、XML 处理与网络调度 |
| **AI 模型层** | Legato (Llama-3.2 Vision + Transformer) | 端到端 OMR 视觉大模型 |
| **基础设施** | 阿里云 FC (Serverless), Docker | AI 计算节点的容器化与弹性伸缩 |

## 📦 本地开发指南 (Local Development)

```bash
# 1. 克隆代码仓库
git clone https://github.com/your-username/yuefu.git
cd yuefu

# 2. 安装 Web 端项目依赖 (推荐使用 pnpm)
pnpm install

# 3. 环境变量配置
cp .env.example .env.development
# 务必在 .env.development 中正确配置 VITE_API_BASE_URL (对应 Spring Boot 后端)

# 4. 启动开发服务器
pnpm dev
```

### 生产环境构建

```bash
# 严格类型检查并打包生产版本
pnpm build
```

## 🛠️ 工程量与高复杂度声明 (Project Complexity Declaration)

乐府项目立足于从物理介质向可交互数字化形态转化的前沿，涉及**多模态图像的深度结构解析**、**跨模态音频映射**与**大规模云原生架构生成**。

在此项目中，大模型不再是简单的对话工具，而是以核心“开发者”与“解析器”的身份深度切入到了极为复杂的工程化链路中。不论是前期海量底层解析代码与 Serverless 调度的编写推演，还是后期云端解析 Agent 在真实环境中的高并发图文长链推理，都呈现出极高的日均 Token 吞吐需求。本项目是 AI 深度赋能垂直领域的重度实践标杆，并致力于通过无障碍设计打破视觉障碍者的音乐学习壁垒。

## 📄 许可证 (License)

[MIT License](LICENSE) © 2024-2026 希望之峰小队 (Yuefu Team)
