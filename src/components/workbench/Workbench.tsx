/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CircuitSolver } from '../../engine/solver';
import { ComponentType, CircuitComponent } from '../../types';
import { Zap, Play, Square, RotateCcw, CheckCircle } from 'lucide-react';
import { LEVELS } from '../../constants/levels';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../FirebaseProvider';

export default function Workbench() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentLevel, circuit, addComponent, resetCircuit, completeLevel, progress } = useGameStore();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedType, setSelectedType] = useState<ComponentType>('WIRE');
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [telemetry, setTelemetry] = useState({ pressure: 0, flow: 0 });
  const { user } = useAuth();

  const levelData = LEVELS.find(l => l.id === currentLevel);

  // Load Level
  useEffect(() => {
    resetCircuit();
    setIsLevelComplete(false);
    setIsRunning(false);
    
    if (levelData) {
      levelData.initial_components.forEach(c => {
        addComponent(c.type, c.position.x, c.position.y);
      });
    }
  }, [currentLevel]);

  // Simulation Loop
  useEffect(() => {
    let frameId: number;
    
    const loop = () => {
      let compsToRender = circuit.components;

      if (isRunning) {
        const updatedComponents = CircuitSolver.solve(circuit.components);
        compsToRender = updatedComponents;
        
        // Update Telemetry
        const battery = updatedComponents.find(c => c.type === 'BATTERY');
        const totalFlow = updatedComponents.reduce((acc, c) => acc + (c.type !== 'BATTERY' ? c.flow_rate : 0), 0);
        setTelemetry({ 
          pressure: battery ? 12 : 0, 
          flow: totalFlow / updatedComponents.length 
        });

        // Check Goal Condition
        const goal = updatedComponents.find(c => c.type === 'GOAL');
        if (goal && goal.is_active && goal.pressure_in >= (levelData?.goal_pressure || 10)) {
          handleLevelComplete();
          setIsRunning(false);
        }
      } else {
        setTelemetry({ pressure: 0, flow: 0 });
      }
      
      render(compsToRender);
      frameId = requestAnimationFrame(loop);
    };

    const render = (comps: CircuitComponent[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvas.width, canvas.height);
      comps.forEach(comp => drawComponent(ctx, comp));
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, circuit.components, currentLevel]);

  const handleLevelComplete = async () => {
    if (isLevelComplete) return;
    setIsLevelComplete(true);
    
    // Calculate ratings (placeholder logic)
    const efficiency = 100 - (circuit.components.length * 2);
    const safety = 100; // No sparks yet

    completeLevel(currentLevel, efficiency, safety);

    if (user) {
      const progressRef = doc(db, 'users', user.uid, 'progress', 'data');
      const updatedProgress = {
        userId: user.uid,
        completedLevels: Array.from(new Set([...progress.completedLevels, currentLevel])),
        efficiencyRatings: { ...progress.efficiencyRatings, [currentLevel]: efficiency },
        safetyRatings: { ...progress.safetyRatings, [currentLevel]: safety },
        updatedAt: serverTimestamp(),
      };
      
      try {
        await setDoc(progressRef, updatedProgress);
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  };

  const drawComponent = (ctx: CanvasRenderingContext2D, comp: any) => {
    const { x, y } = comp.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((comp.rotation * Math.PI) / 180);

    ctx.fillStyle = comp.is_active ? '#4ade80' : '#52525b';
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;

    switch (comp.type) {
      case 'BATTERY':
        ctx.fillRect(-20, -15, 40, 30);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(15, -5, 10, 10);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(-25, -5, 10, 10);
        break;
      case 'WIRE':
        ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
        if (comp.is_active) {
          ctx.strokeStyle = '#4ade80';
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = (Date.now() / 50) % 8;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        break;
      case 'RESISTOR':
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        for(let i=0; i<5; i++) {
          ctx.lineTo(-15 + i*8, i%2===0 ? -10 : 10);
        }
        ctx.lineTo(20, 0);
        ctx.stroke();
        break;
      case 'BULB':
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
        if (comp.flow_rate > 0) {
          ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(1, comp.flow_rate)})`;
          ctx.fill();
        }
        break;
      case 'GOAL':
        ctx.strokeStyle = comp.is_active ? '#4ade80' : '#f87171';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-30, -30, 60, 60);
        ctx.setLineDash([]);
        ctx.fillStyle = comp.is_active ? '#4ade80' : '#52525b';
        ctx.font = '10px monospace';
        ctx.fillText('GOAL', -12, 5);
        break;
      default:
        ctx.fillRect(-10, -10, 20, 20);
    }

    if (comp.heat_index > 0.7) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(-22, -17, 44, 34);
    }

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isLevelComplete) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round((e.clientX - rect.left) / 40) * 40;
    const y = Math.round((e.clientY - rect.top) / 40) * 40;
    addComponent(selectedType, x, y);
  };

  return (
    <div className="flex h-full relative">
      <div className="w-64 bg-[#262626] border-r border-zinc-800 p-6 flex flex-col gap-6 shadow-xl z-20">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Component Tray</h3>
        <div className="grid grid-cols-2 gap-4">
          <InventoryItem type="BATTERY" active={selectedType === 'BATTERY'} onClick={() => setSelectedType('BATTERY')} />
          <InventoryItem type="WIRE" active={selectedType === 'WIRE'} onClick={() => setSelectedType('WIRE')} />
          <InventoryItem type="RESISTOR" active={selectedType === 'RESISTOR'} onClick={() => setSelectedType('RESISTOR')} />
          <InventoryItem type="BULB" active={selectedType === 'BULB'} onClick={() => setSelectedType('BULB')} />
        </div>
        
        <div className="mt-auto space-y-4">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded font-bold transition-all
              ${isRunning ? 'bg-red-900/20 text-red-500 border border-red-500/50' : 'bg-green-900/20 text-green-500 border border-green-500/50'}
            `}
          >
            {isRunning ? <Square size={20} /> : <Play size={20} />}
            {isRunning ? 'HALT FLOW' : 'ENGAGE'}
          </button>
          <button 
            onClick={() => {
              resetCircuit();
              setIsLevelComplete(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw size={18} /> RESET
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#121212] cursor-crosshair overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={1600}
          height={1200}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain"
        />
        
        <div className="absolute bottom-8 left-8 p-4 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg pointer-events-none">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <Zap size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Telemetry</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
            <span className="text-zinc-500">SYSTEM PRESSURE:</span>
            <span className="text-zinc-300 font-bold">{telemetry.pressure.toFixed(2)} V</span>
            <span className="text-zinc-500">FLOW RATE:</span>
            <span className="text-zinc-300 font-bold">{telemetry.flow.toFixed(2)} A</span>
            <span className="text-zinc-500">THERMAL LOAD:</span>
            <span className="text-zinc-300 font-bold">NOMINAL</span>
          </div>
        </div>

        {isLevelComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <div className="bg-zinc-900 border-2 border-green-500 p-12 rounded-lg text-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
              <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
              <h2 className="text-4xl font-black text-white italic mb-2">CIRCUIT STABILIZED</h2>
              <p className="text-zinc-500 mb-8 uppercase tracking-widest text-xs">Efficiency Rating: OPTIMAL</p>
              <button 
                onClick={() => {
                  useGameStore.getState().setCurrentLevel(currentLevel + 1);
                }}
                className="px-8 py-3 bg-green-500 text-black font-black uppercase tracking-widest hover:bg-green-400 transition-colors"
              >
                Proceed to Next Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryItem({ type, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`aspect-square flex flex-col items-center justify-center gap-2 rounded border transition-all
        ${active ? 'bg-zinc-700 border-zinc-500 shadow-inner' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
      `}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'text-white' : 'text-zinc-500'}`}>
        {type === 'BATTERY' && <Zap size={20} />}
        {type === 'WIRE' && <div className="w-6 h-1 bg-current rounded-full" />}
        {type === 'RESISTOR' && <div className="w-6 h-4 border-2 border-current rounded-sm" />}
        {type === 'BULB' && <div className="w-5 h-5 border-2 border-current rounded-full" />}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60">{type}</span>
    </button>
  );
}
