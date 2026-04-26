<template>
  <div class="flex flex-col h-screen bg-[#F5F0E8] text-[#1C1C1E] overflow-hidden font-sans">
    <header class="flex items-center justify-between px-3 md:px-6 py-2 md:py-4 bg-white/70 backdrop-blur-md border-b border-[#C4A882]/20 z-10 shrink-0 shadow-sm">
      <div class="flex items-center gap-2 md:gap-4 overflow-hidden">
        <button @click="handleBack" class="px-3 md:px-4 py-1.5 md:py-2 bg-white/70 hover:bg-[#C4A882] hover:text-white border border-[#C4A882]/20 rounded-lg text-xs md:text-sm transition-all cursor-pointer shrink-0 font-bold">
          返回
        </button>
        <h1 class="text-sm md:text-xl font-bold truncate max-w-[120px] md:max-w-md">{{ scoreName }}</h1>
      </div>

      <div class="flex items-center gap-2 md:gap-4 shrink-0">
        <div class="flex bg-white/70 backdrop-blur-md rounded-lg p-1 border border-[#C4A882]/20">
          <button
            @click="switchView('waterfall')"
            :class="['px-2 md:px-4 py-1 md:py-1.5 rounded-md text-xs md:text-sm transition-all cursor-pointer font-bold', viewMode === 'waterfall' ? 'bg-[#C4A882] text-white shadow-sm' : 'text-[#8B8078]']"
          >
            瀑布流
          </button>
          <button
            @click="switchView('sheet')"
            :class="['px-2 md:px-4 py-1 md:py-1.5 rounded-md text-xs md:text-sm transition-all cursor-pointer font-bold', viewMode === 'sheet' ? 'bg-[#C4A882] text-white shadow-sm' : 'text-[#8B8078]']"
          >
            五线谱
          </button>
        </div>

        <button @click="exportXML" class="px-3 md:px-4 py-1.5 md:py-2 bg-[#C4A882] hover:bg-[#8B8078] text-white rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer shrink-0 shadow-sm">
          <span class="hidden md:inline">导出 XML</span>
          <span class="inline md:hidden">导出</span>
        </button>
      </div>
    </header>

    <main class="flex-1 relative overflow-hidden flex flex-col">

      <div v-show="viewMode === 'waterfall'" class="flex-1 relative w-full flex flex-col bg-[#F5F0E8]">

        <div class="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white/80 backdrop-blur-md px-4 py-2 md:py-3 rounded-2xl md:rounded-full border border-[#C4A882]/20 shadow-xl w-[95vw] md:w-[800px]">

          <div class="flex items-center gap-3 w-full md:flex-1">
            <button @click="togglePlay" class="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-[#C4A882] flex items-center justify-center hover:bg-[#8B8078] transition-all cursor-pointer shadow-sm">
              <span v-if="!isPlaying" class="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></span>
              <div v-else class="w-2.5 h-2.5 md:w-3 md:h-3 border-x-[3px] md:border-x-4 border-white"></div>
            </button>

            <div class="text-xs md:text-sm font-mono text-[#8B8078] w-10 md:w-12 text-right shrink-0">
              {{ formatPlaybackTime(currentPlaybackTime) }}
            </div>

            <input
              type="range"
              min="0"
              :max="totalDuration"
              step="0.01"
              :value="currentPlaybackTime"
              @input="handleSeek"
              class="flex-1 cursor-pointer accent-[#C4A882] bg-[#E8DCC8] h-1 md:h-1.5 rounded-lg appearance-none outline-none relative z-10"
            />

            <div class="text-xs md:text-sm font-mono text-[#8B8078] w-10 md:w-12 shrink-0">
              {{ formatPlaybackTime(totalDuration) }}
            </div>
          </div>

          <div class="flex items-center justify-between w-full md:w-auto border-t md:border-t-0 md:border-l border-[#C4A882]/20 pt-2 md:pt-0 pl-0 md:pl-4 shrink-0 gap-4 md:gap-8">

            <button
              @click="isAutoFollow = !isAutoFollow"
              :class="['flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border transition-all cursor-pointer text-xs md:text-sm font-bold shrink-0', isAutoFollow ? 'border-[#C4A882] bg-[#C4A882]/10 text-[#C4A882]' : 'border-[#E8DCC8] text-[#8B8078]']"
            >
              <span class="w-2 h-2 rounded-full" :class="isAutoFollow ? 'bg-[#C4A882] animate-pulse' : 'bg-[#8B8078]'"></span>
              {{ isAutoFollow ? '跟随中' : '自由滑' }}
            </button>

            <div class="flex items-center gap-2 md:gap-4">
              <div class="relative flex items-center">
                <div
                  @click="showSpeedMenu = !showSpeedMenu"
                  class="bg-transparent text-[#8B8078] text-xs md:text-sm font-bold cursor-pointer hover:text-[#C4A882] transition-colors flex items-center gap-1 select-none"
                >
                  <span>{{ playbackRate }}x</span>
                  <span class="text-[10px] transition-transform" :class="showSpeedMenu ? 'rotate-180' : ''">▼</span>
                </div>
                <transition name="fade">
                  <div
                    v-if="showSpeedMenu"
                    class="absolute top-full mt-2 md:mt-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-[#C4A882]/20 rounded-xl shadow-2xl py-1 md:py-2 w-20 md:w-24 z-50 overflow-hidden"
                  >
                    <div
                      v-for="rate in [0.5, 0.75, 1.0, 1.25, 1.5]"
                      :key="rate"
                      @click="selectSpeed(rate)"
                      class="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-center cursor-pointer transition-all"
                      :class="playbackRate == rate ? 'text-[#C4A882] font-bold bg-[#C4A882]/10' : 'text-[#8B8078] hover:bg-[#C4A882]/5 hover:text-[#C4A882]'"
                    >
                      {{ rate }}x
                    </div>
                  </div>
                </transition>
              </div>

              <button
                @click="toggleMute"
                :class="['flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border transition-all cursor-pointer shrink-0', isMuted ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-[#E8DCC8] hover:bg-[#C4A882]/10 text-[#8B8078]']"
              >
                <sound-outlined v-if="!isMuted" class="text-xs md:text-sm" />
                <div v-else class="relative w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                  <span class="absolute w-full h-[1.5px] bg-red-400 rotate-45"></span>
                  <sound-outlined class="text-xs md:text-sm" />
                </div>
                <span class="text-xs md:text-sm font-bold hidden md:inline">{{ isMuted ? '伴奏关' : '伴奏开' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="showSpeedMenu" @click="showSpeedMenu = false" class="absolute inset-0 z-20"></div>

        <div
          ref="scrollWrapper"
          class="flex-1 relative w-full h-full overflow-x-auto overflow-y-hidden smooth-scroll"
          @touchstart="handleUserTouch"
          @mousedown="handleUserTouch"
          @wheel="handleUserTouch"
        >
          <div ref="scrollContent" class="relative h-full min-w-[1200px] w-full mx-auto">

            <canvas ref="waterfallCanvas" class="absolute inset-0 block z-0"></canvas>

            <div class="absolute bottom-0 left-0 w-full h-[120px] md:h-[180px] bg-gray-900 border-t-4 border-gray-700 flex shadow-2xl z-10 select-none">
              <div
                v-for="key in keyboardLayout"
                :key="'key-'+key.midi"
                @mousedown="playManualKey(key.midi)"
                @mouseup="releaseManualKey(key.midi)"
                @mouseleave="releaseManualKey(key.midi)"
                @touchstart.prevent="playManualKey(key.midi)"
                @touchend.prevent="releaseManualKey(key.midi)"
                :class="[
                   'absolute top-0 cursor-pointer rounded-b-md transition-colors duration-75',
                   key.isBlack
                      ? 'bg-gray-900 border border-black border-t-0 z-20 hover:bg-gray-700'
                      : 'bg-white border border-gray-300 border-t-0 z-10 hover:bg-gray-200',
                   activeMidiKeys.has(key.midi) ? (key.isBlack ? '!bg-gray-700' : '!bg-gray-400') : ''
                 ]"
                :style="{
                   left: key.leftPercent + '%',
                   width: key.widthPercent + '%',
                   height: key.isBlack ? '65%' : '100%'
                 }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="viewMode === 'sheet'" class="flex-1 overflow-auto bg-[#F5F5F7] p-2 md:p-8 text-black relative z-0">
        <div v-if="sheetImageUrl" class="w-full max-w-5xl mx-auto bg-white shadow-lg p-2 md:p-4">
          <img :src="sheetImageUrl" alt="五线谱" class="w-full h-auto" />
        </div>
        <div v-else ref="osmdContainer" class="w-full max-w-5xl mx-auto bg-white shadow-lg p-2 md:p-4 min-h-full"></div>
      </div>

      <div v-if="isLoading" class="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div class="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-blue-400 text-sm md:text-base font-bold tracking-widest">{{ loadingText }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { downloadOmrResult, downloadOmrPic } from '@/api/omr';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import * as Tone from 'tone';
import { SoundOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const taskId = route.query.taskId;
const scoreName = ref(route.query.name || '未命名乐谱');

const viewMode = ref('sheet');
const isLoading = ref(true);
const loadingText = ref('正在初始化...');

const scrollWrapper = ref(null);
const scrollContent = ref(null);
const waterfallCanvas = ref(null);
const osmdContainer = ref(null);
const sheetImageUrl = ref('');

const extractedXmlString = ref('');
const osmdInstance = shallowRef(null);

const baseParsedNotes = shallowRef([]);
const parsedNotes = shallowRef([]);

const isPlaying = ref(false);
const currentPlaybackTime = ref(0);
const totalDuration = ref(0);
const playbackRate = ref(1.0);
const showSpeedMenu = ref(false);
const isMuted = ref(false);
const isAutoFollow = ref(true); // 控制是否自动滚动钢琴坐标系
let animationFrameId = null;
const synth = shallowRef(null);
const tonePart = shallowRef(null);

const activeMidiKeys = ref(new Set());
const splashes = shallowRef([]); // 存储水墨溅射粒子

// 最小物理渲染宽度，防止手机端按键挤压
const MIN_KEYBOARD_WIDTH = 1200;
const BASE_PIXELS_PER_SECOND = 200;
const currentPixelsPerSecond = computed(() => BASE_PIXELS_PER_SECOND * playbackRate.value);

// 当用户在移动端触摸或滑动时，临时打断自动跟随，避免和用户操作抢夺焦点
const handleUserTouch = () => {
  if (isAutoFollow.value) {
    isAutoFollow.value = false;
  }
};

const keyboardLayout = computed(() => {
  const keys = [];
  let whiteCount = 0;
  const TOTAL_WHITE_KEYS = 52;

  for (let midi = 21; midi <= 108; midi++) {
    const noteClass = midi % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteClass);
    if (isBlack) {
      const widthPercent = (0.65 / TOTAL_WHITE_KEYS) * 100;
      const leftPercent = (whiteCount / TOTAL_WHITE_KEYS) * 100 - (widthPercent / 2);
      keys.push({ midi, isBlack: true, leftPercent, widthPercent });
    } else {
      const widthPercent = (1 / TOTAL_WHITE_KEYS) * 100;
      const leftPercent = (whiteCount / TOTAL_WHITE_KEYS) * 100;
      keys.push({ midi, isBlack: false, leftPercent, widthPercent });
      whiteCount++;
    }
  }
  return keys;
});

onMounted(async () => {
  if (!taskId) {
    loadingText.value = '参数错误';
    return;
  }
  try {
    isLoading.value = true;
    loadingText.value = '正在加载音色库...';
    await initAudioEngine();
    await fetchAndParseScore();
    fetchSheetImage();
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('初始化失败:', error);
    loadingText.value = `初始化失败: ${error.message}`;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  stopPlayback();
  if (osmdInstance.value) osmdInstance.value.clear();
  if (synth.value) synth.value.dispose();
  if (tonePart.value) tonePart.value.dispose();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  Tone.Destination.mute = false;
});

const handleBack = () => {
  stopPlayback();
  router.back();
};

const switchView = (mode) => {
  viewMode.value = mode;
  if (mode === 'sheet') {
    stopPlayback();
  } else {
    // 延迟到 DOM 更新后重新计算物理像素
    setTimeout(handleResize, 50);
  }
};

const fetchAndParseScore = async () => {
  try {
    isLoading.value = true;
    loadingText.value = '正在下载乐谱数据...';
    const res = await downloadOmrResult(taskId);
    if (!res.data) throw new Error('数据为空');

    loadingText.value = '正在解析乐谱...';
    // 兼容 axios 返回 blob 或者是 string 的情况
    let xmlString = '';
    if (res.data instanceof Blob) {
      xmlString = await res.data.text();
    } else {
      xmlString = res.data;
    }

    extractedXmlString.value = xmlString;

    loadingText.value = '正在构建五线谱视图...';
    await renderSheetMusic();

    loadingText.value = '正在重构时间轴数据...';
    parseTimelineData();

    isLoading.value = false;
    setTimeout(handleResize, 50);
  } catch (error) {
    console.error('加载失败:', error);
    loadingText.value = `加载失败: ${error.message}`;
  }
};

const renderSheetMusic = async () => {
  if (!osmdContainer.value) return;
  osmdInstance.value = new OpenSheetMusicDisplay(osmdContainer.value, {
    autoResize: true,
    drawTitle: false,
  });
  await osmdInstance.value.load(extractedXmlString.value);
  osmdInstance.value.render();
};

const fetchSheetImage = async () => {
  try {
    const res = await downloadOmrPic(taskId);
    if (res.data?.data) {
      sheetImageUrl.value = `data:image/png;base64,${res.data.data}`;
    }
  } catch (error) {
    console.error('获取五线谱图片失败:', error);
  }
};

const parseTimelineData = () => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(extractedXmlString.value, "text/xml");

  const notes = [];
  const divisionsNode = xmlDoc.querySelector('attributes divisions');
  const divisions = divisionsNode ? parseInt(divisionsNode.textContent) : 1;

  let bpm = 120;
  const tempoNode = xmlDoc.querySelector('sound[tempo], direction-type metronome per-minute');
  if (tempoNode) {
    if (tempoNode.tagName === 'sound') bpm = parseFloat(tempoNode.getAttribute('tempo'));
    else bpm = parseFloat(tempoNode.textContent);
  }

  const secondsPerQuarterNote = 60 / bpm;
  const secondsPerTick = secondsPerQuarterNote / divisions;

  const parts = xmlDoc.querySelectorAll('part');
  parts.forEach((part) => {
    let currentTick = 0;
    const measures = part.querySelectorAll('measure');

    measures.forEach((measure) => {
      const elements = Array.from(measure.children);
      let previousNoteStartTick = currentTick;

      elements.forEach((el) => {
        if (el.tagName === 'note') {
          const isChord = el.querySelector('chord') !== null;
          const isRest = el.querySelector('rest') !== null;
          const durationNode = el.querySelector('duration');
          const durationTicks = durationNode ? parseInt(durationNode.textContent) : 0;
          const staffNode = el.querySelector('staff');
          const staff = staffNode ? parseInt(staffNode.textContent) : 1;

          let startTick = isChord ? previousNoteStartTick : currentTick;
          if (!isChord) previousNoteStartTick = currentTick;

          if (!isRest) {
            const pitchNode = el.querySelector('pitch');
            if (pitchNode) {
              const step = pitchNode.querySelector('step').textContent;
              const octave = parseInt(pitchNode.querySelector('octave').textContent);
              const alterNode = pitchNode.querySelector('alter');
              const alter = alterNode ? parseInt(alterNode.textContent) : 0;

              const pitchString = step + (alter === 1 ? '#' : alter === -1 ? 'b' : '') + octave;
              const midiNote = Tone.Frequency(pitchString).toMidi();

              notes.push({
                pitch: pitchString,
                midi: midiNote,
                baseTime: startTick * secondsPerTick,
                baseDuration: durationTicks * secondsPerTick,
                staff: staff
              });
            }
          }
          if (!isChord) currentTick += durationTicks;
        } else if (el.tagName === 'backup') {
          currentTick -= parseInt(el.querySelector('duration').textContent);
        } else if (el.tagName === 'forward') {
          currentTick += parseInt(el.querySelector('duration').textContent);
        }
      });
    });
  });

  notes.sort((a, b) => a.baseTime - b.baseTime);
  baseParsedNotes.value = notes;
  applySpeedChange(1.0);
};

const applySpeedChange = (newRate) => {
  playbackRate.value = newRate;
  parsedNotes.value = baseParsedNotes.value.map(n => ({
    ...n,
    time: n.baseTime / newRate,
    duration: n.baseDuration / newRate
  }));

  const maxEnd = parsedNotes.value.reduce((max, note) => Math.max(max, note.time + note.duration), 0);
  const oldTotal = totalDuration.value;
  totalDuration.value = maxEnd > 0 ? maxEnd + 2 : 0;

  if (oldTotal > 0) {
    const progressRatio = currentPlaybackTime.value / oldTotal;
    currentPlaybackTime.value = progressRatio * totalDuration.value;
    Tone.Transport.seconds = currentPlaybackTime.value;
  }

  scheduleAudioPlayback();
  if (!isPlaying.value) drawFrame(currentPlaybackTime.value);
};

const selectSpeed = (rate) => {
  showSpeedMenu.value = false;
  const wasPlaying = isPlaying.value;
  if (wasPlaying) stopPlayback();
  applySpeedChange(rate);
  if (wasPlaying) togglePlay();
};

const initAudioEngine = () => {
  return new Promise((resolve) => {
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
    const vol = new Tone.Volume(-5).toDestination();
    reverb.connect(vol);

    // 使用成熟的采样器方案，替换原有的 FMSynth 算法
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1.5,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        console.log('Piano samples loaded.');
        resolve();
      }
    }).connect(reverb);

    synth.value = sampler;
  });
};

const scheduleAudioPlayback = () => {
  if (tonePart.value) tonePart.value.dispose();

  tonePart.value = new Tone.Part((time, note) => {
    if (!isMuted.value) {
      synth.value.triggerAttackRelease(note.pitch, note.duration, time);
    }
    Tone.Draw.schedule(() => {
      activeMidiKeys.value.add(note.midi);
      setTimeout(() => {
        activeMidiKeys.value.delete(note.midi);
      }, note.duration * 1000);
    }, time);
  }, parsedNotes.value).start(0);
};

const playManualKey = async (midi) => {
  if (Tone.context.state !== 'running') await Tone.start();
  const freq = Tone.Frequency(midi, "midi").toFrequency();
  synth.value.triggerAttack(freq);
  activeMidiKeys.value.add(midi);
};

const releaseManualKey = (midi) => {
  if(activeMidiKeys.value.has(midi)) {
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    synth.value.triggerRelease(freq);
    activeMidiKeys.value.delete(midi);
  }
};

const togglePlay = async () => {
  await Tone.start();
  if (isPlaying.value) {
    stopPlayback();
  } else {
    if (currentPlaybackTime.value >= totalDuration.value - 2) {
      Tone.Transport.seconds = 0;
    }
    Tone.Transport.start();
    isPlaying.value = true;
    renderWaterfall();
  }
};

const stopPlayback = () => {
  Tone.Transport.pause();
  isPlaying.value = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  synth.value.releaseAll();
  activeMidiKeys.value.clear();
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (isMuted.value) synth.value.releaseAll();
};

const handleSeek = (e) => {
  const time = parseFloat(e.target.value);
  Tone.Transport.seconds = time;
  currentPlaybackTime.value = time;
  if (!isPlaying.value) drawFrame(time);
};

const formatPlaybackTime = (seconds) => {
  const s = Math.max(0, seconds || 0);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const handleResize = () => {
  if (!waterfallCanvas.value || !scrollContent.value || !scrollWrapper.value) return;
  const wrapperWidth = scrollWrapper.value.clientWidth;

  const logicalWidth = Math.max(wrapperWidth, MIN_KEYBOARD_WIDTH);
  scrollContent.value.style.width = `${logicalWidth}px`;

  const cvs = waterfallCanvas.value;
  cvs.width = logicalWidth;
  cvs.height = scrollWrapper.value.clientHeight;

  if (!isPlaying.value) drawFrame(currentPlaybackTime.value);
};

const renderWaterfall = () => {
  if (!isPlaying.value) return;
  currentPlaybackTime.value = Tone.Transport.seconds;

  if (currentPlaybackTime.value >= totalDuration.value) {
    stopPlayback();
  } else {
    drawFrame(currentPlaybackTime.value);
    animationFrameId = requestAnimationFrame(renderWaterfall);
  }
};

const drawFrame = (currentTime) => {
  const cvs = waterfallCanvas.value;
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const width = cvs.width;
  const height = cvs.height;

  const isMobile = window.innerWidth < 768;
  const currentKeyboardHeight = isMobile ? 120 : 180;

  ctx.clearRect(0, 0, width, height);

  ctx.save();
  const pps = currentPixelsPerSecond.value;
  let activeNoteXSum = 0;
  let activeNoteCount = 0;

  parsedNotes.value.forEach(note => {
    const timeDiff = note.time - currentTime;
    const noteBottomY = height - currentKeyboardHeight - (timeDiff * pps);
    const noteTopY = noteBottomY - (note.duration * pps);

    if (noteTopY > height - currentKeyboardHeight || noteBottomY < 0) return;

    const keyLayout = keyboardLayout.value.find(k => k.midi === note.midi);
    if (!keyLayout) return;

    const keyWidthPx = (keyLayout.widthPercent / 100) * width;
    const keyLeftPx = (keyLayout.leftPercent / 100) * width;
    const noteWidth = keyWidthPx * 0.8;
    const noteX = keyLeftPx + (keyWidthPx / 2) - (noteWidth / 2);
    const centerX = noteX + noteWidth / 2;
    const radius = noteWidth / 2;

    const isActive = currentTime >= note.time && currentTime <= note.time + note.duration;

    if (isActive) {
      activeNoteXSum += noteX;
      activeNoteCount++;
    }

    const gradient = ctx.createLinearGradient(0, noteBottomY, 0, noteTopY);
    const bodyColor = isActive ? 'rgba(30, 30, 30, 0.95)' : 'rgba(50, 50, 50, 0.7)';
    const tailColor = 'rgba(30, 30, 30, 0)';

    gradient.addColorStop(0, bodyColor);
    gradient.addColorStop(1, tailColor);

    ctx.fillStyle = gradient;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(centerX, noteTopY);
    ctx.lineTo(centerX - radius * 0.85, noteBottomY);
    ctx.lineTo(centerX + radius * 0.85, noteBottomY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isActive ? 'rgba(20, 20, 20, 0.15)' : 'rgba(40, 40, 40, 0.1)';
    ctx.beginPath();
    ctx.arc(centerX, noteBottomY, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isActive ? 'rgba(20, 20, 20, 0.3)' : 'rgba(40, 40, 40, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, noteBottomY, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    const headColor = isActive ? 'rgba(20, 20, 20, 0.95)' : 'rgba(40, 40, 40, 0.85)';
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(centerX, noteBottomY, radius, 0, Math.PI * 2);
    ctx.fill();

    if (isActive) {
      ctx.fillStyle = `rgba(40, 40, 40, 0.4)`;
      ctx.beginPath();
      ctx.ellipse(centerX, height - currentKeyboardHeight, noteWidth * 1.5, noteWidth * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() < 0.25) {
        const splashCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < splashCount; i++) {
          splashes.value.push({
            x: centerX + (Math.random() - 0.5) * noteWidth,
            y: height - currentKeyboardHeight,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 4 - 1.5,
            size: 1 + Math.random() * 3,
            opacity: 0.6 + Math.random() * 0.4,
            gravity: 0.25,
            life: 1,
            decay: 0.02 + Math.random() * 0.04
          });
        }
      }
    }
  });

  for (let i = splashes.value.length - 1; i >= 0; i--) {
    let s = splashes.value[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += s.gravity;
    s.life -= s.decay;

    if (s.life <= 0) {
      splashes.value.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(30, 30, 30, ${s.opacity * s.life})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  if (isAutoFollow.value && activeNoteCount > 0 && scrollWrapper.value) {
    const avgX = activeNoteXSum / activeNoteCount;
    const wrapper = scrollWrapper.value;
    const targetScrollLeft = avgX - (wrapper.clientWidth / 2);
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const clampedScroll = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    wrapper.scrollLeft = clampedScroll;
  }
};

const exportXML = () => {
  if (!extractedXmlString.value) return;
  const blob = new Blob([extractedXmlString.value], { type: 'application/vnd.recordare.musicxml+xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${scoreName.value}.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
</script>

<style scoped>

.smooth-scroll::-webkit-scrollbar { height: 6px; }
.smooth-scroll::-webkit-scrollbar-track { background: #E8DCC8; }
.smooth-scroll::-webkit-scrollbar-thumb { background: #C4A882; border-radius: 4px; }
input[type=range]::-webkit-slider-thumb {
  appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; cursor: pointer; box-shadow: 0 2px 4px rgba(196,168,130,0.3);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -10px); }
</style>
