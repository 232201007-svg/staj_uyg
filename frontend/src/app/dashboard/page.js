'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [detectedName, setDetectedName] = useState('Kullanıcı');
  const [loading, setLoading] = useState(true);
  
  // 🔑 ŞİFRE DEĞİŞTİRME STATE'LERİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setUser(data);

        if (data) {
          if (typeof data === 'string') {
            setDetectedName(data);
          } else if (typeof data === 'object') {
            const exactMatch = data.name || data.fullName || data.username || data.ad || data.isim || data.ad_soyad || data.user?.name || data.user?.username;
            if (exactMatch) {
              setDetectedName(exactMatch);
            } else {
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

  // 🛠️ HATAYI KÖKTEN BULAN GÜNCEL ŞİFRE DEĞİŞTİRME FONKSİYONU
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler birbiriyle uyuşmuyor!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }

    setPasswordLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        { oldPassword, newPassword },
        { 
          headers: { Authorization: `Bearer ${token}` },
          // 🚨 KORUMA: 400 ve 500'lü hata kodlarında Axios'un çökmesini engeller, gelen mesajı okumamızı sağlar
          validateStatus: (status) => status >= 200 && status < 500
        }
      );

      // Backend'den hata kodu geldiyse (400, 401, 404, 500 vb.)
      if (response.status >= 400) {
        const backendMessage = response.data?.message || 'Şifre değiştirilirken bir hata oluştu!';
        toast.error(backendMessage);
        setPasswordLoading(false);
        return;
      }

      // Her şey yolundaysa 200 döner
      toast.success('Şifreniz başarıyla değiştirildi!');
      setIsModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // 🚨 İŞTE GERÇEK ARIZAYI GÖSTEREN YER BURASI!
      console.error("🚨 BAĞLANTI VEYA SUNUCU HATASI DETAYI:", err.response || err);
      
      if (err.response) {
        toast.error(`Sunucu Hatası: ${err.response.status} - ${err.response.data?.message || 'Bağlantı reddedildi'}`);
      } else {
        toast.error('Sunucuyla bağlantı kurulamadı! Lütfen backend\'in açık olduğundan emin olun.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-slate-50">
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Profil yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-50 p-6 flex flex-col items-center justify-start pt-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-5xl space-y-6">
        
        {/* 🚀 ÜST BANNER VE ŞİFRE DEĞİŞTİRME BUTONU */}
        <div className="w-full p-8 bg-slate-900 rounded-2xl shadow-lg border border-slate-800 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Hoş Geldin, {detectedName}! 👋
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-sm text-center"
          >
            ⚙️ Şifre Değiştir
          </button>
        </div>

        {/* 📊 KARTLAR ALANI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* 1. KART: SİSTEM DURUMU */}
          <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-200/60 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <span className="px-2.5 py-1 text-xs font-bold tracking-wide uppercase text-emerald-600 bg-emerald-50 rounded-md">
                Sistem Durumu
              </span>
              <h3 className="text-2xl font-bold text-slate-800 mt-4">Aktif / Güvenli</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">JWT Token doğrulandı</p>
          </div>

          {/* 2. KART: VERİ TABANI */}
          <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-200/60 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <span className="px-2.5 py-1 text-xs font-bold tracking-wide uppercase text-blue-600 bg-blue-50 rounded-md">
                Veri Tabanı
              </span>
              <h3 className="text-2xl font-bold text-slate-800 mt-4">MS SQL Server</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">Bağlantı havuzu stabil</p>
          </div>
        </div>

      </div>

      {/* 🔐 ŞİFRE DEĞİŞTİRME MODAL (AÇILIR PENCERE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Şifre Güncelleme</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Mevcut Şifre</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Yeni Şifre</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 text-slate-600 border border-slate-200 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer text-sm"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`w-1/2 py-2.5 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer text-sm ${
                    passwordLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700'
                  }`}
                >
                  {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}