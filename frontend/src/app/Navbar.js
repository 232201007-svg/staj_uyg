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

  // 🚨 TASARIM KORUMASI: Eğer kullanıcı login veya register sayfasındaysa Navbar'ı KOPMLE GİZLE!
  // Böylece o sayfalar dümdüz, ortalanmış o şık premium kart tasarımıyla baş başa kalır.
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.replace('/login');
  };

  return (
    <nav className="w-full bg-slate-950 text-slate-100 border-b border-slate-900/80 px-6 py-4 flex justify-between items-center shadow-xl">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-100">
          <img 
            src="https://flagcdn.com/tr.svg" 
            alt="Türk Bayrağı" 
            className="w-5 h-auto rounded-sm shadow-sm inline-block opacity-90"
          />
          <span><span className="text-indigo-400">Auth</span>Project</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-xl border border-rose-500/20 transition-all duration-200 cursor-pointer text-center"
          >
            Çıkış Yap
          </button>
        )}
      </div>
    </nav>
  );
}