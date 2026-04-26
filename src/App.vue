<template>
  <div class="min-h-screen flex flex-col items-center selection:bg-amber-200 selection:text-amber-900 bg-[#F5F0E8]">

    <header v-if="!hideNav" class="w-full relative sticky top-0 z-50 py-4 border-b border-[#C4A882]/20 shadow-sm overflow-hidden">

      <div class="absolute inset-0 z-[-1] overflow-hidden bg-[#F5F0E8]">
        <img
          src="./assets/header1.jpg"
          alt="background"
          class="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        <div class="absolute inset-0 bg-gradient-to-r from-[#F5F0E8] from-[70px] to-transparent to-[150px] md:from-[110px] md:to-[220px]"></div>

        <div class="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 shadow-[0_-1px_0_rgba(255,255,255,0.2)] opacity-70"></div>
      </div>

      <div class="w-full flex items-center justify-between px-6 md:px-12">

        <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
          <img src="@/assets/logo.svg" alt="Logo" class="w-8 h-8 md:w-10 md:h-10 drop-shadow-sm" />
          <div class="text-xl md:text-2xl font-extrabold text-[#1C1C1E] tracking-tighter font-sans">
            乐府
          </div>
        </div>

        <div class="hidden sm:flex items-center">
          <span class="text-[11px] font-bold tracking-[0.25em] text-[#8B8078] uppercase mix-blend-multiply">
            Sheet Music Engine
          </span>
        </div>

      </div>
    </header>

    <main class="w-full max-w-7xl flex-1 px-4 sm:px-8 py-8 md:py-12 fade-enter-active mx-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const hideNav = computed(() => ['/optimize', '/process', '/play'].includes(route.path));
</script>

<style>
a { text-decoration: none !important; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
