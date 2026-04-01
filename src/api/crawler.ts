import request from './request';
import type { Log, CrawlerStatus, CrawlerStartRequest } from '../types';

export const crawlerApi = {
  start: (data: CrawlerStartRequest) => 
    request.post<{ status: string; message: string }>('/crawler/start', data),
    
  stop: () => 
    request.post<{ status: string; message: string }>('/crawler/stop'),
    
  getStatus: () => 
    request.get<CrawlerStatus>('/crawler/status'),
    
  getLogs: (limit: number = 100) => 
    request.get<{ logs: Log[] }>(`/crawler/logs?limit=${limit}`),
    
  getHealth: () => 
    request.get<{ status: string }>('/health'),
};
