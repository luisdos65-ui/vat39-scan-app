'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onScanFailure, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // Wait for the DOM element to be available
    const initScanner = async () => {
        // Prevent double init
        if (scannerRef.current) return;

        try {
            // Check permissions explicitly first? 
            // Html5Qrcode.getCameras() does this.
            const devices = await Html5Qrcode.getCameras();
            
            if (!mountedRef.current) return;

            if (devices && devices.length) {
                // Use "reader" ID which must exist in DOM
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    {
                        fps: 30, // MAX FPS for instant capture
                        // Optimized for mobile phones (portrait) - wider box for barcodes
                        qrbox: { width: 300, height: 150 }, 
                        aspectRatio: 1.0,
                        disableFlip: false,
                        // Removed explicit formats to support ALL formats by default
                        // formatsToSupport: [...] 
                    },
                    (decodedText) => {
                        // Success - Stop IMMEDIATELY
                         if (scannerRef.current?.isScanning) {
                            // Vibrate if supported
                            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                navigator.vibrate(200);
                            }
                            
                            scannerRef.current.stop().then(() => {
                                if (mountedRef.current) {
                                    onScanSuccess(decodedText);
                                }
                            }).catch(err => console.warn("Failed to stop scanner", err));
                        }
                    },
                    (errorMessage) => {
                        // Ignore frame errors
                    }
                );
                
                if (mountedRef.current) setIsLoading(false);
            } else {
                throw new Error("Geen camera gevonden");
            }
        } catch (err: any) {
            console.error("Scanner Init Error:", err);
            // RETRY LOGIC: If camera fails, wait 1s and try again once
            if (err?.name === "NotAllowedError") {
                 if (mountedRef.current) {
                    setError("Geen toegang tot camera. Controleer je browser instellingen.");
                    setIsLoading(false);
                }
            } else {
                 if (mountedRef.current) {
                    setError(err.message || "Camera start mislukt");
                    setIsLoading(false);
                }
            }
        }
    };

    // Ensure DOM is painted
    const timer = setTimeout(initScanner, 300);

    return () => {
        mountedRef.current = false;
        clearTimeout(timer);
        if (scannerRef.current) {
            if (scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <div className="w-full max-w-md relative bg-black h-full flex flex-col">
            <div className="absolute top-4 right-4 z-20">
                 <Button
                    onClick={onClose}
                    size="icon"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                  >
                    <X className="w-6 h-6" />
                  </Button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center p-4 relative">
                {/* Loader Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
                        <p className="text-white font-medium">Camera starten...</p>
                    </div>
                )}
                
                {/* Error State */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-8 bg-black">
                        <div className="text-red-500 mb-4 bg-red-500/10 p-4 rounded-full">
                            <X className="w-10 h-10" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">{error}</p>
                        <p className="text-white/60 text-center text-sm mb-6">
                            Controleer of je browser toegang heeft tot de camera.
                        </p>
                        <Button onClick={onClose} variant="outline" className="border-white/20 text-white">
                            Sluiten
                        </Button>
                    </div>
                )}

                {/* Scanner Container - Always render this div! */}
                <div 
                    id="reader" 
                    className="w-full overflow-hidden rounded-xl border-2 border-white/20 bg-black min-h-[350px]"
                ></div>

                <p className="text-white/70 text-center mt-6 text-sm font-medium animate-pulse">
                    Richt op de streepjescode
                </p>
            </div>
        </div>
    </div>
  );
}
