import request from './request';

export const clueApi = {
  list: (params: any) => 
    request.get('/clue/list', { params }),

  getDetail: (clue_id: number) =>
    request.get(`/clue/${clue_id}`),

  create: (data: any) =>
    request.post('/clue/create', data),

  update: (clue_id: number, data: any) =>
    request.patch(`/clue/${clue_id}/update`, data),

  delete: (clue_id: number) =>
    request.delete(`/clue/${clue_id}`),

  addItem: (data: any) =>
    request.post('/clue/add-item', data),
};
