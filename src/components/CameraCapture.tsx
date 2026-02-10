'use client';

import React from 'react';
import { Barcode, Camera, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isProcessing: boolean;
  onBarcodeScan: () => void;
}

export default function CameraCapture({ onCapture, isProcessing, onBarcodeScan }: CameraCaptureProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <motion.div
        key="select"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <div
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#940B15] to-[#BF1F26] p-8 text-white shadow-xl shadow-brand/20 active:scale-95 transition-transform cursor-pointer"
          onClick={onBarcodeScan}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative z-10 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner ring-1 ring-white/30">
              <Barcode className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Scan Streepjescode</h2>
              <p className="text-white/80 text-sm mt-1 font-medium">
                Tik hier om te scannen
              </p>
            </div>
          </div>
        </div>

        {/* Small Text Link for Photo Scan (Hidden/Secondary) */}
        <div className="text-center pt-2">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-muted hover:text-text underline decoration-dotted transition-colors"
            >
                Of maak een foto van het etiket (Betaald/AI)
            </button>
        </div>
      </motion.div>
    </div>
  );
}

