/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, CircuitComponent, ComponentType } from '../types';

interface GameStore extends GameState {
  setCurrentLevel: (level: number) => void;
  togglePause: () => void;
  addComponent: (type: ComponentType, x: number, y: number) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  resetCircuit: () => void;
  completeLevel: (levelId: number, efficiency: number, safety: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentLevel: 1,
      isPaused: false,
      progress: {
        completedLevels: [],
        efficiencyRatings: {},
        safetyRatings: {},
      },
      circuit: {
        components: [],
        is_valid: true,
      },

      setCurrentLevel: (level) => set({ currentLevel: level }),
      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
      
      addComponent: (type, x, y) => set((state) => {
        const newComponent: CircuitComponent = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          position: { x, y },
          rotation: 0,
          connections: [],
          pressure_in: 0,
          pressure_out: 0,
          flow_rate: 0,
          resistance: type === 'RESISTOR' ? 10 : 0.1,
          is_active: false,
          heat_index: 0,
          fail_point: 100,
        };
        return {
          circuit: {
            ...state.circuit,
            components: [...state.circuit.components, newComponent],
          }
        };
      }),

      removeComponent: (id) => set((state) => ({
        circuit: {
          ...state.circuit,
          components: state.circuit.components.filter(c => c.id !== id),
        }
      })),

      updateComponent: (id, updates) => set((state) => ({
        circuit: {
          ...state.circuit,
          components: state.circuit.components.map(c => c.id === id ? { ...c, ...updates } : c),
        }
      })),

      resetCircuit: () => set((state) => ({
        circuit: {
          ...state.circuit,
          components: [],
        }
      })),

      completeLevel: (levelId, efficiency, safety) => {
        const state = get();
        const newCompletedLevels = Array.from(new Set([...state.progress.completedLevels, levelId]));
        const newEfficiency = { ...state.progress.efficiencyRatings, [levelId]: efficiency };
        const newSafety = { ...state.progress.safetyRatings, [levelId]: safety };

        set({
          progress: {
            completedLevels: newCompletedLevels,
            efficiencyRatings: newEfficiency,
            safetyRatings: newSafety,
          }
        });
      },
    }),
    {
      name: 'electrify-game-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
