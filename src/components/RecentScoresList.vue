<template>
  <div v-if="!isScanning" class="mt-12 md:mt-16 lg:mt-24 animate-fade-in-up" style="animation-delay: 0.2s">
    <div class="flex items-center justify-between mb-6 md:mb-8 px-2 md:px-4">
      <div class="flex items-center gap-3">
        <h3 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">最近识别</h3>
        <div class="h-6 w-1.5 bg-blue-500 rounded-full hidden md:block opacity-80"></div>
      </div>
      <button
        @click="router.push('/scores')"
        class="text-blue-600 bg-blue-50/80 hover:bg-blue-100 px-4 py-2 rounded-full font-bold text-sm cursor-pointer transition-all flex items-center gap-1.5 group active:scale-95 border border-blue-100/50"
      >
        查看全部
        <right-outlined class="text-[10px] group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div v-if="recentScores.length === 0" class="text-center py-16 bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-slate-200 border-dashed animate-fade-in shadow-sm hover:border-blue-300 transition-colors group" style="animation-delay: 0.3s">
      <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-lg shadow-slate-200/50 group-hover:scale-110 transition-transform duration-500">
        <file-text-filled class="text-3xl text-slate-300 group-hover:text-blue-400 transition-colors" />
      </div>
      <h4 class="text-lg font-extrabold text-slate-700 mb-1.5 tracking-tight">暂无识别记录</h4>
      <p class="text-slate-500 text-sm font-medium">快去上传第一份乐谱，体验 AI 极速识谱吧</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 animate-fade-in" style="animation-delay: 0.3s">
      <div
        v-for="score in recentScores"
        :key="score.taskId"
        @click="$emit('clickScore', score)"
        class="bg-white/90 backdrop-blur-md rounded-[2rem] p-5 flex items-center gap-4 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden"
      >
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <div
          class="w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm border relative z-10"
          :class="score.status === 'PROCESSING' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-slate-500 bg-slate-50 border-slate-200 group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-700 group-hover:shadow-md'"
        >
          <sync-outlined v-if="score.status === 'PROCESSING'" spin class="text-2xl" />
          <file-text-filled v-else class="text-2xl" />
        </div>

        <div class="flex-1 min-w-0 relative z-10">
          <h4 class="text-lg font-extrabold text-slate-800 truncate mb-2 group-hover:text-blue-600 transition-colors tracking-tight" :title="score.name">
            {{ score.name }}
          </h4>

          <div class="flex items-center gap-2.5">
            <span class="text-slate-500 text-xs font-semibold leading-none mt-[1px]">{{ formatTime(score.time) }}</span>

            <span
              v-if="score.engine"
              class="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wider shadow-sm leading-none"
              :class="getEngineTagStyle(score.engine)"
            >
              {{ getEngineName(score.engine) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 relative z-10">
          <button
            v-if="score.status === 'COMPLETED'"
            @click.stop="$emit('download', score)"
            class="w-10 h-10 rounded-full bg-white text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-300 cursor-pointer"
            title="导出 MusicXML"
          >
            <download-outlined class="text-lg" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { FileTextFilled, RightOutlined, SyncOutlined, DownloadOutlined } from '@ant-design/icons-vue';

const router = useRouter();

defineProps({
  isScanning: Boolean,
  recentScores: Array,
  formatTime: Function
});
defineEmits(['clickScore', 'download']);

const getEngineName = (engine) => {
  if (!engine) return '未知';
  const eng = engine.toUpperCase();
  if (eng.includes('FP16') || eng.includes('QINGSHANG')) return '清商';
  if (eng.includes('FP32') || eng.includes('ZHENGSHENG')) return '正声';
  return engine;
};

const getEngineTagStyle = (engine) => {
  const name = getEngineName(engine);
  if (name === '清商') {
    return 'bg-emerald-600 text-white border border-emerald-700/50';
  } else if (name === '正声') {
    return 'bg-violet-700 text-white border border-violet-800/50';
  }
  return 'bg-slate-600 text-white border border-slate-700/50';
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
