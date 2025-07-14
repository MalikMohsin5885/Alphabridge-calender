"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo, getAccessToken } from '../services/loginService';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(getUserInfo());
    } else {
      setUser(null);
    }
    // Listen for login/logout events (optional: can use custom events or polling)
    // For now, just run on mount
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
