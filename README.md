# AI Brain Visualizer Pro - Claude Integration

An advanced 3D visualization tool that demonstrates AI thought processes in real-time using Three.js. This interactive web application simulates how different AI models (Claude, Gemini, GPT-4) process and connect concepts through an immersive brain-like visualization.

## Features

- **Real-time 3D Visualization**: Interactive Three.js scene showing AI thought processes as connected nodes
- **Multi-Model Support**: Switch between Claude, Gemini, and GPT-4 simulation modes
- **Thought Categories**: Visual distinction between Analysis, Synthesis, Recall, and Evaluation nodes
- **Performance Monitoring**: Real-time FPS, node count, and memory usage tracking
- **Chat Interface**: Interactive conversation with simulated AI responses
- **Data Export**: Save and export visualization data as JSON
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Screen reader support and keyboard navigation

## Technologies Used

- **Three.js**: 3D graphics and visualization
- **OrbitControls**: Camera controls for 3D navigation
- **Math.js**: Mathematical computations
- **Vanilla JavaScript**: ES6+ classes and modern JavaScript features
- **CSS Variables**: Dynamic theming and responsive design

## Project Structure

```
claude-ai-brain-visualizer/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # Application logic and Three.js visualization
└── README.md           # Project documentation
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
   cd claude-ai-brain-visualizer
   ```

2. Open `index.html` in your web browser or serve it with a local server.

3. Start exploring AI thought processes by entering questions in the chat interface!

## Usage

1. **Select AI Model**: Choose between Claude, Gemini, or GPT-4 from the model selector
2. **Ask Questions**: Type your question in the input field and press Enter or click "Analyze"
3. **Explore Visualization**: Use mouse to orbit, zoom, and pan around the 3D brain visualization
4. **View Analysis**: Check the right panel for detailed AI response and statistics
5. **Save/Load Sessions**: Use the control buttons to persist your visualization sessions

## Architecture

The application uses a modular architecture with three main components:

- **StateManager**: Centralized state management with history and undo support
- **VisualizationManager**: Three.js scene management and 3D rendering
- **ApplicationController**: Main application logic and event handling
- **AIAPISimulator**: Simulated AI responses (would be replaced with real API calls in production)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires WebGL support for 3D visualization.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Demo

The application runs entirely in the browser with no server-side dependencies. It's a pure client-side application that simulates AI responses for demonstration purposes.
