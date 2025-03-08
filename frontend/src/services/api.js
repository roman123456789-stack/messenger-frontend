import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Замените на ваш адрес сервера
});

export default api;