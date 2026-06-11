/**
 * Graph Analysis Unit Tests
 */

import { GraphAnalysis } from '../../src/services/analysis/GraphAnalysis';
import { ThoughtNode } from '../../src/types';

function makeThought(id: number, parent: number | undefined, weight: number, category: ThoughtNode['category'] = 'analysis'): ThoughtNode {
  return {
    id,
    parent,
    text: `Thought ${id}`,
    category,
    weight,
    position: { x: 0, y: 0, z: 0 } as any,
    connections: [],
    metadata: {
      depth: 0,
      branchId: `branch-${id}`,
      timestamp: Date.now(),
      confidence: weight
    }
  };
}

describe('GraphAnalysis', () => {
  it('returns zeroed metrics for an empty graph', () => {
    const metrics = GraphAnalysis.analyze([]);

    expect(metrics.nodeCount).toBe(0);
    expect(metrics.edgeCount).toBe(0);
    expect(metrics.density).toBe(0);
    expect(metrics.centralNode).toBeNull();
    expect(metrics.adjacency).toEqual([]);
  });

  it('computes metrics for a binary tree', () => {
    // 1 is root; 2,3 children of 1; 4 child of 2
    const thoughts = [
      makeThought(1, undefined, 80),
      makeThought(2, 1, 70, 'synthesis'),
      makeThought(3, 1, 60, 'recall'),
      makeThought(4, 2, 90, 'evaluation')
    ];

    const metrics = GraphAnalysis.analyze(thoughts);

    expect(metrics.nodeCount).toBe(4);
    expect(metrics.edgeCount).toBe(3);
    // 3 edges of 6 possible in a 4-node graph
    expect(metrics.density).toBeCloseTo(0.5);
    // Degrees: node1=2, node2=2, node3=1, node4=1 -> avg 1.5
    expect(metrics.avgDegree).toBeCloseTo(1.5);
    expect(metrics.weightMean).toBeCloseTo(75);
    expect(metrics.maxDepth).toBe(2);
    expect(metrics.centralNode?.id).toBe(1);
  });

  it('builds a symmetric adjacency matrix', () => {
    const thoughts = [
      makeThought(1, undefined, 80),
      makeThought(2, 1, 70)
    ];

    const metrics = GraphAnalysis.analyze(thoughts);

    expect(metrics.adjacency).toEqual([
      [0, 1],
      [1, 0]
    ]);
  });

  it('ignores dangling parent references', () => {
    const thoughts = [
      makeThought(1, undefined, 80),
      makeThought(2, 99, 70) // parent does not exist
    ];

    const metrics = GraphAnalysis.analyze(thoughts);

    expect(metrics.edgeCount).toBe(0);
    expect(metrics.centralNode).toBeNull();
  });

  it('handles a single node graph', () => {
    const metrics = GraphAnalysis.analyze([makeThought(1, undefined, 50)]);

    expect(metrics.nodeCount).toBe(1);
    expect(metrics.density).toBe(0);
    expect(metrics.weightStd).toBe(0);
    expect(metrics.weightMean).toBe(50);
  });
});
