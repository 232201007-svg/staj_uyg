'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success(response.data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
      setEmail('');
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      
      // Backend'den gelebilecek olası İngilizce hataları Türkçe'ye çeviriyoruz
      if (backendMessage === 'User not found' || backendMessage === 'User not found!') {
        toast.error('Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı!');
      } else {
        toast.error(backendMessage || 'Bağlantı gönderilirken bir hata oluştu!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">Güvenlik Doğrulaması</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">Şifremi Unuttum</h2>
          <p className="text-sm text-slate-500 mt-1">Sıfırlama bağlantısı almak için e-posta adresinizi girin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-md ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/10'
            }`}
          >
            {loading ? 'Bağlantı Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-6 border-t border-slate-100 pt-4">
          Hatırladınız mı?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
            Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}