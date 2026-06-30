'use client'; // Next.js'te formlar ve buton tıklamaları için bu şarttır
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  // Dokümanın istediği İngilizce standartlarında state yönetimi (Clean Code)
  const [name, setName] = useState('');
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
      // Backend API'mize Axios ile HTTP POST isteği atıyoruz (Faz 4 - Madde 1)
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });

      // Başarılıysa kullanıcıyı bilgilendir ve 2 saniye sonra Login'e fırlat
      setMessage(response.data.message);
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      // Dokümanın istediği mantıklı hata gösterimi (Error Handling)
      setError(err.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
        
        {message && <p className="p-3 mb-4 text-green-700 bg-green-100 rounded text-center">{message}</p>}
        {error && <p className="p-3 mb-4 text-red-700 bg-red-100 rounded text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}