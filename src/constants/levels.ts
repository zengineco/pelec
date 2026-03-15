/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level } from '../types';

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "The First Spark",
    description: "Connect the battery to the bulb. Pressure must reach the filament.",
    phase: 1,
    goal_pressure: 10,
    inventory: { BATTERY: 1, WIRE: 10, RESISTOR: 0, BULB: 1, SWITCH: 0, CAPACITOR: 0, INDUCTOR: 0, GOAL: 1 },
    initial_components: [
      { id: 'b1', type: 'BATTERY', position: { x: 100, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 0.1, is_active: false, heat_index: 0, fail_point: 100 },
      { id: 'g1', type: 'GOAL', position: { x: 500, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 10, is_active: false, heat_index: 0, fail_point: 100 },
    ]
  },
  {
    id: 2,
    title: "The Long Path",
    description: "Distance increases resistance. Use more wire to reach the goal.",
    phase: 1,
    goal_pressure: 10,
    inventory: { BATTERY: 1, WIRE: 20, RESISTOR: 0, BULB: 1, SWITCH: 0, CAPACITOR: 0, INDUCTOR: 0, GOAL: 1 },
    initial_components: [
      { id: 'b1', type: 'BATTERY', position: { x: 100, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 0.1, is_active: false, heat_index: 0, fail_point: 100 },
      { id: 'g1', type: 'GOAL', position: { x: 700, y: 300 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 10, is_active: false, heat_index: 0, fail_point: 100 },
    ]
  },
  {
    id: 3,
    title: "The Valve",
    description: "A simple switch controls the flow. Close the circuit to power the goal.",
    phase: 1,
    goal_pressure: 10,
    inventory: { BATTERY: 1, WIRE: 15, RESISTOR: 0, BULB: 0, SWITCH: 1, CAPACITOR: 0, INDUCTOR: 0, GOAL: 1 },
    initial_components: [
      { id: 'b1', type: 'BATTERY', position: { x: 100, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 0.1, is_active: false, heat_index: 0, fail_point: 100 },
      { id: 'g1', type: 'GOAL', position: { x: 500, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 10, is_active: false, heat_index: 0, fail_point: 100 },
    ]
  },
  {
    id: 6,
    title: "The Narrow Pipe",
    description: "Series Resistance. Two resistors in a line will slow the flow significantly.",
    phase: 2,
    goal_pressure: 5,
    inventory: { BATTERY: 1, WIRE: 20, RESISTOR: 2, BULB: 1, SWITCH: 0, CAPACITOR: 0, INDUCTOR: 0, GOAL: 1 },
    initial_components: [
      { id: 'b1', type: 'BATTERY', position: { x: 100, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 0.1, is_active: false, heat_index: 0, fail_point: 100 },
      { id: 'g1', type: 'GOAL', position: { x: 600, y: 100 }, rotation: 0, connections: [], pressure_in: 0, pressure_out: 0, flow_rate: 0, resistance: 10, is_active: false, heat_index: 0, fail_point: 100 },
    ]
  },
  {
    id: 13,
    title: "The Logic Gate",
    description: "Use a transistor (Switch) to control a larger flow with a smaller one.",
    phase: 4,
    goal_pressure: 12,
    inventory: { BATTERY: 2, WIRE: 30, RESISTOR: 5, BULB: 2, SWITCH: 1, CAPACITOR: 0, INDUCTOR: 0, GOAL: 1 },
    initial_components: []
  }
];

// Generate placeholders for the rest to ensure 20 exist
for (let i = 2; i <= 20; i++) {
  if (!LEVELS.find(l => l.id === i)) {
    LEVELS.push({
      id: i,
      title: `Assignment #${i}`,
      description: "Advanced circuit analysis required.",
      phase: Math.ceil(i / 4),
      goal_pressure: 10,
      inventory: { BATTERY: 1, WIRE: 50, RESISTOR: 10, BULB: 5, SWITCH: 5, CAPACITOR: 5, INDUCTOR: 5, GOAL: 1 },
      initial_components: []
    });
  }
}

LEVELS.sort((a, b) => a.id - b.id);
