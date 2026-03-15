/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, Point } from '../types';

interface Node {
  id: string;
  voltage: number;
  connections: { componentId: string; otherNodeId: string }[];
}

export class CircuitSolver {
  /**
   * Solves the circuit using an iterative relaxation method 
   * (Simplified Nodal Analysis for real-time performance)
   */
  static solve(components: CircuitComponent[]): CircuitComponent[] {
    if (components.length === 0) return [];

    // 1. Reset state
    const updated = components.map(c => ({
      ...c,
      pressure_in: 0,
      pressure_out: 0,
      flow_rate: 0,
    }));

    // 2. Map connections to Nodes
    // In a grid-based system, nodes are the grid intersections
    const nodes = new Map<string, number>(); // key: "x,y", value: voltage

    // 3. Find Battery (Source of Pressure)
    const battery = updated.find(c => c.type === 'BATTERY');
    if (!battery) return updated;

    // Set Battery Positive node to 12V, Negative to 0V
    const posNode = `${battery.position.x + 40},${battery.position.y}`;
    const negNode = `${battery.position.x - 40},${battery.position.y}`;
    nodes.set(posNode, 12);
    nodes.set(negNode, 0);

    // 4. Iterative Relaxation (Solve for Voltage at each node)
    // This is a numerical approximation of Kirchhoff's Laws
    for (let iter = 0; iter < 20; iter++) {
      updated.forEach(comp => {
        const n1 = `${comp.position.x - 40},${comp.position.y}`;
        const n2 = `${comp.position.x + 40},${comp.position.y}`;
        
        const v1 = nodes.get(n1) ?? 0;
        const v2 = nodes.get(n2) ?? 0;

        if (comp.type === 'WIRE') {
          const avg = (v1 + v2) / 2;
          nodes.set(n1, avg);
          nodes.set(n2, avg);
        } else if (comp.type === 'RESISTOR' || comp.type === 'BULB') {
          // V = I * R -> I = (V1 - V2) / R
          // For relaxation: move voltages closer based on resistance
          const diff = v1 - v2;
          const shift = diff * (1 / (comp.resistance + 1));
          nodes.set(n1, v1 - shift * 0.5);
          nodes.set(n2, v2 + shift * 0.5);
        }
        
        // Re-pin battery
        nodes.set(posNode, 12);
        nodes.set(negNode, 0);
      });
    }

    // 5. Finalize Component Values
    return updated.map(comp => {
      const n1 = `${comp.position.x - 40},${comp.position.y}`;
      const n2 = `${comp.position.x + 40},${comp.position.y}`;
      const v1 = nodes.get(n1) ?? 0;
      const v2 = nodes.get(n2) ?? 0;

      const pressure_diff = Math.abs(v1 - v2);
      const flow = pressure_diff / (comp.resistance || 0.1);

      // Thermal Calculation
      const power = pressure_diff * flow;
      const new_heat = Math.min(1, comp.heat_index + (power / 1000) - 0.005);

      return {
        ...comp,
        pressure_in: v1,
        pressure_out: v2,
        flow_rate: flow,
        heat_index: Math.max(0, new_heat),
        is_active: flow > 0.01
      };
    });
  }
}
