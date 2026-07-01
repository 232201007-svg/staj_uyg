'use client'; 
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Stil dosyasını burada garantiye alıyoruz

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState(''); // Ekrandaki yedek kırmızı yazı için
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCustomError(''); // Her butona basıldığında eski hatayı temizle

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register', 
        { name, email, password },
        { 
          validateStatus: function (status) {
            return status >= 200 && status < 500; // 400 hatalarında Next.js'in çökmesini engelle
          }
        }
      );

      // Durum kodu 400 veya üzeriyse (Aynı e-posta veya geçersiz veri)
      if (response.status >= 400) {
        const backendMessage = response.data?.message || '';
        const lowerMessage = typeof backendMessage === 'string' ? backendMessage.toLowerCase() : '';
        
        let errorTxt = 'Bu e-posta adresi zaten mevcut veya geçersiz!';
        if (lowerMessage.includes('email') || lowerMessage.includes('exist') || lowerMessage.includes('already')) {
          errorTxt = 'Bu e-posta adresiyle zaten bir hesap oluşturulmuş!';
        } else if (backendMessage) {
          errorTxt = backendMessage;
        }

        // 1. Hatayı Toast ile fırlatmayı dene
        toast.error(errorTxt);
        // 2. Eğer toast bileşeni patlaksa, ekranda yazı olarak göster (Yedek Hat)
        setCustomError(errorTxt);
        
        setLoading(false);
        return; 
      }

      // BAŞARILI DURUM (200-299)
      toast.success(response.data.message || 'Kayıt başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => { router.push('/login'); }, 2000);

    } catch (err) {
      console.error("Sistemsel Hata:", err);
      toast.error('Sunucuyla bağlantı kurulamadı!');
      setCustomError('Sunucuyla bağlantı kurulamadı!');
    } finally {
      setLoading(false);
    }
  };
  // RegisterPage fonksiyonunun içinde useEffect'ten sonra:
const [mounted, setMounted] = useState(false);
const [isCheckingAuth, setIsCheckingAuth] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    router.replace('/dashboard');
    return;
  }
  setMounted(true);
  setIsCheckingAuth(false);
}, [router]);

// ... ve return'ün hemen üzerine ...
if (!mounted || isCheckingAuth) {
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />;
}
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Toast mekanizmasının lambasını buraya direkt monte ediyoruz */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">Yeni Üyelik</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">Hesap Oluştur</h2>
          <p className="text-sm text-slate-500 mt-1">Hızlıca platformumuza dahil olun</p>
        </div>

        {/* 🚨 YEDEK HAT: Toast patlasa bile kartın içinde fırlayacak jilet gibi kırmızı uyarı kutusu */}
        {customError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center animate-shake">
            ⚠️ {customError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Ad Soyad</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-900 transition-all text-sm"
              placeholder="Ahmet Yılmaz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">E-posta Adresi</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-900 transition-all text-sm"
              placeholder="isim@firma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Şifre</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-900 transition-all text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-md ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/10'
            }`}
          >
            {loading ? 'Hesap Açılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-6 border-t border-slate-100 pt-4">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}