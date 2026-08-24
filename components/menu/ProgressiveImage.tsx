"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ProgressiveImageProps = ImageProps & {
  placeholderClassName?: string;
};

export function ProgressiveImage({
  alt,
  className = "",
  onError,
  onLoad,
  placeholderClassName = "bg-black/10",
  src,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <span
        aria-hidden
        className={`menu-image-placeholder pointer-events-none absolute inset-0 transition-opacity duration-300 ${placeholderClassName} ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <Image
        {...props}
        alt={alt}
        src={src}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
      />
    </>
  );
}
