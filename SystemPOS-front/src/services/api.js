import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout na conexão com o servidor')
    }
    if (!error.response) {
      throw new Error('Erro de conexão com o servidor. Verifique sua internet.')
    }

    // Tratamento específico por status code
    switch (error.response.status) {
      case 401:
        throw new Error('Não autorizado. Faça login novamente.')
      case 403:
        throw new Error('Acesso negado.')
      case 404:
        throw new Error('Recurso não encontrado.')
      case 500:
        throw new Error('Erro interno do servidor.')
      default:
        throw error
    }
  },
)

export default api
