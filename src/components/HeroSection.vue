<template>
  <div class="bg-white/40 backdrop-blur-[2px] rounded-3xl p-6 mb-12 md:mb-16 text-center md:text-left animate-fade-in-up relative z-10" style="animation-delay: 0.05s">

    <h1 class="title-font text-5xl md:text-7xl font-black mb-4 md:mb-6 tracking-tight">
      <span class="animate-gradient-text bg-clip-text text-transparent bg-[length:200%_auto] bg-gradient-to-r from-gray-900 via-slate-600 to-gray-900"
            style="filter: drop-shadow(0px 1px 1px rgba(255, 255, 255, 0.9)) drop-shadow(0px 4px 12px rgba(255, 255, 255, 1));">
        {{ isScanning ? '乐谱获取' : '乐谱，从此“听得见”' }}
      </span>
    </h1>

    <div class="flex gap-1.5 mb-6 justify-center md:justify-start items-center"
         style="filter: drop-shadow(0px 2px 4px rgba(255,255,255,0.6));">
      <div class="h-1.5 w-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-sm"></div>
      <div class="h-1.5 w-4 bg-indigo-400 rounded-full shadow-sm"></div>
      <div class="h-1.5 w-1.5 bg-purple-400 rounded-full shadow-sm"></div>
    </div>

    <p class="text-base md:text-lg font-bold tracking-[0.2em] text-slate-700"
       style="text-shadow: 0 1px 2px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,1);">
      {{ isScanning ? '请选择识别引擎并导入乐谱' : '基于 AI 五线谱识别的乐谱即时识别、预览与导出系统' }}
    </p>

  </div>
</template>

<script setup>
defineProps({
  isScanning: Boolean
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&display=swap');

.title-font {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.animate-gradient-text {
  animation: shine 6s linear infinite;
}

@keyframes shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
</style>
