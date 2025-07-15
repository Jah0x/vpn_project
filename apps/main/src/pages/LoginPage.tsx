import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hanko, register } from '@teamhanko/hanko-elements';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    register('/hanko');
    const handle = async () => {
      const token = await hanko.session.getToken();
      const { data } = await api.post('/api/auth/login', { token });
      auth.checkAuthStatus();
      navigate('/dashboard');
    };
    document.addEventListener('hankoAuthFlowCompleted', handle);
    return () => document.removeEventListener('hankoAuthFlowCompleted', handle);
  }, [auth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <hanko-auth />
    </div>
  );
}
