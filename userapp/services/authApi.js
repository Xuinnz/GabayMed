import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;
  if (hostUri) {
    const lanHost = hostUri.split(':')[0];
    if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
      return `http://${lanHost}:3000`;
    }
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

const API_URL = resolveApiUrl();

export class ApiError extends Error {
  constructor(message, { status = 0, fields = null, retryAfter = 0, code = '' } = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
    this.retryAfter = retryAfter;
    this.code = code;
  }
}

async function post(path, body = {}, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(`${API_URL}/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(`We couldn't reach the GabayMed server (${API_URL}). Make sure the backend is running.`);
  } finally {
    clearTimeout(timer);
  }
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    throw new ApiError(data.error || 'Something went wrong. Please try again.', {
      status: response.status,
      fields: data.fields || null,
      retryAfter: Number(data.retry_after) || Number(response.headers.get('Retry-After')) || 0,
      code: data.code || '',
    });
  }
  return data;
}

const AuthAPI = {
  sendOtp: payload => post('patient-otp', { ...payload, action: 'send' }),
  verifyOtp: payload => post('patient-otp', { ...payload, action: 'verify' }),
  register: details => post('patient-register', details),
  login: (email, password) => post('patient-login', { email, password }),
  refresh: refreshToken => post('patient-session', { refresh_token: refreshToken }),
  completeOnboarding: (token, consents) => post('patient-onboarding', consents, token),
  resetPassword: payload => post('patient-reset-password', payload),
  logout: token => post('patient-logout', {}, token),
};

export default AuthAPI;
