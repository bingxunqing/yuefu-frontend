import axios from 'axios';
import type { BaseResponse } from './omr';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

const apiClient = axios.create({
  baseURL: baseURL || '',
  timeout: 10000,
});

/**
 * 提交问卷调查
 * @param data 问卷数据字典
 */
export const submitSurvey = (data: Record<string, string[]>) => {
  return apiClient.post<BaseResponse>('/survey/submit', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
