const API_URL = 'https://backend-gwc-1.onrender.com';

export const authenticateUser = async (telegramId, username) => {
  const response = await fetch(`${API_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: telegramId, username })
  });
  if (!response.ok) throw new Error('Authentication failed');
  return response.json();
};

export const updateUserData = async (data) => {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update user data');
  return response.json();
};

export const logToServer = async (message) => {
  const response = await fetch(`${API_URL}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error('Failed to log message');
};