/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from './store/gameStore';
import Workbench from './components/workbench/Workbench';
import CRTMenu from './components/ui/CRTMenu';
import Clipboard from './components/ui/Clipboard';
import Pegboard from './components/ui/Pegboard';
import { FirebaseProvider, useAuth } from './FirebaseProvider';

function AppContent() {
  const [view, setView] = useState<'menu' | 'workbench' | 'levels'>('menu');
  const [showSettings, setShowSettings] = useState(false);
  const { currentLevel, togglePause, isPaused } = useGameStore();
  const { user, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-green-500 font-mono">
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          INITIALIZING SYSTEM...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative w-full h-screen bg-[#1a1a1a] flex items-center justify-center overflow-hidden font-mono text-zinc-400">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/workbench/1920/1080?blur=10')] bg-cover opacity-20" />
        <div className="z-10 text-center p-12 bg-zinc-900/80 border border-zinc-700 rounded-lg backdrop-blur-md shadow-2xl">
          <h1 className="text-4xl font-black text-green-500 italic mb-8 tracking-tighter">PROJECT ELECTRIFY</h1>
          <p className="mb-8 text-zinc-500 uppercase tracking-widest text-xs">Authentication Required to Access Workbench</p>
          <button
            onClick={login}
            className="px-8 py-4 bg-green-500 text-black font-black uppercase tracking-widest hover:bg-green-400 transition-all transform hover:scale-105"
          >
            Sign In with Google
          </button>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-[length:100%_4px,3px_100%] z-50" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden font-mono text-zinc-400">
      {/* Ambient Workbench Background */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/workbench/1920/1080?blur=10')] bg-cover opacity-20" />
      
      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center p-12"
          >
            <CRTMenu onStart={() => setView('levels')} />
          </motion.div>
        )}

        {view === 'levels' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center p-12"
          >
            <Pegboard onSelectLevel={(l) => {
              useGameStore.getState().setCurrentLevel(l);
              setView('workbench');
            }} onBack={() => setView('menu')} />
          </motion.div>
        )}

        {view === 'workbench' && (
          <motion.div
            key="workbench"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Workbench />
            
            {/* Diegetic HUD Elements */}
            <div className="absolute top-4 right-4 flex gap-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors"
              >
                MANUAL (ESC)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Clipboard Overlay */}
      <AnimatePresence>
        {showSettings && (
          <Clipboard onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* Global Scanline Overlay for CRT feel */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-[length:100%_4px,3px_100%] z-50" />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
