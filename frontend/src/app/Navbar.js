'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  // 🚨 AKILLI FREN SİSTEMİ: Oturum açıkken tepedeki linklerin git-gel yapmasını engeller
  const handleNavClick = (e, targetPath) => {
    const token = localStorage.getItem('token');
    if (token) {
      e.preventDefault(); // Sayfa değiştirmeyi tamamen iptal et!
      router.replace('/dashboard'); // Zaten içeridesin, dashboard'da pürüzsüzce tut
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        {/* 🚨 LOGO KORUMASI: Giriş yapılmışsa ana sayfaya basınca ekranın göz kırpmasını engeller */}
        <Link 
          href="/" 
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-800 hover:opacity-90 transition"
        >
          <img 
            src="https://flagcdn.com/tr.svg" 
            alt="Türk Bayrağı" 
            className="w-6 h-auto rounded-sm shadow-sm inline-block"
          />
          <span><span className="text-blue-600">Auth</span>Project</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl border border-red-200/60 transition-all duration-200 cursor-pointer shadow-sm shadow-red-500/5"
          >
            Çıkış Yap
          </button>
        ) : (
          <>
            <Link 
              href="/login" 
              onClick={(e) => handleNavClick(e, '/login')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all duration-200"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              onClick={(e) => handleNavClick(e, '/register')}
              className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200"
            >
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}