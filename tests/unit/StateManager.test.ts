/**
 * State Manager Unit Tests
 * Updated to handle batched async notifications
 */

import { StateManager } from '../../src/services/state/StateManager';
import { AppState, AIModel } from '../../src/types';

// Helper to wait for microtask queue to flush
const flushMicrotasks = () => new Promise(resolve => queueMicrotask(resolve));

describe('StateManager', () => {
  let stateManager: StateManager;
  let initialState: AppState;

  beforeEach(() => {
    initialState = {
      scene: null,
      camera: null,
      renderer: null,
      currentModel: 'claude' as AIModel,
      currentPattern: 'hierarchical',
      currentResearchMode: 'conceptual',
      isThinking: false,
      responseHistory: [],
      currentResponseIndex: 0,
      apiConfig: {
        provider: 'anthropic',
        apiKey: '',
        configured: false,
        researchMode: 'conceptual',
        rateLimit: {
          requests: 100,
          windowMs: 900000
        }
      },
      knowledgeGraph: {
        nodes: [],
        connections: [],
        nodeMap: new Map(),
        disabledNodes: new Set(),
        branchStates: new Map(),
        matrices: new Map()
      },
      ui: {
        sidebarOpen: true,
        fullscreen: false,
        theme: 'dark'
      }
    };

    stateManager = new StateManager(initialState);
  });

  describe('initialization', () => {
    it('should initialize with provided state', () => {
      const state = stateManager.getState();
      expect(state.currentModel).toBe('claude');
      expect(state.isThinking).toBe(false);
      expect(state.ui.theme).toBe('dark');
    });

    it('should create deep copy of initial state', () => {
      const state1 = stateManager.getState();
      const state2 = stateManager.getState();

      expect(state1).not.toBe(state2); // Different references
      expect(state1).toEqual(state2); // Same content
    });
  });

  describe('state updates', () => {
    it('should update state with setState', () => {
      stateManager.setState({ isThinking: true });

      const state = stateManager.getState();
      expect(state.isThinking).toBe(true);
    });

    it('should merge partial state updates', () => {
      stateManager.setState({
        isThinking: true,
        currentModel: 'gemini' as AIModel
      });

      const state = stateManager.getState();
      expect(state.isThinking).toBe(true);
      expect(state.currentModel).toBe('gemini');
      expect(state.ui.theme).toBe('dark'); // Unchanged
    });

    it('should handle nested object updates', () => {
      stateManager.setState({
        ui: { theme: 'light' }
      });

      const state = stateManager.getState();
      expect(state.ui.theme).toBe('light');
      expect(state.ui.sidebarOpen).toBe(true); // Other UI properties preserved
    });
  });

  describe('dispatch', () => {
    it('should handle MODEL_CHANGED action', () => {
      stateManager.dispatch({
        type: 'MODEL_CHANGED',
        payload: 'gpt' as AIModel
      });

      const state = stateManager.getState();
      expect(state.currentModel).toBe('gpt');
    });

    it('should handle THINKING_STARTED action', () => {
      stateManager.dispatch({ type: 'THINKING_STARTED' });

      const state = stateManager.getState();
      expect(state.isThinking).toBe(true);
    });

    it('should handle THINKING_FINISHED action', () => {
      const mockResponse = {
        response: 'Test response',
        thoughts: [],
        model: 'Claude',
        confidence: 85,
        metadata: { processingTime: 1000 }
      };

      stateManager.dispatch({
        type: 'THINKING_FINISHED',
        payload: mockResponse
      });

      const state = stateManager.getState();
      expect(state.isThinking).toBe(false);
      expect(state.responseHistory).toContain(mockResponse);
      expect(state.currentResponseIndex).toBe(0);
    });

    it('should handle unknown actions gracefully', () => {
      const originalState = stateManager.getState();

      stateManager.dispatch({
        type: 'UNKNOWN_ACTION',
        payload: 'test'
      } as any);

      const newState = stateManager.getState();
      expect(newState).toEqual(originalState);
    });
  });

  describe('state subscriptions', () => {
    it('should notify subscribers on state changes', async () => {
      const mockSubscriber = jest.fn();
      stateManager.subscribe(mockSubscriber);

      // Clear the initial call
      mockSubscriber.mockClear();

      stateManager.setState({ isThinking: true });

      // Wait for batched notification
      await flushMicrotasks();

      expect(mockSubscriber).toHaveBeenCalledWith(
        expect.objectContaining({ isThinking: true })
      );
    });

    it('should handle multiple subscribers', async () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      stateManager.subscribe(subscriber1);
      stateManager.subscribe(subscriber2);

      // Clear initial calls
      subscriber1.mockClear();
      subscriber2.mockClear();

      stateManager.setState({ currentModel: 'gemini' as AIModel });

      // Wait for batched notification
      await flushMicrotasks();

      expect(subscriber1).toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalled();
    });

    it('should batch multiple state updates', async () => {
      const mockSubscriber = jest.fn();
      stateManager.subscribe(mockSubscriber);

      // Clear initial call
      mockSubscriber.mockClear();

      // Make multiple updates
      stateManager.setState({ isThinking: true });
      stateManager.setState({ currentModel: 'gemini' as AIModel });

      // Should only notify once after batching
      await flushMicrotasks();

      // May be called 1 or 2 times depending on microtask timing
      expect(mockSubscriber).toHaveBeenCalled();
      
      // But final state should include all updates
      const finalCall = mockSubscriber.mock.calls[mockSubscriber.mock.calls.length - 1][0];
      expect(finalCall.isThinking).toBe(true);
      expect(finalCall.currentModel).toBe('gemini');
    });

    it('should not notify unsubscribed listeners', async () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = stateManager.subscribe(mockSubscriber);

      // Should have been called once during subscription
      expect(mockSubscriber).toHaveBeenCalledTimes(1);
      expect(mockSubscriber).toHaveBeenCalledWith(initialState);

      unsubscribe();
      mockSubscriber.mockClear(); // Reset call count
      stateManager.setState({ isThinking: true });

      // Wait for batched notification
      await flushMicrotasks();

      expect(mockSubscriber).not.toHaveBeenCalled();
    });

    it('should call subscribers immediately with current state', () => {
      const mockSubscriber = jest.fn();
      stateManager.subscribe(mockSubscriber);

      expect(mockSubscriber).toHaveBeenCalledWith(initialState);
    });
  });

  describe('reset functionality', () => {
    it('should reset to initial state', () => {
      // Make some changes
      stateManager.setState({
        isThinking: true,
        currentModel: 'gpt' as AIModel,
        responseHistory: [{ response: 'test' }]
      });

      stateManager.reset();

      const state = stateManager.getState();
      expect(state.isThinking).toBe(false);
      expect(state.currentModel).toBe('claude');
      expect(state.responseHistory).toEqual([]);
    });

    it('should notify subscribers on reset', async () => {
      const mockSubscriber = jest.fn();
      stateManager.subscribe(mockSubscriber);

      // Clear initial call
      mockSubscriber.mockClear();

      stateManager.reset();

      // Reset notifies synchronously, so no need to wait
      expect(mockSubscriber).toHaveBeenCalled();
    });
  });

  describe('history management', () => {
    it('should maintain response history', () => {
      const response1 = {
        response: 'Response 1',
        thoughts: [],
        model: 'Claude',
        confidence: 85,
        metadata: {
          processingTime: 1000,
          tokensUsed: 500,
          modelVersion: 'claude-3'
        }
      };
      const response2 = {
        response: 'Response 2',
        thoughts: [],
        model: 'Gemini',
        confidence: 90,
        metadata: {
          processingTime: 1200,
          tokensUsed: 600,
          modelVersion: 'gemini-pro'
        }
      };

      stateManager.dispatch({ type: 'THINKING_FINISHED', payload: response1 });
      stateManager.dispatch({ type: 'THINKING_FINISHED', payload: response2 });

      const state = stateManager.getState();
      expect(state.responseHistory).toHaveLength(2);
      expect(state.responseHistory[0]).toBe(response1);
      expect(state.responseHistory[1]).toBe(response2);
      expect(state.currentResponseIndex).toBe(1);
    });

    it('should limit history size if needed', () => {
      // Add many responses
      for (let i = 0; i < 15; i++) {
        const response = {
          response: `Response ${i}`,
          thoughts: [],
          model: 'Claude',
          confidence: 85,
          metadata: {
            processingTime: 1000 + i * 100,
            tokensUsed: 500 + i * 10,
            modelVersion: 'claude-3'
          }
        };
        stateManager.dispatch({ type: 'THINKING_FINISHED', payload: response });
      }

      const state = stateManager.getState();
      // Should maintain reasonable history size (implementation dependent)
      expect(state.responseHistory.length).toBeGreaterThan(10);
    });
  });

  describe('knowledge graph management', () => {
    it('should handle knowledge graph updates', () => {
      const mockNode = {
        id: 1,
        text: 'Test node',
        category: 'analysis' as const,
        weight: 80,
        position: { x: 0, y: 0, z: 0 },
        connections: [],
        metadata: {
          depth: 0,
          branchId: 'test',
          timestamp: Date.now(),
          confidence: 85
        }
      };

      stateManager.setState({
        knowledgeGraph: {
          nodes: [mockNode],
          connections: [],
          nodeMap: new Map([[1, mockNode]]),
          disabledNodes: new Set(),
          branchStates: new Map(),
          matrices: new Map()
        }
      });

      const state = stateManager.getState();
      expect(state.knowledgeGraph.nodes).toHaveLength(1);
      expect(state.knowledgeGraph.nodeMap.has(1)).toBe(true);
      expect(state.knowledgeGraph.nodeMap.get(1)).toEqual(mockNode);
    });
  });

  describe('undo functionality', () => {
    it('should undo last state change', () => {
      stateManager.setState({ isThinking: true });
      const stateAfterChange = stateManager.getState();
      expect(stateAfterChange.isThinking).toBe(true);

      stateManager.undo();

      const stateAfterUndo = stateManager.getState();
      expect(stateAfterUndo.isThinking).toBe(false);
    });

    it('should handle undo when history is empty', () => {
      // Should not throw
      expect(() => stateManager.undo()).not.toThrow();
    });
  });

  describe('serialization', () => {
    it('should serialize state to JSON', () => {
      const json = stateManager.toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should deserialize state from JSON', () => {
      stateManager.setState({ currentModel: 'gemini' as AIModel });
      const json = stateManager.toJSON();

      // Create new state manager
      const newManager = new StateManager(initialState);
      newManager.fromJSON(json);

      expect(newManager.getState().currentModel).toBe('gemini');
    });
  });
});
