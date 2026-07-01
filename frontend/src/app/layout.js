'use client'; // Dinamik token kontrolü ve çıkış yapma işlemleri için şart
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Şu an hangi sayfada olduğumuzu anlar

  // Her sayfa değişiminde tarayıcıda token var mı diye kontrol et
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]); // Sayfa değiştikçe bu kontrolü tetikle

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* GLOBAL AKILLI NAVBAR */}
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center border-b">
          <Link href="/" className="text-xl font-bold text-gray-800 tracking-wider hover:text-blue-600 transition">
            🚀 AUTH_PROJECT
          </Link>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Sayfaların İçerikleri Buraya Basılacak */}
        <main>{children}</main>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </body>
    </html>
  );
}