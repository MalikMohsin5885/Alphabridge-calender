"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken } from '../services/loginService';
import { fetchUserProfile } from '../services/userService';
import { useRouter } from 'next/navigation';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("user_info");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchAndSetUser(token);
    } else {
      setUser(null);
      localStorage.removeItem("user_info");
      setLoading(false);
    }
  }, []);

  async function fetchAndSetUser(token) {
    try {
      const data = await fetchUserProfile(token);
      setUser(data);
      localStorage.setItem("user_info", JSON.stringify(data));
      setLoading(false);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user_info");
      setLoading(false);
      if (router) router.replace('/login');
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
