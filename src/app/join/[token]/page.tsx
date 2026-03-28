'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { setSessionCookie } from '@/lib/session';
import {use} from 'react'
export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'notfound'>('loading');
  const {token} = use(params)
  useEffect(() => {
    const handleJoin = async () => {
      try {
        // 1. Connexion anonyme si pas déjà connecté
        let currentUser = auth.currentUser;
        if (!currentUser) {
          const { user } = await signInAnonymously(auth);
          currentUser = user;
        }

        // 2. Créer le cookie de session avec le user qu'on vient d'obtenir
        await setSessionCookie(currentUser);

        // 3. Chercher l'arbre
        const q = query(
          collection(db, 'trees'),
          where('shareLink', '==', token)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setStatus('notfound');
          return;
        }

        // 4. Rediriger — le cookie est déjà en place
        const treeId = snap.docs[0].id;
        router.push(`/tree/${treeId}?role=viewer`);

      } catch (err) {
        console.error('Erreur join:', err);
        setStatus('notfound');
      }
    };

    handleJoin();
  }, [token, router]); // ← plus de dépendance sur useAuth

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#080808]">
      <div className="text-center space-y-2">
        {status === 'loading' && (
          <p className="text-zinc-400 animate-pulse">Chargement de l'arbre...</p>
        )}
        {status === 'notfound' && (
          <div className="space-y-2">
            <p className="text-red-500 font-medium">Lien invalide ou expiré.</p>
            <p className="text-sm text-zinc-400">Demandez un nouveau lien au propriétaire.</p>
          </div>
        )}
      </div>
    </div>
  );
}