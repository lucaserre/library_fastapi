import { api } from '../../../lib/axios';

export const getDiaryStats = async () => {
  const response = await api.get('/library/books-read/stats');
  return response.data;
};

export const getMyBooks = async () => {
  const response = await api.get('/library/books-read/');
  return response.data;
};


export const createDiaryEntry = async (bookData) => {
  const response = await api.post('/library/books-read', bookData);
  return response.data; 
};


export const uploadDiaryCover = async (bookId, file) => {
  const formData = new FormData();
  formData.append('file', file); 

  const response = await api.post(`/library/books-read/${bookId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};


export const getDiaryBook = async (bookId) => {
  const response = await api.get(`/library/books-read/${bookId}`);
  return response.data;
};

export const deleteDiaryEntry = async (bookId) => {
  const response = await api.delete(`/library/books-read/${bookId}`);
  return response.data;
};


export const updateDiaryEntry = async (bookId, bookData) => {
  const response = await api.put(`/library/books-read/${bookId}`, bookData);
  return response.data;
};








