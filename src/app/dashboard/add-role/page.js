"use client";
import React from 'react';
import { useUser } from '../../../context/UserContext';
import { useRouter } from 'next/navigation';

export default function AddRolePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user?.role !== 'Supervisor') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'Supervisor') {
    return null;
  }

  return (
    <div className="p-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Add Role</h1>
      <p className="dark:text-gray-300">This is the Add Role page. Implement the form and logic here.</p>
    </div>
  );
} 