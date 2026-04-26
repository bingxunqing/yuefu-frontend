<template>
  <div class="flex flex-col gap-4 w-full h-full">

    <div
      v-if="isUploading"
      class="fixed inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <loading-outlined class="text-4xl md:text-5xl text-blue-500 mb-4 animate-spin" />
      <p class="text-blue-600 font-bold text-base md:text-lg">正在上传并提交识别任务...</p>
      <p class="text-gray-400 text-xs md:text-sm mt-2">请勿关闭页面</p>
    </div>

    <score-editor
      v-if="selectedFile"
      :raw-file="selectedFile"
      @cancel="handleEditorCancel"
      @submit="handleEditorSubmit"
    />

    <div
      @click="$emit('cancel')"
      class="flex md:hidden bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
    >
      <arrow-left-outlined class="text-lg text-gray-500" />
      <span class="font-bold text-sm text-gray-600">返回主页</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 flex-1">

      <a-upload
        :show-upload-list="false"
        :before-upload="interceptFileSelection"
        :disabled="isUploading"
        accept="image/*,.pdf"
        class="block h-full w-full custom-upload-wrapper"
      >
        <div class="w-full h-full bg-white hover:bg-blue-50 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-6 cursor-pointer transition-all group">
          <div class="w-14 h-14 md:w-20 md:h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <picture-filled class="text-2xl md:text-4xl" />
          </div>
          <div class="text-center">
            <h3 class="text-lg md:text-xl font-bold text-gray-900">导入文件</h3>
            <p class="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">支持图片或 PDF 格式乐谱</p>
          </div>
        </div>
      </a-upload>

      <div
        @click="$emit('open-tutorial')"
        class="bg-white hover:bg-indigo-50 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-6 cursor-pointer transition-all group h-full"
      >
        <div class="w-14 h-14 md:w-20 md:h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <camera-filled class="text-2xl md:text-4xl" />
        </div>
        <div class="text-center">
          <h3 class="text-lg md:text-xl font-bold text-gray-900">拍摄照片</h3>
          <p class="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">通过引导式拍摄识别纸质乐谱</p>
        </div>
      </div>

    </div>

    <div
      @click="$emit('cancel')"
      class="hidden md:flex bg-gray-100 hover:bg-gray-200 rounded-[2.5rem] p-6 flex-row items-center justify-center gap-3 cursor-pointer transition-colors active:scale-95 group shrink-0"
    >
      <arrow-left-outlined class="text-2xl text-gray-600 group-hover:-translate-x-2 transition-transform" />
      <span class="font-bold text-lg text-gray-600">返回控制台主页</span>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { CameraFilled, PictureFilled, ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { submitOmrTask } from '@/api/omr';
import { useScoreStore } from '@/stores/score';
import ScoreEditor from '@/components/ScoreEditor.vue'; // 引入刚刚编写的编辑器组件

const emit = defineEmits(['cancel', 'open-tutorial']);
const router = useRouter();
const scoreStore = useScoreStore();

// 状态控制
const isUploading = ref(false);
const selectedFile = ref(null); // 存储被拦截的原始文件

/**
 * 核心逻辑 1：拦截文件选择，阻止直接上传
 * 使用 before-upload 钩子，返回 false 即可阻止 Ant Design Vue 自动发起网络请求
 */
const interceptFileSelection = (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20;
  if (!isLt20M) {
    message.error('文件大小不能超过 20MB!');
    return false; // 拦截
  }

  if (file.type === 'application/pdf') {
    executeFinalUpload(file);
    return false;
  }

  selectedFile.value = file;
  return false;
};


const handleEditorCancel = () => {
  selectedFile.value = null; // 清除文件，关闭编辑器
};

const handleEditorSubmit = (processedFile) => {
  selectedFile.value = null; // 关闭编辑器界面
  executeFinalUpload(processedFile); // 传入处理后的 Blob File 执行真实上传
};


const executeFinalUpload = async (fileToUpload) => {
  isUploading.value = true;

  try {
    const res = await submitOmrTask(fileToUpload);

    if (res.data && res.data.code === 200 && res.data.data) {
      const responseData = res.data.data;
      const taskMeta = {
        taskId: responseData.taskId,
        name: fileToUpload.name.substring(0, fileToUpload.name.lastIndexOf('.')) || fileToUpload.name,
        time: Date.now(),
        status: responseData.status || 'PROCESSING'
      };

      scoreStore.addScore(taskMeta);
      message.success('任务提交成功，正在云端识别');
      router.push('/scores'); // 跳转到乐谱库
    } else {
      throw new Error(res.data?.msg || '服务器返回异常结构');
    }
  } catch (error) {
    console.error('上传失败:', error);
    message.error('提交失败: ' + (error.message || '网络或服务器异常'));
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
/* 覆盖 Ant Design Vue 的上传组件默认样式，使其撑满容器 */
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
</style>
