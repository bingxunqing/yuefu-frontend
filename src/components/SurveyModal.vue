<template>
  <div class="fixed inset-0 z-[150] bg-[#f8fafc] flex flex-col font-sans overflow-hidden animate-fade-in">

    <div class="fixed top-0 left-0 right-0 z-[160] bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div class="h-12 md:h-18 flex items-center justify-between px-3 md:px-8 w-full">

        <div class="flex items-center gap-1.5 md:gap-2.5 px-1 md:px-2 py-1.5">
          <loading-outlined class="animate-spin text-blue-500 text-lg md:text-2xl" />
          <span class="text-base sm:text-lg md:text-xl font-black text-slate-800 tracking-tight">
            云端 AI 正在识别...
          </span>
        </div>

        <button
          @click="$emit('skip')"
          class="text-slate-400 hover:text-slate-800 text-xs md:text-base font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-slate-100 transition-colors active:scale-95"
        >
          跳过问卷
        </button>
      </div>

      <div class="w-full h-[2px] md:h-[3px] bg-slate-100">
        <div
          class="h-full bg-emerald-500 transition-all duration-500 ease-out"
          :style="{ width: `${(step / questions.length) * 100}%` }"
        ></div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-24 pb-28 md:pb-32 flex flex-col items-center">
      <div class="w-full max-w-2xl px-4 md:px-10 flex flex-col min-h-full">

        <div v-if="step === 0" class="flex-1 flex flex-col justify-center items-center text-center animate-slide-up my-auto py-6 md:py-10">
          <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 shadow-xl shadow-rose-100/50 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8">
            <span class="text-3xl sm:text-4xl md:text-5xl">👋</span>
          </div>
          <h2 class="text-xl sm:text-2xl md:text-4xl font-extrabold text-slate-900 mb-3 md:mb-5 tracking-tight leading-snug">
            请花费 2 分钟<br>帮助我们了解您的音乐背景
          </h2>
          <p class="text-slate-500 text-xs md:text-base font-medium leading-relaxed max-w-[16rem] sm:max-w-md">
            这将有助于我们提供更加个性化的服务。我们确保这些信息仅用于研究，不会用于任何其他用途。
          </p>
        </div>

        <div v-else class="flex flex-col animate-slide-up pt-4 md:pt-10 h-full">

          <div class="mb-5 md:mb-8 text-left">
            <div class="flex items-center gap-2 mb-2 md:mb-3">
              <span v-if="currentQuestion.type === 'multiple'" class="text-[10px] md:text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 md:px-2.5 md:py-1 rounded border border-orange-200">
                多选
              </span>
              <span v-else class="text-[10px] md:text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 md:px-2.5 md:py-1 rounded border border-cyan-200">
                单选
              </span>
            </div>
            <h2 class="text-lg sm:text-xl md:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight mb-1.5 md:mb-2">
              {{ currentQuestion.title }}
            </h2>
            <p v-if="currentQuestion.desc" class="text-[11px] md:text-sm text-slate-500 font-medium leading-relaxed mt-1 md:mt-2">
              {{ currentQuestion.desc }}
            </p>
          </div>

          <div class="flex-1 flex flex-col gap-2.5 md:gap-4 overflow-y-auto pb-4">
            <div
              v-for="(option, oIdx) in currentQuestion.options"
              :key="oIdx"
              class="flex flex-col gap-1.5 md:gap-2 shrink-0"
            >
              <div
                @click="toggleOption(option)"
                class="relative border md:border-2 rounded-xl md:rounded-2xl p-3.5 md:p-5 flex items-center gap-3 md:gap-4 cursor-pointer transition-all duration-200 group bg-white"
                :class="isSelected(option) ? 'border-emerald-500 shadow-sm shadow-emerald-500/10 z-10' : 'border-slate-200 shadow-sm shadow-slate-200/50 hover:border-slate-300 hover:shadow-md'"
              >
                <div
                  class="w-4 h-4 md:w-6 md:h-6 border-[1.5px] md:border-2 flex items-center justify-center shrink-0 transition-all duration-300"
                  :class="[
                    isSelected(option) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-slate-50 group-hover:border-slate-400',
                    currentQuestion.type === 'multiple' ? 'rounded md:rounded-md' : 'rounded-full'
                  ]"
                >
                  <check-outlined v-if="isSelected(option)" class="text-white text-[8px] md:text-xs font-bold" />
                </div>

                <span
                  class="font-bold text-[13px] sm:text-sm md:text-base transition-colors flex-1"
                  :class="isSelected(option) ? 'text-emerald-900' : 'text-slate-700 group-hover:text-slate-900'"
                >
                  {{ option }}
                </span>

                <div v-if="isSelected(option)" class="absolute inset-0 bg-emerald-50/40 rounded-xl md:rounded-2xl pointer-events-none"></div>
              </div>

              <div
                v-if="option.includes('其他') && isSelected(option)"
                class="animate-slide-up pl-9 md:pl-12 pr-1"
              >
                <input
                  type="text"
                  v-model="customInputs[currentQuestionIndex]"
                  placeholder="请输入具体情况..."
                  class="w-full px-3 py-2.5 md:px-4 md:py-3 border border-emerald-200 md:border-2 rounded-lg md:rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white shadow-sm font-medium text-[13px] md:text-sm transition-colors"
                  @click.stop
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 z-[160] pointer-events-none flex flex-col items-center">
      <div class="w-full h-8 md:h-10 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      <div class="w-full bg-[#f8fafc] px-4 md:px-5 pb-4 md:pb-10 pt-1 md:pt-2 flex justify-center border-t border-slate-100 md:border-none">
        <div class="w-full max-w-2xl pointer-events-auto flex gap-2.5 md:gap-3">

          <button
            v-if="step > 0"
            @click="handlePrev"
            class="w-1/3 md:w-1/4 bg-white text-slate-700 hover:text-slate-900 font-bold py-3 md:py-5 rounded-xl md:rounded-[1.5rem] text-[15px] md:text-lg border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            上一步
          </button>

          <button
            @click="handleNext"
            :disabled="step > 0 && !canProceed"
            class="flex-1 bg-slate-900 !text-white font-bold py-3 md:py-5 rounded-xl md:rounded-[1.5rem] text-[15px] md:text-lg shadow-lg md:shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-slate-900/30 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-1.5 md:gap-2"
          >
            {{ step === 0 ? '开始填写' : (isLastStep ? '提交问卷' : '下一步') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons-vue';

const emit = defineEmits(['complete', 'skip']);

const step = ref(0);
const answers = ref({});
const customInputs = ref({});

const questions = [
  { title: '您的音乐背景是？', type: 'single', options: ['音乐初学者（学习时间＜1年）', '业余音乐学习者（1-5年）', '进阶学习者/音乐爱好者', '音乐专业学生', '专业音乐从业者（教师/演奏者/编曲等）'] },
  { title: '您主要使用的乐器是？', type: 'multiple', options: ['钢琴', '小提琴', '吉他', '管乐器', '声乐', '作曲/编曲', '其他...'] },
  { title: '您平时获取乐谱的方式是？', type: 'multiple', options: ['纸质教材/书籍', 'PDF乐谱', '图片/拍照', '乐谱网站下载', '音乐软件自带乐谱', '自己编写', '其他...'] },
  { title: '你在理解新乐谱时通常遇到哪些困难？', type: 'multiple', options: ['很难快速想象音乐整体效果', '识谱速度慢', '乐谱复杂（多声部/节奏复杂）', '没有方便的试听工具', '图片或纸质乐谱无法直接播放', '需要手动输入乐谱才能试听', '其他...'] },
  { title: '当你拿到一份新乐谱时，你最希望做的事情是？', type: 'multiple', options: ['立即试听整体效果', '分析旋律与节奏结构', '直接开始练习', '查看难度是否适合', '进行改编/编曲', '其他...'] },
  { title: '您是否希望软件提供图片乐谱识别？', desc: '系统能够自动识别图片或PDF中的五线谱，并将其转换为可播放、可编辑的数字乐谱。', type: 'single', options: ['非常希望', '可以有', '无所谓', '不需要'] },
  { title: '您是否希望软件能提供乐谱即时试听功能？', desc: '系统能够根据识别结果自动生成音频播放，使用户无需演奏即可快速了解乐曲整体效果。', type: 'single', options: ['非常希望', '可以有', '无所谓', '不需要'] },
  { title: '您是否希望软件提供乐谱编辑功能？', desc: '系统支持用户对识别后的乐谱进行修改和简单编辑，以满足个性化学习或创作需求。', type: 'single', options: ['非常希望', '可以有', '无所谓', '不需要'] },
  { title: '您是否希望软件提供AI辅助音乐功能？', type: 'single', options: ['非常希望', '可以有', '无所谓', '不需要'] },
  { title: '在音乐领域，你最感兴趣的AI功能是？', type: 'multiple', options: ['AI自动编曲', 'AI旋律润色', 'AI生成伴奏', 'AI分析乐曲难度', 'AI推荐练习方式', 'AI风格转换（古典/流行等）'] },
  { title: '您是否希望软件提供乐谱可视化功能？', desc: '系统通过动态图形方式展示乐谱结构，帮助用户更直观地理解旋律、节奏和音高变化。', type: 'single', options: ['非常希望', '可以有', '无所谓', '不需要'] }
];

const currentQuestionIndex = computed(() => step.value - 1);
const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
const isLastStep = computed(() => step.value === questions.length);

const currentAnswers = computed(() => {
  return answers.value[currentQuestionIndex.value] || [];
});

const canProceed = computed(() => {
  const selected = currentAnswers.value;
  if (selected.length === 0) return false;

  const hasOtherSelected = selected.some(opt => opt.includes('其他'));
  if (hasOtherSelected) {
    const customText = customInputs.value[currentQuestionIndex.value];
    if (!customText || customText.trim() === '') {
      return false;
    }
  }

  return true;
});

const isSelected = (option) => {
  return currentAnswers.value.includes(option);
};

const toggleOption = (option) => {
  const qIdx = currentQuestionIndex.value;
  const qType = currentQuestion.value.type;
  let currentSelections = answers.value[qIdx] || [];

  if (qType === 'single') {
    answers.value[qIdx] = [option];
    if (!option.includes('其他')) {
      customInputs.value[qIdx] = '';
    }
  } else {
    if (currentSelections.includes(option)) {
      answers.value[qIdx] = currentSelections.filter(item => item !== option);
      if (option.includes('其他')) {
        customInputs.value[qIdx] = '';
      }
    } else {
      answers.value[qIdx] = [...currentSelections, option];
    }
  }
};

const formatPayload = () => {
  const payload = {};
  questions.forEach((_, index) => {
    const selectedOptions = answers.value[index] || [];
    const customText = customInputs.value[index] || '';

    payload[`问题${index + 1}`] = selectedOptions.map(opt => {
      if (opt.includes('其他')) {
        return `其他: ${customText.trim()}`;
      }
      return opt;
    });
  });
  return payload;
};

const handlePrev = () => {
  if (step.value > 0) {
    step.value--;
  }
};

const handleNext = () => {
  if (step.value === 0) {
    step.value++;
    return;
  }

  if (isLastStep.value) {
    emit('complete', formatPayload());
  } else {
    step.value++;
  }
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
