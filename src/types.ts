/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ComponentType = 'BATTERY' | 'WIRE' | 'RESISTOR' | 'BULB' | 'SWITCH' | 'CAPACITOR' | 'INDUCTOR' | 'GOAL';

export interface Point {
  x: number;
  y: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Point;
  rotation: number; // 0, 90, 180, 270
  connections: string[]; // IDs of connected nodes/components
  
  // Simulation properties
  pressure_in: number;  // Voltage In
  pressure_out: number; // Voltage Out
  flow_rate: number;    // Current
  resistance: number;   // Resistance
  capacity?: number;    // For capacitors
  inductance?: number;  // For inductors
  
  // State
  is_active: boolean;
  heat_index: number;   // 0 to 1 (fail point)
  fail_point: number;   // Threshold for "bulging" or "smoke"
}

export interface Level {
  id: number;
  title: string;
  description: string;
  phase: number;
  goal_pressure: number;
  inventory: Record<ComponentType, number>;
  initial_components: CircuitComponent[];
}

export interface GameState {
  currentLevel: number;
  isPaused: boolean;
  progress: {
    completedLevels: number[];
    efficiencyRatings: Record<number, number>;
    safetyRatings: Record<number, number>;
  };
  circuit: {
    components: CircuitComponent[];
    is_valid: boolean;
    last_error?: string;
  };
}
