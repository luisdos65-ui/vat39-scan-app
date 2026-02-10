'use client';

import { Camera, Upload, ScanLine, Loader2, Search, Barcode } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { processScan, processTextSearch } from '@/lib/services/product';
import { fetchProductByBarcode } from '@/lib/services/barcode';
import CameraCapture from '@/components/CameraCapture';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProcessingOverlay from '@/components/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [processingStep, setProcessingStep] = useState('ocr');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorLog, setErrorLog] = useState<string[]>([]); // New debug log state
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined); // Preview state
  const router = useRouter();

  const addLog = (msg: string) => {
    console.log(msg);
    setErrorLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowBarcodeScanner(false);
    setIsProcessing(true);
    setProcessingStep('search');
    addLog(`Barcode found: ${barcode}`);

    try {
        const product = await fetchProductByBarcode(barcode);
        
        // Product is guaranteed to be returned now (either real or fallback)
        if (!product) {
             // Should not happen with new logic, but safe guard
             alert("Er is een onbekende fout opgetreden.");
             setIsProcessing(false);
             return;
        }

        addLog(`Barcode success: ${product.name}`);
        
        // Save to local history
        try {
            const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
            localStorage.setItem('recentScans', JSON.stringify([product, ...recentScans].slice(0, 10)));
        } catch (e) {
            console.error(e);
        }

        router.push(`/product/${product.id}`);

    } catch (error) {
        console.error("Barcode lookup failed:", error);
        addLog("Barcode error");
        setIsProcessing(false);
        alert("Fout bij ophalen barcode info.");
    }
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
      
      // PARALLEL STRATEGY: Race between Barcode (Fast/Accurate) and AI (Smart/Robust)
      // We start both. If barcode finds something, it wins.
      // If barcode fails, we just wait for AI.
      
      let isBarcodeFound = false;

      // 1. Start AI Analysis Promise (Don't await yet)
      const aiPromise = (async () => {
          addLog("Start AI Analyse (GPT-4o)...");
          try {
             const product = await processScan(file);
             if (isBarcodeFound) return null; // Barcode already won
             return product;
          } catch (e) {
             console.error("AI Error:", e);
             return null;
          }
      })();

      // 2. Start Barcode Analysis Promise
      const barcodePromise = (async () => {
          try {
             addLog("Controleren op barcode...");
             const html5QrCode = new Html5Qrcode("reader-hidden");
             const barcode = await html5QrCode.scanFile(file, false);
             html5QrCode.clear();
             
             if (barcode) {
                 addLog(`Barcode found: ${barcode}`);
                 isBarcodeFound = true;
                 handleBarcodeScan(barcode); // This triggers redirect
                 return true; // Winner
             }
          } catch (e) {
             console.log("No barcode in image (or scan failed)");
             // Do not error out, just let AI continue
          }
          return false;
      })();

      try {
        // Wait for barcode first (it's usually faster if present)
        // But we don't want to block AI if barcode takes long (unlikely for local)
        // Actually, scanFile can be slow on huge images.
        
        // We race? No, we want barcode to override AI if found.
        
        // Let's await barcode first, but with a short timeout?
        // No, user wants "Instant". 
        
        // If we await barcode, and it takes 2s to say "no", that's 2s wasted.
        // But AI takes 4-5s anyway.
        
        const barcodeResult = await barcodePromise;
        if (barcodeResult) return; // Barcode won and handled redirect

        addLog("No barcode found. Waiting for AI...");
        
        // If barcode didn't find anything, we rely on AI
        const aiProduct = await aiPromise;
        
        if (aiProduct) {
            // Simulate steps for UX (if it was too fast, which is rare for GPT-4o)
            setProcessingStep('search');
            await new Promise(r => setTimeout(r, 500));
            setProcessingStep('parse');
            setProcessingStep('verify');
            
            addLog(`AI Success: ${aiProduct.name}`);
            saveToHistory(aiProduct);
            router.push(`/product/${aiProduct.id}`);
        } else {
            throw new Error("Geen resultaat van AI of Barcode.");
        }

      } catch (error) {
        console.error('Scan failed:', error);
        let errorMessage = 'Kon de foto niet verwerken.';
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes("500")) errorMessage = "Server fout (Controleer API Key).";
        }
        
        setIsProcessing(false);
        alert(`Helaas, we konden dit niet herkennen.\n\nFout: ${errorMessage}`);
        addLog(`ERROR: ${errorMessage}`);
      }
  };

  const saveToHistory = (product: any) => {
        try {
            const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
            try {
                localStorage.setItem('recentScans', JSON.stringify([product, ...recentScans].slice(0, 10)));
            } catch (quotaError) {
                // Try saving only the new product
                localStorage.setItem('recentScans', JSON.stringify([product]));
            }
        } catch (e) {
             console.error("Storage error", e);
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
      
      {/* Hidden div for file scanner */}
      <div id="reader-hidden" className="hidden"></div>

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
        {!isProcessing && !showBarcodeScanner && (
            <div className="space-y-4">
                <CameraCapture 
                    onCapture={handleCapture} 
                    isProcessing={isProcessing} 
                    onBarcodeScan={() => setShowBarcodeScanner(true)}
                />
            </div>
        )}

        {showBarcodeScanner && (
            <BarcodeScanner 
                onScanSuccess={handleBarcodeScan} 
                onClose={() => setShowBarcodeScanner(false)} 
            />
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
