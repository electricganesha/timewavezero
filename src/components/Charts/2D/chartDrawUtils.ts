import { t, ZERO_DATE } from "../../../engine/timewaveEngine";
import { MAJOR_EVENTS } from "../../../engine/timewaveConstants";
import { formatChartDate } from "../../../utils/dateUtils";

export interface ChartColors {
  grid: string;
  wave: string;
  waveGlow: string;
  eventLine: string;
  eventLabel: string;
  marker: string;
  markerLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  labelMuted: string;
  metaText: string;
}

export interface Point {
  x: number;
  val: number;
}

/**
 * Samples novelty data points for the given time range.
 */
export const getNoveltyPoints = (startTime: number, endTime: number, steps: number): { points: Point[]; maxY: number } => {
  const timeRange = endTime - startTime;
  const points: Point[] = [];
  let maxY = 0;

  for (let i = 0; i <= steps; i++) {
    const timeAtPoint = startTime + (i / steps) * timeRange;
    const x = (ZERO_DATE.getTime() - timeAtPoint) / 86400000;
    const val = t(x);
    points.push({ x: i, val });
    if (val > maxY) maxY = val;
  }

  return { points, maxY };
};

/**
 * Draws the horizontal grid lines.
 */
export const drawGrid = (ctx: CanvasRenderingContext2D, width: number, padding: number, chartHeight: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const y = padding + (i / 5) * chartHeight;
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
  }
  ctx.stroke();
};

/**
 * Draws the main novelty wave.
 */
export const drawWave = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  steps: number,
  padding: number,
  height: number,
  chartWidth: number,
  scaleY: number,
  colors: ChartColors,
  theme: "dark" | "light"
) => {
  ctx.save();
  ctx.shadowBlur = theme === "dark" ? 10 : 0;
  ctx.shadowColor = colors.waveGlow;
  ctx.strokeStyle = colors.wave;
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
  ctx.restore();
};

/**
 * Draws major historical events as vertical lines with labels.
 */
export const drawEvents = (
  ctx: CanvasRenderingContext2D,
  startTime: number,
  endTime: number,
  padding: number,
  height: number,
  chartWidth: number,
  colors: ChartColors
) => {
  const timeRange = endTime - startTime;
  let lastLabelX = -999;
  
  MAJOR_EVENTS.forEach((ev) => {
    if (ev.time >= startTime && ev.time <= endTime) {
      const xPos = padding + ((ev.time - startTime) / timeRange) * chartWidth;

      ctx.strokeStyle = colors.eventLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xPos, padding);
      ctx.lineTo(xPos, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      if (xPos - lastLabelX > 16) {
        ctx.save();
        ctx.translate(xPos - 5, padding + 10);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = colors.eventLabel;
        ctx.font = "10px JetBrains Mono";
        ctx.textAlign = "right";
        ctx.fillText(ev.label, 0, 0);
        ctx.restore();
        lastLabelX = xPos;
      }
    }
  });
};

/**
 * Draws the hover marker and tooltip.
 */
export const drawHoverMarker = (
  ctx: CanvasRenderingContext2D,
  mousePos: { x: number, y: number },
  startTime: number,
  endTime: number,
  padding: number,
  height: number,
  width: number,
  chartWidth: number,
  scaleY: number,
  colors: ChartColors,
  theme: "dark" | "light",
  onHoverValue?: (val: number | null) => void
) => {
  const timeRange = endTime - startTime;
  const xRelative = (mousePos.x - padding) / chartWidth;
  const hoveredTime = startTime + xRelative * timeRange;
  const xVal = (ZERO_DATE.getTime() - hoveredTime) / 86400000;
  const hoveredVal = t(xVal);
  const hoveredY = height - padding - hoveredVal * scaleY;

  // Vertical indicator line
  ctx.strokeStyle = colors.markerLine;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(mousePos.x, padding);
  ctx.lineTo(mousePos.x, height - padding);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pulse dot at point
  ctx.save();
  ctx.fillStyle = colors.marker;
  ctx.shadowBlur = theme === "dark" ? 10 : 0;
  ctx.shadowColor = colors.marker;
  ctx.beginPath();
  ctx.arc(mousePos.x, hoveredY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tooltip box
  const tooltipW = 160;
  const tooltipH = 50;
  let tx = mousePos.x + 10;
  let ty = hoveredY - 60;
  if (tx + tooltipW > width) tx = mousePos.x - tooltipW - 10;
  if (ty < 10) ty = hoveredY + 20;

  ctx.fillStyle = colors.tooltipBg;
  ctx.strokeStyle = colors.tooltipBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tx, ty, tooltipW, tooltipH, 8);
  ctx.fill();
  ctx.stroke();

  // Tooltip text
  ctx.fillStyle = colors.tooltipText;
  ctx.font = "bold 10px Inter";
  ctx.fillText(formatChartDate(hoveredTime, true), tx + 10, ty + 20);
  ctx.fillStyle = colors.wave;
  ctx.font = "12px JetBrains Mono";
  ctx.fillText(`Novelty: ${hoveredVal.toFixed(6)}`, tx + 10, ty + 40);

  if (onHoverValue) onHoverValue(hoveredVal);
};

/**
 * Draws fractal resonance rhyming points and connecting arcs.
 */
export const drawRhymes = (
  ctx: CanvasRenderingContext2D,
  startTime: number,
  endTime: number,
  padding: number,
  height: number,
  chartWidth: number,
  scaleY: number,
  colors: ChartColors,
  archaeologistDate: Date,
  echoDates?: Date[]
) => {
  const timeRange = endTime - startTime;
  const allPoints = [archaeologistDate, ...(echoDates || [])];
  const pointPositions: { x: number; y: number; time: number }[] = [];

  allPoints.forEach((date, i) => {
    const time = date.getTime();
    if (time >= startTime && time <= endTime) {
      const xPos = padding + ((time - startTime) / timeRange) * chartWidth;
      const xVal = (ZERO_DATE.getTime() - time) / 86400000;
      const val = t(xVal);
      const yPos = height - padding - val * scaleY;
      pointPositions.push({ x: xPos, y: yPos, time });

      // Vertical marker
      ctx.strokeStyle = i === 0 ? "#00f2ff" : i === 1 ? "#ff00fb" : "#7000ff";
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xPos, padding);
      ctx.lineTo(xPos, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      // Glowing echo dot
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(xPos, yPos, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Label
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText(i === 0 ? "PRIMARY" : `ECHO L${i}`, xPos + 8, yPos - 10);
    }
  });

  // Connecting Resonance Arcs
  if (pointPositions.length > 1) {
    ctx.save();
    ctx.setLineDash([]);
    for (let i = 0; i < pointPositions.length - 1; i++) {
      const p1 = pointPositions[i];
      const p2 = pointPositions[i + 1];
      
      ctx.strokeStyle = colors.wave;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      const cpX = (p1.x + p2.x) / 2;
      const cpY = Math.min(p1.y, p2.y) - Math.abs(p1.x - p2.x) * 0.2;
      ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }
};
