'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Tarayıcı hafızasından (localStorage) giriş biletini çekiyoruz
    const token = localStorage.getItem('token');

    // 2. Bilet yoksa, bu adam kaçaktır! Direkt login sayfasına şutla
    if (!token) {
      router.push('/login');
      return;
    }

    // 3. Bilet varsa, backend'deki o korumalı "/profile" odasına istek atıyoruz
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}` // Bileti HTTP kafasına (header) koyduk
          }
        });
        
        // Backend "Geç gardaş" dedi, bilgileri state'e aldık
        setUser(response.data.user);
        setLoading(false);
      } catch (err) {
        // Biletin süresi bittiyse veya sahteyse hafızayı temizle ve logine at
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchUserProfile();
  }, [router]);

  // Çıkış Yapma Fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token'); // Bileti yırtıp atıyoruz
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl font-semibold animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition duration-200"
          >
            Logout (Çıkış Yap)
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-blue-900">
          <p className="text-lg font-medium">
            Welcome back, <span className="font-bold text-blue-600">{user?.name}</span>!
          </p>
          <p className="text-sm mt-1">Sisteme başarıyla giriş yaptın. JWT biletin tarayıcıda güvenle saklanıyor.</p>
        </div>
      </div>
    </div>
  );
}