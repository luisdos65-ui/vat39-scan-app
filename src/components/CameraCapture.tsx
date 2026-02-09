'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isProcessing: boolean;
}

export default function CameraCapture({ onCapture, isProcessing }: CameraCaptureProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'preview'>('select');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    // PREFER NATIVE CAMERA INPUT for better quality/focus control
    // The user explicitly requested "Save the photo then read it", which matches the Native Input flow.
    fileInputRef.current?.click();

    /* 
    // Legacy Custom Camera Logic (Disabled for robustness)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (err) {
      console.error('Camera access denied:', err);
      // Fallback to file upload if camera access fails
      fileInputRef.current?.click();
    }
    */
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                onCapture(file);
                stopCamera();
                // Note: We skip 'preview' mode here and go straight to processing
                // because the parent component handles the loading state
            }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  const cancelCamera = () => {
    stopCamera();
    setMode('select');
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="w-full max-w-md mx-auto">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div
              className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#940B15] to-[#BF1F26] p-8 text-white shadow-xl shadow-brand/20"
              onClick={startCamera}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
              
              <div className="relative z-10 text-center space-y-4 cursor-pointer">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner ring-1 ring-white/30 transition-transform active:scale-95">
                  <Camera className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Scan je etiket</h2>
                  <p className="text-white/80 text-sm mt-1 font-medium">
                    Tik hier om de camera te starten
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-14 bg-white text-text border border-divider hover:bg-surface2 rounded-xl font-medium shadow-sm transition-all active:scale-[0.98]"
                variant="outline"
              >
                <Upload className="w-5 h-5 mr-2 text-muted" />
                Foto uploaden
              </Button>
            </div>
          </motion.div>
        )}

        {mode === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="relative flex-1 overflow-hidden">
                <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Overlay frame */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute left-8 right-8 top-1/4 bottom-1/4 border-2 border-white/80 rounded-[24px] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br-lg" />
                    </div>
                    
                    <div className="absolute top-16 left-0 right-0 text-center">
                        <span className="bg-black/60 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                            Richt op het etiket
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-32 bg-black flex items-center justify-between px-8 pb-8 pt-4">
              <Button
                onClick={cancelCamera}
                size="icon"
                variant="ghost"
                className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
              
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/30 flex items-center justify-center transition-transform active:scale-90 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <div className="w-16 h-16 rounded-full bg-brand/10 border-2 border-brand/20" />
              </button>

              <div className="w-12" /> {/* Spacer for centering */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
