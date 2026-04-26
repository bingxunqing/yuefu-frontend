import axios from 'axios';

// ==========================================
// Axios 实例配置
// ==========================================
const baseURL = import.meta.env.VITE_API_BASE_URL as string;

if (!baseURL) {
  console.warn('警告: 未找到 VITE_API_BASE_URL 环境变量，请检查 .env 配置');
}

const apiClient = axios.create({
  baseURL: baseURL || '',
  timeout: 30000,
});

// ==========================================
// 类型定义 (Interfaces & Types)
// ==========================================

export interface BaseResponse<T = any> {
  code?: number;
  msg?: string;
  data?: T;
}


export type OmrEngineType = 'AUDIVERIS' | 'LEGATO_FP16' | 'LEGATO_FP32';

export interface SubmitTaskData {
  message?: string;
  taskId: string;
  status?: string;
}

export type TaskStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;

export interface SystemInfoVO {
  time: number;
  tmpSize: number;
}

// ==========================================
// API 请求方法 (API Methods)
// ==========================================

export const getSystemInfo = () => {
  return apiClient.get<BaseResponse<SystemInfoVO>>('/systemInfo');
};

export const submitOmrTask = (engine: OmrEngineType, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<BaseResponse<SubmitTaskData>>(`/omr/submit/${engine}`, formData);
};

export const getOmrTaskStatus = (taskId: string) => {
  return apiClient.get<BaseResponse<TaskStatus>>(`/omr/status/${taskId}`);
};

export const downloadOmrResult = (taskId: string) => {
  return apiClient.get(`/omr/download/${taskId}`, {
    responseType: 'blob',
  });
};

export const downloadOmrPic = (taskId: string) => {
  return apiClient.get<BaseResponse<string>>(`/omr/download/pic/${taskId}`);
};
