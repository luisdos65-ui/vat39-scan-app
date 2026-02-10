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

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            const cameraId = devices[0].id;
            
            // Create instance
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" }, 
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                    ]
                },
                (decodedText) => {
                    // Success
                    if (mountedRef.current) {
                        html5QrCode.stop().then(() => {
                            onScanSuccess(decodedText);
                        }).catch(console.error);
                    }
                },
                (errorMessage) => {
                    // Ignore scan errors as they happen every frame no code is detected
                }
            );
            setIsLoading(false);
        } else {
            setError("Geen camera gevonden.");
            setIsLoading(false);
        }
      } catch (err) {
        console.error("Camera start failed", err);
        setError("Toegang tot camera geweigerd of niet beschikbaar.");
        setIsLoading(false);
      }
    };

    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
        startScanner();
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
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
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Loader2 className="w-10 h-10 text-brand animate-spin" />
                    </div>
                )}
                
                {error ? (
                    <div className="text-white text-center p-4 bg-red-500/20 rounded-xl border border-red-500/50">
                        <p className="font-medium">{error}</p>
                        <p className="text-sm opacity-80 mt-2">Controleer je browser instellingen.</p>
                    </div>
                ) : (
                    <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-white/20 bg-black min-h-[300px]"></div>
                )}

                <p className="text-white/70 text-center mt-4 text-sm">
                    Richt de camera op de streepjescode
                </p>
            </div>
        </div>
    </div>
  );
}
