// loginService.js

const API_BASE_URL = 'http://127.0.0.1:8000'; // Replace with your backend URL

import { fetchUserProfile } from './userService';

export async function login(username, password) {
  const response = await fetch(`http://127.0.0.1:8000/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);

  // Immediately fetch and store user profile
  const profile = await fetchUserProfile(data.access);
  localStorage.setItem('user_info', JSON.stringify(profile));

  return data;
}

export function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function getRefreshToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`http://127.0.0.1:8000/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data;
}

