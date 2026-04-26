<template>
  <div class="max-w-5xl mx-auto pt-2 md:pt-8 pb-20 px-4 md:px-8 w-full">

    <div class="md:hidden flex items-center justify-between py-2 mb-4">
      <button @click="$router.push('/')" class="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm active:scale-95 transition-transform">
        <arrow-left-outlined class="text-gray-600" />
      </button>
      <div class="flex flex-col items-center justify-center">
        <h1 class="text-lg font-bold text-gray-900 tracking-tight">关于乐府</h1>
      </div>
      <div class="w-10"></div> </div>

    <div class="hidden md:block mb-8">
      <button
        @click="$router.push('/')"
        class="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 active:scale-95 cursor-pointer w-fit"
      >
        <arrow-left-outlined class="text-gray-500 group-hover:text-gray-900 text-sm transition-all group-hover:-translate-x-1" />
        <span class="font-bold text-sm text-gray-600 group-hover:text-gray-900 transition-colors">返回首页</span>
      </button>
    </div>

    <div class="mb-8 md:mb-12 text-center flex flex-col items-center">
      <img src="@/assets/logo.svg" alt="Logo" class="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-6 drop-shadow-xl hover:scale-105 transition-transform duration-500" />
      <h1 class="text-2xl md:text-5xl font-bold text-gray-900 mb-1 md:mb-2 tracking-tight hidden md:block">乐府</h1>
      <p class="text-gray-500 text-xs md:text-lg font-medium bg-gray-100/80 md:bg-transparent px-3 py-1 rounded-full md:p-0">v0.2.1-beta</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">

      <div class="w-full bg-white rounded-3xl md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6 border-b border-gray-50 pb-3 md:pb-4">
          <div class="p-1.5 md:p-2 bg-blue-50 rounded-xl text-blue-600">
            <team-outlined class="text-lg md:text-xl" />
          </div>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">核心团队</h3>
        </div>

        <div class="grid grid-cols-2 gap-2 md:gap-4">
          <div v-for="(dev, idx) in developers" :key="idx" class="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-default border border-transparent hover:border-gray-100">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-50 md:bg-gray-100 rounded-[10px] md:rounded-full flex items-center justify-center text-gray-400 shrink-0 shadow-inner">
              <user-outlined class="text-lg md:text-xl" />
            </div>
            <div class="overflow-hidden min-w-0">
              <div class="text-gray-900 font-bold text-sm md:text-base truncate">{{ dev.name }}</div>
              <div class="text-blue-500 text-[10px] md:text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-md md:rounded-full w-fit mt-0.5 md:mt-1">{{ dev.role }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full bg-white rounded-3xl md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full">
        <div class="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6 border-b border-gray-50 pb-3 md:pb-4">
          <div class="p-1.5 md:p-2 bg-green-50 rounded-xl text-green-600">
            <cloud-server-outlined class="text-lg md:text-xl" />
          </div>
          <h3 class="text-lg md:text-xl font-bold text-gray-900">服务状态</h3>
        </div>

        <div class="space-y-4 md:space-y-6">
          <div class="p-3 md:p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
            <div class="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">API Endpoint</div>
            <div class="flex items-center gap-2 md:gap-3 bg-white p-2.5 md:p-3 rounded-xl border border-gray-100 shadow-sm min-w-0">
              <div
                class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 transition-colors duration-300"
                :class="{
                       'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse': serverStatus === 'online',
                       'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]': serverStatus === 'offline',
                       'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse': serverStatus === 'loading'
                     }"
              ></div>
              <a href="https://yf.qingshuige.ink/api/" target="_blank" class="text-blue-600 font-mono text-[11px] md:text-sm hover:underline truncate w-full">
                https://yf.qingshuige.ink/api/
              </a>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 md:gap-4">
            <div class="p-3 md:p-4 bg-gray-50 rounded-2xl border border-gray-100 min-w-0">
              <div class="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1">Last Updated</div>
              <div class="text-gray-900 font-mono text-[10px] sm:text-xs md:text-sm font-semibold truncate" :title="displayTime">
                {{ displayTime }}
              </div>
            </div>
            <div class="p-3 md:p-4 bg-gray-50 rounded-2xl border border-gray-100 min-w-0">
              <div class="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1">Cache Size</div>
              <div class="text-gray-900 font-mono text-xs md:text-sm font-semibold truncate">
                {{ formattedCacheSize }} MB
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { UserOutlined, ArrowLeftOutlined, TeamOutlined, CloudServerOutlined } from '@ant-design/icons-vue';
import { getSystemInfo } from '@/api/omr.ts';


const developers = [
  { name: '线粒体', role: '程序' },
  { name: '发发', role: '策划' },
  { name: '冰寻卿', role: '策划' },
  { name: '柒晨', role: '程序' },
];

// 'loading' | 'online' | 'offline'
const serverStatus = ref('loading');
const timestamp = ref(null);
const cacheSize = ref(0);


const displayTime = computed(() => {
  if (serverStatus.value === 'loading') return '加载中...';
  if (serverStatus.value === 'offline') return '连接失败';
  if (!timestamp.value) return '--';

  const date = new Date(timestamp.value);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
});


const formattedCacheSize = computed(() => {
  if (serverStatus.value !== 'online') return '--';
  return (cacheSize.value / 1024 / 1024).toFixed(2);
});


const fetchStatus = async () => {
  serverStatus.value = 'loading';
  try {
    const res = await getSystemInfo();
    if (res.data && res.data.code === 200 && res.data.data) {
      timestamp.value = res.data.data.time;
      cacheSize.value = res.data.data.tmpSize || 0;
      serverStatus.value = 'online';
    } else {
      serverStatus.value = 'offline';
    }
  } catch (error) {
    console.error('获取系统信息失败:', error);
    serverStatus.value = 'offline';
  }
};

onMounted(() => {
  fetchStatus();
});
</script>
