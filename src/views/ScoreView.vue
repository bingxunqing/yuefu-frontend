<template>
  <div class="min-h-screen text-[#1C1C1E] transition-all duration-500 font-sans pb-20 overflow-x-hidden relative">
    <!-- 背景层 -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-[#F5F0E8]"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[#C4A882]/10 blur-[120px] rounded-full"></div>
    </div>

    <div class="max-w-[85rem] mx-auto pt-4 md:pt-8 px-4 md:px-8 lg:px-10">

      <div class="hidden md:block mb-8 animate-fade-in-up">
        <div class="mb-6">
          <button
            @click="$router.push('/')"
            class="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/70 backdrop-blur-md border border-[#C4A882]/20 shadow-sm hover:shadow-lg hover:bg-white hover:border-[#C4A882]/40 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <arrow-left-outlined class="text-[#8B8078] group-hover:text-[#1C1C1E] text-sm transition-all group-hover:-translate-x-1" />
            <span class="font-bold text-sm text-[#8B8078] group-hover:text-[#1C1C1E] transition-colors">返回首页控制台</span>
          </button>
        </div>

        <div class="mb-4 flex items-center gap-4">
          <h1 class="text-4xl md:text-5xl font-black text-[#1C1C1E] tracking-tight drop-shadow-sm">我的乐谱库</h1>
          <div class="h-10 w-2.5 bg-[#C4A882] rounded-full opacity-90 shadow-lg shadow-[#C4A882]/20"></div>
        </div>
        <p class="text-[#8B8078] text-lg md:text-xl font-medium max-w-2xl">管理、检索与查看您的所有数字乐谱记录。</p>
      </div>

      <div class="md:hidden flex items-center justify-between py-3 mb-4 sticky top-0 z-40 bg-[#F5F0E8]/90 backdrop-blur-md -mx-4 px-4 border-b border-[#C4A882]/20 shadow-sm animate-fade-in">
        <button @click="$router.push('/')" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/70 border border-[#C4A882]/20 shadow-sm active:scale-95 transition-transform">
          <arrow-left-outlined class="text-[#8B8078]" />
        </button>
        <h1 class="text-xl font-black text-[#1C1C1E] tracking-tight">我的乐谱库</h1>
        <div class="w-10"></div>
      </div>

      <div class="sticky top-[73px] md:top-4 z-30 mb-8 md:mb-12 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="relative group max-w-3xl mx-auto md:mx-0">
          <search-outlined class="absolute left-6 top-1/2 -translate-y-1/2 text-[#8B8078] text-lg md:text-xl group-focus-within:text-[#C4A882] transition-colors z-10" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索乐谱名称..."
            class="w-full bg-white/70 backdrop-blur-xl border border-[#C4A882]/20 hover:border-[#C4A882]/40 focus:border-[#C4A882] focus:ring-4 focus:ring-[#C4A882]/10 rounded-2xl md:rounded-full py-4 md:py-5 pl-14 md:pl-16 pr-8 text-[#1C1C1E] placeholder-[#8B8078] shadow-md hover:shadow-lg focus:shadow-xl outline-none transition-all duration-300 text-base md:text-lg font-medium"
          />
        </div>
      </div>

      <div v-if="filteredScores.length === 0" class="text-center py-24 bg-white/50 backdrop-blur-md rounded-[3rem] border-2 border-[#C4A882]/30 border-dashed shadow-sm animate-fade-in" style="animation-delay: 0.2s">
        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C4A882]/20 shadow-xl shadow-[#C4A882]/10">
          <file-filled class="text-5xl text-[#C4A882]/40" />
        </div>
        <h4 class="text-2xl font-black text-[#1C1C1E] mb-3 tracking-tight">暂无对应的乐谱记录</h4>
        <p class="text-[#8B8078] text-base md:text-lg font-medium max-w-md mx-auto">调整搜索词，或返回首页上传新乐谱以便体验云端 AI 识谱功能。</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-fade-in" style="animation-delay: 0.2s">
        <div
          v-for="score in filteredScores"
          :key="score.taskId"
          @click="handleScoreClick(score)"
          :class="[
            'group cursor-pointer p-5 rounded-[2.5rem] transition-all duration-500 flex relative overflow-hidden',
            'flex-row md:flex-col items-center md:items-stretch gap-5 md:gap-0',
            score.status === 'PROCESSING'
              ? 'bg-white/60 border-2 border-dashed border-[#C4A882]/30 shadow-inner'
              : 'bg-white/80 backdrop-blur-md border border-[#C4A882]/20 shadow-sm hover:shadow-2xl hover:shadow-[#C4A882]/10 hover:border-[#C4A882]/40 hover:-translate-y-2'
          ]"
        >
          <div class="absolute -right-16 -top-16 w-40 h-40 bg-gradient-to-br from-[#C4A882]/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div
            :class="[
              'w-24 h-24 md:w-full md:h-auto md:aspect-[4/3] shrink-0 rounded-3xl flex items-center justify-center relative overflow-hidden mb-0 md:mb-5 border border-[#C4A882]/20 z-10',
              score.status === 'PROCESSING' ? 'bg-[#C4A882]/10' : 'bg-gradient-to-br from-[#F5F0E8] to-[#E8DCC8] group-hover:from-[#C4A882]/10 group-hover:to-[#C4A882]/20 transition-all duration-500'
            ]"
          >
            <template v-if="score.status === 'PROCESSING'">
              <div class="absolute inset-0 bg-[#C4A882]/5 animate-pulse"></div>
              <div class="flex flex-col items-center text-[#C4A882] z-10">
                <sync-outlined spin class="text-3xl md:text-5xl mb-1 md:mb-3" />
                <span class="text-[10px] md:text-xs font-bold tracking-wider hidden md:block">PROCESSING</span>
              </div>
            </template>

            <template v-else>
              <div class="flex flex-col items-center opacity-30 text-[#8B8078] group-hover:scale-110 group-hover:text-[#C4A882] group-hover:opacity-100 transition-all duration-500">
                <file-filled class="text-4xl md:text-6xl mb-1.5 md:mb-3" />
                <span class="font-bold text-[11px] md:text-sm uppercase tracking-widest text-[#8B8078] group-hover:text-[#C4A882] transition-colors">MXL</span>
              </div>
              <div class="absolute inset-0 bg-[#C4A882]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </template>
          </div>

          <div class="flex flex-col justify-center md:justify-start flex-1 min-w-0 px-1 md:px-2 md:pb-2 z-10">
            <h3
              class="font-extrabold text-lg md:text-xl truncate mb-1.5 tracking-tight transition-colors"
              :class="score.status === 'PROCESSING' ? 'text-[#C4A882]' : 'text-[#1C1C1E] group-hover:text-[#C4A882]'"
              :title="score.name"
            >
              {{ score.name }}
            </h3>

            <p v-if="score.status === 'PROCESSING'" class="text-[#C4A882] text-xs font-bold flex items-center gap-2 bg-[#C4A882]/10 w-fit px-3 py-1.5 rounded-xl mt-1 border border-[#C4A882]/30 shadow-inner">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4A882]/60 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[#C4A882]"></span>
              </span>
              AI 识别中...
            </p>

            <p v-else-if="score.status === 'FAILED'" class="text-red-700 text-xs font-bold bg-red-100 w-fit px-3 py-1.5 rounded-xl mt-1 border border-red-200/50 shadow-inner">
              <span class="w-2 h-2 rounded-full bg-red-600 mr-1.5"></span>
              识别失败
            </p>

            <div v-else class="flex flex-col mt-2 md:mt-3 gap-3.5 border-t border-[#C4A882]/20 pt-3 md:pt-4">

              <div class="flex items-center gap-2.5">
                <span class="text-[#8B8078] text-xs font-semibold leading-none mt-[1px]">
                  {{ formatTime(score.time) }}
                </span>

                <span
                  v-if="score.engine"
                  class="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wider shadow-sm leading-none"
                  :class="getEngineTagStyle(score.engine)"
                >
                  {{ getEngineName(score.engine) }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <button
                  @click.stop="handleDownload(score)"
                  class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/70 text-[#8B8078] border border-[#C4A882]/20 flex items-center justify-center hover:bg-[#C4A882] hover:text-white hover:border-[#C4A882] hover:shadow-lg hover:shadow-[#C4A882]/40 active:scale-90 transition-all duration-300 cursor-pointer shadow-inner"
                  title="下载 MXL 乐谱文件"
                >
                  <download-outlined class="text-[13px] md:text-sm" />
                </button>

                <button
                  @click.stop="handleDelete(score.taskId)"
                  class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/70 text-[#8B8078] border border-[#C4A882]/20 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/40 active:scale-90 transition-all duration-300 cursor-pointer shadow-inner"
                  title="删除记录"
                >
                  <delete-outlined class="text-[13px] md:text-sm" />
                </button>

                <div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-md group-active:scale-95">
                  <right-outlined class="text-[10px] md:text-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasProcessingTask" class="fixed bottom-6 md:bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
        <div class="pointer-events-auto bg-slate-950/90 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl shadow-blue-950/30 flex items-center gap-3 animate-bounce-in border border-slate-800 w-auto max-w-full whitespace-nowrap">
          <sync-outlined spin class="text-blue-400 shrink-0 text-xl" />
          <span class="text-base md:text-lg font-bold tracking-wide truncate">云端 AI 正在处理 {{ processingCount }} 个乐谱任务...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { SearchOutlined, FileFilled, SyncOutlined, RightOutlined, ArrowLeftOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useScoreStore } from '@/stores/score';
import { downloadOmrResult } from '@/api/omr';

const router = useRouter();
const scoreStore = useScoreStore();
const searchQuery = ref('');

onMounted(() => {
  scoreStore.resumePolling();
});

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
  }
};

const handleDelete = (taskId) => {
  if (window.confirm('确定要删除这条乐谱记录吗？此操作无法恢复。')) {
    scoreStore.deleteScore(taskId);
  }
};

const handleScoreClick = (score) => {
  if (score.status === 'PROCESSING') return;
  if (score.status === 'COMPLETED') {
    router.push(`/play?taskId=${score.taskId}&name=${encodeURIComponent(score.name)}`);
  }
};

const filteredScores = computed(() => {
  if (!searchQuery.value) return scoreStore.scores;
  const lowerQuery = searchQuery.value.toLowerCase();
  return scoreStore.scores.filter(score =>
    score.name.toLowerCase().includes(lowerQuery)
  );
});

const processingCount = computed(() => {
  return scoreStore.scores.filter(s => s.status === 'PROCESSING').length;
});
const hasProcessingTask = computed(() => processingCount.value > 0);

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
.bg-main-background {
  background-image: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url('../assets/backgroud.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounceIn {
  0% { opacity: 0; transform: translateY(25px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(245, 240, 232, 0.5);
}
::-webkit-scrollbar-thumb {
  background: rgba(196, 168, 130, 0.5);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(196, 168, 130, 0.8);
}
</style>
