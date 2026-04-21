"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type AppImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export default function AppImage({ src, alt, fallbackSrc, onError, unoptimized, ...props }: AppImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const shouldBypassOptimization = /^https?:\/\//.test(currentSrc);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      alt={alt}
      {...props}
      onError={(event) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
      unoptimized={unoptimized ?? shouldBypassOptimization}
      src={currentSrc}
    />
  );
}
