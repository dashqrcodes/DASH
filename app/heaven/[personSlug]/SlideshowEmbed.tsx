"use client";

import SlideshowPage from "@/app/_dashmemories/slideshow/page";

interface SlideshowEmbedProps {
  displayName?: string;
}

export default function SlideshowEmbed({ displayName }: SlideshowEmbedProps) {
  return <SlideshowPage displayName={displayName} />;
}
