'use client'; // Form ve buton hareketleri için şart
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  // İngilizce standartlarında state yönetimi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Backend API'mize giriş isteği atıyoruz (Faz 4 - Madde 1)
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Başarılıysa bize dönen o meşhur JWT biletini (token) tarayıcının hafızasına (localStorage) gömüyoruz
      // Doküman: "Giriş başarılı ise kullanıcıya bir token verilmeli ve bu token saklanmalıdır."
      localStorage.setItem('token', response.data.token);
      
      setMessage('Login successful! Redirecting...');
      
      // 1.5 saniye sonra kullanıcıyı korumalı Dashboard sayfasına uçuruyoruz
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      // Dokümanın istediği hata yönetimi
      setError(err.response?.data?.message || 'Invalid email or password!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
        
        {message && <p className="p-3 mb-4 text-green-700 bg-green-100 rounded text-center">{message}</p>}
        {error && <p className="p-3 mb-4 text-red-700 bg-red-100 rounded text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}