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
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black flex items-center justify-center mt-0.5">
              <svg
                className="w-3 h-3 text-white"
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
