import React, { useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { GraphCanvasProps, Node, Link } from "./GraphCanvas.types";
import { COLORS, SIMULATION, ZOOM } from "./GraphCanvas.consts";

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const selectedIdRef = useRef<string | null>(null);
  const animationFrame = useRef<number | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  const { nodes, links } = useMemo(() => {
    return {
      nodes: graphData.nodes.map((n) => ({ ...n })),
      links: graphData.links.map((l) => ({ ...l })),
    };
  }, [graphData]);

  const render = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const { x, y, k } = transformRef.current;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(x, y);
    ctx.scale(k, k);

    ctx.beginPath();
    ctx.strokeStyle = COLORS.LINK;
    ctx.lineWidth = 1 / k;

    links.forEach((link) => {
      const source = link.source as unknown as Node;
      const target = link.target as unknown as Node;
      if (
        source.x !== undefined &&
        source.y !== undefined &&
        target.x !== undefined &&
        target.y !== undefined
      ) {
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
      }
    });
    ctx.stroke();

    const selectedId = selectedIdRef.current;
    nodes.forEach((node) => {
      if (node.x == null || node.y == null) return;

      const isSelected = node.id === selectedId;

      ctx.beginPath();
      ctx.arc(node.x, node.y, SIMULATION.NODE_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? COLORS.NODE_SELECTED : COLORS.NODE;
      ctx.fill();

      ctx.strokeStyle = isSelected ? COLORS.STROKE_SELECTED : COLORS.STROKE;
      ctx.lineWidth = 1 / k;
      ctx.stroke();
    });

    ctx.restore();
  }, [nodes, links, width, height]);

  const findNodeAt = useCallback(
    (px: number, py: number): Node | null => {
      const [mx, my] = transformRef.current.invert([px, py]);
      return (
        nodes.find((n) => {
          if (n.x == null || n.y == null) return false;
          const dx = mx - n.x;
          const dy = my - n.y;
          return dx * dx + dy * dy < SIMULATION.CLICK_RADIUS_SQ;
        }) ?? null
      );
    },
    [nodes]
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const node = findNodeAt(x, y);
      const newId = node?.id ?? null;

      if (newId !== selectedIdRef.current) {
        selectedIdRef.current = newId;
        render();
      }
    },
    [findNodeAt, render]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    contextRef.current = ctx;

    const sim = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(SIMULATION.LINK_DISTANCE)
      )
      .force("charge", d3.forceManyBody().strength(SIMULATION.CHARGE))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        if (animationFrame.current)
          cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(render);
      });

    simulationRef.current = sim;

    const selection = d3.select(canvas);

    // Zoom
    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([ZOOM.MIN, ZOOM.MAX])
      .filter((event) => {
        if (event.type === "mousedown") {
          const rect = canvas.getBoundingClientRect();
          return !findNodeAt(
            event.clientX - rect.left,
            event.clientY - rect.top
          );
        }
        return true;
      })
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        render();
      });

    const drag = d3
      .drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const rect = canvas.getBoundingClientRect();
        return findNodeAt(
          event.sourceEvent.clientX - rect.left,
          event.sourceEvent.clientY - rect.top
        );
      })
      .on("start", (event) => {
        if (!event.active) sim.alphaTarget(SIMULATION.ALPHA_TARGET).restart();
        const node = event.subject as Node;
        node.fx = node.x;
        node.fy = node.y;
      })
      .on("drag", (event) => {
        const rect = canvas.getBoundingClientRect();
        const [mx, my] = transformRef.current.invert([
          event.sourceEvent.clientX - rect.left,
          event.sourceEvent.clientY - rect.top,
        ]);
        const node = event.subject as Node;
        node.fx = mx;
        node.fy = my;
      })
      .on("end", (event) => {
        if (!event.active) sim.alphaTarget(0);
        const node = event.subject as Node;
        node.fx = null;
        node.fy = null;
      });

    selection.call(zoom).call(drag);
    canvas.addEventListener("click", handleClick);

    render();

    return () => {
      sim.stop();
      simulationRef.current = null;
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      canvas.removeEventListener("click", handleClick);
      selection.on(".zoom", null).on(".drag", null);
    };
  }, [nodes, links, width, height, render, findNodeAt, handleClick]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        display: "block",
        cursor: "grab",
      }}
    />
  );
};

export default GraphCanvas;
