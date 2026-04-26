<template>
  <div class="editor-root font-sans select-none">

    <!-- 背景纹理层 -->
    <div class="editor-bg">
      <div class="editor-bg-paper"></div>
      <div class="editor-bg-glow"></div>
    </div>

    <!-- ══ 顶部导航栏 ══ -->
    <header class="editor-header">
      <div class="editor-header-inner">

        <!-- 返回按钮 -->
        <button @click="$emit('cancel')" class="btn-back">
          <arrow-left-outlined class="btn-back-icon" />
          <span class="btn-back-label">返回</span>
        </button>

        <!-- 中心标题（移动端） -->
        <div class="header-title-mobile">
          <h2 class="header-title-text">图片预处理</h2>
        </div>

        <!-- 桌面端标题 -->
        <div class="header-title-desktop">
          <h2 class="header-title-lg">图片预处理</h2>
          <p class="header-subtitle">
            裁剪去除背景，调整参数使
            <em class="header-em">五线谱与音符黑白分明</em>，大幅提升识别率
          </p>
        </div>

        <!-- 确认按钮 -->
        <button
          @click="handleConfirm"
          :disabled="isProcessing"
          class="btn-confirm"
          :class="{ 'btn-confirm--loading': isProcessing }"
        >
          <loading-outlined v-if="isProcessing" class="btn-confirm-spin" />
          <span>{{ isProcessing ? (isMobileMode ? '处理中' : '正在处理…') : (isMobileMode ? '完成' : '确认并上传') }}</span>
        </button>

      </div>
      <!-- header 底部金线 -->
      <div class="header-gold-line"></div>
    </header>

    <!-- ══ 图片预览区 ══ -->
    <main class="editor-canvas">
      <div class="canvas-inner" :style="{ filter: previewFilter }">
        <div class="image-frame">
          <img
            ref="imageRef"
            :src="imageUrl"
            class="preview-img"
            :class="isMobileMode ? 'preview-img--mobile' : 'preview-img--desktop'"
            @load="initCropper"
          />
        </div>
      </div>

      <!-- 裁剪提示浮条 -->
      <transition name="crop-hint">
        <div v-if="isCropping" class="crop-hint-pill">
          <span class="crop-hint-dot"></span>
          请拖拽选框，剔除无关背景
        </div>
      </transition>
    </main>

    <!-- ══ 桌面端底部控制面板 ══ -->
    <footer class="editor-panel desktop-panel">
      <div class="panel-inner">
        <div class="sliders-grid">

          <!-- 亮度 -->
          <div class="slider-row">
            <div class="slider-meta">
              <div class="slider-icon-wrap slider-icon-wrap--warm">
                <thunderbolt-outlined class="slider-icon" />
              </div>
              <div class="slider-info">
                <span class="slider-name">亮度</span>
                <span class="slider-hint">过亮会导致五线谱断裂，请谨慎调节</span>
              </div>
            </div>
            <span class="slider-value slider-value--warm">{{ brightness }}</span>
            <input
              type="range" v-model="brightness" min="0" max="100"
              class="warm-range" style="--thumb: #C4A882; --track: rgba(196,168,130,0.18);"
            />
          </div>

          <!-- 对比度 -->
          <div class="slider-row">
            <div class="slider-meta">
              <div class="slider-icon-wrap slider-icon-wrap--smoke">
                <bg-colors-outlined class="slider-icon" />
              </div>
              <div class="slider-info">
                <span class="slider-name">对比度</span>
                <span class="slider-hint">适当调高可消除褶皱阴影，使墨迹更黑</span>
              </div>
            </div>
            <span class="slider-value slider-value--smoke">{{ contrast }}</span>
            <input
              type="range" v-model="contrast" min="0" max="100"
              class="warm-range" style="--thumb: #8B8078; --track: rgba(139,128,120,0.15);"
            />
          </div>

        </div>

        <!-- 操作按钮行 -->
        <div class="panel-actions">
          <button @click="toggleCropModePC" class="action-btn" :class="{ 'action-btn--active': isCropping }">
            <scissor-outlined :class="{ 'action-btn-spin': isCropping }" />
            <span>{{ isCropping ? '完成裁剪' : '自由裁剪' }}</span>
          </button>
          <button @click="handleReset" class="action-btn action-btn--ghost">
            <undo-outlined />
            <span>全部重置</span>
          </button>
        </div>
      </div>
    </footer>

    <!-- ══ 移动端底部工具栏 ══ -->
    <footer class="editor-panel mobile-panel">

      <!-- 弹出参数面板 -->
      <transition name="float-up">
        <div
          v-if="activeTab === 'brightness' || activeTab === 'contrast'"
          class="mobile-float-panel"
        >
          <!-- 亮度面板 -->
          <div v-show="activeTab === 'brightness'" class="float-content">
            <div class="float-row">
              <div>
                <span class="float-name">
                  <thunderbolt-outlined class="float-name-icon float-name-icon--warm" />
                  亮度
                </span>
                <p class="float-desc">过亮会导致五线谱断裂，请谨慎调节</p>
              </div>
              <div class="float-badge float-badge--warm">{{ brightness }}</div>
            </div>
            <input
              type="range" v-model="brightness" min="0" max="100"
              class="warm-range warm-range--mobile" style="--thumb: #C4A882; --track: rgba(196,168,130,0.2);"
            />
          </div>

          <!-- 对比度面板 -->
          <div v-show="activeTab === 'contrast'" class="float-content">
            <div class="float-row">
              <div>
                <span class="float-name">
                  <bg-colors-outlined class="float-name-icon float-name-icon--smoke" />
                  对比度
                </span>
                <p class="float-desc">适当调高可消除褶皱阴影，使墨迹更黑</p>
              </div>
              <div class="float-badge float-badge--smoke">{{ contrast }}</div>
            </div>
            <input
              type="range" v-model="contrast" min="0" max="100"
              class="warm-range warm-range--mobile" style="--thumb: #8B8078; --track: rgba(139,128,120,0.18);"
            />
          </div>
        </div>
      </transition>

      <!-- 工具栏按钮行 -->
      <div class="mobile-toolbar">

        <button
          @click="toggleTab('brightness')"
          class="tool-btn"
          :class="activeTab === 'brightness' ? 'tool-btn--warm' : 'tool-btn--idle'"
        >
          <thunderbolt-outlined class="tool-btn-icon" />
          <span class="tool-btn-label">亮度</span>
        </button>

        <button
          @click="toggleTab('contrast')"
          class="tool-btn"
          :class="activeTab === 'contrast' ? 'tool-btn--smoke' : 'tool-btn--idle'"
        >
          <bg-colors-outlined class="tool-btn-icon" />
          <span class="tool-btn-label">对比度</span>
        </button>

        <div class="toolbar-divider"></div>

        <button
          @click="toggleCropModeMobile"
          class="tool-btn"
          :class="isCropping ? 'tool-btn--ink' : 'tool-btn--idle'"
        >
          <scissor-outlined class="tool-btn-icon" />
          <span class="tool-btn-label">{{ isCropping ? '完成' : '裁剪' }}</span>
        </button>

        <button @click="handleReset" class="tool-btn tool-btn--idle tool-btn--reset">
          <undo-outlined class="tool-btn-icon" />
          <span class="tool-btn-label">重置</span>
        </button>

      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import {
  ArrowLeftOutlined, ThunderboltOutlined, BgColorsOutlined,
  ScissorOutlined, UndoOutlined, LoadingOutlined
} from '@ant-design/icons-vue';

const props = defineProps({
  rawFile: { type: File, required: true }
});
const emit = defineEmits(['cancel', 'submit']);

const imageRef    = ref(null);
const imageUrl    = ref('');
const brightness  = ref(50);
const contrast    = ref(50);
const isCropping  = ref(false);
const isProcessing = ref(false);
const activeTab   = ref(null);
let cropperInstance = null;

const isMobileMode = ref(window.innerWidth < 768);
const handleResize = () => { isMobileMode.value = window.innerWidth < 768; };

const previewFilter = computed(() => {
  const b = (brightness.value / 50) * 100;
  const c = (contrast.value / 50) * 100;
  return `brightness(${b}%) contrast(${c}%)`;
});

onMounted(() => {
  if (props.rawFile) imageUrl.value = URL.createObjectURL(props.rawFile);
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  if (cropperInstance) cropperInstance.destroy();
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  window.removeEventListener('resize', handleResize);
});

const initCropper = () => {
  if (cropperInstance) cropperInstance.destroy();
  cropperInstance = new Cropper(imageRef.value, {
    viewMode: 1, dragMode: 'move', autoCrop: false,
    background: false, responsive: true, restore: false,
    ready() { imageRef.value.style.opacity = '1'; }
  });
};

const toggleCropModePC = () => { isCropping.value = !isCropping.value; updateCropperState(); };
const toggleCropModeMobile = () => { activeTab.value = null; isCropping.value = !isCropping.value; updateCropperState(); };

const updateCropperState = () => {
  if (isCropping.value) {
    cropperInstance.setDragMode('crop');
    if (!cropperInstance.getData().width) cropperInstance.crop();
  } else {
    cropperInstance.setDragMode('move');
  }
};

const toggleTab = (tabName) => {
  activeTab.value = activeTab.value === tabName ? null : tabName;
  if (activeTab.value && isCropping.value) { isCropping.value = false; updateCropperState(); }
};

const handleReset = () => {
  brightness.value = 50; contrast.value = 50;
  activeTab.value = null; isCropping.value = false;
  cropperInstance.clear(); cropperInstance.setDragMode('move');
};

const handleConfirm = () => {
  if (!cropperInstance) return;
  activeTab.value = null;
  isProcessing.value = true;
  const canvas = cropperInstance.getCroppedCanvas({ maxWidth: 2048, maxHeight: 2048, fillColor: '#fff' });
  const finalCanvas = document.createElement('canvas');
  const ctx = finalCanvas.getContext('2d');
  finalCanvas.width = canvas.width; finalCanvas.height = canvas.height;
  ctx.filter = previewFilter.value;
  ctx.drawImage(canvas, 0, 0);
  finalCanvas.toBlob((blob) => {
    isProcessing.value = false;
    const ext = props.rawFile.name.split('.').pop() || 'jpg';
    emit('submit', new File([blob], `edit_${Date.now()}.${ext}`, { type: blob.type }));
  }, 'image/jpeg', 0.9);
};
</script>

<style scoped>
/* ══════════════════════════════════════════
   CSS 变量
══════════════════════════════════════════ */
.editor-root {
  --c-bg:       #F5F0E8;
  --c-bg-panel: rgba(250, 247, 242, 0.96);
  --c-ink:      #1C1C1E;
  --c-smoke:    #8B8078;
  --c-warm:     #C4A882;
  --c-warm-lt:  rgba(196, 168, 130, 0.15);
  --c-warm-md:  rgba(196, 168, 130, 0.35);
  --c-border:   rgba(196, 168, 130, 0.2);
  --c-canvas:   #EDE8E0;

  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* ══ 背景层 ══ */
.editor-bg {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
}
.editor-bg-paper {
  position: absolute; inset: 0;
  background-color: var(--c-bg);
  background-image: url('@/assets/backgroud.jpg');
  background-size: 500px;
  background-repeat: repeat;
  opacity: 1;
}
/* 纸张纹理半透明叠加 */
.editor-bg-paper::after {
  content: '';
  position: absolute; inset: 0;
  background: rgba(245, 240, 232, 0.72);
}
.editor-bg-glow {
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: 80%; height: 300px;
  background: radial-gradient(ellipse at 50% 0%,
  rgba(196, 168, 130, 0.1) 0%, transparent 70%);
}

/* ══ Header ══ */
.editor-header {
  position: relative; z-index: 20; flex-shrink: 0;
  background: var(--c-bg-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.editor-header-inner {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
}
@media (min-width: 768px) {
  .editor-header-inner { padding: 14px 32px; }
}
.header-gold-line {
  height: 1px;
  background: linear-gradient(to right,
  transparent, #C4A882 25%, #E8A87C 50%, #C4A882 75%, transparent);
  opacity: 0.55;
}

/* 返回按钮 */
.btn-back {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 20px; border: none;
  background: var(--c-warm-lt);
  color: var(--c-smoke); cursor: pointer;
  transition: all 0.2s; flex-shrink: 0;
}
.btn-back:hover { background: var(--c-warm-md); color: var(--c-ink); }
.btn-back:active { transform: scale(0.96); }
.btn-back-icon { font-size: 13px; transition: transform 0.2s; }
.btn-back:hover .btn-back-icon { transform: translateX(-2px); }
.btn-back-label { font-size: 13px; font-weight: 600; }

/* 移动端标题 */
.header-title-mobile {
  flex: 1; text-align: center;
}
@media (min-width: 768px) { .header-title-mobile { display: none; } }
.header-title-text {
  font-size: 15px; font-weight: 700; color: var(--c-ink); letter-spacing: -0.01em;
}

/* 桌面端标题 */
.header-title-desktop {
  display: none; text-align: center; flex: 1;
}
@media (min-width: 768px) { .header-title-desktop { display: block; } }
.header-title-lg {
  font-size: 22px; font-weight: 800; color: var(--c-ink);
  letter-spacing: -0.03em; margin-bottom: 4px;
}
.header-subtitle {
  font-size: 13px; color: var(--c-smoke); line-height: 1.5;
}
.header-em {
  font-style: normal; font-weight: 700; color: var(--c-warm);
}

/* 确认按钮 */
.btn-confirm {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 20px; border-radius: 20px; border: none;
  background: var(--c-ink); color: var(--c-bg);
  font-size: 13px; font-weight: 700;
  cursor: pointer; flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(28,28,30,0.18);
}
.btn-confirm:hover:not(:disabled) {
  background: #3A3632;
  box-shadow: 0 4px 20px rgba(28,28,30,0.25);
  transform: translateY(-1px);
}
.btn-confirm:active:not(:disabled) { transform: scale(0.97); }
.btn-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-confirm-spin { animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ 画布区 ══ */
.editor-canvas {
  flex: 1; position: relative; z-index: 5;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  background: var(--c-canvas);
  /* 棋盘格纹，柔和版 */
  background-image:
    linear-gradient(45deg, rgba(196,168,130,0.07) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(196,168,130,0.07) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(196,168,130,0.07) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(196,168,130,0.07) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
.canvas-inner {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  transition: filter 0.1s;
}
@media (min-width: 768px) { .canvas-inner { padding: 32px; } }
.image-frame {
  position: relative;
  box-shadow:
    0 0 0 1px rgba(196,168,130,0.25),
    0 8px 40px rgba(28,28,30,0.18),
    0 2px 8px rgba(28,28,30,0.08);
  border-radius: 4px; overflow: hidden;
  background: white;
}
.preview-img {
  display: block; opacity: 0;
  transition: opacity 0.6s ease;
}
.preview-img--mobile  { max-height: 80dvh; max-width: 100%; object-fit: contain; }
.preview-img--desktop { max-height: 62vh; max-width: 100%; }

/* 裁剪提示 */
.crop-hint-pill {
  position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: var(--c-ink); color: var(--c-bg);
  padding: 8px 18px; border-radius: 20px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
  box-shadow: 0 4px 16px rgba(28,28,30,0.25);
  pointer-events: none; white-space: nowrap;
}
.crop-hint-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--c-warm);
  animation: blink 1.2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.crop-hint-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.crop-hint-leave-active { transition: all 0.2s ease; }
.crop-hint-enter-from, .crop-hint-leave-to { opacity:0; transform:translateX(-50%) translateY(-6px) scale(0.95); }

/* ══ 桌面端底部面板 ══ */
.editor-panel { position: relative; z-index: 20; flex-shrink: 0; }
.desktop-panel {
  display: none;
  background: var(--c-bg-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--c-border);
  box-shadow: 0 -8px 32px rgba(196,168,130,0.08);
  border-radius: 28px 28px 0 0;
}
@media (min-width: 768px) { .desktop-panel { display: block; } }

.panel-inner {
  max-width: 860px; margin: 0 auto;
  padding: 24px 32px 28px;
}
.sliders-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px 48px; margin-bottom: 20px;
}
.slider-row { display: flex; flex-direction: column; gap: 10px; }
.slider-meta {
  display: flex; align-items: flex-start; gap: 12px;
}
.slider-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.slider-icon-wrap--warm { background: rgba(196,168,130,0.15); color: var(--c-warm); }
.slider-icon-wrap--smoke { background: rgba(139,128,120,0.12); color: var(--c-smoke); }
.slider-icon { font-size: 16px; }
.slider-info { flex: 1; }
.slider-name  { display: block; font-size: 14px; font-weight: 700; color: var(--c-ink); margin-bottom: 2px; }
.slider-hint  { display: block; font-size: 11px; color: var(--c-smoke); line-height: 1.5; }
.slider-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 20px; font-weight: 800; line-height: 1;
  margin-left: auto; flex-shrink: 0;
}
.slider-value--warm  { color: var(--c-warm); }
.slider-value--smoke { color: var(--c-smoke); }

.panel-actions {
  display: flex; justify-content: center; gap: 12px;
  padding-top: 18px; border-top: 1px solid var(--c-border);
}
.action-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 28px; border-radius: 14px; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
  background: var(--c-warm-lt); color: var(--c-smoke);
}
.action-btn:hover { background: var(--c-warm-md); color: var(--c-ink); }
.action-btn:active { transform: scale(0.97); }
.action-btn--active {
  background: var(--c-ink); color: var(--c-bg);
  box-shadow: 0 2px 12px rgba(28,28,30,0.2);
}
.action-btn--active:hover { background: #3A3632; color: var(--c-bg); }
.action-btn--ghost:hover { background: rgba(220,50,50,0.06); color: #b84040; }
.action-btn-spin { animation: spin 1s linear infinite; }

/* ══ 移动端底部工具栏 ══ */
.mobile-panel {
  display: block;
  background: var(--c-bg-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--c-border);
  box-shadow: 0 -6px 24px rgba(196,168,130,0.1);
  border-radius: 24px 24px 0 0;
  padding-bottom: env(safe-area-inset-bottom, 12px);
}
@media (min-width: 768px) { .mobile-panel { display: none; } }

/* 浮出参数面板 */
.mobile-float-panel {
  position: absolute; bottom: calc(100% + 12px);
  left: 12px; right: 12px;
  background: var(--c-bg-panel);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--c-border);
  border-radius: 20px; padding: 20px;
  box-shadow: 0 -8px 32px rgba(196,168,130,0.12), 0 4px 16px rgba(28,28,30,0.08);
}
.float-up-enter-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.float-up-leave-active { transition: all 0.22s cubic-bezier(0.3,0,0.2,1); }
.float-up-enter-from, .float-up-leave-to { transform: translateY(16px) scale(0.96); opacity: 0; }

.float-content { display: flex; flex-direction: column; gap: 14px; }
.float-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.float-name {
  display: flex; align-items: center; gap: 7px;
  font-size: 15px; font-weight: 700; color: var(--c-ink); margin-bottom: 4px;
}
.float-name-icon { font-size: 15px; }
.float-name-icon--warm  { color: var(--c-warm); }
.float-name-icon--smoke { color: var(--c-smoke); }
.float-desc { font-size: 11px; color: var(--c-smoke); line-height: 1.5; }
.float-badge {
  width: 44px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 15px; font-weight: 800; flex-shrink: 0;
}
.float-badge--warm  { background: rgba(196,168,130,0.14); color: var(--c-warm); }
.float-badge--smoke { background: rgba(139,128,120,0.11); color: var(--c-smoke); }

/* 工具栏按钮行 */
.mobile-toolbar {
  display: flex; align-items: center;
  justify-content: space-around;
  padding: 10px 8px 8px;
}
.toolbar-divider {
  width: 1px; height: 28px; flex-shrink: 0;
  background: linear-gradient(to bottom, transparent, var(--c-border), transparent);
}
.tool-btn {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 4px;
  width: 60px; height: 60px; border-radius: 16px; border: none;
  cursor: pointer; transition: all 0.2s; background: transparent;
}
.tool-btn:active { transform: scale(0.93); }
.tool-btn-icon  { font-size: 22px; line-height: 1; }
.tool-btn-label { font-size: 10px; font-weight: 700; }
.tool-btn--idle { color: var(--c-smoke); }
.tool-btn--idle:hover { background: var(--c-warm-lt); }
.tool-btn--warm  { background: rgba(196,168,130,0.14); color: var(--c-warm); }
.tool-btn--smoke { background: rgba(139,128,120,0.12); color: var(--c-smoke); }
.tool-btn--ink   { background: var(--c-ink); color: var(--c-bg); }
.tool-btn--reset:hover { background: rgba(180,50,50,0.07); color: #b84040; }

/* ══ 统一滑块样式 ══ */
.warm-range {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 6px;
  background: var(--track, rgba(196,168,130,0.18));
  border-radius: 10px; outline: none; cursor: pointer;
}
.warm-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 24px; height: 24px;
  background: #fff; border: 3px solid var(--thumb, #C4A882);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(28,28,30,0.12);
  transition: transform 0.15s, box-shadow 0.15s;
}
.warm-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 12px rgba(28,28,30,0.18);
}
.warm-range--mobile { height: 7px; }
.warm-range--mobile::-webkit-slider-thumb {
  width: 28px; height: 28px;
  margin-top: -10px;
}


:deep(.cropper-view-box) {
  outline: 2px solid var(--c-warm, #C4A882);
}
:deep(.cropper-line)  { background-color: var(--c-warm, #C4A882); }
:deep(.cropper-point) { background-color: var(--c-warm, #C4A882); }
:deep(.cropper-modal) { background: rgba(28,28,30,0.55); }

@media (max-width: 768px) {
  :deep(.cropper-view-box)        { outline-radius: 0; }
  :deep(.cropper-point.point-se)  { width: 20px; height: 20px; right: -10px; bottom: -10px; opacity: 1; }
  :deep(.cropper-modal)           { background: rgba(28,28,30,0.62); }
}
@media (min-width: 768px) {
  :deep(.cropper-point.point-se)  { width: 10px; height: 10px; opacity: 1; }
}
</style>
