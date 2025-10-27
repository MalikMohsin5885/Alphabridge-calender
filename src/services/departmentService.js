const API_BASE_URL = 'https://alphabridge-backend-34902771404.europe-west1.run.app/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Fetch departments and users (closers) from the combined API endpoint
export const fetchDepartmentsAndUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/departments-users/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch departments and users');
  }

  return response.json();
};

// Fetch all users from the API
export const fetchAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/departments-users/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all users');
  }

  const data = await response.json();
  return data.all_users || [];
};

// Fetch all departments (legacy function - kept for backward compatibility)
export const fetchDepartments = async () => {
  const response = await fetch(`${API_BASE_URL}/departments-users/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }

  const data = await response.json();
  return data.departments || [];
}; 