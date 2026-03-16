/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CircuitSolver } from '../../engine/solver';
import { ComponentType, CircuitComponent } from '../../types';
import { Zap, Play, Square, RotateCcw, CheckCircle, Trash2 } from 'lucide-react';
import { LEVELS } from '../../constants/levels';

export default function Workbench() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentLevel, circuit, addComponent, resetCircuit, completeLevel } = useGameStore();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedType, setSelectedType] = useState<ComponentType | 'DELETE'>('WIRE');
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [telemetry, setTelemetry] = useState({ pressure: 0, flow: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
  const [rotation, setRotation] = useState(0);

  const levelData = LEVELS.find(l => l.id === currentLevel);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setRotation(prev => (prev + 90) % 360);
      }
      if (e.key === 'Escape') {
        setSelectedType('WIRE');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Level
  useEffect(() => {
    resetCircuit();
    setIsLevelComplete(false);
    setIsRunning(false);
    setRotation(0);
    
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
      let compsToRender = [...circuit.components];

      // Add Ghost Component if hovering
      if (isHoveringCanvas && !isRunning && !isLevelComplete && selectedType !== 'DELETE') {
        const snappedX = Math.round(mousePos.x / 40) * 40;
        const snappedY = Math.round(mousePos.y / 40) * 40;
        
        // Check if space is occupied
        const isOccupied = circuit.components.some(c => 
          c.position.x === snappedX && c.position.y === snappedY
        );

        if (!isOccupied) {
          compsToRender.push({
            id: 'ghost',
            type: selectedType,
            position: { x: snappedX, y: snappedY },
            rotation: rotation,
            connections: [],
            pressure_in: 0,
            pressure_out: 0,
            flow_rate: 0,
            resistance: 0,
            is_active: false,
            heat_index: 0,
            fail_point: 100,
            isGhost: true,
          } as any);
        }
      }

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

    const render = (comps: any[]) => {
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
  }, [isRunning, circuit.components, currentLevel, mousePos, isHoveringCanvas, selectedType, rotation]);

  const handleLevelComplete = async () => {
    if (isLevelComplete) return;
    setIsLevelComplete(true);
    
    const efficiency = 100 - (circuit.components.length * 2);
    const safety = 100;

    completeLevel(currentLevel, efficiency, safety);
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

    // Ghost styling
    if (comp.isGhost) {
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([2, 2]);
    }

    ctx.fillStyle = comp.is_active ? '#4ade80' : '#52525b';
    ctx.strokeStyle = comp.isGhost ? '#4ade80' : '#a1a1aa';
    ctx.lineWidth = 2;

    switch (comp.type) {
      case 'BATTERY':
        ctx.fillRect(-20, -15, 40, 30);
        // Polarity indicators
        ctx.fillStyle = '#ef4444'; ctx.fillRect(15, -5, 10, 10); // Positive
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(-25, -5, 10, 10); // Negative
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('+', 17, 4);
        ctx.fillText('-', -22, 4);
        break;
      case 'WIRE':
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        // Draw connections to neighbors
        const neighbors = [
          { dx: 40, dy: 0 }, { dx: -40, dy: 0 },
          { dx: 0, dy: 40 }, { dx: 0, dy: -40 }
        ];

        neighbors.forEach(n => {
          // Check if there's a component at this neighbor position
          const hasNeighbor = circuit.components.some(c => 
            c.position.x === comp.position.x + n.dx && 
            c.position.y === comp.position.y + n.dy
          );
          
          if (hasNeighbor || comp.isGhost) {
            // Rotate the neighbor vector back to local space
            const localDx = n.dx * Math.cos(-comp.rotation * Math.PI / 180) - n.dy * Math.sin(-comp.rotation * Math.PI / 180);
            const localDy = n.dx * Math.sin(-comp.rotation * Math.PI / 180) + n.dy * Math.cos(-comp.rotation * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(localDx / 2, localDy / 2);
          }
        });
        
        ctx.stroke();

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

    // Draw Ports
    if (comp.type !== 'WIRE' && !comp.isGhost) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(-20, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(20, 0, 3, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isLevelComplete || isRunning) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round((e.clientX - rect.left) / 40) * 40;
    const y = Math.round((e.clientY - rect.top) / 40) * 40;
    
    if (selectedType === 'DELETE') {
      const comp = circuit.components.find(c => c.position.x === x && c.position.y === y);
      if (comp) useGameStore.getState().removeComponent(comp.id);
      return;
    }

    // Prevent overlapping
    const isOccupied = circuit.components.some(c => c.position.x === x && c.position.y === y);
    if (!isOccupied) {
      useGameStore.getState().addComponent(selectedType, x, y);
      // Apply rotation to the newly added component
      const components = useGameStore.getState().circuit.components;
      const last = components[components.length - 1];
      if (last) useGameStore.getState().updateComponent(last.id, { rotation });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round((e.clientX - rect.left) / 40) * 40;
    const y = Math.round((e.clientY - rect.top) / 40) * 40;
    
    const comp = circuit.components.find(c => c.position.x === x && c.position.y === y);
    if (comp) useGameStore.getState().removeComponent(comp.id);
  };

  return (
    <div className="flex h-full relative">
      <div className="w-64 bg-[#262626] border-r border-zinc-800 p-6 flex flex-col gap-6 shadow-xl z-20 overflow-y-auto">
        {/* Mission Briefing - Moved to Sidebar */}
        <div className="bg-zinc-900/50 border-l-4 border-green-500 p-4 rounded-r shadow-inner">
          <h2 className="text-xs font-black text-white uppercase tracking-widest mb-1">Level {currentLevel}</h2>
          <p className="text-[10px] text-zinc-400 italic mb-3">"{levelData?.description}"</p>
          {currentLevel === 1 && !isRunning && (
            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-[9px] text-green-400 animate-pulse">
              TUTORIAL: Select WIRE, then click the grid to connect Battery (+) to Goal.
            </div>
          )}
          <div className="space-y-1 border-t border-zinc-800 pt-2">
            <div className="flex justify-between text-[9px]">
              <span className="text-zinc-500 uppercase">Target:</span>
              <span className="text-green-500 font-bold">{levelData?.goal_pressure || 10}V</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Component Tray</h3>
          <div className="grid grid-cols-2 gap-4">
            <InventoryItem type="BATTERY" active={selectedType === 'BATTERY'} onClick={() => setSelectedType('BATTERY')} />
            <InventoryItem type="WIRE" active={selectedType === 'WIRE'} onClick={() => setSelectedType('WIRE')} />
            <InventoryItem type="RESISTOR" active={selectedType === 'RESISTOR'} onClick={() => setSelectedType('RESISTOR')} />
            <InventoryItem type="BULB" active={selectedType === 'BULB'} onClick={() => setSelectedType('BULB')} />
            <InventoryItem type="DELETE" active={selectedType === 'DELETE'} onClick={() => setSelectedType('DELETE')} />
          </div>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded text-[9px] leading-relaxed">
          <h4 className="text-zinc-400 font-bold mb-2 uppercase tracking-widest">How to Play</h4>
          <ul className="space-y-2 text-zinc-500">
            <li>• Select a component from the tray</li>
            <li>• Click the grid to place (snaps to 40px)</li>
            <li>• Press <span className="text-white font-bold">R</span> to rotate component</li>
            <li>• <span className="text-red-400">Right-Click</span> a component to remove it</li>
            <li>• Connect the <span className="text-red-400">Battery</span> to the <span className="text-green-400">Goal</span></li>
            <li>• Click <span className="text-green-400 font-bold">ENGAGE</span> to test flow</li>
          </ul>
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
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringCanvas(true)}
          onMouseLeave={() => setIsHoveringCanvas(false)}
          onClick={handleCanvasClick}
          onContextMenu={handleContextMenu}
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
        {type === 'DELETE' && <Trash2 size={20} className="text-red-500" />}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60">{type}</span>
    </button>
  );
}
