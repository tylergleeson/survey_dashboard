import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
}

export function OnlineToggle({ isOnline, onToggle }: OnlineToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center h-48">
      <motion.button
        onClick={() => onToggle(!isOnline)}
        className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-lg ${
          isOnline ? 'bg-blue-500' : 'bg-gray-200'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isOnline ? [1, 1.05, 1] : 1,
          boxShadow: isOnline
            ? '0 0 0 0 rgba(59, 130, 246, 0)'
            : '0 0 0 0 rgba(59, 130, 246, 0)',
        }}
      >
        <motion.div
          className={`absolute w-full h-full rounded-full ${
            isOnline ? 'bg-blue-500' : 'bg-gray-200'
          }`}
          animate={{
            scale: isOnline ? [1, 1.2, 1] : 1,
            opacity: isOnline ? [1, 0, 0] : 0,
          }}
          transition={{ duration: 0.5, times: [0, 0.5, 1] }}
        />
        <motion.div
          className="text-3xl font-bold"
          animate={{ color: isOnline ? 'white' : '#374151' }}
        >
          {isOnline ? 'Stop' : 'Go'}
        </motion.div>
      </motion.button>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={isOnline ? 'online' : 'offline'}
          className="h-8 mt-4 text-sm font-medium text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <span className={isOnline ? 'text-blue-600' : 'text-gray-600'}>
            {isOnline ? 'You\'re receiving surveys' : 'Tap to start receiving surveys'}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 