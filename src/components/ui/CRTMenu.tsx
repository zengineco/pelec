/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Power, Play, Settings, HelpCircle } from 'lucide-react';

interface CRTMenuProps {
  onStart: () => void;
}

export default function CRTMenu({ onStart }: CRTMenuProps) {
  return (
    <div className="relative w-[600px] h-[450px] bg-zinc-900 rounded-3xl border-[12px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Screen Inner Glow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(34,197,94,0.1)] z-10" />
      
      {/* CRT Screen Content */}
      <div className="flex-1 bg-[#0a0f0a] p-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Flickering Overlay */}
        <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none" />
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-black text-green-500 tracking-tighter mb-2 italic">
            PROJECT ELECTRIFY
          </h1>
          <p className="text-green-800 text-sm font-bold uppercase tracking-widest">
            System v2.5.0 - The Workbench
          </p>
        </motion.div>

        <div className="space-y-4 w-64">
          <MenuButton icon={<Play size={18} />} label="INITIALIZE" onClick={onStart} primary />
          <MenuButton icon={<Settings size={18} />} label="CALIBRATION" onClick={() => {}} />
          <MenuButton icon={<HelpCircle size={18} />} label="FIELD MANUAL" onClick={() => {}} />
          <MenuButton icon={<Power size={18} />} label="TERMINATE" onClick={() => {}} danger />
        </div>

        {/* Static/Noise effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUqnW3Fe/giphy.gif')] bg-cover" />
      </div>

      {/* Physical Buttons on Monitor */}
      <div className="h-16 bg-zinc-800 flex items-center justify-end px-8 gap-4 border-t border-zinc-700">
        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-2 bg-zinc-700 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, primary, danger }: any) {
  return (
    <motion.button
      whileHover={{ x: 10, backgroundColor: primary ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded border transition-colors text-left font-bold
        ${primary ? 'border-green-500/50 text-green-500' : 'border-zinc-800 text-zinc-500'}
        ${danger ? 'hover:text-red-500 hover:border-red-500/50' : ''}
      `}
    >
      {icon}
      <span className="text-sm tracking-widest">{label}</span>
    </motion.button>
  );
}
