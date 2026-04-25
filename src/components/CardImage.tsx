"use client";

import { useState } from "react";
import Image from "next/image";

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
    <div className="relative aspect-video overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 640px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
