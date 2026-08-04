'use client';

/**
 * UserContext.js
 * Exposes global student & teacher authentication context for local testing.
 * Automatically retrieves default database accounts and stores selections in localStorage.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/users`);
        const data = await res.json();
        setUsers(data);
        
        // Default to student if available, else first user
        if (data.length > 0) {
          const savedUserId = localStorage.getItem('lms_user_id');
          const savedUser = data.find(u => u.id === savedUserId);
          if (savedUser) {
            setActiveUser(savedUser);
          } else {
            const studentUser = data.find(u => u.role === 'STUDENT') || data[0];
            setActiveUser(studentUser);
            localStorage.setItem('lms_user_id', studentUser.id);
          }
        }
      } catch (err) {
        console.error('Failed to load users from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      localStorage.setItem('lms_user_id', user.id);
    }
  };

  return (
    <UserContext.Provider value={{ users, activeUser, switchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
