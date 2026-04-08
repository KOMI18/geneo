'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { setSessionCookie } from '@/lib/session';
import { Eye, EyeOff } from 'lucide-react';
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      // 1. Créer l'utilisateur Firebase Auth
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      // 2. Mettre à jour le displayName
      await updateProfile(newUser, { displayName: name });

      // 3. Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        displayName: name,
        email,
        createdAt: Date.now(),
      });
      await setSessionCookie();
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setError('Une erreur est survenue. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md   mx-auto  bg-white dark:bg-zinc-900 rounded-2xl  dark:border-zinc-800 p-8 ">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold italic text-zinc-900 dark:text-zinc-100">
          Geneo <span className="text-orange-300">.io</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Créez votre compte</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Nom complet
          </label>
          <Input
            placeholder="Moussa Traoré"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 h-11"
            required
          />
        </div>

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

        {/* Confirmation avec Icône */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Confirmer le mot de passe</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 h-11 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#ffb86a]  text-white font-bold "
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-[#ffb86a] font-bold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}