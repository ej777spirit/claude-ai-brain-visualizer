/**
 * Graph Analysis - mathjs-powered metrics for the thought knowledge graph
 * @module services/analysis/GraphAnalysis
 */

import { matrix, multiply, ones, mean, std } from 'mathjs';
import { ThoughtNode } from '../../types';

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  /** Fraction of possible edges present (0-1) */
  density: number;
  avgDegree: number;
  weightMean: number;
  weightStd: number;
  maxDepth: number;
  /** Node with the highest degree (most connections) */
  centralNode: ThoughtNode | null;
  /** Symmetric adjacency matrix, indexed in thought order */
  adjacency: number[][];
}

export class GraphAnalysis {
  /**
   * Compute structural metrics for a thought graph built from parent links
   */
  static analyze(thoughts: ThoughtNode[]): GraphMetrics {
    const n = thoughts.length;
    if (n === 0) {
      return {
        nodeCount: 0,
        edgeCount: 0,
        density: 0,
        avgDegree: 0,
        weightMean: 0,
        weightStd: 0,
        maxDepth: 0,
        centralNode: null,
        adjacency: []
      };
    }

    const indexById = new Map<number, number>();
    thoughts.forEach((t, i) => indexById.set(t.id, i));

    // Build symmetric adjacency matrix from parent links
    const adjacency: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    let edgeCount = 0;
    thoughts.forEach(t => {
      if (t.parent == null) return;
      const childIdx = indexById.get(t.id);
      const parentIdx = indexById.get(t.parent);
      if (childIdx === undefined || parentIdx === undefined || childIdx === parentIdx) return;
      if (adjacency[childIdx][parentIdx] === 0) {
        adjacency[childIdx][parentIdx] = 1;
        adjacency[parentIdx][childIdx] = 1;
        edgeCount++;
      }
    });

    // Degree vector = A · 1 (row sums of the adjacency matrix)
    const degrees = (n > 1
      ? (multiply(matrix(adjacency), ones(n)) as any).toArray() as number[]
      : [0]);

    let centralIdx = 0;
    degrees.forEach((d, i) => {
      if (d > degrees[centralIdx]) centralIdx = i;
    });

    const weights = thoughts.map(t => t.weight);

    return {
      nodeCount: n,
      edgeCount,
      density: n > 1 ? (2 * edgeCount) / (n * (n - 1)) : 0,
      avgDegree: (mean(degrees) as unknown) as number,
      weightMean: (mean(weights) as unknown) as number,
      weightStd: n > 1 ? ((std(weights, 'uncorrected') as unknown) as number) : 0,
      maxDepth: GraphAnalysis.maxDepth(thoughts),
      centralNode: degrees[centralIdx] > 0 ? thoughts[centralIdx] : null,
      adjacency
    };
  }

  /**
   * Longest parent chain in the graph
   */
  private static maxDepth(thoughts: ThoughtNode[]): number {
    const byId = new Map<number, ThoughtNode>();
    thoughts.forEach(t => byId.set(t.id, t));

    let max = 0;
    thoughts.forEach(t => {
      let depth = 0;
      let current: ThoughtNode | undefined = t;
      const seen = new Set<number>();
      while (current?.parent != null && !seen.has(current.id)) {
        seen.add(current.id);
        current = byId.get(current.parent);
        if (current) depth++;
      }
      max = Math.max(max, depth);
    });
    return max;
  }
}
