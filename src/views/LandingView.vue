<template>
  <div class="landing-root" :class="{ 'is-leaving': isLeaving }">

    <!-- ░░ 背景层：纸张纹理 + 水彩晕染 ░░ -->
    <div class="bg-layer">
      <!-- 水彩底图（引用 header1.jpg，极低透明度） -->
      <div class="bg-watercolor"></div>
      <!-- 纸张细颗粒纹理（引用 backgroud.jpg） -->
      <div class="bg-paper"></div>
      <!-- 中心暖光晕 -->
      <div class="bg-glow"></div>
    </div>

    <!-- ░░ 顶部品牌标识 ░░ -->
    <header class="landing-header" :class="{ visible: contentVisible }">
      <div class="logo-wrap">
        <img src="@/assets/logo.svg" alt="乐府" class="logo-img" />
        <span class="logo-name">乐府</span>
      </div>
      <span class="logo-sub">Sheet Music Engine</span>
    </header>

    <!-- ░░ 主内容区 ░░ -->
    <main class="landing-main">

      <!-- 大标题 -->
      <div class="hero-text" :class="{ visible: contentVisible }">
        <p class="hero-eyebrow">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-label">AI 驱动的乐谱识别引擎</span>
          <span class="eyebrow-line"></span>
        </p>
        <h1 class="hero-title">
          <span class="title-line title-line--1">让每一张</span>
          <span class="title-line title-line--2">纸质乐谱</span>
          <span class="title-line title-line--3 title-accent">都能被聆听</span>
        </h1>
        <p class="hero-desc">
          拍摄或上传乐谱图片，AI 引擎自动识别音符与结构，<br class="br-desktop" />
          秒级转换为可演奏的数字乐谱文件。
        </p>
      </div>

      <!-- 功能简介三列 -->
      <div class="features-row" :class="{ visible: contentVisible }">
        <div
          v-for="(feat, i) in features"
          :key="feat.label"
          class="feature-item"
          :style="{ transitionDelay: `${0.55 + i * 0.08}s` }"
        >
          <div class="feat-icon">{{ feat.icon }}</div>
          <div class="feat-label">{{ feat.label }}</div>
          <div class="feat-desc">{{ feat.desc }}</div>
        </div>
      </div>

    </main>

    <!-- ░░ 滚动 / 点击进入提示 ░░ -->
    <footer class="landing-footer" :class="{ visible: contentVisible }">
      <button class="enter-btn" @click="handleEnter" :disabled="isLeaving">
        <span class="enter-text">进入工作台</span>
        <span class="enter-arrow-wrap">
          <span class="enter-arrow"></span>
        </span>
      </button>
      <div class="scroll-indicator" @click="handleEnter">
        <div class="scroll-dot"></div>
        <div class="scroll-line-track">
          <div class="scroll-line-fill"></div>
        </div>
        <span class="scroll-label">向下滑动</span>
      </div>
    </footer>

    <!-- ░░ 离场遮罩 ░░ -->
    <div class="leave-mask" :class="{ active: isLeaving }"></div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const contentVisible = ref(false);
const isLeaving = ref(false);

const features = [
  {
    icon: '⌕',
    label: '智能识谱',
    desc: '两款 AI 引擎，清商模型快速响应，正声模型精密解析复杂乐谱'
  },
  {
    icon: '◎',
    label: '引导式拍摄',
    desc: '三步拍摄引导，可手动校正对比度与亮度，纸质乐谱精准识别'
  },
  {
    icon: '▷',
    label: '在线演奏',
    desc: '识别完成后即可在浏览器内播放，支持 MXL 格式一键导出'
  }
];

onMounted(() => {
  const hasVisited = localStorage.getItem('yf_visited');

  if (hasVisited) {
    router.replace('/workbench');
    return;
  }

  localStorage.setItem('yf_visited', 'true');

  requestAnimationFrame(() => {
    setTimeout(() => {
      contentVisible.value = true;
    }, 80);
  });

  window.addEventListener('wheel', handleScrollEnter, { once: true, passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
});

let touchStartY = 0;

const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
  window.addEventListener('touchend', handleTouchEnd, { once: true });
};

const handleTouchEnd = (e) => {
  const deltaY = touchStartY - e.changedTouches[0].clientY;
  if (deltaY > 30) {
    handleEnter();
  } else {
    window.addEventListener('touchstart', handleTouchStart, { once: true, passive: true });
  }
};

const handleScrollEnter = () => {
  handleEnter();
};

const handleEnter = () => {
  if (isLeaving.value) return;
  isLeaving.value = true;

  window.removeEventListener('wheel', handleScrollEnter);
  window.removeEventListener('touchstart', handleTouchStart);

  // 遮罩动画完成后路由跳转
  setTimeout(() => {
    router.push('/workbench');
  }, 680);
};
</script>

<style scoped>
.landing-root {
  --c-ink:       #1C1C1E;
  --c-ink-soft:  #3A3632;
  --c-warm:      #C4A882;
  --c-warm-lt:   #E8D5BB;
  --c-smoke:     #8B8078;
  --c-bg:        #F5F0E8;
  --c-accent:    #E8A87C;

  position: fixed;
  inset: 0;
  overflow: hidden;
  background: var(--c-bg);
  font-family: 'PingFang SC', 'Noto Serif SC', 'Hiragino Mincho ProN', Georgia, serif;
}

/* ============================================
   背景层
   ============================================ */
.bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* 水彩底图：铺满全屏，极低透明度覆盖在右上区域 */
.bg-watercolor {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/header1.jpg');
  background-size: cover;
  background-position: center top;
  opacity: 0.08;
  mix-blend-mode: multiply;
}

/* 纸张纹理：覆盖全屏，极淡颗粒感 */
.bg-paper {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/backgroud.jpg');
  background-size: 600px;
  background-repeat: repeat;
  opacity: 0.18;
  mix-blend-mode: multiply;
}

/* 中心暖光晕 */
.bg-glow {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70vw;
  height: 50vh;
  background: radial-gradient(
    ellipse at center,
    rgba(196, 168, 130, 0.18) 0%,
    rgba(232, 168, 124, 0.08) 40%,
    transparent 72%
  );
  border-radius: 50%;
  animation: glowPulse 6s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 0.7; transform: translate(-50%, -50%) scale(1.08); }
}

/* ============================================
   通用入场动画基类
   ============================================ */
.landing-header,
.hero-text,
.features-row,
.landing-footer {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
  transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-header.visible  { opacity: 1; transform: none; transition-delay: 0.0s; }
.hero-text.visible       { opacity: 1; transform: none; transition-delay: 0.18s; }
.features-row.visible    { opacity: 1; transform: none; transition-delay: 0.42s; }
.landing-footer.visible  { opacity: 1; transform: none; transition-delay: 0.65s; }

/* ============================================
   顶部品牌
   ============================================ */
.landing-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 40px;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
}

.logo-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-ink);
  letter-spacing: -0.02em;
}

.logo-sub {
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--c-smoke);
  font-family: 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
}

/* ============================================
   主内容
   ============================================ */
.landing-main {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  padding: 0 24px;
  padding-bottom: 80px;
}

/* --- 英雄区文字 --- */
.hero-text {
  text-align: center;
  max-width: 600px;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.eyebrow-line {
  display: block;
  width: 32px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--c-warm));
}

.eyebrow-line:last-child {
  background: linear-gradient(to left, transparent, var(--c-warm));
}

.eyebrow-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--c-smoke);
  font-family: 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-weight: 500;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
}

.title-line {
  display: block;
  font-size: clamp(42px, 8vw, 72px);
  font-weight: 700;
  color: var(--c-ink);
  letter-spacing: -0.035em;
  line-height: 1.05;
  /* 每行单独入场 */
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-text.visible .title-line--1 { opacity: 1; transform: none; transition-delay: 0.25s; }
.hero-text.visible .title-line--2 { opacity: 1; transform: none; transition-delay: 0.33s; }
.hero-text.visible .title-line--3 { opacity: 1; transform: none; transition-delay: 0.41s; }

.title-accent {
  /* 用 header1.jpg 的暖棕色系做文字颜色，区分其他行 */
  color: var(--c-warm);
  position: relative;
  display: inline-block;
}

/* 标题下的装饰横线 */
.title-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, var(--c-warm-lt), var(--c-accent), var(--c-warm-lt));
  border-radius: 1px;
  opacity: 0.6;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s;
}

.hero-text.visible .title-accent::after {
  transform: scaleX(1);
}

.hero-desc {
  font-size: 15px;
  color: var(--c-smoke);
  line-height: 1.8;
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-weight: 400;
}

.br-desktop { display: inline; }

/* --- 功能三列 --- */
.features-row {
  display: flex;
  gap: 0;
  margin-top: 40px;
  max-width: 580px;
  width: 100%;
}

.feature-item {
  flex: 1;
  text-align: center;
  padding: 0 16px;
  position: relative;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
  transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.features-row.visible .feature-item {
  opacity: 1;
  transform: none;
}

/* 竖向分隔线 */
.feature-item + .feature-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--c-warm-lt), transparent);
}

.feat-icon {
  font-size: 18px;
  color: var(--c-warm);
  margin-bottom: 8px;
  font-family: sans-serif;
}

.feat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-soft);
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  font-family: 'PingFang SC', sans-serif;
}

.feat-desc {
  font-size: 11px;
  color: var(--c-smoke);
  line-height: 1.65;
  font-family: 'PingFang SC', sans-serif;
}

/* ============================================
   底部：进入按钮 + 滚动指示
   ============================================ */
.landing-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-bottom: 36px;
}

/* 进入按钮 */
.enter-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--c-ink);
  color: var(--c-bg);
  border: none;
  border-radius: 40px;
  padding: 12px 28px;
  cursor: pointer;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
  box-shadow: 0 2px 12px rgba(28,28,30,0.12);
}

.enter-btn:hover:not(:disabled) {
  background: var(--c-ink-soft);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(28,28,30,0.18);
}

.enter-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.enter-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.enter-arrow-wrap {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enter-arrow {
  display: block;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid var(--c-bg);
  border-bottom: 1.5px solid var(--c-bg);
  transform: rotate(45deg) translateY(-2px);
  transition: transform 0.2s;
}

.enter-btn:hover .enter-arrow {
  transform: rotate(45deg) translateY(0px);
}

/* 滚动指示器 */
.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.scroll-indicator:hover {
  opacity: 1;
}

.scroll-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--c-warm);
  animation: dotBounce 1.8s ease-in-out infinite;
}

.scroll-line-track {
  width: 1px;
  height: 32px;
  background: rgba(196, 168, 130, 0.2);
  position: relative;
  overflow: hidden;
}

.scroll-line-fill {
  position: absolute;
  top: 0;
  width: 100%;
  background: var(--c-warm);
  animation: lineScroll 1.8s ease-in-out infinite;
}

.scroll-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--c-smoke);
  font-family: 'SF Pro Text', sans-serif;
  margin-top: 2px;
}

@keyframes dotBounce {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50%       { transform: translateY(3px); opacity: 0.6; }
}

@keyframes lineScroll {
  0%   { height: 0%; top: 0; }
  50%  { height: 100%; top: 0; }
  51%  { height: 100%; top: 0; }
  100% { height: 0%; top: 100%; }
}

/* ============================================
   离场遮罩
   ============================================ */
.leave-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #F5F0E8;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}

.leave-mask.active {
  opacity: 1;
  pointer-events: all;
}

/* ============================================
   响应式
   ============================================ */
/* ============================================
   响应式
   ============================================ */
@media (max-width: 640px) {
  /* 修复：解除根容器锁定，允许纵向滚动，并适配 iOS 底部安全区 */
  .landing-root {
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* 修复：取消绝对定位与强行居中，改用相对定位，让内容自然撑开高度 */
  .landing-main {
    position: relative;
    inset: auto;
    min-height: 100vh;
    justify-content: flex-start;
    padding-top: 100px;   /* 为顶部的 header 留出空间 */
    padding-bottom: 140px; /* 为底部的 footer 留出空间，防止滚动到底部时被遮挡 */
  }

  /* 修复：将底部操作区改为固定定位，并添加渐变背景，避免滚动时与下方文字重叠混乱 */
  .landing-footer {
    position: fixed;
    background: linear-gradient(to top, var(--c-bg) 50%, rgba(245, 240, 232, 0));
    padding-top: 30px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }

  .landing-header {
    padding: 20px 20px;
  }

  .logo-sub {
    display: none;
  }

  /* 优化：适当缩小移动端大标题字号，释放垂直高度 */
  .title-line {
    font-size: clamp(34px, 10vw, 42px);
  }

  .hero-eyebrow {
    margin-bottom: 16px;
  }

  .hero-title {
    margin-bottom: 16px;
  }

  .hero-desc {
    font-size: 13px;
  }

  .br-desktop {
    display: none;
  }

  /* 优化：压缩功能区块的垂直间距 */
  .features-row {
    flex-direction: column;
    gap: 12px;
    align-items: center;
    margin-top: 24px;
  }

  .feature-item {
    max-width: 100%;
    padding: 12px 16px;
  }

  .feature-item + .feature-item::before {
    display: none;
  }

  .feature-item + .feature-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--c-warm-lt), transparent);
  }

  .enter-btn {
    padding: 11px 24px;
    font-size: 13px;
  }
}

@media (max-width: 380px) {
  .title-line {
    font-size: 32px;
  }
}
</style>
