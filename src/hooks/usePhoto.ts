import { useState } from 'react';

export function usePhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToR2 = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. Demander l'URL signée à ton API Route
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: file.name, 
          fileType: file.type 
        }),
      });

      if (!res.ok) throw new Error("Impossible d'obtenir l'URL signée");

      const { signedUrl, publicUrl } = await res.json();

      // 2. Upload direct du binaire vers Cloudflare R2
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error("Échec de l'upload vers R2");

      return publicUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload";
      setError(msg);
      console.error(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  const deletePhoto = async (photoURL: string) => {
  try {
    await fetch('/api/upload/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoURL }),
    });
  } catch (err) {
    console.error("Erreur lors de la suppression R2:", err);
  }
};
  return { uploadToR2, isUploading, error  , deletePhoto};
}