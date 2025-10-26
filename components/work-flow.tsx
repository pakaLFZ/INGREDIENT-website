"use client";

import React from "react";

interface WorkFlowProps {
  steps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
}

const WorkFlow = ({ steps }: WorkFlowProps) => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-black">How We Work</h2>
      <div className="relative">
        {steps.map((item, index) => (
          <div key={item.step} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Vertical line connecting circles */}
            {index !== steps.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-black" />
            )}

            {/* Numbered circle */}
            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
              {item.step}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-semibold text-black mb-1 text-base">
                {item.title}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkFlow;
