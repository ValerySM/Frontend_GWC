const API_URL = 'https://backend-gwc-1.onrender.com';

export const authenticateUser = async (telegramId, username) => {
  console.log('Отправка запроса аутентификации:', { telegramId, username });
  const response = await fetch(`${API_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: telegramId, username })
  });
  if (!response.ok) {
    console.error('Ошибка аутентификации:', response.status, response.statusText);
    throw new Error('Authentication failed');
  }
  const data = await response.json();
  console.log('Ответ аутентификации:', data);
  return data;
};

export const updateUserData = async (data) => {
  console.log('Отправка запроса обновления данных пользователя:', data);
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    console.error('Ошибка обновления данных:', response.status, response.statusText);
    throw new Error('Failed to update user data');
  }
  const responseData = await response.json();
  console.log('Ответ обновления данных:', responseData);
  return responseData;
};

export const logToServer = async (message, telegramId, username) => {
  console.log('Отправка лога на сервер:', { message, telegramId, username });
  if (!telegramId || !username) {
    console.warn('Попытка отправки лога без данных пользователя');
    // Попытка получить данные из localStorage
    telegramId = localStorage.getItem('telegramId');
    username = localStorage.getItem('username');
    if (!telegramId || !username) {
      console.error('Данные пользователя недоступны для отправки лога');
      return;
    }
  }
  const response = await fetch(`${API_URL}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, telegram_id: telegramId, username })
  });
  if (!response.ok) {
    console.error('Ошибка отправки лога:', response.status, response.statusText);
    throw new Error('Failed to log message');
  }
  const responseData = await response.json();
  console.log('Ответ сервера на лог:', responseData);
};