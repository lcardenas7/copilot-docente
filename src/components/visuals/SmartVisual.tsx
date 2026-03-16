"use client";

import { Visual } from "@/lib/ai/schemas";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports para evitar SSR issues
const SVGDynamicRenderer = dynamic(
  () => import("./SVGDynamicRenderer"),
  { loading: () => <VisualSkeleton />, ssr: false }
);

const MermaidRenderer = dynamic(
  () => import("./MermaidRenderer"),
  { loading: () => <VisualSkeleton />, ssr: false }
);

const ComicRenderer = dynamic(
  () => import("./ComicRenderer"),
  { loading: () => <VisualSkeleton />, ssr: false }
);

const ImageSearchRenderer = dynamic(
  () => import("./ImageSearchRenderer"),
  { loading: () => <VisualSkeleton />, ssr: false }
);

function VisualSkeleton() {
  return (
    <div className="w-full aspect-video bg-muted rounded-lg animate-pulse flex items-center justify-center">
      <Skeleton className="w-3/4 h-3/4" />
    </div>
  );
}

interface SmartVisualProps {
  visual: Visual;
  className?: string;
}

export default function SmartVisual({ visual, className = "" }: SmartVisualProps) {
  // Guard clause - si visual es inválido, no renderizar nada
  if (!visual || !visual.engine) return null;
  
  try {
    const renderVisual = () => {
      switch (visual.engine) {
        case "svg_dynamic":
          if (!visual.type || !visual.data) return null;
          return <SVGDynamicRenderer type={visual.type} data={visual.data} />;
        
        case "mermaid":
          if (!visual.code) return null;
          return <MermaidRenderer code={visual.code} type={visual.type} />;
        
        case "comic":
          if (!visual.panels || visual.panels.length === 0) return null;
          return <ComicRenderer panels={visual.panels as any} />;
        
        case "image_search":
          if (!visual.query) return null;
          return <ImageSearchRenderer query={visual.query} source={visual.source} />;
        
        default:
          return <div className="text-muted-foreground">Visualización no soportada</div>;
      }
    };

    return (
      <figure className={`my-4 ${className}`}>
        <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-900">
          {renderVisual()}
        </div>
        {visual.caption && (
          <figcaption className="text-sm text-center text-muted-foreground mt-2 italic">
            {visual.caption}
          </figcaption>
        )}
      </figure>
    );
  } catch (error) {
    // Si cualquier renderer falla, no romper la app — solo no mostrar el visual
    console.error("SmartVisual render error:", error, visual);
    return null;
  }
}
