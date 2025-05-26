import React, { useMemo } from "react";
import { GraphData } from "./GraphCanvas";
import GraphCanvas from "./GraphCanvas/GraphCanvas";

const generateSampleData = (): GraphData => {
  const nodes = Array.from({ length: 100 }, (_, i) => ({
    id: `node-${i}`,
  }));

  const links = Array.from({ length: 100 }, () => {
    const source = `node-${Math.floor(Math.random() * 100)}`;
    const target = `node-${Math.floor(Math.random() * 100)}`;
    return { source, target };
  });

  return { nodes, links };
};

const App: React.FC = () => {
  const sampleData = useMemo(() => generateSampleData(), []);

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          marginBottom: "1rem",
          color: "#333",
        }}
      >
        Force-Directed Graph Visualization
      </h2>
      <GraphCanvas graphData={sampleData} width={800} height={600} />
    </div>
  );
};

export default App;
