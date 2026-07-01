'use client'; 
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false); 
  const [customError, setCustomError] = useState('');
  const [mounted, setMounted] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
      return;
    }

    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (hasVisitedBefore) {
      setIsReturningUser(true);
    }
    
    setMounted(true); 
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCustomError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login', 
        { email, password },
        { validateStatus: (status) => status >= 200 && status < 500 }
      );

      if (response.status >= 400) {
        const backendMessage = response.data?.message || '';
        const lowerMessage = typeof backendMessage === 'string' ? backendMessage.toLowerCase() : '';
        
        let errorTxt = 'E-posta adresi veya şifre hatalı!';
        if (backendMessage && !lowerMessage.includes('invalid')) {
          errorTxt = backendMessage;
        }

        toast.error(errorTxt);
        setCustomError(errorTxt);
        setLoading(false);
        return; 
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('hasVisitedBefore', 'true'); 
      
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      router.push('/dashboard');

    } catch (err) {
      toast.error('Sunucuyla bağlantı kurulamadı!');
      setCustomError('Sunucuyla bağlantı kurulamadı!');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null; 
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">Güvenli Erişim</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">
            {isReturningUser ? 'Tekrar Hoş Geldiniz' : 'Giriş Paneli'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Lütfen hesabınızla giriş yapın</p>
        </div>

        {customError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
            ⚠️ {customError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">E-posta Adresi</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
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
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 text-slate-900 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-center text-sm">
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline transition">
              Şifremi Unuttum
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all duration-200 ${
              loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700'
            }`}
          >
            {loading ? 'İşlem yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-6 border-t border-slate-100 pt-4">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-semibold">
            Şimdi Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
}