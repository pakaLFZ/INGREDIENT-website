"use client";

import { TitledImageCard } from "@/components/ui/titled-image-card";

export function Strength() {
  return (
   <section className="w-full bg-zinc-900 pt-[40px] pb-[60px]">
    <div className="max-w-[1000px] mx-auto w-full h-full px-4">
        <p className="text-white font-bold text-3xl mb-[20px]">We combat complexity</p>

        <div className="flex flex-row flex-wrap justify-between md:justify-between justify-center gap-4">

          <TitledImageCard
          title="Complex sample identification"
          sample="/015.png"
          mask="/015_contours.png"
        />

        <TitledImageCard
          title="Pixel-level precision"
          sample="/crack.png"
          mask="/crack-mask.png"
        />

        <TitledImageCard
          title="Overlapping object detection"
          sample="/image-73.png"
          mask="/image-73-mask.png"
        />
        </div>

       </div>
    </section>
  );
}
