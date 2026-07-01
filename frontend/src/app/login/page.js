'use client'; 
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Buton kilidi için state
  
  const router = useRouter();

  // KURUMSAL AYAR: Eğer adam zaten giriş yapmışsa direkt Dashboard'a şutla!
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true); // İstek başladı, butonu kilitliyoruz

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      toast.success('Giriş başarılı! Dashboard\'a uçuruluyorsunuz...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'E-posta veya şifre hatalı!');
      setLoading(false); // Hata gelirse butonu tekrar açıyoruz
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
            disabled={loading} // İstek sırasındaki kilit mekanizması
            className={`w-full py-2 px-4 text-white font-semibold rounded-md transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}