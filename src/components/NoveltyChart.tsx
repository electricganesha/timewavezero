import React, { useEffect, useRef, useCallback } from "react";
import { getNoveltyAtDate } from "../engine/timewaveEngine";

interface NoveltyChartProps {
  startTime: number;
  endTime: number;
}

const NoveltyChartComponent: React.FC<NoveltyChartProps> = ({
  startTime,
  endTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get actual pixel dimensions from container
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) return;

    // Sync buffer size with display size
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    const timeRange = endTime - startTime;

    // Sampling
    const steps = Math.min(width, 1440);
    const points: { x: number; val: number }[] = [];
    let maxY = 0;

    for (let i = 0; i <= steps; i++) {
      const timeAtPoint = startTime + (i / steps) * timeRange;
      const val = getNoveltyAtDate(new Date(timeAtPoint));
      points.push({ x: i, val });
      if (val > maxY) maxY = val;
    }

    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const scaleY = maxY > 0 ? chartHeight / maxY : 1;

    // Grid
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    ctx.stroke();

    // Wave
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f2ff55";
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();

    points.forEach((p, i) => {
      const xPos = padding + (p.x / steps) * chartWidth;
      const yPos = height - padding - p.val * scaleY;
      if (i === 0) ctx.moveTo(xPos, yPos);
      else ctx.lineTo(xPos, yPos);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Vertical marker and tooltip
    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      const xRelative = (mousePos.x - padding) / chartWidth;
      const hoveredTime = startTime + xRelative * timeRange;
      const hoveredDate = new Date(hoveredTime);
      const hoveredVal = getNoveltyAtDate(hoveredDate);
      const hoveredY = height - padding - hoveredVal * scaleY;

      ctx.strokeStyle = "#ffffff22";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mousePos.x, padding);
      ctx.lineTo(mousePos.x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.beginPath();
      ctx.arc(mousePos.x, hoveredY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const tooltipW = 160;
      const tooltipH = 50;
      let tx = mousePos.x + 10;
      let ty = hoveredY - 60;
      if (tx + tooltipW > width) tx = mousePos.x - tooltipW - 10;
      if (ty < 10) ty = hoveredY + 20;

      ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tooltipW, tooltipH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px Inter";
      ctx.fillText(
        hoveredDate.toLocaleDateString() +
          " " +
          hoveredDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        tx + 10,
        ty + 20,
      );
      ctx.fillStyle = "#00f2ff";
      ctx.font = "12px JetBrains Mono";
      ctx.fillText(`Novelty: ${hoveredVal.toFixed(6)}`, tx + 10, ty + 40);
    }

    // Labels
    ctx.fillStyle = "#444";
    ctx.font = "10px JetBrains Mono";
    ctx.fillText("NOVELTY INDEX", padding, padding - 10);
    ctx.fillText("TIME PROGRESSION", padding, height - padding + 15);
  }, [startTime, endTime, mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  useEffect(() => {
    const update = () => draw();
    // Simplified resize observation
    const observer = new ResizeObserver(() => requestAnimationFrame(update));
    if (containerRef.current) observer.observe(containerRef.current);
    update();
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#050505",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          pointerEvents: "none",
          fontSize: "10px",
          fontFamily: "JetBrains Mono",
          color: "#333",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          gap: "4px",
        }}
      >
        <span>FRACTAL_SCALE: 64^i</span>
        <span>ZERO_POINT: 2012-12-21</span>
      </div>
    </div>
  );
};

export const NoveltyChart = React.memo(NoveltyChartComponent);
