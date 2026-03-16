"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

interface ImageSearchRendererProps {
  query: string;
  source: "unsplash" | "wikimedia";
}

export default function ImageSearchRenderer({ query, source }: ImageSearchRendererProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/visuals/image-search?query=${encodeURIComponent(query)}&source=${source}`);
        const data = await response.json();
        
        if (data.success && data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Image search error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [query, source]);

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="w-full aspect-video rounded-lg" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No se encontró imagen para: "{query}"</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={query}
          fill
          className="object-cover"
          unoptimized={source === "wikimedia"}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Fuente: {source === "unsplash" ? "Unsplash" : "Wikimedia Commons"}
      </p>
    </div>
  );
}
