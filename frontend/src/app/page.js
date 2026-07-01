'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Eğer zaten giriş yaptıysa ana sayfada tutma, tık diye dashboard'a kitle
      router.replace('/dashboard');
      return;
    }
    setMounted(true);
  }, [router]);

  // Sayfa yüklenene kadar veya giriş yaptıysa yönlendirme bitene kadar boş ekran dön (göz kırpmasın)
  if (!mounted || isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-slate-50">
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  // SADECE GİRİŞ YAPMAMIŞ KULLANICILAR BURAYI GÖREBİLİR
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl p-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 text-center transition-all duration-300">
        <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
          FULL-STACK AUTH SYSTEM
        </span>
        <h1 className="text-5xl font-black text-slate-800 tracking-tight mt-6 leading-tight">
          Güvenli Kimlik <br /> Doğrulama <span className="text-blue-600">Platformu</span>
        </h1>
        <p className="text-base text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
          Next.js App Router, Tailwind v4, Node.js, JWT ve Microsoft SQL Server mimarisiyle geliştirilmiş kurumsal seviyede güvenli giriş ve kayıt paneli.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3.5 text-white font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/10 transition-all"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="px-8 py-3.5 text-slate-600 font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Kayıt Ol
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex justify-center gap-6 text-xs text-slate-400 font-medium">
          <span>⚡ Next.js v15</span>
          <span>🛡️ JWT Secured</span>
          <span>🗄️ MS SQL Server</span>
        </div>
      </div>
    </div>
  );
}