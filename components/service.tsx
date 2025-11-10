"use client";

import React from "react";
import WorkFlow from "@/components/work-flow";
import WhatWeOffer from "@/components/what-we-offer";

const Service = () => {
  const workSteps = [
    {
      step: 1,
      title: "Book a free consultation",
      description: "discuss how computer vision can accelerate your workflow.",
    },
    {
      step: 2,
      title: "Define project scope",
      description: "clarify requirements, goals, and expectations.",
    },
    {
      step: 3,
      title: "Upload your data",
      description: "no background information needed.",
    },
    {
      step: 4,
      title: "Model development",
      description: "typical turnaround within one week.",
    },
    {
      step: 5,
      title: "Receive deliverables",
      description: "ready-to-use tools with documentation and support.",
    },
  ];

  const offerings = [
    "Same-day response time",
    "High-quality data labeling",
    "Computer vision architecture design",
    "Model training and optimization",
    "Inference pipeline development (Python scripts, Jupyter notebook, Graphical User Interfaces, etc)",
    "Local network server deployment (single-computer setup) supporting multi-device access with task management and authentication systems",
    "Comprehensive documentation",
    "Optional online video tutorial session for implementation and usage",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <WorkFlow steps={workSteps} />
        <WhatWeOffer offerings={offerings} />
      </div>
    </div>
  );
};

export default Service;
