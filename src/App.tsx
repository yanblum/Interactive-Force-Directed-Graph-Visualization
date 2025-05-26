import React, { useMemo } from "react";
import { GraphData } from "./GraphCanvas";
import GraphCanvas from "./GraphCanvas/GraphCanvas";

const generateSampleData = (): GraphData => {
  const nodes = Array.from({ length: 50 }, (_, i) => ({ id: `Node ${i}` }));
  const links = Array.from({ length: 50 }, () => {
    const source = `Node ${Math.floor(Math.random() * 50)}`;
    const target = `Node ${Math.floor(Math.random() * 50)}`;
    return { source, target };
  });
  return { nodes, links };
};

function App() {
  const data = useMemo(() => generateSampleData(), []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Force-Directed Graph Visualization</h2>
      <GraphCanvas graphData={data} width={800} height={600} />
    </div>
  );
}

export default App;
