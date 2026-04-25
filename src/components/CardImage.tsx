"use client";

import { useState } from "react";

interface Props {
  src?: string;
  alt: string;
}

export function CardImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="aspect-video overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
