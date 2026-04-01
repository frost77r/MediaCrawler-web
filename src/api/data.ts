import request from './request';
import type { Note, Comment } from '../types';

export const dataApi = {
  getNotes: (platform: string, limit: number = 1000) => 
    request.get<{ data: Note[]; error?: string }>(`/data/db/${platform}/notes?limit=${limit}`),
    
  getComments: (platform: string, noteId: string, limit: number = 500) => 
    request.get<{ data: Comment[]; error?: string }>(`/data/db/${platform}/comments?note_id=${noteId}&limit=${limit}`),
};
