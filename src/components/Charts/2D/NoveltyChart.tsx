import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { t, ZERO_DATE } from "../../../engine/timewaveEngine";
import { 
  getNoveltyPoints, 
  drawGrid, 
  drawWave, 
  drawEvents, 
  drawHoverMarker, 
  drawRhymes,
  type ChartColors
} from "./chartDrawUtils";

interface NoveltyChartProps {
  startTime: number;
  endTime: number;
  onHoverValue?: (val: number | null) => void;
  onClickDate?: (date: Date) => void;
  theme: "dark" | "light";
  isArchaeologistActive?: boolean;
  archaeologistDate?: Date;
  echoDates?: Date[];
}

const NoveltyChartComponent: React.FC<NoveltyChartProps> = ({
  startTime,
  endTime,
  onHoverValue,
  onClickDate,
  theme,
  isArchaeologistActive,
  archaeologistDate,
  echoDates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme-aware color configuration
  const colors: ChartColors = useMemo(
    () => ({
      grid: theme === "dark" ? "#1a1a1a" : "#f0f0f2",
      wave: theme === "dark" ? "#00f2ff" : "#0066cc",
      waveGlow: theme === "dark" ? "#00f2ff55" : "transparent",
      eventLine:
        theme === "dark" ? "rgba(255, 0, 251, 0.36)" : "rgba(191, 0, 176, 0.25)",
      eventLabel: theme === "dark" ? "hotpink" : "#bf00b0",
      marker: theme === "dark" ? "#ffffff" : "#000000",
      markerLine: theme === "dark" ? "#ffffff22" : "#00000022",
      tooltipBg:
        theme === "dark"
          ? "rgba(10, 10, 10, 0.9)"
          : "rgba(255, 255, 255, 0.98)",
      tooltipBorder: theme === "dark" ? "#333" : "#ddd",
      tooltipText: theme === "dark" ? "#fff" : "#1a1a1c",
      labelMuted: theme === "dark" ? "#444" : "#88888b",
      metaText: theme === "dark" ? "#333" : "#88888b",
    }),
    [theme],
  );

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

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const steps = Math.min(width, 1440);

    // 1. Prepare Data
    const { points, maxY } = getNoveltyPoints(startTime, endTime, steps);
    const scaleY = maxY > 0 ? chartHeight / maxY : 1;

    ctx.clearRect(0, 0, width, height);

    // 2. Draw Layers
    drawGrid(ctx, width, padding, chartHeight, colors.grid);
    drawEvents(ctx, startTime, endTime, padding, height, chartWidth, colors);
    drawWave(ctx, points, steps, padding, height, chartWidth, scaleY, colors, theme);

    // 3. Draw Rhymes (Archaeologist Mode)
    if (isArchaeologistActive && archaeologistDate) {
      drawRhymes(ctx, startTime, endTime, padding, height, chartWidth, scaleY, colors, archaeologistDate, echoDates);
    }

    // 4. Draw Interaction Layer
    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      drawHoverMarker(ctx, mousePos, startTime, endTime, padding, height, width, chartWidth, scaleY, colors, theme, onHoverValue);
    } else if (onHoverValue) {
      onHoverValue(null);
    }

    // 5. Labels
    ctx.font = "10px JetBrains Mono";
    if (mousePos && mousePos.x >= padding && mousePos.x <= width - padding) {
      const timeRange = endTime - startTime;
      const xRelative = (mousePos.x - padding) / chartWidth;
      const hoveredTime = startTime + xRelative * timeRange;
      const xVal = (ZERO_DATE.getTime() - hoveredTime) / 86400000;
      const hoveredVal = t(xVal);
      ctx.fillStyle = colors.wave;
      ctx.fillText(`NOVELTY INDEX: ${hoveredVal.toFixed(6)}`, padding, padding - 10);
    } else {
      ctx.fillStyle = colors.labelMuted;
      ctx.fillText("NOVELTY INDEX", padding, padding - 10);
    }

    ctx.fillStyle = colors.labelMuted;
    ctx.fillText("TIME PROGRESSION", padding, height - padding + 15);
  }, [startTime, endTime, mousePos, onHoverValue, colors, theme, isArchaeologistActive, archaeologistDate, echoDates]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!onClickDate) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    
    if (x >= padding && x <= rect.width - padding) {
      const xRelative = (x - padding) / chartWidth;
      const clickedTime = startTime + xRelative * (endTime - startTime);
      onClickDate(new Date(clickedTime));
    }
  };

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
        backgroundColor: "var(--bg-color)",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
      />
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          pointerEvents: "none",
          fontSize: "10px",
          fontFamily: "JetBrains Mono",
          color: "var(--meta-text, var(--text-very-muted))",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          gap: "4px",
        }}
      >
        <span>
          FRACTAL_SCALE: 64<sup>{Math.max(1, Math.round(Math.log((endTime - startTime) / 86400000 / 6) / Math.log(64)))}</sup>
        </span>
        <span>TERMINAL_SINGULARITY: 2012-12-21</span>
      </div>
    </div>
  );
};

export const NoveltyChart = React.memo(NoveltyChartComponent);
