// userService.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const API_AUTH_URL = 'http://127.0.0.1:8000/auth';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Fetch user profile
export const fetchUserProfile = async (token) => {
  const response = await fetch(`${API_AUTH_URL}/profile/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

// Fetch all users
export const fetchAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
};

// Add a new user
export const addUser = async (userData) => {
  // Transform the data to match the API payload structure
  const payload = {
    name: userData.name,
    email: userData.email,
    password: userData.password || 'defaultPassword123', // You might want to add password field to the form
    role_id: userData.role,
    department_id: userData.department,
    supervisor_id: userData.lead,
    priority: userData.priority
  };

  const response = await fetch(`${API_AUTH_URL}/register/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register user');
  }

  return response.json();
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
}; 

// Fetch roles, departments, and administrators from the new API endpoint
export const fetchRolesDepartmentsLeads = async () => {
  const response = await fetch(`${API_BASE_URL}/roles-departments-supervisors/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch roles, departments, and leads');
  }

  return response.json();
}; 


