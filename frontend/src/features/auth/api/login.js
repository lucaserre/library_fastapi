import { api } from '../../../lib/axios';

export const loginUser = async (username, password) => {
  // Convertendo os dados para o formato que o FastAPI (OAuth2) exige
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  // Assumindo que sua rota de login seja '/token' (baseado no oauth2_scheme do security.py)
  // Caso esteja com algum prefixo no auth.py (ex: '/auth/token'), ajuste aqui.
  const response = await api.post('/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};