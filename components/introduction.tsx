"use client";

import { AuroraText } from "@/components/ui/aurora-text";

export function Introduction() {
  return (
    <section className="w-full bg-white flex items-center justify-center px-[50px] py-[80px]" style={{ minHeight: "95vh" }}>
      <div className="w-full max-w-[600px] tracking-tight text-black font-bold text-3xl space-y-8">
        <p>
          Problem-solving is complex. Tools make complexity manageable.
        </p>

        <p>
          We design <AuroraText>computer vision</AuroraText> tools tailored to your use case, so you can think deeper, not dig harder.
        </p>
      </div>
    </section>
  );
}
