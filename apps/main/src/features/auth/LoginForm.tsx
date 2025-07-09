import { useState } from 'react';
import api from '@/services/api';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data?.token) {
        localStorage.setItem('token', data.token);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 text-white flex flex-col gap-2">
      <input
        type="text"
        placeholder="Email или username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 rounded bg-gray-700"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded bg-gray-700"
      />
      {error && <span className="text-red-400 text-sm">{error}</span>}
      <button type="submit" className="btn-primary mt-2">Войти</button>
    </form>
  );
}
