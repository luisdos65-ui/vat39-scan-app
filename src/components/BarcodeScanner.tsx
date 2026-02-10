'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onScanFailure, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
        ]
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Success
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Failure (scanning in progress)
        if (onScanFailure) onScanFailure(errorMessage);
      }
    );

    scannerRef.current = scanner;

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanFailure]);

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
            
            <div className="flex-1 flex flex-col justify-center p-4">
                <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-white/20"></div>
                <p className="text-white/70 text-center mt-4 text-sm">
                    Richt de camera op de streepjescode
                </p>
            </div>
        </div>
    </div>
  );
}
