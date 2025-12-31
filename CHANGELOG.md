# AI Brain Visualizer - Bug Fixes Changelog

## Version 2.0.1 - Bug Fix Release

### 🐛 Bugs Fixed

---

### 1. Node Y-Drift Accumulation (Critical)
**Files:** `VisualizationManager.ts`, `script.js`, `index.html`

**Problem:** Nodes continuously drifted upward/downward because the sine wave value was being *added* to the current position each frame, causing infinite accumulation.

**Before (Buggy):**
```javascript
node.position.y += Math.sin(time + i) * 0.01;  // Adds to position every frame
```

**After (Fixed):**
```javascript
const baseY = node.userData.originalY;
node.position.y = baseY + Math.sin(time + i * 0.1) * 0.3;  // Oscillates around base
```

**Solution:** Store the original Y position when nodes are created, then oscillate around that fixed point instead of accumulating.

---

### 2. Static Connection Lines (Critical)
**Files:** `VisualizationManager.ts`, `script.js`, `index.html`

**Problem:** When nodes animated/moved, connection lines remained static at their original positions because `BufferGeometry.setFromPoints()` copies values at creation time.

**Solution:** Added `updateConnectionPositions()` function that runs every animation frame:
```javascript
function updateConnectionPositions() {
    connectionData.forEach(conn => {
        const positions = conn.line.geometry.attributes.position;
        // Update start point
        posArray[0] = fromNode.position.x;
        posArray[1] = fromNode.position.y;
        posArray[2] = fromNode.position.z;
        // Update end point
        posArray[3] = toNode.position.x;
        posArray[4] = toNode.position.y;
        posArray[5] = toNode.position.z;
        positions.needsUpdate = true;
    });
}
```

---

### 3. Memory Leak - Inconsistent Disposal Tracking (Medium)
**Files:** `VisualizationManager.ts`, `script.js`

**Problem:** In TypeScript version, disposables were pushed directly. In JS version, they were pushed as objects. This inconsistency caused some resources to not be properly disposed.

**Solution:** Standardized disposal tracking format across all files:
```javascript
// Consistent format
disposables.push({ geometry, material });

// Consistent cleanup
disposables.forEach(({ geometry, material }) => {
    if (geometry && typeof geometry.dispose === 'function') geometry.dispose();
    if (material && typeof material.dispose === 'function') material.dispose();
});
```

---

### 4. Animation Frame Overlap on View Change (Medium)
**Files:** `VisualizationManager.ts`, `script.js`, `index.html`

**Problem:** Multiple overlapping animations could occur if the user rapidly switched views, causing erratic node behavior.

**Solution:** Track active animations by node UUID and cancel existing animations before starting new ones:
```javascript
const activeAnimations = new Map();

function animateNodePosition(node, target, nodeIndex) {
    const nodeUuid = node.uuid;
    
    // Cancel existing animation for this node
    if (activeAnimations.has(nodeUuid)) {
        cancelAnimationFrame(activeAnimations.get(nodeUuid));
        activeAnimations.delete(nodeUuid);
    }
    
    // Start new animation...
    const frameId = requestAnimationFrame(update);
    activeAnimations.set(nodeUuid, frameId);
}
```

---

### 5. Heatmap Z-Position Causes Clipping (Low)
**Files:** `index.html`

**Problem:** High activation values pushed nodes too far on Z-axis (up to 10 units), potentially outside the camera's view frustum.

**Before:**
```javascript
z: node.activation * 10  // Can be 0-10, too far
```

**After:**
```javascript
z: Math.min(node.activation * 10, 8)  // Clamped to max 8
```

---

### 6. Neural Activity Race Condition (Medium)
**Files:** `index.html`

**Problem:** If `sendMessage()` was called rapidly, multiple neural activity waves would overlap, causing erratic behavior and visual glitches.

**Solution:** Added a debounce flag to prevent overlapping simulations:
```javascript
function simulateNeuralActivity() {
    // Prevent overlapping simulations
    if (state.isSimulatingActivity) {
        return;
    }
    state.isSimulatingActivity = true;

    // ... simulation code ...

    setTimeout(() => {
        // ... decay code ...
        state.isSimulatingActivity = false;  // Reset flag
    }, 1500);
}
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/visualization/VisualizationManager.ts` | Fixes 1, 2, 3, 4 |
| `script.js` | Fixes 1, 2, 3, 4 |
| `index.html` | Fixes 1, 2, 3, 4, 5, 6 |

---

## Testing Recommendations

1. **Node Drift Test:** Let visualization run for 5+ minutes, verify nodes stay in place
2. **Connection Test:** Enable recording mode, verify lines follow nodes
3. **Memory Test:** Create/clear visualizations repeatedly, monitor browser memory
4. **View Switch Test:** Rapidly switch between views, verify smooth transitions
5. **Heatmap Test:** Switch to heatmap view with high-activation nodes, verify all visible
6. **Rapid Input Test:** Send multiple messages quickly, verify stable behavior
