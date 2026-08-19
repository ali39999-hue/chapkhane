"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CMYKSimulator = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch
  if (!mounted) return <div className="w-64 h-64 flex items-center justify-center"></div>;

  const circleClass = "absolute w-32 h-32 rounded-full mix-blend-multiply opacity-80";

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Cyan */}
      <motion.div
        className={circleClass}
        style={{ backgroundColor: '#00aeef' }}
        animate={{
          x: [-15, 0, -15],
          y: [-15, -25, -15],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Magenta */}
      <motion.div
        className={circleClass}
        style={{ backgroundColor: '#ec008c' }}
        animate={{
          x: [15, 25, 15],
          y: [-15, 0, -15],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      
      {/* Yellow */}
      <motion.div
        className={circleClass}
        style={{ backgroundColor: '#fff200' }}
        animate={{
          x: [0, -15, 0],
          y: [15, 25, 15],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Key (Black) */}
      <motion.div
        className="absolute w-24 h-24 rounded-full mix-blend-multiply opacity-90"
        style={{ backgroundColor: '#1a1a1a' }}
        animate={{
          x: [10, 0, 10],
          y: [10, 20, 10],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      
      {/* Center Label */}
      <div className="absolute z-10 flex flex-col items-center justify-center pointer-events-none mix-blend-difference text-white">
         <span className="font-black tracking-widest text-xl">CMYK</span>
         <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">Sync</span>
      </div>
    </div>
  );
};
