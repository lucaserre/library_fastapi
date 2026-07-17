import { api } from '../../../lib/axios';

export const getBooks = async () => {
  // Ajustado para o prefixo /library e a rota /books do seu stock.py
  const response = await api.get('/library/books'); 
  return response.data;
};