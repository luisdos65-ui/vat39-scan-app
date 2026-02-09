'use client';

import { Camera, Upload, ScanLine, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { processScan } from '@/lib/services/product';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]); // New debug log state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addLog = (msg: string) => {
    console.log(msg);
    setErrorLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setErrorLog([]); // Clear old logs
      addLog(`Start scan: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);
      
      try {
        addLog("Processing image...");
        const product = await processScan(file);
        addLog(`Scan success: ${product.name}`);
        
        // Save to local history
        try {
            const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
            localStorage.setItem('recentScans', JSON.stringify([product, ...recentScans].slice(0, 10)));
        } catch (storageError) {
             addLog("Storage Warning: Could not save history");
             console.error(storageError);
        }

        router.push(`/product/${product.id}`);
      } catch (error) {
        console.error('Scan failed:', error);
        addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsProcessing(false);
      }
    }
  };

  // Cleanup old mocks from history on mount
  useEffect(() => {
    try {
        const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
        const cleanScans = recentScans.filter((p: any) => p.id !== 'mock-id');
        if (recentScans.length !== cleanScans.length) {
            localStorage.setItem('recentScans', JSON.stringify(cleanScans));
            console.log("Cleaned up mock-id from history");
        }
    } catch (e) {
        // Ignore parsing errors
    }
  }, []);



  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-8 pt-8">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-text">Scan een fles</h1>
        <p className="text-muted text-sm">Maak een foto van het etiket</p>
      </motion.div>

      {/* Camera View / Placeholder */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative w-72 h-72 bg-surface rounded-[32px] border-2 border-dashed border-divider flex flex-col items-center justify-center overflow-hidden shadow-sm group cursor-pointer hover:border-brand/50 transition-colors"
        onClick={triggerFileInput}
      >
        {isProcessing ? (
           <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-10 h-10 text-brand animate-spin" />
              <span className="text-sm font-medium text-brand animate-pulse">Analyseren...</span>
           </div>
        ) : (
            <>
                <div className="absolute inset-0 bg-surface2/30 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="p-5 bg-white rounded-full shadow-lg shadow-black/5 text-brand ring-1 ring-black/5">
                        <Camera className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-medium text-muted group-hover:text-brand transition-colors">Tik om te scannen</span>
                </div>
            </>
        )}
        
        {/* Scanning Animation Line */}
        {isProcessing && (
            <motion.div 
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-brand/50 shadow-[0_0_20px_rgba(148,11,21,0.8)] z-20" 
            />
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col w-full max-w-xs space-y-3"
      >
        <button 
            className="w-full bg-brand text-white font-semibold h-14 rounded-[16px] shadow-lg shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            onClick={triggerFileInput}
            disabled={isProcessing}
        >
            <Camera className="w-5 h-5" />
            <span>Start Camera</span>
        </button>
        
        <button 
            className="w-full bg-white text-text font-medium h-14 rounded-[16px] border border-divider hover:bg-surface2 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            onClick={triggerFileInput}
            disabled={isProcessing}
        >
            <Upload className="w-5 h-5 text-muted" />
            <span>Upload Foto</span>
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 bg-brand-soft/50 rounded-[16px] max-w-xs border border-brand-soft"
      >
         <div className="flex items-start space-x-3">
            <ScanLine className="w-5 h-5 text-brand mt-0.5 shrink-0" />
            <p className="text-xs text-brand-2 leading-relaxed">
                Richt je camera op het voor- of achteretiket. Zorg voor goed licht voor het beste resultaat.
            </p>
         </div>
      </motion.div>
   {/* Debug Logs */}
      {errorLog.length > 0 && (
          <div className="mt-4 p-2 bg-black/5 rounded text-[10px] font-mono text-left w-full max-w-xs mx-auto">
            {errorLog.map((log, i) => (
                <div key={i} className="text-red-600 truncate">{log}</div>
            ))}
          </div>
      )}

      {/* Version Footer */}
      <div className="text-[10px] text-muted/50 pt-4">
        v1.3.4 - Debug Mode - {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
