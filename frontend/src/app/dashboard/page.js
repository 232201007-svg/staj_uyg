'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [detectedName, setDetectedName] = useState('Kullanıcı');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = response.data;
        setUser(data);

        // 🕵️‍♂️ OTOMATİK VERİ YAKALAMA AĞI
        if (data) {
          // Eğer backend veriyi direkt string olarak gönderdiyse (örn: response.data = "Tarık Buğra")
          if (typeof data === 'string') {
            setDetectedName(data);
          } 
          // Eğer bir nesneyse, içindeki string olan ilk mantıklı değeri bulmaya çalışıyoruz
          else if (typeof data === 'object') {
            // Önce bildiğimiz tüm alternatifleri tarıyoruz
            const exactMatch = data.name || data.fullName || data.username || data.ad || data.isim || data.ad_soyad || data.user?.name || data.user?.username;
            
            if (exactMatch) {
              setDetectedName(exactMatch);
            } else {
              // Eğer hiçbiri uymadıysa, nesnenin içindeki id veya email olmayan ilk metni isim kabul et
              const keys = Object.keys(data);
              const nameKey = keys.find(key => 
                typeof data[key] === 'string' && 
                !key.toLowerCase().includes('id') && 
                !key.toLowerCase().includes('email') && 
                !key.toLowerCase().includes('password') &&
                !key.toLowerCase().includes('role')
              );
              if (nameKey) {
                setDetectedName(data[nameKey]);
              }
            }
          }
        }

      } catch (err) {
        console.error('Profil yüklenirken hata oluştu:', err);
        localStorage.removeItem('token');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-slate-50">
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Profil yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-50 p-6 flex flex-col items-center justify-start pt-12">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* 🚀 ÜST BANNER - OTOMATİK YAKALANAN DİNAMİK İSİM */}
        <div className="w-full p-8 bg-slate-900 rounded-2xl shadow-lg border border-slate-800 text-white flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Hoş Geldin, {detectedName}! 👋
          </h1>
        </div>

        {/* 📊 KARTLAR ALANI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* 1. KART: SİSTEM DURUMU */}
          <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-200/60 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <span className="px-2.5 py-1 text-xs font-bold tracking-wide uppercase text-emerald-600 bg-emerald-50 rounded-md">
                Sistem Durumu
              </span>
              <h3 className="text-2xl font-bold text-slate-800 mt-4">
                Aktif / Güvenli
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              JWT Token doğrulandı
            </p>
          </div>

          {/* 2. KART: VERİ TABANI */}
          <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-200/60 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <span className="px-2.5 py-1 text-xs font-bold tracking-wide uppercase text-blue-600 bg-blue-50 rounded-md">
                Veri Tabanı
              </span>
              <h3 className="text-2xl font-bold text-slate-800 mt-4">
                MS SQL Server
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Bağlantı havuzu stabil
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}