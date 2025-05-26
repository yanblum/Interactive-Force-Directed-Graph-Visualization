import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphCanvasProps, Node, Link } from "./GraphCanvas.types";

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const selectedNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const nodes: Node[] = graphData.nodes.map((n) => ({ ...n }));
    const links: Link[] = graphData.links.map((l) => ({ ...l }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", render);

    const selection = d3.select(canvas);

    // Helper function to find node at position
    function findNodeAtPosition(x: number, y: number): Node | null {
      const [mx, my] = transformRef.current.invert([x, y]);
      return (
        nodes.find((node) => {
          const dx = (node.x ?? 0) - mx;
          const dy = (node.y ?? 0) - my;
          return dx * dx + dy * dy < 25;
        }) ?? null
      );
    }

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 5])
      .filter((event) => {
        // Only allow zoom/pan if we're not clicking on a node
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const nodeAtPosition = findNodeAtPosition(x, y);

        // If there's a node at this position, don't allow zoom/pan
        return !nodeAtPosition;
      })
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        render();
      });

    const drag = d3
      .drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.sourceEvent.clientX - rect.left;
        const y = event.sourceEvent.clientY - rect.top;
        return findNodeAtPosition(x, y);
      })
      .on("start", (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        const node = event.subject as Node;
        if (node) {
          node.fx = node.x;
          node.fy = node.y;
        }
      })
      .on("drag", (event) => {
        const node = event.subject as Node;
        if (node) {
          const rect = canvas.getBoundingClientRect();
          const x = event.sourceEvent.clientX - rect.left;
          const y = event.sourceEvent.clientY - rect.top;
          const [mx, my] = transformRef.current.invert([x, y]);
          node.fx = mx;
          node.fy = my;
        }
      })
      .on("end", (event) => {
        if (!event.active) simulation.alphaTarget(0);
        const node = event.subject as Node;
        if (node) {
          node.fx = null;
          node.fy = null;
        }
      });

    // Apply zoom first, then drag
    selection.call(zoom).call(drag);

    function handleClick(event: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const clickedNode = findNodeAtPosition(x, y);
      selectedNodeIdRef.current = clickedNode?.id ?? null;
      render();
    }

    canvas.addEventListener("click", handleClick);

    function render() {
      if (!context) return;

      const { x, y, k } = transformRef.current;
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(x, y);
      context.scale(k, k);

      // Draw links
      context.beginPath();
      context.strokeStyle = "gray";
      context.lineWidth = 1 / k; // Adjust line width for zoom
      links.forEach((link) => {
        const source = link.source as any;
        const target = link.target as any;
        if (
          source.x !== undefined &&
          source.y !== undefined &&
          target.x !== undefined &&
          target.y !== undefined
        ) {
          context.moveTo(source.x, source.y);
          context.lineTo(target.x, target.y);
        }
      });
      context.stroke();

      // Draw nodes
      nodes.forEach((node) => {
        if (node.x !== undefined && node.y !== undefined) {
          context.beginPath();
          context.arc(node.x, node.y, 5, 0, 2 * Math.PI);
          context.fillStyle =
            node.id === selectedNodeIdRef.current ? "red" : "steelblue";
          context.fill();

          // Add stroke for better visibility
          context.strokeStyle =
            node.id === selectedNodeIdRef.current ? "darkred" : "navy";
          context.lineWidth = 1 / k;
          context.stroke();
        }
      });

      context.restore();
    }

    return () => {
      simulation.stop();
      selection.on(".zoom", null).on(".drag", null);
      canvas.removeEventListener("click", handleClick);
    };
  }, [graphData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc", display: "block", cursor: "grab" }}
    />
  );
};

export default GraphCanvas;
