"use client";

import React from "react";
import Link from "next/link";
import AnalysisWorkbenchApp from "@/components/analysis-workbench-app";

const DemoRBC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-20">
      <div className="relative">
        {/* Mobile Notice */}
        <div className="md:hidden flex items-center justify-center rounded border border-gray-700 bg-gray-200 p-8 min-h-[200px]">
          <p className="text-center text-gray-600 text-sm">
            This demo is optimized for desktop devices. Please view on a PC or tablet for the full experience.
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <p className="text-sm md:text-base font-semibold text-gray-500">
            We design customized research GUIs for secure deployment within your organization's internal network.{" "}
            <Link href="/demo-rbc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 underline transition-colors">
              Full screen.
            </Link>
          </p>

          {/* Demo Container */}
          <div className="relative rounded border border-gray-700 overflow-hidden bg-white max-w-4xl">

            {/* Workbench App Container */}
            <div className="w-full h-[500px]">
              <AnalysisWorkbenchApp />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default DemoRBC;
