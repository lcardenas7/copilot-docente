"use client";

import React from "react";

interface VisualData {
  type: string;
  data?: any;
  query?: string;
  caption?: string;
  source?: string;
}

interface SmartVisualProps {
  visual: VisualData;
}

export function SmartVisual({ visual }: SmartVisualProps) {
  if (!visual) return null;

  switch (visual.type) {
    case "fraction_circle":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-4xl mb-2">🍕</div>
          <div className="text-sm font-medium">
            {visual.data?.shaded || 0}/{visual.data?.total || 0}
          </div>
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.caption}
            </div>
          )}
        </div>
      );

    case "fraction_rect":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-4xl mb-2">🧱</div>
          <div className="text-sm font-medium">
            {visual.data?.shaded || 0}/{visual.data?.total || 0}
          </div>
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.caption}
            </div>
          )}
        </div>
      );

    case "bar_chart":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm font-medium">Gráfica de barras</div>
          {visual.data?.title && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.data.title}
            </div>
          )}
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.caption}
            </div>
          )}
        </div>
      );

    case "number_line":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-4xl mb-2">📏</div>
          <div className="text-sm font-medium">Recta numérica</div>
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.caption}
            </div>
          )}
        </div>
      );

    case "geometric_shape":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-4xl mb-2">📐</div>
          <div className="text-sm font-medium">Figura geométrica</div>
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.caption}
            </div>
          )}
        </div>
      );

    case "image_search":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          {visual.source === "wikimedia" ? (
            <img
              src={`https://commons.wikimedia.org/wiki/Special:FilePath/${visual.query}`}
              alt={visual.caption || visual.query}
              className="max-w-full h-48 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : (
            <img
              src={`https://source.unsplash.com/400x300/?${encodeURIComponent(
                visual.query || ""
              )}`}
              alt={visual.caption || visual.query}
              className="max-w-full h-48 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          )}
          <div className="hidden text-sm text-muted-foreground">
            🖼️ Imagen no disponible
          </div>
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-2">
              {visual.caption}
            </div>
          )}
        </div>
      );

    case "comic":
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-4xl mb-2">💭</div>
          <div className="text-sm font-medium">Diálogo</div>
          {visual.caption && (
            <div className="text-xs text-muted-foreground mt-1">
              {visual.caption}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            Visual no reconocido: {visual.type}
          </div>
        </div>
      );
  }
}
