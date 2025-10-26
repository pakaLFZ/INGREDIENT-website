"use client";

import { TitledImageCard } from "@/components/ui/titled-image-card";

export function Strength() {
  return (
   <section className="w-full bg-zinc-900 pt-[40px] pb-[60px]">
    <div className="max-w-[1000px] mx-auto w-full h-full px-4">
        <p className="text-white font-bold text-3xl mb-[20px]">We combat complexity</p>

        <div className="flex flex-row flex-wrap justify-between gap-4">

          <TitledImageCard
          title="Complex sample identification"
          mask="/015.png"
          sample="/015_contours.png"
        />

        <TitledImageCard
          title="Pixel-level precision"
          mask="/crack.png"
          sample="/crack-mask.png"
        />

        <TitledImageCard
          title="Overlapping object detection"
          mask="/image-73.png"
          sample="/image-73-mask.png"
        />
        </div>

       </div>
    </section>
  );
}
