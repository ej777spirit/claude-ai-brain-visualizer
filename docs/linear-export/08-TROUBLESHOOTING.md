# Troubleshooting Guide

## Quick Diagnosis

### Application Won't Load

| Symptom | Check | Solution |
|---------|-------|----------|
| Blank page | Console for errors | Fix JS errors |
| "Module not found" | `npm install` completed? | Run `npm install` |
| CORS error | Backend running? | Start `npm run server` |
| 404 on assets | Build exists? | Run `npm run build` |

### Visualization Issues

| Symptom | Check | Solution |
|---------|-------|----------|
| Black canvas | WebGL enabled? | Enable hardware acceleration |
| No nodes appear | Thoughts empty? | Check API response |
| Nodes at origin | Connections first? | Verify position → connect order |
| Lights stacking | clearScene fixed? | Update VisualizationManager |

### API Issues

| Symptom | Check | Solution |
|---------|-------|----------|
| "Demo mode" always | API keys set? | Configure `.env` file |
| Rate limit errors | Request count? | Wait 15 minutes |
| Provider errors | Model ID correct? | Update to latest model IDs |
| Timeout errors | Network? | Check connectivity |

---

## Detailed Diagnostics

### Problem: Blank 3D Canvas

**Symptoms:**
- Canvas element exists
- No WebGL errors in console
- Scene appears empty

**Diagnosis Steps:**

1. **Check WebGL support**
   ```javascript
   // Console
   !!document.createElement('canvas').getContext('webgl2')
   ```

2. **Verify scene objects**
   ```javascript
   // Console (after initialization)
   visualizationManager.scene.children.length
   ```

3. **Check camera position**
   ```javascript
   // Console
   visualizationManager.camera.position
   ```

**Solutions:**
- Enable hardware acceleration in browser settings
- Update graphics drivers
- Try Chrome/Firefox instead of Safari

---

### Problem: Thoughts Not Extracted

**Symptoms:**
- Response content displays correctly
- Visualization empty or minimal
- `thoughtSource: "sentence-derived"` in response

**Diagnosis Steps:**

1. **Check raw API response**
   ```bash
   curl -X POST http://localhost:3001/api/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Test","model":"claude"}' | jq
   ```

2. **Look for JSON block in content**
   - Response should contain ` ```json` block
   - Block should have `reasoning_steps` array

3. **Verify server extraction**
   ```javascript
   // In server/apiProxy.js
   console.log('Raw response:', content);
   console.log('Extracted:', thoughts);
   ```

**Solutions:**
- Model may not support structured output → use sentence-derived
- Prompt engineering issue → adjust STRUCTURE_INSTRUCTION
- JSON parsing failure → check malformed brackets

---

### Problem: Performance Degradation

**Symptoms:**
- FPS drops below 30
- UI becomes unresponsive
- Memory usage climbing

**Diagnosis Steps:**

1. **Check node count**
   ```javascript
   // Right panel shows "Total Thoughts"
   // Or console:
   stateManager.select('knowledgeGraph').nodes.length
   ```

2. **Profile in DevTools**
   - Performance tab → Record
   - Look for long-running functions

3. **Check memory**
   - Memory tab → Take heap snapshot
   - Look for retained objects

**Solutions:**
- Limit nodes per visualization (< 500)
- Clear old visualizations before new
- Dispose Three.js objects properly

---

### Problem: State Not Updating

**Symptoms:**
- UI doesn't reflect changes
- Console shows state dispatched
- Components not re-rendering

**Diagnosis Steps:**

1. **Verify subscription**
   ```javascript
   // In component
   stateManager.subscribe('key', (value) => console.log('Updated:', value));
   ```

2. **Check dispatch**
   ```javascript
   // Before/after dispatch
   console.log(stateManager.select('key'));
   stateManager.dispatch({ type: 'ACTION', payload: data });
   console.log(stateManager.select('key'));
   ```

3. **Verify observer notification**
   ```javascript
   // In StateManager.dispatch
   console.log('Notifying observers for:', key);
   ```

**Solutions:**
- Ensure subscription before dispatch
- Check action type string matches
- Verify payload structure

---

### Problem: Connection Lines Wrong

**Symptoms:**
- Lines going to origin
- Lines connecting wrong nodes
- Missing connections

**Diagnosis Steps:**

1. **Check node positions**
   ```javascript
   // For each node
   node.mesh.position.clone()
   ```

2. **Verify createConnection timing**
   - Must happen AFTER positionNodes()

3. **Check parentId references**
   ```javascript
   thoughts.forEach(t => console.log(t.id, '→', t.parentId));
   ```

**Solutions:**
- Ensure positionNodes() completes before createConnection()
- Validate parentId references in normalization
- Check nodeMap contains all parents

---

## Error Messages

### "Cannot read property 'x' of undefined"

**Context:** Usually in positioning or connection code

**Cause:** Node lookup failed

**Solution:**
```javascript
const parent = nodeMap.get(parentId);
if (!parent) {
  console.warn('Parent not found:', parentId);
  return;
}
```

### "WebGL: CONTEXT_LOST_WEBGL"

**Context:** After many visualizations

**Cause:** GPU memory exhausted

**Solution:**
- Properly dispose all Three.js objects
- Reduce geometry complexity
- Restart browser

### "Rate limit exceeded"

**Context:** Multiple rapid requests

**Cause:** 100 requests in 15 minutes

**Solution:**
- Wait for rate limit window to reset
- Increase limit in server configuration
- Cache responses client-side

---

## Logging Configuration

### Enable Verbose Logging

```javascript
// In main.ts
localStorage.setItem('debug', 'brain-visualizer:*');

// In modules
const debug = localStorage.getItem('debug')?.includes('brain-visualizer');
if (debug) console.log('[Module]', message);
```

### Server-Side Logging

```javascript
// In server/apiProxy.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Request:', req.body);
  console.log('Response:', response);
}
```

---

## Support Resources

### Getting Help

1. Check this troubleshooting guide
2. Review console/network errors
3. Search existing issues in repository
4. Open new issue with:
   - Environment details
   - Steps to reproduce
   - Console output
   - Expected vs actual behavior
