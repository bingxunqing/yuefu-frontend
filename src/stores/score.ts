import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getOmrTaskStatus } from '@/api/omr';

export interface ScoreMeta {
  taskId: string;
  name: string;
  time: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT' | string;
}

const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL = 2000;

export const useScoreStore = defineStore('score', () => {
  const scores = ref<ScoreMeta[]>(JSON.parse(localStorage.getItem('yf_scores') || '[]'));

  const saveToLocal = () => {
    localStorage.setItem('yf_scores', JSON.stringify(scores.value));
  };

  const addScore = (task: ScoreMeta) => {
    scores.value.unshift(task);
    saveToLocal();
    if (task.status === 'PROCESSING') {
      pollStatus(task.taskId, 0);
    }
  };

  const deleteScore = (taskId: string) => {
    const index = scores.value.findIndex(s => s.taskId === taskId);
    if (index !== -1) {
      scores.value.splice(index, 1);
      saveToLocal();
    }
  };

  const updateStatus = (taskId: string, newStatus: ScoreMeta['status']) => {
    const target = scores.value.find(s => s.taskId === taskId);
    if (target) {
      target.status = newStatus;
      saveToLocal();
      return true;
    }
    return false;
  };

  const pollStatus = async (taskId: string, attempt: number = 0) => {
    const currentTask = scores.value.find(s => s.taskId === taskId);
    if (!currentTask) return;

    if (attempt >= MAX_POLL_ATTEMPTS) {
      updateStatus(taskId, 'TIMEOUT');
      console.warn(`任务 ${taskId} 轮询超时`);
      return;
    }

    try {
      const res = await getOmrTaskStatus(taskId);
      const isSuccess = res.data && (res.data.code === 200 || res.data.code === undefined);

      if (isSuccess && res.data.data) {
        const newStatus = res.data.data;

        const isUpdated = updateStatus(taskId, newStatus);

        if (isUpdated && newStatus === 'PROCESSING') {
          setTimeout(() => pollStatus(taskId, attempt + 1), POLL_INTERVAL);
        }
      } else {
        updateStatus(taskId, 'FAILED');
      }
    } catch (error) {
      console.error(`轮询异常:`, error);
      setTimeout(() => pollStatus(taskId, attempt + 1), POLL_INTERVAL);
    }
  };

  const resumePolling = () => {
    scores.value
      .filter(s => s.status === 'PROCESSING')
      .forEach((task, index) => {
        setTimeout(() => pollStatus(task.taskId, 0), index * 500);
      });
  };

  return {
    scores,
    addScore,
    resumePolling,
    deleteScore
  };
});
