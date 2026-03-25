"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MermaidRendererProps {
  code: string;
  type: "flowchart" | "mindmap" | "sequence" | "classDiagram";
}

export default function MermaidRenderer({ code, type }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code) return;

      try {
        // Dynamic import of mermaid (npm package)
        const mermaid = (await import("mermaid")).default;
        
        // Initialize mermaid with theme
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
        });

        // Generate unique ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, code);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Error al renderizar el diagrama");
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{error}</p>
        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Skeleton className="w-3/4 h-3/4" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`flex justify-center ${loading ? "hidden" : ""}`}
      />
    </div>
  );
}
