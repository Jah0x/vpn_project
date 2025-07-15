import { useEffect } from 'react';
import { Hanko } from '@teamhanko/hanko-elements';

export default function LoginPage() {
  useEffect(() => {
    const hanko = new Hanko(process.env.VITE_HANKO_API_URL!);
    hanko.onAuthFlowCompleted(async () => {
      const { jwt } = await hanko.session.get();
      const res = await fetch('/api/auth/hanko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: jwt }),
      });
      const { access_token } = await res.json();
      localStorage.setItem('access_token', access_token);
      window.location.href = '/dashboard';
    });
  }, []);
  return <hanko-auth />;
}
