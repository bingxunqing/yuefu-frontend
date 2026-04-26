<template>
  <div class="min-h-screen text-[#1C1C1E] transition-all duration-500 pb-20 px-4 md:px-8 lg:px-0 pt-4 md:pt-12 relative overflow-hidden font-sans bg-main-background">

    <!-- 顶部暖色光晕（替换原蓝色光晕） -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-amber-100/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

    <div class="max-w-6xl mx-auto relative z-10">

      <!-- <Teleport to="body">
        <survey-modal
          v-if="showSurvey"
          :is-uploading="isUploading"
          @complete="handleSurveySubmit"
          @skip="handleSurveySkip"
        />
      </Teleport> -->

      <!-- 全屏加载遮罩 — 暖米底色 + 暖棕转圈 -->
      <div
        v-if="isUploading"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fade-in"
        style="background: rgba(245, 240, 232, 0.88); backdrop-filter: blur(12px);"
      >
        <div class="relative w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center">
          <div class="absolute inset-0 border-4 rounded-full" style="border-color: rgba(196,168,130,0.2);"></div>
          <div class="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin-fast" style="border-color: #C4A882; border-top-color: transparent; box-shadow: 0 0 12px rgba(196,168,130,0.15);"></div>
          <camera-filled class="text-2xl md:text-3xl animate-pulse-warm" style="color: #C4A882;" />
        </div>
        <h2 class="font-black text-xl md:text-3xl tracking-tight mb-2" style="color: #1C1C1E;">正在解析乐谱纹理...</h2>
        <p class="text-xs md:text-base font-medium" style="color: #8B8078;">AI 引擎正在高速运转，请勿关闭页面</p>
      </div>

      <Teleport to="body">
        <score-editor
          v-if="selectedFile"
          :raw-file="selectedFile"
          @cancel="selectedFile = null"
          @submit="handleFinalUpload"
          style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; background-color: #F5F0E8;"
        />
      </Teleport>

      <transition name="page-transition" mode="out-in">
        <div :key="isScanning ? 'scanning' : 'main'">

          <hero-section :is-scanning="isScanning" />

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref="cameraInputRef"
            class="hidden"
            @change="handleCameraCapture"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 md:min-h-[420px]">
            <template v-if="!isScanning">

              <core-scan-card @toggle="toggleScanMode" />

              <action-cards />

            </template>

            <template v-else>
              <!-- 移动端返回按钮 -->
              <div class="col-span-1 md:col-span-2 lg:col-span-3 md:hidden mb-1 animate-fade-in" style="animation-delay: 0.05s">
                <div
                  @click="toggleScanMode"
                  class="rounded-2xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm transition-all"
                  style="background: rgba(255,255,255,0.8); border: 1px solid rgba(196,168,130,0.25);"
                >
                  <arrow-left-outlined class="text-base" style="color: #8B8078;" />
                  <span class="font-bold text-sm" style="color: #1C1C1E;">返回控制台主页</span>
                </div>
              </div>

              <!-- 引擎选择 -->
              <div class="col-span-1 md:col-span-2 lg:col-span-3 mb-2 animate-fade-in" style="animation-delay: 0.1s">
                <h3 class="text-xs md:text-sm font-bold uppercase tracking-wider mb-2 md:mb-3 ml-2 drop-shadow-sm" style="color: #8B8078;">Select Processing Engine</h3>
                <div class="rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 flex flex-col md:flex-row gap-1.5 md:gap-2 shadow-md" style="background: rgba(255,255,255,0.9); border: 1px solid rgba(196,168,130,0.2); backdrop-filter: blur(8px);">
                  <div
                    v-for="eng in engineOptions"
                    :key="eng.value"
                    @click="selectedEngine = eng.value"
                    :class="[
                      'flex-1 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] cursor-pointer transition-all duration-300 flex flex-col justify-center items-center relative overflow-hidden',
                    ]"
                    :style="selectedEngine === eng.value
                      ? 'background: #1C1C1E; color: #F5F0E8; box-shadow: 0 4px 16px rgba(28,28,30,0.18); transform: scale(1.02);'
                      : 'background: transparent; color: #8B8078;'"
                  >
                    <div class="relative z-10 font-bold text-sm md:text-lg tracking-tight">{{ eng.label }}</div>
                    <div class="relative z-10 text-[10px] md:text-xs font-medium mt-0.5 md:mt-1"
                         :style="selectedEngine === eng.value ? 'color: rgba(196,168,130,0.8);' : 'color: #8B8078;'"
                    >{{ eng.desc }}</div>
                  </div>
                </div>
              </div>

              <!-- 上传 / 拍摄区 -->
              <div class="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-[45vh] md:h-72 animate-fade-in" style="animation-delay: 0.2s">

                <!-- 本地文件上传 -->
                <a-upload
                  :show-upload-list="false"
                  :before-upload="interceptFileSelection"
                  accept="image/*,.pdf"
                  class="block h-full w-full custom-upload-wrapper group"
                >
                  <div class="w-full h-full rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-5 cursor-pointer transition-all duration-300 shadow-sm upload-card-local">
                    <div class="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 upload-icon-wrap">
                      <picture-filled class="text-2xl md:text-4xl upload-icon" />
                    </div>
                    <div class="text-center">
                      <h3 class="text-lg md:text-xl font-extrabold tracking-tight transition-colors upload-card-title">本地文件导入</h3>
                      <p class="text-xs md:text-sm mt-1 md:mt-2 font-medium" style="color: #8B8078;">支持图片乐谱</p>
                    </div>
                  </div>
                </a-upload>

                <!-- 拍摄识别 -->
                <div
                  @click="startTutorial"
                  class="w-full h-full rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-5 cursor-pointer transition-all duration-300 shadow-sm upload-card-camera group"
                >
                  <div class="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 upload-icon-wrap-cam">
                    <camera-filled class="text-2xl md:text-4xl upload-icon-cam" />
                  </div>
                  <div class="text-center">
                    <h3 class="text-lg md:text-xl font-extrabold tracking-tight transition-colors upload-card-title-cam" style="color: #1C1C1E;">拍摄照片识别</h3>
                    <p class="text-xs md:text-sm mt-1 md:mt-2 font-medium" style="color: #8B8078;">通过引导式拍摄识别纸质乐谱</p>
                  </div>
                </div>

                <!-- 桌面端返回按钮 -->
                <div
                  @click="toggleScanMode"
                  class="hidden md:flex md:col-span-2 rounded-2xl md:rounded-[2rem] p-3.5 md:p-5 items-center justify-center gap-2 md:gap-3 cursor-pointer transition-all active:scale-95 group shadow-sm hover:shadow-md h-auto mt-1 md:mt-0 back-btn"
                >
                  <arrow-left-outlined class="text-lg md:text-xl transition-all back-btn-icon" style="color: #8B8078;" />
                  <span class="font-bold text-sm md:text-base transition-colors back-btn-text" style="color: #8B8078;">返回控制台主页</span>
                </div>
              </div>
            </template>

          </div>

          <recent-scores-list
            :is-scanning="isScanning"
            :recent-scores="recentScores"
            :format-time="formatTime"
            @clickScore="handleScoreClick"
            @download="handleDownload"
          />

        </div>
      </transition>

      <!-- 拍摄引导抽屉 -->
      <a-drawer
        placement="bottom"
        :closable="false"
        :open="showTutorial"
        @close="showTutorial = false"
        height="85%"
        rootClassName="tutorial-drawer"
        :bodyStyle="{ padding: '24px 16px', display: 'flex', flexDirection: 'column', background: '#F5F0E8' }"
      >
        <div class="w-10 md:w-12 h-1 md:h-1.5 rounded-full mx-auto mb-6 md:mb-8 shrink-0" style="background: rgba(196,168,130,0.4);"></div>
        <h3 class="text-center font-extrabold mb-2 tracking-tight uppercase text-[10px] md:text-sm" style="color: #8B8078;">Smart Capture Guide</h3>
        <div class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="relative w-40 h-40 md:w-72 md:h-72 rounded-3xl md:rounded-[3rem] mb-6 md:mb-10 flex items-center justify-center overflow-hidden" style="background: rgba(255,255,255,0.8); border: 1px solid rgba(196,168,130,0.2); box-shadow: 0 8px 32px rgba(196,168,130,0.12);">
            <div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(196,168,130,0.06) 0%, transparent 60%);"></div>
            <div class="relative z-10 text-5xl md:text-7xl font-black animate-scale-in" style="color: #1C1C1E;">{{ tutorialStep }}</div>
          </div>
          <h2 class="text-xl md:text-3xl font-extrabold mb-2 md:mb-4 tracking-tight drop-shadow-sm animate-fade-in-up" :key="'title'+tutorialStep" style="color: #1C1C1E;">{{ tutorialTitles[tutorialStep-1] }}</h2>
          <p class="text-sm md:text-lg leading-relaxed px-2 md:px-8 font-medium animate-fade-in-up" :key="'desc'+tutorialStep" style="animation-delay: 0.05s; color: #8B8078;">
            {{ tutorialDescs[tutorialStep-1] }}
          </p>
        </div>
        <button
          @click="nextTutorialStep"
          class="w-full font-bold py-3.5 md:py-4 rounded-2xl md:rounded-[1.5rem] text-base md:text-lg active:scale-[0.98] transition-all mt-4 md:mt-6 cursor-pointer"
          style="background: #1C1C1E; color: #F5F0E8; box-shadow: 0 4px 20px rgba(28,28,30,0.16);"
        >
          {{ tutorialStep < 3 ? '下一步' : '开启相机' }}
        </button>
      </a-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  CameraFilled, ArrowLeftOutlined,
  PictureFilled,
} from '@ant-design/icons-vue';

import ScoreEditor from '@/components/ScoreEditor.vue';
// import SurveyModal from '@/components/SurveyModal.vue';
import HeroSection from '@/components/HeroSection.vue';
import CoreScanCard from '@/components/CoreScanCard.vue';
import ActionCards from '@/components/ActionCards.vue';
import RecentScoresList from '@/components/RecentScoresList.vue';

import { submitOmrTask, downloadOmrResult } from '@/api/omr';
// import { submitSurvey } from '@/api/survey';
import { useScoreStore } from '@/stores/score';

const router = useRouter();
const scoreStore = useScoreStore();

const isScanning = ref(false);
const showTutorial = ref(false);
const tutorialStep = ref(1);
const cameraInputRef = ref(null);

const selectedEngine = ref('LEGATO_FP16');

const engineOptions = ref([
  {
    label: '清商 (yuefu-qingshang-fp16-0.2)',
    value: 'LEGATO_FP16',
    desc: '高响应速度模型，专为快速识谱优化。'
  },
  {
    label: '正声 (yuefu-zhengsheng-fp32-0.2)',
    value: 'LEGATO_FP32',
    desc: '极致解析乐谱细节，提高复杂乐谱的识别精度。'
  }
]);

const selectedFile = ref(null);
const isUploading = ref(false);
const showSurvey = ref(false);

const recentScores = computed(() => {
  return scoreStore.scores.slice(0, 3);
});

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;

  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toggleScanMode = () => {
  isScanning.value = !isScanning.value;
};

const interceptFileSelection = (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20;
  if (!isLt20M) {
    message.error('文件大小不能超过 20MB!');
    return false;
  }
  if (file.type === 'application/pdf') {
    handleFinalUpload(file);
    return false;
  }
  selectedFile.value = file;
  return false;
};

const handleCameraCapture = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
  event.target.value = '';
};

const handleFinalUpload = async (fileToUpload) => {
  selectedFile.value = null;
  // const hasCompletedSurvey = localStorage.getItem('yf_survey_completed');
  isUploading.value = true;

  // if (!hasCompletedSurvey) {
  //   showSurvey.value = true;
  // }

  try {
    const res = await submitOmrTask(selectedEngine.value, fileToUpload);

    if (res.data && res.data.code === 200 && res.data.data) {
      const responseData = res.data.data;
      const taskMeta = {
        taskId: responseData.taskId,
        name: fileToUpload.name.substring(0, fileToUpload.name.lastIndexOf('.')) || fileToUpload.name,
        time: Date.now(),
        status: responseData.status || 'PROCESSING',
        engine: selectedEngine.value
      };

      scoreStore.addScore(taskMeta);

      // if (!showSurvey.value) {
        message.success('任务提交成功，正在云端识别');
        isScanning.value = false;
      // }
    } else {
      throw new Error(res.data?.msg || '服务器返回异常结构');
    }
  } catch (error) {
    console.error('上传失败:', error);
    // if (!showSurvey.value) {
      message.error('提交失败: ' + (error.message || '网络或服务器异常'));
    // }
  } finally {
    isUploading.value = false;
    // if (!showSurvey.value) {
      isScanning.value = false;
    // }
  }
};

/*
const handleSurveySubmit = async (surveyData) => {
  try {
    await submitSurvey(surveyData);
    localStorage.setItem('yf_survey_completed', 'true');
  } catch (error) {
    console.error('问卷提交异常，已忽略', error);
    localStorage.setItem('yf_survey_completed', 'true');
  } finally {
    showSurvey.value = false;
    if (!isUploading.value) {
      message.success('感谢反馈，乐谱已提交识别');
      isScanning.value = false;
    }
  }
};

const handleSurveySkip = () => {
  localStorage.setItem('yf_survey_completed', 'true');
  showSurvey.value = false;
  if (!isUploading.value) {
    isScanning.value = false;
  }
};
*/

const startTutorial = () => {
  showTutorial.value = true;
  tutorialStep.value = 1;
};

const nextTutorialStep = () => {
  if (tutorialStep.value < 3) {
    tutorialStep.value++;
  } else {
    showTutorial.value = false;
    if (cameraInputRef.value) {
      cameraInputRef.value.click();
    }
  }
};

const handleScoreClick = (score) => {
  if (score.status === 'PROCESSING') {
    message.info('该乐谱仍在识别中');
    return;
  }
  if (score.status === 'COMPLETED') {
    router.push(`/play?taskId=${score.taskId}&name=${encodeURIComponent(score.name)}`);
  }
};

const handleDownload = async (score) => {
  try {
    const res = await downloadOmrResult(score.taskId);
    if (res.data) {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${score.name || 'score'}.mxl`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('下载失败:', error);
    message.error('乐谱文件下载失败，请稍后重试');
  }
};

const tutorialTitles = ['垂直拍摄', '对齐谱表左侧', '保持谱表平行'];
const tutorialDescs = [
  '将乐谱平放在桌面上，然后使用手机从上向下垂直拍摄。若您的相机上有水平仪，请将其置于完全水平状态，然后按拍摄键。',
  '使所有谱表的左侧边平行于屏幕左侧边缘。',
  '使所有谱表的谱线平行，避免边缘卷曲、倾斜等。'
];
</script>

<style scoped>
.bg-main-background {
  background-image:
    linear-gradient(rgba(245, 240, 232, 0.78), rgba(245, 240, 232, 0.78)),
    url('../assets/backgroud.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.upload-card-local {
  background: white;
  border: 2px dashed rgba(196, 168, 130, 0.35);
}
.upload-card-local:hover {
  border-color: #C4A882;
  box-shadow: 0 8px 32px rgba(196, 168, 130, 0.18);
  transform: translateY(-2px);
}
.upload-icon-wrap {
  background: rgba(196, 168, 130, 0.1);
  border: 1px solid rgba(196, 168, 130, 0.15);
}
.upload-icon { color: #C4A882; }
.upload-card-title { color: #1C1C1E; }

.upload-card-local:hover .upload-icon-wrap {
  background: #C4A882;
  transform: scale(1.1);
}
.upload-card-local:hover .upload-icon { color: white; }
.upload-card-local:hover .upload-card-title { color: #C4A882; }

.upload-card-camera {
  background: white;
  border: 2px dashed rgba(139, 128, 120, 0.3);
}
.upload-card-camera:hover {
  border-color: #8B8078;
  box-shadow: 0 8px 32px rgba(139, 128, 120, 0.15);
  transform: translateY(-2px);
}
.upload-icon-wrap-cam {
  background: rgba(139, 128, 120, 0.08);
  border: 1px solid rgba(139, 128, 120, 0.12);
}
.upload-icon-cam { color: #8B8078; }

.upload-card-camera:hover .upload-icon-wrap-cam {
  background: #8B8078;
  transform: scale(1.1);
}
.upload-card-camera:hover .upload-icon-cam { color: white; }
.upload-card-camera:hover .upload-card-title-cam { color: #8B8078; }

.back-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(196, 168, 130, 0.2);
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(196, 168, 130, 0.35);
  box-shadow: 0 2px 12px rgba(196, 168, 130, 0.1);
}
.back-btn:hover .back-btn-icon {
  transform: translateX(-3px);
  color: #1C1C1E !important;
}
.back-btn:hover .back-btn-text { color: #1C1C1E !important; }

:deep(.custom-upload-wrapper .ant-upload-select) {
  width: 100%;
  height: 100%;
  border: none !important;
  background: none !important;
  display: block;
}
:deep(.custom-upload-wrapper .ant-upload) {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  display: block;
}


:deep(.tutorial-drawer .ant-drawer-content-wrapper) {
  box-shadow: 0 -20px 40px -10px rgba(196,168,130,0.15) !important;
  border-top-left-radius: 2.5rem !important;
  border-top-right-radius: 2.5rem !important;
  overflow: hidden;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

.page-transition-enter-active, .page-transition-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-transition-enter-from, .page-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
.animate-scale-in {
  animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}


@keyframes spinFast {
  to { transform: rotate(360deg); }
}
@keyframes pulseWarm {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.75; transform: scale(1.03); }
}
.animate-spin-fast  { animation: spinFast 0.7s linear infinite; }
.animate-pulse-warm { animation: pulseWarm 1.6s ease infinite; }
</style>
