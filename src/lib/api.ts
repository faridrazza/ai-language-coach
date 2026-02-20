const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8001';
const USER_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8000';
const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8002';

const getToken = () => localStorage.getItem('token');

const authHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  return res.json();
};

// Auth
export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    fetch(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    }).then(handleResponse),

  login: (email: string, password: string) =>
    fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  me: () =>
    fetch(`${AUTH_URL}/auth/me`, { headers: authHeaders() }).then(handleResponse),

  refresh: () =>
    fetch(`${AUTH_URL}/auth/refresh`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handleResponse),
};

// User
export const userApi = {
  getProfile: () =>
    fetch(`${USER_URL}/users/profile`, { headers: authHeaders() }).then(handleResponse),

  updateProfile: (data: Record<string, unknown>) =>
    fetch(`${USER_URL}/users/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getSettings: () =>
    fetch(`${USER_URL}/users/settings`, { headers: authHeaders() }).then(handleResponse),
};

// AI
export const aiApi = {
  chat: (message: string) =>
    fetch(`${AI_URL}/ai/chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    }).then(handleResponse),

  generateSentence: (language: string) =>
    fetch(`${AI_URL}/ai/generate-sentence`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ language }),
    }).then(handleResponse),

  submitAudio: (audio: Blob, expectedSentence: string, englishTranslation: string, language: string) => {
    const formData = new FormData();
    formData.append('audio_file', audio, 'recording.webm');
    formData.append('expected_sentence', expectedSentence);
    formData.append('english_translation', englishTranslation);
    formData.append('language', language);
    const token = getToken();
    return fetch(`${AI_URL}/ai/submit-audio`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(handleResponse);
  },

  getConversations: () =>
    fetch(`${AI_URL}/ai/conversations`, { headers: authHeaders() }).then(handleResponse),

  textToSpeech: (text: string) =>
    fetch(`${AI_URL}/ai/speech/text-to-speech`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleResponse),
};
