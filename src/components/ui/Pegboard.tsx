/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Tag } from 'lucide-react';

interface PegboardProps {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export default function Pegboard({ onSelectLevel, onBack }: PegboardProps) {
  const phases = [
    { title: 'PHASE I: BASICS', levels: [1, 2, 3, 4, 5] },
    { title: 'PHASE II: SERIES', levels: [6, 7, 8] },
    { title: 'PHASE III: PARALLEL', levels: [9, 10, 11, 12] },
    { title: 'PHASE IV: LOGIC', levels: [13, 14, 15, 16] },
    { title: 'PHASE V: CAPACITY', levels: [17, 18, 19, 20] },
  ];

  return (
    <div className="relative w-full max-w-5xl aspect-[16/9] bg-[#2a241e] rounded-lg shadow-2xl border-[16px] border-[#1e1a16] p-12 overflow-hidden">
      {/* Pegboard Holes Pattern */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ChevronLeft size={16} /> Return to Terminal
          </button>
          <h2 className="text-2xl font-black text-zinc-400 tracking-tighter italic">ASSIGNMENT BOARD</h2>
        </div>

        <div className="flex-1 grid grid-cols-5 gap-8">
          {phases.map((phase, i) => (
            <div key={i} className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-800 pb-2">
                {phase.title}
              </h3>
              <div className="flex flex-wrap gap-4">
                {phase.levels.map(level => (
                  <LevelTag 
                    key={level} 
                    num={level} 
                    onClick={() => onSelectLevel(level)}
                    locked={level > 1} // Placeholder logic
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelTag({ num, onClick, locked }: any) {
  return (
    <motion.button
      whileHover={locked ? {} : { y: -5, rotate: 2 }}
      whileTap={locked ? {} : { scale: 0.95 }}
      onClick={locked ? undefined : onClick}
      className={`relative w-12 h-16 flex flex-col items-center justify-center rounded-sm shadow-md transition-all
        ${locked ? 'bg-zinc-800 opacity-40 grayscale cursor-not-allowed' : 'bg-zinc-100 hover:bg-white cursor-pointer'}
      `}
    >
      {/* String hole */}
      <div className="absolute top-2 w-2 h-2 rounded-full bg-zinc-900/20" />
      
      <span className={`text-xl font-black ${locked ? 'text-zinc-600' : 'text-zinc-900'}`}>
        {num}
      </span>
      
      {!locked && (
        <div className="absolute bottom-1 w-full flex justify-center gap-0.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-1 h-1 rounded-full bg-zinc-300" />
          ))}
        </div>
      )}
    </motion.button>
  );
}
