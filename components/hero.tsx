"use client"

import { useEffect, useState } from "react"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { BloodCellViewer } from "@/components/demo-1/blood-cell-viewer"

const tools = [
  "affordable. ",
  "efficient. ",
  "intuitive. ",
  "explainable. ",
  "collaborative. ",
  "flexible. "
]

function TypingWordRotate() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % tools.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TypingAnimation
      key={tools[index]}
      className="font-bold leading-none"
      duration={100}
    >
      {tools[index]}
    </TypingAnimation>
  )
}

export function Hero() {
  return (
    <div className="w-screen bg-black overflow-hidden" style={{ minHeight: "95vh" }}>
      <div className="flex flex-col items-center" style={{ marginTop: "60px", maxWidth: "600px", margin: "60px auto 0" }}>
        {/* Image on top */}
        <div className="flex justify-center items-center p-4">
          <div className="w-[50vw] h-[50vw] md:w-[200px] md:h-[200px]">
            <BloodCellViewer />
            {/* <p className="text-gray-400 italic">Real output data.</p> */}
          </div>
        </div>

        {/* Text on bottom */}
        <div className="flex items-start justify-start p-6 md:p-8 lg:p-12">
          <div className="tracking-tight text-white font-bold text-[32px] md:text-[30px] lg:text-[30px]">
            <p><span>The tools we build for researchers are </span><TypingWordRotate /></p>
          </div>
        </div>
      </div>
    </div>
  )
}
