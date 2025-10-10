// loginService.js

const API_BASE_URL = 'https://alphabridge-backend-799410638250.us-east4.run.app/'; // Replace with your backend URL or set NEXT_PUBLIC_API_BASE_URL

import { fetchUserProfile } from './userService';

export async function login(username, password) {
  try {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });
    
    // Get response text for error handling
    const responseText = await response.text();
    
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
    if (fetchError.message === 'Failed to fetch') {
  console.error('Network error: Could not connect to server at', API_BASE_URL);
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

