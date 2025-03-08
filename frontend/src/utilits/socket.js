import { io } from 'socket.io-client';

let socket = null; // Глобальный экземпляр сокета
const listeners = new Map(); // Хранит обработчики событий

// Инициализация подключения
export const initSocket = (token) => {
  if (!socket) {
    // Создаем соединение с сервером
    socket = io('http://localhost:3001', {
      auth: { token }, // Токен аутентификации
      transports: ['websocket'], // Используем только WebSocket
      reconnection: true, // Автопереподключение
      reconnectionAttempts: 5, // Максимум 5 попыток
      reconnectionDelay: 3000 // Интервал между попытками (3 сек)
    });

    // Обработка всех событий от сервера
    socket.onAny((eventName, ...args) => {
      const handlers = listeners.get(eventName) || [];
      handlers.forEach(handler => handler(...args)); // Вызов всех обработчиков
    });
  }
  return socket;
};

// Разрыв соединения
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners.clear(); // Очистка всех обработчиков
  }
};

// Подписка на событие
export const onSocketEvent = (eventName, handler) => {
  const handlers = listeners.get(eventName) || [];
  listeners.set(eventName, [...handlers, handler]); // Добавляем обработчик
  
  // Функция для отписки
  return () => {
    const filtered = handlers.filter(h => h !== handler);
    listeners.set(eventName, filtered);
  };
};

// Отправка события на сервер
export const emitSocketEvent = (eventName, data) => {
  if (socket) {
    socket.emit(eventName, data); // Отправляем данные
  }
};

export const getSocket = ()=>{
  return socket; 
}