'use client';
import { Suspense, useState } from 'react';
import { signInWithEmailAndPassword  , sendPasswordResetEmail} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { setSessionCookie } from '@/lib/session';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner"
// useSearchParams lives here, inside Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const handleForgotPassword = async () => {
  if (!email) {
    setError('Veuillez entrer votre email pour réinitialiser le mot de passe.');
    return;
  }
  toast.promise(sendPasswordResetEmail(auth, email), {
    position:"top-center",
    loading: 'Envoi de l\'email de réinitialisation...',
    success: () => {
      setError(null);
      return 'Email envoyé ! Vérifiez votre boîte de réception.';
    },
    error: (err) => {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        return "Aucun compte n'existe avec cet email.";
      }
      return "Erreur : Impossible d'envoyer l'email.";
    },
  });
};
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: loggedUser } = await signInWithEmailAndPassword(auth, email, password);
      await setSessionCookie(loggedUser);
      const redirectTo = searchParams?.get('from');
      router.push(redirectTo ? decodeURIComponent(redirectTo) : '/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto max-w-md bg-white dark:bg-zinc-900 rounded-2xl dark:border-zinc-800 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold italic text-zinc-900 dark:text-zinc-100">
          Geneo <span className="text-orange-300">.io</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Connectez-vous à votre compte</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Email</label>
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
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Mot de passe</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 h-11 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[10px] text-orange-500 hover:underline font-bold uppercase"
          >
            Mot de passe oublié ?
          </button>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full h-11 bg-[#f59e0b] text-white font-bold">
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
      <p className="text-center text-sm text-zinc-500 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-[#f59e0b] font-bold hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}

// ✅ Page just wraps the form in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}