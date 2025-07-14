// userService.js

export async function fetchUserProfile(token) {
  const response = await fetch('http://127.0.0.1:8000/auth/profile/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return await response.json();
} 