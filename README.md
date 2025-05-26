# 🎯 Interactive Force-Directed Graph Visualization

This project is a React-based interactive graph visualization tool that uses D3.js to render a force-directed layout onto an HTML Canvas. It was built as part of a technical assignment.

---

## 📦 Technologies Used

- **React** (with Hooks)
- **TypeScript** (strongly typed throughout)
- **D3.js** (force simulation, zoom/pan/drag)
- **Canvas API** (for performant rendering)

---

## 🚀 Features

- ⚙️ **Force-directed layout** using D3’s simulation
- 🖱️ **Zoom and pan** via mouse or touchpad
- 👆 **Node dragging** with smooth interaction
- 🎯 **Node selection** with visual highlighting
- ⚡ **Efficient Canvas rendering**
- 💡 **Responsive architecture** using `useEffect`, `useRef`, and `useMemo`

---

## 📁 Project Structure

```
src/
│
├── App.tsx                   # Demo app with sample data
├── GraphCanvas/
│   ├── GraphCanvas.tsx       # Main canvas rendering logic
│   ├── GraphCanvas.types.ts  # Graph data types
│   ├── GraphCanvas.consts.ts # Graph consts
│   └── index.ts              # Barrel export
```

---

## 🛠️ Getting Started

### 1. Clone the repository or unzip the project:

```bash
git clone https://github.com/yanblum/Interactive-Force-Directed-Graph-Visualization
cd interactive-graph-visualization
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Run the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the visualization in action.

---

## 📊 Sample Graph

- Generates a sample graph of 100 nodes and 100 links on load.
- You can adjust node/link counts in `App.tsx`

---

## 🧹 Clean Code Practices

- ✅ Fully typed with TypeScript
- 🧠 React hooks for state and lifecycle
- 🧼 Structured for readability and maintainability
- 🧯 Proper cleanup of D3 simulation and event listeners

---

## 🙏 Acknowledgements

Thanks to the reviewers for the opportunity! Feedback is always welcome.
