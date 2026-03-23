"use client";

import React, { useMemo } from "react";

type SVGType = 
  | "fraction_circle" | "fraction_rect" | "number_line"
  | "bar_chart" | "pie_chart" | "coordinate_plane"
  | "geometric_shape" | "venn_diagram" | "table"
  | "cell_animal" | "cell_plant" | "atom_structure"
  | "circuit_simple" | "force_diagram" | "vector_diagram"
  | "timeline" | "body_system";

interface SVGDynamicRendererProps {
  type: SVGType;
  data: Record<string, any>;
}

// Colores del tema
const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#F59E0B",
  muted: "#94A3B8",
  shaded: "#3B82F6",
  unshaded: "#E2E8F0",
  text: "#1E293B",
  grid: "#CBD5E1",
};

export default function SVGDynamicRenderer({ type, data }: SVGDynamicRendererProps) {
  const svg = useMemo(() => {
    switch (type) {
      case "fraction_circle":
        return renderFractionCircle(data);
      case "fraction_rect":
        return renderFractionRect(data);
      case "number_line":
        return renderNumberLine(data);
      case "bar_chart":
        return renderBarChart(data);
      case "pie_chart":
        return renderPieChart(data);
      case "geometric_shape":
        return renderGeometricShape(data);
      case "timeline":
        return renderTimeline(data);
      case "force_diagram":
        return renderForceDiagram(data);
      case "circuit_simple":
        return renderCircuitSimple(data);
      case "table":
        return renderTable(data);
      default:
        return renderPlaceholder(type);
    }
  }, [type, data]);

  return (
    <div className="w-full flex justify-center p-4">
      {svg}
    </div>
  );
}

// ==================== FRACTION CIRCLE ====================
function renderFractionCircle(data: Record<string, any>) {
  const { total = 8, shaded = 3, style = "pizza" } = data;
  const cx = 150, cy = 150, r = 120;
  
  const sectors = [];
  for (let i = 0; i < total; i++) {
    const startAngle = (2 * Math.PI / total) * i - Math.PI / 2;
    const endAngle = (2 * Math.PI / total) * (i + 1) - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;
    
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const isShaded = i < shaded;
    
    // Centro del sector para el símbolo
    const labelX = cx + r * 0.62 * Math.cos(midAngle);
    const labelY = cy + r * 0.62 * Math.sin(midAngle);
    
    sectors.push(
      <g key={i}>
        <path
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={isShaded ? COLORS.shaded : COLORS.unshaded}
          stroke="white"
          strokeWidth="2"
        />
        {isShaded && (
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="16"
            fontWeight="bold"
          >
            ✕
          </text>
        )}
        {!isShaded && style === "pizza" && (
          <circle cx={labelX} cy={labelY} r="4" fill={COLORS.muted} opacity="0.5" />
        )}
      </g>
    );
  }
  
  return (
    <svg viewBox="0 0 300 300" className="max-w-xs">
      {sectors}
    </svg>
  );
}

// ==================== FRACTION RECT ====================
function renderFractionRect(data: Record<string, any>) {
  const { total = 5, shaded = 2, orientation = "horizontal" } = data;
  const width = 280, height = 80;
  const padding = 10;
  
  const rects = [];
  const isHorizontal = orientation === "horizontal";
  const partWidth = isHorizontal ? (width - padding * 2) / total : width - padding * 2;
  const partHeight = isHorizontal ? height - padding * 2 : (height - padding * 2) / total;
  
  for (let i = 0; i < total; i++) {
    const x = isHorizontal ? padding + i * partWidth : padding;
    const y = isHorizontal ? padding : padding + i * partHeight;
    const isShaded = i < shaded;
    
    rects.push(
      <rect
        key={i}
        x={x}
        y={y}
        width={partWidth - 2}
        height={partHeight - 2}
        fill={isShaded ? COLORS.shaded : COLORS.unshaded}
        stroke="white"
        strokeWidth="2"
        rx="4"
      />
    );
  }
  
  return (
    <svg viewBox={`0 0 ${width} ${height + 40}`} className="max-w-sm">
      {rects}
      <text x={width / 2} y={height + 25} textAnchor="middle" fontSize="18" fill={COLORS.text} fontWeight="bold">
        {shaded}/{total}
      </text>
    </svg>
  );
}

// ==================== NUMBER LINE ====================
function renderNumberLine(data: Record<string, any>) {
  const { min = 0, max = 10, marked = [], step = 1 } = data;
  const width = 400, height = 100;
  const padding = 40;
  const lineY = 60;
  
  const range = max - min;
  const getX = (value: number) => padding + ((value - min) / range) * (width - padding * 2);
  
  const ticks = [];
  for (let v = min; v <= max; v += step) {
    const x = getX(v);
    ticks.push(
      <g key={v}>
        <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke={COLORS.text} strokeWidth="2" />
        <text x={x} y={lineY + 25} textAnchor="middle" fontSize="12" fill={COLORS.text}>
          {v}
        </text>
      </g>
    );
  }
  
  const markedPoints = (marked as number[]).map((value, i) => {
    const x = getX(value);
    return (
      <g key={`marked-${i}`}>
        <circle cx={x} cy={lineY} r="8" fill={COLORS.primary} />
        <text x={x} y={lineY - 20} textAnchor="middle" fontSize="14" fill={COLORS.primary} fontWeight="bold">
          {value}
        </text>
      </g>
    );
  });
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="max-w-md">
      {/* Main line */}
      <line x1={padding - 10} y1={lineY} x2={width - padding + 10} y2={lineY} stroke={COLORS.text} strokeWidth="3" />
      {/* Arrows */}
      <polygon points={`${width - padding + 15},${lineY} ${width - padding + 5},${lineY - 5} ${width - padding + 5},${lineY + 5}`} fill={COLORS.text} />
      <polygon points={`${padding - 15},${lineY} ${padding - 5},${lineY - 5} ${padding - 5},${lineY + 5}`} fill={COLORS.text} />
      {ticks}
      {markedPoints}
    </svg>
  );
}

// ==================== BAR CHART ====================
function renderBarChart(data: Record<string, any>) {
  const { labels = [], values = [], title = "", color = COLORS.primary } = data;
  const width = 400, height = 250;
  const padding = { top: 40, right: 20, bottom: 50, left: 50 };
  
  const maxValue = Math.max(...(values as number[]), 1);
  const barWidth = (width - padding.left - padding.right) / labels.length - 10;
  const chartHeight = height - padding.top - padding.bottom;
  
  const bars = (labels as string[]).map((label, i) => {
    const value = (values as number[])[i] || 0;
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding.left + i * (barWidth + 10) + 5;
    const y = height - padding.bottom - barHeight;
    
    return (
      <g key={i}>
        <rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={color}
          rx="4"
        />
        <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="12" fill={COLORS.text} fontWeight="bold">
          {value}
        </text>
        <text x={x + barWidth / 2} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill={COLORS.text}>
          {label}
        </text>
      </g>
    );
  });
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="max-w-md">
      {title && (
        <text x={width / 2} y={20} textAnchor="middle" fontSize="16" fill={COLORS.text} fontWeight="bold">
          {title}
        </text>
      )}
      {/* Y axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke={COLORS.grid} strokeWidth="2" />
      {/* X axis */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke={COLORS.grid} strokeWidth="2" />
      {bars}
    </svg>
  );
}

// Mapeo de colores semánticos para pie chart
const SEMANTIC_COLORS: Record<string, string> = {
  rojo: "#EF4444", roja: "#EF4444", rojas: "#EF4444", rojos: "#EF4444",
  verde: "#22C55E", verdes: "#22C55E",
  azul: "#3B82F6", azules: "#3B82F6",
  amarillo: "#EAB308", amarilla: "#EAB308", amarillas: "#EAB308", amarillos: "#EAB308",
  naranja: "#F97316", naranjas: "#F97316",
  morado: "#A855F7", morada: "#A855F7", moradas: "#A855F7", morados: "#A855F7",
  rosa: "#EC4899", rosado: "#EC4899", rosada: "#EC4899",
  café: "#92400E", marrón: "#92400E", marron: "#92400E",
  blanco: "#F1F5F9", blancos: "#F1F5F9", blancas: "#F1F5F9",
  negro: "#1E293B", negros: "#1E293B", negras: "#1E293B",
  gris: "#94A3B8",
};

function getSemanticColor(label: string, fallbackColors: string[], index: number): string {
  const lower = label.toLowerCase().trim();
  for (const [key, color] of Object.entries(SEMANTIC_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return fallbackColors[index % fallbackColors.length];
}

// ==================== PIE CHART ====================
function renderPieChart(data: Record<string, any>) {
  const { labels = [], values = [] } = data;
  const defaultColors = [COLORS.primary, COLORS.secondary, COLORS.accent, "#EC4899", "#8B5CF6"];
  // Resolve colors: use semantic colors based on label names
  const resolvedColors = (labels as string[]).map((label, i) => getSemanticColor(label, defaultColors, i));
  const cx = 150, cy = 130, r = 100;
  
  const total = (values as number[]).reduce((a, b) => a + b, 0) || 1;
  let currentAngle = -Math.PI / 2;
  
  const slices = (values as number[]).map((value, i) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;
    
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    
    const midAngle = (startAngle + endAngle) / 2;
    const labelX = cx + r * 0.65 * Math.cos(midAngle);
    const labelY = cy + r * 0.65 * Math.sin(midAngle);
    
    return (
      <g key={i}>
        <path
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={resolvedColors[i % resolvedColors.length]}
          stroke="white"
          strokeWidth="2"
        />
      </g>
    );
  });
  
  const legend = (labels as string[]).map((label, i) => (
    <g key={`legend-${i}`} transform={`translate(10, ${260 + i * 20})`}>
      <rect width="12" height="12" fill={resolvedColors[i % resolvedColors.length]} rx="2" />
      <text x="18" y="10" fontSize="11" fill={COLORS.text}>{label}</text>
    </g>
  ));
  
  return (
    <svg viewBox={`0 0 300 ${260 + labels.length * 20}`} className="max-w-xs">
      {slices}
      {legend}
    </svg>
  );
}

// ==================== GEOMETRIC SHAPE ====================
function renderGeometricShape(data: Record<string, any>) {
  const { shape = "rectangle", dimensions = {}, showLabels = true } = data;
  const width = 300, height = 250;
  const cx = 150, cy = 120;
  
  let shapeElement = null;
  let labels: React.ReactElement[] = [];
  
  switch (shape) {
    case "rectangle": {
      const w = dimensions.width || 120;
      const h = dimensions.height || 80;
      const scale = Math.min(200 / w, 150 / h, 1.5);
      const sw = w * scale, sh = h * scale;
      
      shapeElement = (
        <rect x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill="none" stroke={COLORS.primary} strokeWidth="3" />
      );
      if (showLabels) {
        labels = [
          <text key="w" x={cx} y={cy + sh / 2 + 20} textAnchor="middle" fontSize="14" fill={COLORS.text}>{w} cm</text>,
          <text key="h" x={cx + sw / 2 + 15} y={cy} textAnchor="start" fontSize="14" fill={COLORS.text}>{h} cm</text>,
        ];
      }
      break;
    }
    case "triangle": {
      const base = dimensions.base || 100;
      const altura = dimensions.height || 80;
      const scale = Math.min(200 / base, 150 / altura, 1.5);
      const sb = base * scale, sh = altura * scale;
      
      const points = `${cx},${cy - sh / 2} ${cx - sb / 2},${cy + sh / 2} ${cx + sb / 2},${cy + sh / 2}`;
      shapeElement = <polygon points={points} fill="none" stroke={COLORS.primary} strokeWidth="3" />;
      if (showLabels) {
        labels = [
          <text key="b" x={cx} y={cy + sh / 2 + 20} textAnchor="middle" fontSize="14" fill={COLORS.text}>{base} cm</text>,
          <text key="h" x={cx + 15} y={cy} textAnchor="start" fontSize="14" fill={COLORS.text}>{altura} cm</text>,
        ];
      }
      break;
    }
    case "circle": {
      const radius = dimensions.radius || 60;
      const scale = Math.min(100 / radius, 1.5);
      const sr = radius * scale;
      
      shapeElement = <circle cx={cx} cy={cy} r={sr} fill="none" stroke={COLORS.primary} strokeWidth="3" />;
      if (showLabels) {
        labels = [
          <line key="rl" x1={cx} y1={cy} x2={cx + sr} y2={cy} stroke={COLORS.accent} strokeWidth="2" strokeDasharray="5,3" />,
          <text key="r" x={cx + sr / 2} y={cy - 8} textAnchor="middle" fontSize="14" fill={COLORS.text}>r = {radius} cm</text>,
        ];
      }
      break;
    }
  }
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="max-w-xs">
      {shapeElement}
      {labels}
    </svg>
  );
}

// ==================== TIMELINE ====================
function renderTimeline(data: Record<string, any>) {
  const { events = [], direction = "horizontal" } = data;
  const isHorizontal = direction === "horizontal";
  
  if (events.length === 0) return renderPlaceholder("timeline");
  
  const width = isHorizontal ? 500 : 300;
  const height = isHorizontal ? 150 : 50 + events.length * 80;
  const padding = 40;
  
  const eventElements = (events as Array<{ year: string | number; label: string; description?: string }>).map((event, i) => {
    if (isHorizontal) {
      const x = padding + (i / (events.length - 1 || 1)) * (width - padding * 2);
      const y = 75;
      const above = i % 2 === 0;
      
      return (
        <g key={i}>
          <circle cx={x} cy={y} r="8" fill={COLORS.primary} />
          <line x1={x} y1={y} x2={x} y2={above ? y - 30 : y + 30} stroke={COLORS.primary} strokeWidth="2" />
          <text x={x} y={above ? y - 40 : y + 50} textAnchor="middle" fontSize="12" fill={COLORS.text} fontWeight="bold">
            {event.year}
          </text>
          <text x={x} y={above ? y - 55 : y + 65} textAnchor="middle" fontSize="10" fill={COLORS.muted}>
            {event.label}
          </text>
        </g>
      );
    } else {
      const x = 150;
      const y = padding + i * 80;
      const left = i % 2 === 0;
      
      return (
        <g key={i}>
          <circle cx={x} cy={y} r="8" fill={COLORS.primary} />
          <text x={left ? x - 20 : x + 20} y={y - 5} textAnchor={left ? "end" : "start"} fontSize="12" fill={COLORS.text} fontWeight="bold">
            {event.year}
          </text>
          <text x={left ? x - 20 : x + 20} y={y + 12} textAnchor={left ? "end" : "start"} fontSize="10" fill={COLORS.muted}>
            {event.label}
          </text>
        </g>
      );
    }
  });
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={isHorizontal ? "max-w-lg" : "max-w-xs"}>
      {/* Main line */}
      {isHorizontal ? (
        <line x1={padding - 10} y1={75} x2={width - padding + 10} y2={75} stroke={COLORS.grid} strokeWidth="3" />
      ) : (
        <line x1={150} y1={padding - 10} x2={150} y2={height - padding + 10} stroke={COLORS.grid} strokeWidth="3" />
      )}
      {eventElements}
    </svg>
  );
}

// ==================== FORCE DIAGRAM ====================
function renderForceDiagram(data: Record<string, any>) {
  const { object = "Objeto", forces = [] } = data;
  const width = 300, height = 300;
  const cx = 150, cy = 150;
  const objectSize = 50;
  
  const arrowLength = 60;
  const directions: Record<string, { dx: number; dy: number }> = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };
  
  const forceArrows = (forces as Array<{ direction: string; label: string; magnitude?: number }>).map((force, i) => {
    const dir = directions[force.direction] || { dx: 0, dy: -1 };
    const mag = force.magnitude || 1;
    const len = arrowLength * Math.min(mag, 2);
    
    const startX = cx + dir.dx * (objectSize / 2 + 5);
    const startY = cy + dir.dy * (objectSize / 2 + 5);
    const endX = startX + dir.dx * len;
    const endY = startY + dir.dy * len;
    
    const labelX = endX + dir.dx * 15;
    const labelY = endY + dir.dy * 15;
    
    return (
      <g key={i}>
        <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={COLORS.primary} strokeWidth="4" markerEnd="url(#arrowhead)" />
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={COLORS.text} fontWeight="bold">
          {force.label}
        </text>
      </g>
    );
  });
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="max-w-xs">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.primary} />
        </marker>
      </defs>
      {/* Object */}
      <rect x={cx - objectSize / 2} y={cy - objectSize / 2} width={objectSize} height={objectSize} fill={COLORS.unshaded} stroke={COLORS.text} strokeWidth="2" rx="4" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={COLORS.text}>
        {object}
      </text>
      {forceArrows}
    </svg>
  );
}

// ==================== CIRCUIT SIMPLE ====================
function renderCircuitSimple(data: Record<string, any>) {
  const { components = [], layout = "series" } = data;
  const width = 400, height = 200;
  
  // Simplified circuit rendering
  const componentSymbols: Record<string, (x: number, y: number, label?: string) => React.ReactElement> = {
    battery: (x, y, label) => (
      <g key={`battery-${x}`}>
        <line x1={x - 5} y1={y - 15} x2={x - 5} y2={y + 15} stroke={COLORS.text} strokeWidth="3" />
        <line x1={x + 5} y1={y - 8} x2={x + 5} y2={y + 8} stroke={COLORS.text} strokeWidth="3" />
        <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill={COLORS.muted}>{label || "Batería"}</text>
      </g>
    ),
    resistor: (x, y, label) => (
      <g key={`resistor-${x}`}>
        <path d={`M ${x - 20} ${y} L ${x - 15} ${y - 8} L ${x - 5} ${y + 8} L ${x + 5} ${y - 8} L ${x + 15} ${y + 8} L ${x + 20} ${y}`} fill="none" stroke={COLORS.text} strokeWidth="2" />
        <text x={x} y={y + 25} textAnchor="middle" fontSize="10" fill={COLORS.muted}>{label || "R"}</text>
      </g>
    ),
    bulb: (x, y, label) => (
      <g key={`bulb-${x}`}>
        <circle cx={x} cy={y} r="12" fill="none" stroke={COLORS.text} strokeWidth="2" />
        <line x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} stroke={COLORS.text} strokeWidth="2" />
        <line x1={x + 8} y1={y - 8} x2={x - 8} y2={y + 8} stroke={COLORS.text} strokeWidth="2" />
        <text x={x} y={y + 28} textAnchor="middle" fontSize="10" fill={COLORS.muted}>{label || "Bombilla"}</text>
      </g>
    ),
    switch: (x, y, label) => (
      <g key={`switch-${x}`}>
        <circle cx={x - 10} cy={y} r="3" fill={COLORS.text} />
        <circle cx={x + 10} cy={y} r="3" fill="none" stroke={COLORS.text} strokeWidth="2" />
        <line x1={x - 10} y1={y} x2={x + 8} y2={y - 10} stroke={COLORS.text} strokeWidth="2" />
        <text x={x} y={y + 25} textAnchor="middle" fontSize="10" fill={COLORS.muted}>{label || "Interruptor"}</text>
      </g>
    ),
  };
  
  const numComponents = components.length;
  const spacing = (width - 80) / (numComponents + 1);
  
  const renderedComponents = (components as Array<{ type: string; label?: string }>).map((comp, i) => {
    const x = 40 + spacing * (i + 1);
    const y = 100;
    const renderer = componentSymbols[comp.type];
    return renderer ? renderer(x, y, comp.label) : null;
  });
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="max-w-md">
      {/* Wires */}
      <rect x="30" y="50" width={width - 60} height="100" fill="none" stroke={COLORS.text} strokeWidth="2" rx="10" />
      {renderedComponents}
    </svg>
  );
}

// ==================== TABLE ====================
function renderTable(data: Record<string, any>) {
  const { headers = [], rows = [], title = "" } = data;
  
  if (!headers.length && !rows.length) return renderPlaceholder("table");

  return (
    <div className="w-full max-w-lg">
      {title && (
        <p className="text-sm font-semibold text-center mb-2" style={{ color: COLORS.text }}>{title}</p>
      )}
      <table className="w-full border-collapse text-sm">
        {headers.length > 0 && (
          <thead>
            <tr>
              {(headers as string[]).map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold"
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: "white",
                    borderRadius: i === 0 ? "8px 0 0 0" : i === headers.length - 1 ? "0 8px 0 0" : undefined
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(rows as string[][]).map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#F8FAFC" : "white" }}>
              {row.map((cell: string, j: number) => (
                <td
                  key={j}
                  className="px-3 py-2 border-b"
                  style={{ borderColor: COLORS.unshaded, color: COLORS.text }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== PLACEHOLDER ====================
function renderPlaceholder(type: string) {
  return (
    <svg viewBox="0 0 200 150" className="max-w-xs">
      <rect x="10" y="10" width="180" height="130" fill={COLORS.unshaded} stroke={COLORS.grid} strokeWidth="2" rx="8" strokeDasharray="5,5" />
      <text x="100" y="75" textAnchor="middle" fontSize="12" fill={COLORS.muted}>
        {type}
      </text>
      <text x="100" y="95" textAnchor="middle" fontSize="10" fill={COLORS.muted}>
        (próximamente)
      </text>
    </svg>
  );
}
