"use client";

import React from "react";

interface WhatWeOfferProps {
  offerings: string[];
}

const WhatWeOffer = ({ offerings }: WhatWeOfferProps) => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-black">What We Offer</h2>
      <ul className="space-y-3">
        {offerings.map((offering, index) => (
          <li
            key={index}
            className="flex gap-3 items-start text-sm text-gray-700 leading-relaxed"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center mt-0.5 flex-shrink-0">
              <svg
                className="w-3 h-3 text-black"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </span>
            <span className="flex-1 min-w-0">{offering}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default WhatWeOffer;
