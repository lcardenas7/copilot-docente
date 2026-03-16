"use client";

type Character = "niño" | "niña" | "maestro" | "maestra" | "adulto";
type Expression = "neutral" | "happy" | "confused" | "surprised" | "thinking" | "sad";

interface Panel {
  character: Character;
  text: string;
  expression: Expression;
  setting?: string;
}

interface ComicRendererProps {
  panels: Panel[];
}

// Character colors con aliases para mayor compatibilidad
const CHARACTER_COLORS: Record<string, { skin: string; hair: string; clothes: string }> = {
  // Personajes principales
  "niño": { skin: "#FDBF6F", hair: "#5D4037", clothes: "#2196F3" },
  "niña": { skin: "#FDBF6F", hair: "#4A148C", clothes: "#E91E63" },
  "maestro": { skin: "#D7A86E", hair: "#212121", clothes: "#607D8B" },
  "maestra": { skin: "#D7A86E", hair: "#5D4037", clothes: "#9C27B0" },
  "adulto": { skin: "#FDBF6F", hair: "#424242", clothes: "#795548" },
  // Aliases frecuentes que la IA puede enviar
  "profesor": { skin: "#D7A86E", hair: "#212121", clothes: "#607D8B" }, // mismo que maestro
  "profesora": { skin: "#D7A86E", hair: "#5D4037", clothes: "#9C27B0" }, // mismo que maestra
  "estudiante": { skin: "#FDBF6F", hair: "#5D4037", clothes: "#2196F3" }, // mismo que niño
  "chico": { skin: "#FDBF6F", hair: "#5D4037", clothes: "#2196F3" }, // mismo que niño
  "chica": { skin: "#FDBF6F", hair: "#4A148C", clothes: "#E91E63" }, // mismo que niña
  "joven": { skin: "#FDBF6F", hair: "#5D4037", clothes: "#2196F3" }, // mismo que niño
  "adulta": { skin: "#FDBF6F", hair: "#424242", clothes: "#795548" }, // mismo que adulto
};

// Expression paths for eyes and mouth
const EXPRESSIONS: Record<Expression, { eyes: string; mouth: string }> = {
  neutral: { eyes: "M-8,-5 L-4,-5 M4,-5 L8,-5", mouth: "M-6,8 L6,8" },
  happy: { eyes: "M-8,-5 L-4,-5 M4,-5 L8,-5", mouth: "M-8,6 Q0,14 8,6" },
  confused: { eyes: "M-8,-6 L-4,-4 M4,-4 L8,-6", mouth: "M-4,8 Q0,6 4,10" },
  surprised: { eyes: "M-6,-5 A2,2 0 1,1 -6,-4.9 M6,-5 A2,2 0 1,1 6,-4.9", mouth: "M0,10 A4,4 0 1,1 0,9.9" },
  thinking: { eyes: "M-8,-5 L-4,-5 M4,-3 L8,-7", mouth: "M-4,8 L4,8" },
  sad: { eyes: "M-8,-4 L-4,-6 M4,-6 L8,-4", mouth: "M-6,12 Q0,6 6,12" },
};

export default function ComicRenderer({ panels }: ComicRendererProps) {
  const maxPanels = Math.min(panels.length, 4);
  const displayPanels = panels.slice(0, maxPanels);
  
  const cols = displayPanels.length <= 2 ? displayPanels.length : 2;
  
  return (
    <div 
      className={`grid gap-2 p-4 ${cols === 1 ? "grid-cols-1" : "grid-cols-2"}`}
      style={{ maxWidth: cols === 1 ? "300px" : "600px", margin: "0 auto" }}
    >
      {displayPanels.map((panel, index) => (
        <ComicPanel key={index} panel={panel} index={index} />
      ))}
    </div>
  );
}

function ComicPanel({ panel, index }: { panel: Panel; index: number }) {
  // Normalizar el nombre del personaje con fallback defensivo
  const characterKey = Object.keys(CHARACTER_COLORS).find(
    key => key === panel.character?.toLowerCase()
  ) ?? "adulto"; // fallback siempre disponible
  
  const colors = CHARACTER_COLORS[characterKey];
  const expression = EXPRESSIONS[panel.expression];
  
  return (
    <div 
      className="relative bg-white border-2 border-black rounded-lg overflow-hidden"
      style={{ aspectRatio: "4/3" }}
    >
      {/* Background/Setting */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-sky-50">
        {panel.setting && (
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-200 to-transparent" />
        )}
      </div>
      
      {/* Character */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <svg viewBox="-40 -60 80 120" className="w-24 h-32">
          {/* Body */}
          <ellipse cx="0" cy="40" rx="20" ry="25" fill={colors.clothes} />
          
          {/* Head */}
          <circle cx="0" cy="-10" r="25" fill={colors.skin} />
          
          {/* Hair */}
          <ellipse cx="0" cy="-25" rx="22" ry="15" fill={colors.hair} />
          
          {/* Face expression */}
          <g transform="translate(0, -10)">
            <path d={expression.eyes} stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={expression.mouth} stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      
      {/* Speech bubble */}
      <div 
        className="absolute top-2 left-2 right-2 bg-white border-2 border-black rounded-xl p-2 shadow-sm"
        style={{ maxHeight: "45%" }}
      >
        <p className="text-xs leading-tight text-center font-sans">
          {panel.text}
        </p>
        {/* Bubble tail */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid black",
          }}
        />
        <div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid white",
          }}
        />
      </div>
      
      {/* Panel number */}
      <div className="absolute top-1 left-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full font-bold">
        {index + 1}
      </div>
    </div>
  );
}
