'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@viralytics/utils/auth';


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (login(username, password)) {
      router.push('/dashboard');
    } else {
      alert('nah, try again');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        className="border p-2 mb-2"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 mb-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>
        Log In
      </button>
    </div>
  );
}
