<template>
  <div
    @click="$emit('toggle')"
    class="md:col-span-2 lg:col-span-2 relative rounded-3xl md:rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-blue-900/10 hover:shadow-blue-600/30 transition-all duration-700 ease-out hover:-translate-y-2 animate-fade-in-up"
    style="animation-delay: 0.1s"
  >
    <div class="absolute inset-0 bg-piano-card bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"></div>
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/95 backdrop-blur-[2px] opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>

    <div class="absolute -top-16 -right-16 md:-top-20 md:-right-20 w-56 h-56 md:w-80 md:h-80 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700"></div>
    <div class="absolute bottom-0 right-0 p-6 md:p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all transform group-hover:scale-110">
      <scan-outlined class="text-[8rem] md:text-[12rem] text-white" />
    </div>

    <div class="relative z-10 p-6 md:p-10 lg:p-12 h-full flex flex-col justify-between min-h-[180px] md:min-h-[280px] text-white">
      <div class="transform transition-transform duration-500 group-hover:translate-x-2">
        <div class="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-white/20">
          <camera-filled class="text-xl md:text-3xl text-white drop-shadow-md" />
        </div>

        <h2 class="text-2xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4 tracking-tight drop-shadow-lg">识别乐谱</h2>
        <p class="text-blue-50/90 text-xs md:text-base lg:text-lg max-w-sm md:max-w-md leading-relaxed font-light tracking-wide">
          拍照或上传纸质乐谱、PDF，立即获取音频预览。<br class="hidden md:block">支持多声部结构解析与 MusicXML 导出。
        </p>
      </div>

      <div class="mt-6 md:mt-8 flex items-center gap-2 md:gap-3 font-bold text-sm md:text-lg bg-orange-600 text-white w-fit px-5 py-2.5 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-orange-500 transition-all transform group-hover:translate-y-[-4px]">
        <span>开始扫描</span>
        <arrow-right-outlined class="text-xs md:text-base group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { CameraFilled, ScanOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
defineEmits(['toggle']);
</script>

<style scoped>
.bg-piano-card {
  background-image: url('../assets/piano.jpg');
}
</style>
