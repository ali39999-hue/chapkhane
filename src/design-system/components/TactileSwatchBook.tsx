"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const swatches = [
  {
    id: 1,
    title: 'سلفون مات',
    subtitle: 'Matte Cellophane',
    description: 'پوشش مخملی با بازتاب نور صفر، مناسب برای طرح‌های مینیمال و شیک.',
    baseColor: 'bg-zinc-800',
    textColor: 'text-zinc-100',
    glareOpacity: 0.15,
    glareColor: 'rgba(255,255,255,0.3)',
  },
  {
    id: 2,
    title: 'سلفون براق',
    subtitle: 'Glossy Cellophane',
    description: 'درخشش بالا و رنگ‌های شارپ، ایده‌آل برای تصاویر پرجنب‌وجوش.',
    baseColor: 'bg-white',
    textColor: 'text-zinc-900',
    glareOpacity: 0.9,
    glareColor: 'rgba(255,255,255,0.9)',
    border: 'border border-gray-200',
  },
  {
    id: 3,
    title: 'طلاکوب برجسته',
    subtitle: 'Gold Foil',
    description: 'جزئیات درخشان طلایی با بافت لمسی برجسته و لوکس.',
    baseColor: 'bg-zinc-900',
    textColor: 'text-amber-400',
    glareOpacity: 0.6,
    glareColor: 'rgba(251, 191, 36, 0.5)',
    border: 'border border-amber-900/30',
  },
  {
    id: 4,
    title: 'یووی موضعی',
    subtitle: 'Spot UV',
    description: 'برجسته‌سازی براق بخش‌های خاصی از طرح روی زمینه مات.',
    baseColor: 'bg-zinc-800',
    textColor: 'text-zinc-100',
    glareOpacity: 0.8,
    glareColor: 'rgba(255,255,255,0.6)',
    isSpotUV: true,
  }
];

const SwatchCard = ({ swatch }: { swatch: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rY = ((mouseX / width) - 0.5) * 30;
    const rX = ((mouseY / height) - 0.5) * -30;

    setRotateX(rX);
    setRotateY(rY);
    setGlareX((mouseX / width) * 100);
    setGlareY((mouseY / height) * 100);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-64 h-80 rounded-2xl cursor-pointer shrink-0 shadow-xl overflow-hidden flex flex-col justify-between p-6 ${swatch.baseColor} ${swatch.border || ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? 1.05 : 1,
        zIndex: isHovered ? 10 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glare overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
        animate={{
          background: isHovered
            ? `radial-gradient(circle at ${glareX}% ${glareY}%, ${swatch.glareColor} 0%, transparent ${swatch.isSpotUV ? '30%' : '70%'})`
            : `radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)`,
          opacity: isHovered ? swatch.glareOpacity : 0,
        }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Spot UV specific pattern overlay */}
      {swatch.isSpotUV && (
        <motion.div
           className="absolute inset-0 pointer-events-none z-0 opacity-20"
           style={{
             backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
             backgroundSize: '20px 20px',
           }}
           animate={{
             opacity: isHovered ? 0.4 : 0.1
           }}
        />
      )}
      
      {/* Content */}
      <div className={`relative z-20 transform-gpu ${swatch.textColor}`} style={{ transform: "translateZ(40px)" }}>
        <h3 className="text-2xl font-black mb-1">{swatch.title}</h3>
        <span className="text-xs opacity-70 font-mono tracking-widest uppercase">{swatch.subtitle}</span>
      </div>

      <div className={`relative z-20 transform-gpu ${swatch.textColor}`} style={{ transform: "translateZ(30px)" }}>
        <p className="text-sm opacity-80 leading-relaxed font-medium">
          {swatch.description}
        </p>
      </div>
    </motion.div>
  );
};

export const TactileSwatchBook = () => {
  return (
    <div className="w-full relative py-8">
      {/* Fade edges for horizontal scroll */}
      <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      
      <div 
        className="w-full flex gap-8 overflow-x-auto pb-12 pt-8 px-8 hide-scrollbar" 
        style={{ perspective: "1200px" }}
      >
        {swatches.map((swatch) => (
          <SwatchCard key={swatch.id} swatch={swatch} />
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
