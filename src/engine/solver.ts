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
    for (let iter = 0; iter < 30; iter++) {
      updated.forEach(comp => {
        const rad = (comp.rotation * Math.PI) / 180;
        const dx = Math.round(Math.cos(rad) * 40);
        const dy = Math.round(Math.sin(rad) * 40);

        // Port 1 and Port 2 positions
        const p1x = comp.position.x - dx;
        const p1y = comp.position.y - dy;
        const p2x = comp.position.x + dx;
        const p2y = comp.position.y + dy;

        const n1 = `${p1x},${p1y}`;
        const n2 = `${p2x},${p2y}`;
        
        const v1 = nodes.get(n1) ?? 0;
        const v2 = nodes.get(n2) ?? 0;

        if (comp.type === 'WIRE') {
          // Wires are special: they connect ALL 4 neighbors in a grid
          const neighbors = [
            `${comp.position.x - 40},${comp.position.y}`,
            `${comp.position.x + 40},${comp.position.y}`,
            `${comp.position.x},${comp.position.y - 40}`,
            `${comp.position.x},${comp.position.y + 40}`,
          ];
          
          let sum = 0;
          let count = 0;
          neighbors.forEach(n => {
            if (nodes.has(n)) {
              sum += nodes.get(n)!;
              count++;
            }
          });

          if (count > 0) {
            const avg = sum / count;
            neighbors.forEach(n => {
              if (nodes.has(n)) nodes.set(n, avg);
            });
          }
        } else if (comp.type === 'RESISTOR' || comp.type === 'BULB' || comp.type === 'GOAL') {
          const diff = v1 - v2;
          const shift = diff * (1 / (comp.resistance + 1));
          nodes.set(n1, v1 - shift * 0.5);
          nodes.set(n2, v2 + shift * 0.5);
        }
        
        // Re-pin battery
        const bRad = (battery.rotation * Math.PI) / 180;
        const bdx = Math.round(Math.cos(bRad) * 40);
        const bdy = Math.round(Math.sin(bRad) * 40);
        nodes.set(`${battery.position.x + bdx},${battery.position.y + bdy}`, 12);
        nodes.set(`${battery.position.x - bdx},${battery.position.y - bdy}`, 0);
      });
    }

    // 5. Finalize Component Values
    return updated.map(comp => {
      const rad = (comp.rotation * Math.PI) / 180;
      const dx = Math.round(Math.cos(rad) * 40);
      const dy = Math.round(Math.sin(rad) * 40);

      const n1 = `${comp.position.x - dx},${comp.position.y - dy}`;
      const n2 = `${comp.position.x + dx},${comp.position.y + dy}`;
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
