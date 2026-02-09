import React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, FileText, CheckCircle } from 'lucide-react';

const steps = [
  { id: 'ocr', label: 'Etiket lezen...', icon: FileText },
  { id: 'search', label: 'Producent zoeken...', icon: Search },
  { id: 'parse', label: 'Website analyseren...', icon: Globe },
  { id: 'verify', label: 'Verifiëren...', icon: CheckCircle },
];

interface ProcessingOverlayProps {
  currentStep: string;
  isVisible: boolean;
  imagePreview?: string; // New prop for image preview
}

export default function ProcessingOverlay({ currentStep, isVisible, imagePreview }: ProcessingOverlayProps) {
  if (!isVisible) return null;

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Image Preview Card */}
        {imagePreview && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-48 bg-gray-100 rounded-2xl overflow-hidden shadow-md relative"
          >
             <img src={imagePreview} alt="Scan preview" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        )}

        {/* Animated logo (if no image, show logo) */}
        {!imagePreview && (
            <div className="flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 bg-gradient-to-br from-[#940B15] to-[#BF1F26] rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-2xl">V39</span>
              </motion.div>
            </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentIndex ? 1 : 0.4,
                  x: 0
                }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                  ${isActive ? 'bg-white shadow-md' : 'bg-transparent'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${isComplete ? 'bg-green-100 text-green-600' : ''}
                  ${isActive ? 'bg-[#FBEAEC] text-[#940B15]' : ''}
                  ${!isActive && !isComplete ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  {isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`
                  font-medium transition-colors
                  ${isActive ? 'text-[#111827]' : ''}
                  ${isComplete ? 'text-green-600' : ''}
                  ${!isActive && !isComplete ? 'text-gray-400' : ''}
                `}>
                  {step.label}
                </span>
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#940B15] to-[#BF1F26]"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
