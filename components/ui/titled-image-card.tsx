"use client";

import { ImageRevealCard } from "@/components/ui/image-reveal-card";

interface TitledImageCardProps {
  title: string;
  sample: string;
  mask: string;
  className?: string;
}

export function TitledImageCard({ title, sample, mask, className = "" }: TitledImageCardProps) {
  return (
    <div className={`flex flex-col border border-gray-300 rounded-[5px] p-4 w-[300px] h-[450px] flex-shrink-0 ${className}`}>
      <p className="text-white text-lg font-bold mb-2 flex-shrink-0">{title}</p>
      <div className="flex-1 min-h-0">
        <ImageRevealCard
          sample={sample}
          mask={mask}
        />
      </div>
    </div>
  );
}
