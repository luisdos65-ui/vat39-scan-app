'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Product Page Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-text">Er is iets misgegaan</h2>
        <p className="text-muted text-sm max-w-xs mx-auto">
          We konden de productgegevens niet laden. Dit kan komen door een netwerkfout of verouderde gegevens.
        </p>
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-3">
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Probeer opnieuw</span>
        </button>
        
        <button
          onClick={() => router.push('/scan')}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-surface border border-divider text-text rounded-xl font-medium hover:bg-surface2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Terug naar scannen</span>
        </button>
      </div>

      <div className="text-[10px] text-muted font-mono mt-8 max-w-full overflow-hidden text-ellipsis px-4">
        <p>Error: {error.message}</p>
        <p>Digest: {error.digest || 'Unknown'}</p>
      </div>
    </div>
  );
}
