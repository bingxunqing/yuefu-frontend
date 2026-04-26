<template>
  <div
    class="h-[100dvh] w-full flex flex-col text-[#1C1C1E] font-sans relative overflow-hidden bg-cover bg-center app-bg"
  >
    <!-- 背景层 -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-[#F5F0E8]"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-[#C4A882]/5 via-transparent to-[#C4A882]/5"></div>
    </div>

    <header class="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white/70 backdrop-blur-xl border-b border-[#C4A882]/20 shrink-0 z-20 shadow-sm">
      <div class="flex items-center gap-3 md:gap-4">
        <div @click="router.push('/')" class="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-[#C4A882]/10 cursor-pointer transition-all border border-transparent hover:border-[#C4A882]/20">
          <ArrowLeftOutlined class="text-base md:text-lg text-[#8B8078]" />
        </div>
        <div class="flex flex-col">
          <h1 class="text-base md:text-lg font-bold text-[#1C1C1E] tracking-tight leading-tight">AI音乐创作</h1>
          <div class="text-xs md:text-sm font-semibold flex items-center gap-1.5" :class="connectionStatus === '连接成功' ? 'text-emerald-600' : 'text-[#8B8078]'">
            <div class="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full shadow-sm" :class="connectionStatus === '连接成功' ? 'bg-emerald-500 animate-pulse' : 'bg-[#8B8078]'"></div>
            {{ connectionStatus }}
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-3 md:p-8 scroll-smooth relative" ref="chatContainerRef">
      <div class="max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 pb-32">

        <div v-if="messages && messages.length === 0" class="flex flex-col items-center justify-center mt-12 md:mt-24 opacity-90 animate-fade-in-up px-4">
          <div class="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl mb-6 shadow-xl overflow-hidden border-2 border-[#C4A882]/30 relative group">
            <img src="../assets/abc.jpg" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Inspiration" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#C4A882]/50 to-transparent flex items-center justify-center">
              <CustomerServiceOutlined class="text-4xl md:text-5xl text-white drop-shadow-lg" />
            </div>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-[#1C1C1E] mb-3 tracking-tight text-center">构想你的听觉世界</h2>
          <p class="text-[#8B8078] text-sm md:text-base font-medium text-center max-w-lg leading-relaxed">
            描述你脑海中的旋律。例如 <span class="text-[#C4A882] bg-white/70 px-2 py-0.5 rounded-md cursor-pointer hover:bg-white/90 transition-all shadow-sm inline-block mt-1 md:mt-0 border border-[#C4A882]/20">"赛博朋克风格的合成器贝斯"</span> 或 <span class="text-[#8B8078] bg-white/70 px-2 py-0.5 rounded-md cursor-pointer hover:bg-white/90 transition-all shadow-sm inline-block mt-1 md:mt-0 border border-[#C4A882]/20">"空灵的钢琴独奏"</span>
          </p>
        </div>

        <transition-group name="msg-list" tag="div" class="flex flex-col gap-6 md:gap-8">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex w-full group"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div v-if="msg.role === 'ai'" class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex items-center justify-center mr-3 md:mr-4 mt-1 shrink-0 shadow-sm border border-[#C4A882]/30">
              <img src="../assets/pic1.jpg" class="w-full h-full object-cover" alt="AI" />
            </div>

            <div
              class="max-w-[88%] md:max-w-[70%] px-4 py-3 md:px-6 md:py-4 shadow-sm relative"
              :class="[
                msg.role === 'user'
                  ? 'bg-[#C4A882]/90 backdrop-blur-md text-white rounded-2xl rounded-tr-sm border border-[#C4A882]'
                  : 'bg-white/70 backdrop-blur-md border border-[#C4A882]/20 text-[#1C1C1E] rounded-2xl rounded-tl-sm hover:shadow-md transition-shadow',
                msg.isError ? 'border-red-300 bg-red-50/80 text-red-600' : ''
              ]"
            >
              <div class="text-sm md:text-[15px] leading-relaxed break-words font-medium">
                {{ msg.content }}
              </div>

              <div v-if="msg.role === 'ai' && msg.status === 'playing'" class="mt-3 md:mt-4 flex items-center justify-between bg-white/50 p-2 md:p-3 rounded-xl border border-[#C4A882]/20">
                <div class="flex items-center gap-2 md:gap-3">
                  <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#C4A882]/20 flex items-center justify-center text-[#C4A882] animate-spin-slow text-xs md:text-base">
                    <CustomerServiceOutlined />
                  </div>
                  <span class="text-xs md:text-sm font-bold text-[#8B8078]">音频实时生成中</span>
                </div>
                <div class="flex items-end h-4 md:h-5 gap-1">
                  <div class="w-1 md:w-1.5 bg-[#C4A882] rounded-full animate-audio-bar" style="animation-delay: 0.1s"></div>
                  <div class="w-1 md:w-1.5 bg-[#C4A882] rounded-full animate-audio-bar" style="animation-delay: 0.3s"></div>
                  <div class="w-1 md:w-1.5 bg-[#C4A882] rounded-full animate-audio-bar" style="animation-delay: 0.2s"></div>
                  <div class="w-1 md:w-1.5 bg-[#C4A882] rounded-full animate-audio-bar" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>

            <div v-if="msg.role === 'user'" class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex items-center justify-center ml-3 md:ml-4 mt-1 shrink-0 shadow-sm border border-[#C4A882]/30">
              <img src="../assets/pic2.jpg" class="w-full h-full object-cover" alt="User" />
            </div>
          </div>
        </transition-group>
      </div>
    </main>

    <footer class="w-full bg-white/70 backdrop-blur-xl border-t border-[#C4A882]/20 pb-safe pt-3 px-3 md:pt-4 md:px-8 z-30 shrink-0">
      <div class="max-w-4xl mx-auto relative mb-3 md:mb-4">

        <transition name="fade-slide">
          <div v-if="playbackState !== 'idle'" class="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 w-max max-w-[95vw] bg-[#C4A882]/95 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full shadow-2xl flex items-center justify-center gap-3 md:gap-5 z-40 border border-[#C4A882] backdrop-blur-md">
            <button @click="togglePlay" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all shrink-0">
              <PauseCircleFilled v-if="playbackState === 'playing'" class="text-xl md:text-2xl text-emerald-400" />
              <PlayCircleFilled v-else class="text-xl md:text-2xl text-white" />
            </button>
            <div class="w-[1px] h-5 md:h-6 bg-white/30"></div>
            <button @click="stopAudio" class="flex items-center gap-1.5 md:gap-2 hover:text-red-300 transition-colors text-xs md:text-sm font-medium whitespace-nowrap">
              <StopFilled /> <span class="hidden sm:inline">终止</span>
            </button>
            <div class="w-[1px] h-5 md:h-6 bg-white/30"></div>
            <button @click="resetAudioContext" class="flex items-center gap-1.5 md:gap-2 hover:text-white/80 transition-colors text-xs md:text-sm font-medium pr-1 whitespace-nowrap">
              <SyncOutlined /> <span class="hidden sm:inline">重置语境</span>
            </button>
          </div>
        </transition>

        <div
          class="flex items-end gap-2 md:gap-3 bg-white/70 backdrop-blur-md border md:border-2 rounded-2xl md:rounded-3xl p-1.5 md:p-2.5 transition-all shadow-sm"
          :class="isInputDisabled ? 'border-[#C4A882]/20 opacity-70 bg-white/50' : 'border-[#C4A882]/30 focus-within:border-[#C4A882] focus-within:shadow-[0_0_0_4px_rgba(196,168,130,0.15)]'"
        >
          <textarea
            v-model="inputText"
            @keydown.enter.prevent="handleSend"
            rows="1"
            :disabled="isInputDisabled"
            :placeholder="playbackState !== 'idle' ? '请先终止...' : '描述想听到的音乐...'"
            class="flex-1 max-h-24 md:max-h-36 bg-transparent border-none focus:ring-0 resize-none px-3 py-2.5 md:px-4 md:py-3 text-[#1C1C1E] placeholder-[#8B8078] font-medium text-sm md:text-[15px] leading-relaxed scrollbar-hide outline-none disabled:cursor-not-allowed"
            @input="autoResize"
            ref="inputRef"
          ></textarea>

          <button
            @click="handleSend"
            :disabled="!inputText.trim() || isInputDisabled"
            class="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300"
            :class="(!inputText.trim() || isInputDisabled) ? 'bg-white/70 text-[#8B8078] cursor-not-allowed border border-[#C4A882]/20' : 'bg-[#C4A882] text-white shadow-md hover:bg-[#8B8078] hover:shadow-lg active:scale-95 cursor-pointer'"
          >
            <LoadingOutlined v-if="isProcessing" class="text-lg md:text-xl" />
            <SendOutlined v-else class="text-lg md:text-xl" />
          </button>
        </div>

        <div class="text-center mt-2 md:mt-3 text-[10px] md:text-xs text-[#8B8078] font-medium drop-shadow-sm">
          AI 生成的内容可能存在瑕疵，请以实际听感为准。
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeftOutlined, SendOutlined, CustomerServiceOutlined,
  LoadingOutlined, PlayCircleFilled, PauseCircleFilled, StopFilled, SyncOutlined
} from '@ant-design/icons-vue';
import { LyriaAudioClient } from '@/api/lyriaWs.ts';

const router = useRouter();
const inputText = ref('');
const inputRef = ref(null);
const chatContainerRef = ref(null);
const isProcessing = ref(false);
const connectionStatus = ref('未连接');
const messages = ref([]);

const playbackState = ref('idle');

const isInputDisabled = computed(() => {
  return isProcessing.value || playbackState.value !== 'idle';
});

let audioClient = null;

onMounted(() => {
  audioClient = new LyriaAudioClient('wss://8.148.249.149/ws/lyria');

  audioClient.onStatusChange = (status) => {
    connectionStatus.value = status;
    if (status.includes('正在接收并播放音频流')) {
      playbackState.value = 'playing';
      updateLastAiMessageStatus('playing');
    } else if (status === '已暂停') {
      playbackState.value = 'paused';
      updateLastAiMessageStatus('idle');
    } else if (status === '已停止' || status === '上下文已重置' || status === '连接已断开') {
      playbackState.value = 'idle';
      updateLastAiMessageStatus('idle');
    }
  };

  audioClient.onError = (err) => {
    console.error(err);
    addMessage('ai', '连接发生错误，请检查网络或控制台。', true);
    isProcessing.value = false;
    playbackState.value = 'idle';
  };

  audioClient.connect();
});

onUnmounted(() => {
  if (audioClient) {
    audioClient.disconnect();
  }
});

const updateLastAiMessageStatus = (status) => {
  if (messages.value.length > 0) {
    const lastMsg = messages.value[messages.value.length - 1];
    if (lastMsg.role === 'ai') {
      lastMsg.status = status;
    }
  }
};

const autoResize = () => {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 128) + 'px';
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const addMessage = (role, content, isError = false) => {
  messages.value.push({ role, content, isError, status: 'idle' });
  scrollToBottom();
};

const togglePlay = () => {
  if (playbackState.value === 'playing') {
    audioClient.pause();
  } else {
    audioClient.resume();
  }
};

const stopAudio = () => {
  audioClient.stop();
  addMessage('ai', '已停止播放当前音频。');
};

const resetAudioContext = () => {
  audioClient.resetContext();
  addMessage('ai', '已清空创作上下文记忆。');
};

const handleSend = async () => {
  const text = inputText.value.trim();
  if (!text || isInputDisabled.value) return;

  inputText.value = '';
  if (inputRef.value) inputRef.value.style.height = 'auto';

  addMessage('user', text);
  isProcessing.value = true;

  setTimeout(() => {
    addMessage('ai', `正在基于提示词 "${text}" 生成音乐...`);
  }, 300);

  try {
    await audioClient.ensureConnected();

    const promptsArray = text.split(',').map(item => ({
      text: item.trim(),
      weight: 1.0
    })).filter(item => item.text !== '');

    audioClient.sendCommand({
      clientContent: {
        weightedPrompts: promptsArray.length > 0 ? promptsArray : [{ text: text, weight: 1.0 }]
      }
    });

    audioClient.sendCommand({ playbackControl: 'PLAY' });
    isProcessing.value = false;
  } catch (error) {
    console.error('WebSocket 连接超时或指令发送异常', error);
    addMessage('ai', '通信建立失败，请检查网络状态并重试。', true);
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.app-bg {
  background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('../assets/backgroud.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.msg-list-enter-active,
.msg-list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.msg-list-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
.msg-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes audioBar {
  0%, 100% { height: 6px; opacity: 0.6; }
  50% { height: 20px; opacity: 1; }
}
/* 移动端减小音频条震幅 */
@media (max-width: 768px) {
  @keyframes audioBar {
    0%, 100% { height: 4px; opacity: 0.6; }
    50% { height: 14px; opacity: 1; }
  }
}
.animate-audio-bar {
  animation: audioBar 1s ease-in-out infinite;
  transform-origin: bottom;
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spinSlow 3s linear infinite;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.9);
}

/* --- 新增：专门针对移动端的 CSS 优化 --- */
@media (max-width: 768px) {
  .app-bg {
    /* 防止在 iOS/Android 上键盘弹出导致背景图被剧烈压缩/滑动 */
    background-attachment: scroll;
  }

  /* 移动端播放悬浮条弹出动画稍微调小一点幅度，防止超出可视区 */
  .fade-slide-enter-from,
  .fade-slide-leave-to {
    transform: translate(-50%, 10px) scale(0.95);
  }
}
</style>
