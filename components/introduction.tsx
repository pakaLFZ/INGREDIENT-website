"use client";

import { AuroraText } from "@/components/ui/aurora-text";

export function Introduction() {
  return (
    <section className="w-full bg-white flex items-center justify-center px-4 sm:px-8 md:px-[50px] py-16 sm:py-20 md:py-24 min-h-[300px]">
      
      <div className="w-full max-w-[600px] tracking-tight text-black font-bold text-2xl sm:text-3xl space-y-6 sm:space-y-8">
        <p>
          Problem-solving is complex. Tools make complexity manageable.
        </p>

        <p>
          We design <CVText /> tools tailored to your use case, so you can think deeper, not dig harder.
        </p>
      </div>
    </section>
  );
}

function CVText(){
  return (
    <AuroraText     >
      computer vision
    </AuroraText>
  )
}