'use client';

import { Camera, Upload, ScanLine, Loader2, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { processScan, processTextSearch } from '@/lib/services/product';
import CameraCapture from '@/components/CameraCapture';
import ProcessingOverlay from '@/components/ProcessingOverlay';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('ocr');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorLog, setErrorLog] = useState<string[]>([]); // New debug log state
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined); // Preview state
  const router = useRouter();

  const addLog = (msg: string) => {
    console.log(msg);
    setErrorLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsProcessing(true);
    setCurrentImage(undefined); // No image for manual search
    setProcessingStep('search'); // Start at search for manual input
    setErrorLog([]);
    addLog(`Searching for: ${searchQuery}`);

    try {
        setProcessingStep('search');
        await new Promise(r => setTimeout(r, 800)); // Simulate step
        
        setProcessingStep('parse');
        const product = await processTextSearch(searchQuery);
        
        setProcessingStep('verify');
        await new Promise(r => setTimeout(r, 600)); // Simulate step

        addLog(`Search success: ${product.name}`);
        
        try {
            const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
            localStorage.setItem('recentScans', JSON.stringify([product, ...recentScans].slice(0, 10)));
        } catch (storageError) {
             console.error(storageError);
        }

        router.push(`/product/${product.id}`);
    } catch (error) {
        console.error("Search failed:", error);
        addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsProcessing(false);
    }
  };

  const handleCapture = async (file: File) => {
      setIsProcessing(true);
      setProcessingStep('ocr');
      setErrorLog([]); // Clear old logs
      setCurrentImage(URL.createObjectURL(file)); // Show preview immediately

      addLog(`Start scan: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);
      
      try {
        addLog("Processing image...");
        // Step 1: OCR
        setProcessingStep('ocr');
        const product = await processScan(file);
        
        // Simulate other steps for better UX since processScan does it all in parallel now
        // In a real LLM flow these would be distinct await calls
        setProcessingStep('search');
        await new Promise(r => setTimeout(r, 800));
        
        setProcessingStep('parse');
        await new Promise(r => setTimeout(r, 800));

        setProcessingStep('verify');
        await new Promise(r => setTimeout(r, 600));

        addLog(`Scan success: ${product.name}`);
        
        // Save to local history
        try {
            const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
            try {
                localStorage.setItem('recentScans', JSON.stringify([product, ...recentScans].slice(0, 10)));
            } catch (quotaError) {
                console.warn("Storage quota exceeded, clearing old scans to make space.");
                // Try saving only the new product
                localStorage.setItem('recentScans', JSON.stringify([product]));
            }
        } catch (storageError) {
             addLog("Storage Warning: Could not save history");
             console.error(storageError);
             // Even if storage fails, we should try to persist this one item for the next page
             try {
                sessionStorage.setItem('currentProduct', JSON.stringify(product));
             } catch(e) {}
        }

        router.push(`/product/${product.id}`);
      } catch (error) {
        console.error('Scan failed:', error);
        
        let errorMessage = 'Er is iets misgegaan tijdens het scannen.';
        if (error instanceof Error) {
            errorMessage = error.message;
            // Check for specific Google AI errors that might be swallowed
            if (errorMessage.includes("500")) errorMessage = "Server fout (controleer API Key).";
        }
        
        // Show Visible Alert
        alert(`Scan Fout: ${errorMessage}\n\nProbeer het opnieuw of zoek handmatig.`);

        addLog(`ERROR: ${errorMessage}`);
        setIsProcessing(false);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-8 pt-8">
      <ProcessingOverlay currentStep={processingStep} isVisible={isProcessing} imagePreview={currentImage} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 mb-4"
      >
        <h1 className="text-2xl font-bold text-text">Welkom bij Vat39</h1>
        <p className="text-muted text-sm">De wijnspecialist in jouw broekzak</p>
      </motion.div>

      {/* New Camera Component */}
      <div className="w-full px-4">
        {!isProcessing && (
            <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} />
        )}
      </div>

      {/* Manual Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-xs space-y-3 pt-2 px-4"
      >
        <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-divider"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-muted uppercase tracking-wider font-medium">Of zoek handmatig</span>
            <div className="flex-grow border-t border-divider"></div>
        </div>
        
        <form onSubmit={handleSearch} className="flex space-x-2">
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bv. Glenfiddich 12..."
                className="flex-1 h-12 px-4 rounded-[12px] border border-divider bg-white text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-sm"
            />
            <button 
                type="submit"
                disabled={!searchQuery.trim() || isProcessing}
                className="h-12 w-12 flex items-center justify-center bg-brand text-white rounded-[12px] hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm"
            >
                <Search className="w-5 h-5" />
            </button>
        </form>
      </motion.div>
   
   {/* Debug Logs */}
      {errorLog.length > 0 && (
          <div className="mt-4 p-2 bg-black/5 rounded text-[10px] font-mono text-left w-full max-w-xs mx-auto">
            {errorLog.map((log, i) => (
                <div key={i} className="text-red-600 truncate">{log}</div>
            ))}
          </div>
      )}

      <div className="text-[10px] text-muted/50 pt-4">
        v1.3.10 - Native Cam Active
      </div>
    </div>
  );
}
