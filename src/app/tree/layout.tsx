'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { clearSessionCookie } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, LogOut } from 'lucide-react';

export default function TreeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const handleLogout = async () => {
    await signOut(auth);
    clearSessionCookie();
    router.push('/login');
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-zinc-50 dark:bg-[#080808]">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center px-6 justify-between">
        
        {/* Gauche : retour + logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ChevronLeft size={16} />
            Dashboard
          </Link>
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />
          <span className="italic font-bold text-zinc-900 dark:text-zinc-100">
            Geneo <span className="text-orange-300">.io</span>
          </span>
        </div>

        {/* Droite : user + logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 hidden sm:block">
            {user?.displayName}
          </span>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Contenu de la page */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}