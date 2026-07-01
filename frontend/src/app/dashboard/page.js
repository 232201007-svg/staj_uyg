'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data.user);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="bg-gradient-to-r navigate bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg text-blue-900">
          <h1 className="text-2xl font-bold mb-2">Welcome Back, {user?.name}!</h1>
          <p className="text-sm">
            Sisteme başarıyla giriş yaptın. Güvenlik duvarı (Middleware) token'ını doğruladı ve sana özel bu alanı açtı.
          </p>
        </div>
      </div>
    </div>
  );
}