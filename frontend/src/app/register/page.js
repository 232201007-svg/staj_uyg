'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. ADIM: Standart Format Kontrolü (Regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Geçersiz E-Posta!');
      setLoading(false);
      return;
    }

    // 2. ADIM: 🛡️ SALLAMA DOMAIN ENGELLEYİCİ (BEYAZ LİSTE)
    // Sadece gerçek ve bilinen mail servislerine izin veriyoruz
    const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'yandex.com'];
    
    // Girilen mailin domain kısmını cımbızla çekiyoruz (örn: 123@123.com -> 123.com)
    const emailDomain = email.split('@')[1]?.toLowerCase();

    // Eğer adamın yazdığı domain bizim güvenli listede yoksa geçit vermiyoruz!
    if (!allowedDomains.includes(emailDomain)) {
      toast.error('Geçersiz E-Posta!');
      setLoading(false);
      return; // Formu burada kilitliyoruz!
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register', 
        { name, email, password },
        { validateStatus: (status) => status >= 200 && status < 500 }
      );

      if (response.status >= 400) {
        let backendMessage = response.data?.message || 'Kayıt esnasında bir hata oluştu!';
        
        const lowerMessage = backendMessage.toLowerCase();
        if (lowerMessage.includes('already registered') || lowerMessage.includes('already exists') || lowerMessage.includes('in use')) {
          backendMessage = 'Bu e-posta adresi zaten sisteme kayıtlı!';
        } else if (lowerMessage.includes('password tooshort') || lowerMessage.includes('password length')) {
          backendMessage = 'Şifre çok kısa veya istenen kriterlere uymuyor!';
        }

        toast.error(backendMessage);
        setLoading(false);
        return; 
      }

      toast.success('Kayıt işlemi başarılı! Giriş paneline yönlendiriliyorsunuz...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      toast.error('Sunucuyla bağlantı kurulamadı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">Yeni Hesap Oluştur</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">Kayıt Paneli</h2>
          <p className="text-sm text-slate-500 mt-1">Sisteme erişmek için bilgilerinizi girin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Ad Soyad</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
              placeholder="Adınızı ve soyadınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">E-posta Adresi</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
              placeholder="isim@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Şifre</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all duration-200 ${
              loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700'
            }`}
          >
            {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-6 border-t border-slate-100 pt-4">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}