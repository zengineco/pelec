/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Sliders, Info } from 'lucide-react';

interface ClipboardProps {
  onClose: () => void;
}

export default function Clipboard({ onClose }: ClipboardProps) {
  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm"
    >
      <div className="relative w-[500px] h-[700px] bg-[#d4c5b0] shadow-2xl rounded-sm transform rotate-1">
        {/* Metal Clip */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 bg-zinc-400 rounded-t-lg shadow-md flex items-center justify-center border-b-4 border-zinc-500">
          <div className="w-16 h-2 bg-zinc-500 rounded-full" />
        </div>

        {/* Paper Content */}
        <div className="h-full p-12 flex flex-col font-serif text-zinc-800">
          <div className="flex justify-between items-start mb-8 border-b-2 border-zinc-300 pb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">FIELD MANUAL</h2>
              <p className="text-xs opacity-60 uppercase tracking-widest font-sans font-bold">Project Electrify // Calibration</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto pr-4">
            <section>
              <h3 className="flex items-center gap-2 font-sans font-bold text-sm mb-4 uppercase tracking-wider text-zinc-500">
                <BookOpen size={16} /> Fundamentals
              </h3>
              <div className="space-y-4 text-sm leading-relaxed italic">
                <p>1. Electricity flows like water. Voltage is the pressure pushing it through the pipes.</p>
                <p>2. Resistance narrows the pipe, slowing the flow rate (Current).</p>
                <p>3. A short circuit is a leak that drains all pressure instantly. Dangerous.</p>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-sans font-bold text-sm mb-4 uppercase tracking-wider text-zinc-500">
                <Sliders size={16} /> Accessibility
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-bold">High Contrast Wires</span>
                  <div className="w-10 h-5 bg-zinc-300 rounded-full relative group-hover:bg-zinc-400 transition-colors">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-bold">Haptic Visuals</span>
                  <div className="w-10 h-5 bg-zinc-800 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </label>
              </div>
            </section>

            <section className="pt-8 border-t border-zinc-300">
              <div className="flex items-center gap-3 text-xs opacity-50 font-sans font-bold">
                <Info size={14} />
                <span>ALL SIMULATIONS ARE CALCULATED IN REAL-TIME. PRECISION IS MANDATORY.</span>
              </div>
            </section>
          </div>
        </div>

        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      </div>
    </motion.div>
  );
}
