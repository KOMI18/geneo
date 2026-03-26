'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { setSessionCookie } from '@/lib/session';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    await setSessionCookie(); // ← ajouter cette ligne
    router.push('/dashboard');
  } catch {
    setError('Email ou mot de passe incorrect.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full  mx-auto align-center max-w-md margin-[100px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold italic text-zinc-900 dark:text-zinc-100">
          Geneo <span className="text-orange-300">.io</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Connectez-vous à votre compte</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Email
          </label>
          <Input
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Mot de passe
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 h-11"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-orange-500 font-bold hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}