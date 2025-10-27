// loginService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'; // Replace with your backend URL or set NEXT_PUBLIC_API_BASE_URL

import { fetchUserProfile } from './userService';

export async function login(username, password) {
  try {
    // Debug: print what URL we will call and environment values
    try {
      console.log('[loginService] API_BASE_URL (inlined):', API_BASE_URL);
      console.log('[loginService] process.env.NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('[loginService] Full login endpoint:', `${API_BASE_URL}/auth/login/`);
    } catch (e) {
      // In case console or process is not available for some reason
      // (defensive, should rarely happen in browser)
      console.warn('[loginService] Debug log failed:', e && e.message ? e.message : e);
    }

  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });
    
    // Get response text for error handling
    const responseText = await response.text();

    // Debug: log response status and a short excerpt of the response text
    try {
      const excerpt = responseText ? (responseText.length > 100 ? responseText.substring(0, 100) + '...': responseText) : '<empty>';
      console.log('[loginService] Response status:', response.status, 'Response excerpt:', excerpt);
    } catch (e) {
      console.warn('[loginService] Failed to log response debug info', e && e.message ? e.message : e);
    }
    
    if (!response.ok) {
      // Log error for debugging but don't expose sensitive details
      console.error('Login failed with status:', response.status);
      throw new Error(`Login failed with status ${response.status}: ${responseText}`);
    }
    
    // Parse successful response
    const data = JSON.parse(responseText);
    
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    // Immediately fetch and store user profile
    const profile = await fetchUserProfile(data.access);
    localStorage.setItem('user_info', JSON.stringify(profile));

    return data;
    
  } catch (fetchError) {
    // Log network errors for debugging
    if (fetchError && fetchError.message) {
      console.error('[loginService] Network error:', fetchError.message, 'Attempted server:', API_BASE_URL);
    }
    
    throw fetchError;
  }
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

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
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

