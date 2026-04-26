<template>
  <div class="flex flex-col gap-4 md:gap-8 h-full animate-fade-in-up" style="animation-delay: 0.15s">

    <div @click="router.push('/ai-create')" class="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-500 bg-ai-creation-card bg-cover bg-center">
      <div class="absolute inset-0 bg-gradient-to-br from-white/95 to-orange-50/90 backdrop-blur-sm opacity-90 transition-opacity duration-300 group-hover:opacity-95"></div>

      <div class="absolute -top-10 -right-10 w-32 md:w-40 h-32 md:h-40 bg-orange-100 rounded-full blur-2xl group-hover:bg-orange-200 transition-colors"></div>

      <div class="relative z-10 p-5 md:p-8 h-full flex flex-col justify-between min-h-[120px] md:min-h-[160px]">
        <div class="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-white/50 shadow-inner">
          <bulb-filled class="text-lg md:text-3xl" />
        </div>
        <div>
          <h3 class="text-xl md:text-3xl font-extrabold text-slate-800 mb-1 tracking-tight drop-shadow-sm">音乐创作</h3>
          <p class="text-slate-600 text-xs md:text-sm font-medium">激发灵感，创作属于你的独特乐章</p>
        </div>
      </div>
    </div>

    <div @click="router.push('/scores')" class="flex-1 relative rounded-3xl md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg shadow-slate-200/50 hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-500 bg-paper-card bg-cover bg-center">
      <div class="absolute inset-0 bg-gradient-to-br from-white/95 to-orange-50/90 backdrop-blur-sm opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>

      <div class="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-orange-100/50 rounded-full blur-2xl -mr-8 md:-mr-10 -mt-8 md:-mt-10 group-hover:bg-orange-200/50 transition-colors"></div>

      <div class="relative z-10 p-5 md:p-8 h-full flex flex-col justify-between min-h-[120px] md:min-h-[160px]">
        <div class="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-white/50 shadow-inner">
          <folder-open-filled class="text-lg md:text-3xl" />
        </div>
        <div>
          <h3 class="text-xl md:text-3xl font-extrabold text-slate-800 mb-1 tracking-tight drop-shadow-sm">我的乐谱库</h3>
          <p class="text-slate-600 text-xs md:text-sm font-medium">查看已转换的数字乐谱</p>
        </div>
      </div>
    </div>

    <div @click="router.push('/about')" class="h-auto min-h-[80px] md:min-h-[120px] bg-white/70 backdrop-blur-sm rounded-3xl md:rounded-[2rem] p-4 md:p-8 border border-slate-100 shadow-sm cursor-pointer group flex flex-row items-center gap-4 md:gap-5 transition-all duration-300 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1">
      <div class="w-10 h-10 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex flex-shrink-0 items-center justify-center text-slate-600 border border-slate-100 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300 shadow-inner">
        <info-circle-filled class="text-lg md:text-2xl" />
      </div>
      <div>
        <h3 class="text-base md:text-xl font-extrabold text-slate-800 mb-0.5 md:mb-1 tracking-tight drop-shadow-sm">关于乐府引擎</h3>
        <p class="text-slate-500 text-[10px] md:text-xs font-mono bg-slate-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md inline-block">v0.2.2-beta</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { BulbFilled, FolderOpenFilled, InfoCircleFilled } from '@ant-design/icons-vue';

const router = useRouter();
</script>

<style scoped>

.bg-ai-creation-card {
  background-image: url('../assets/creative-composer.jpg');
}
.bg-paper-card {
  background-image: url('../assets/paper.jpg');
}
</style>
