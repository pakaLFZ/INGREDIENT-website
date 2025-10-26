"use client"

import { useEffect, useState } from "react"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { BloodCellViewer } from "@/components/demo-1/blood-cell-viewer"
import { Button } from "@/components/ui/button"

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
  const scrollToContact = () => {
    const contactElement = document.getElementById('contact')
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="w-full bg-black" style={{ minHeight: "95vh" }}>
      <div className="flex flex-col items-center max-w-[600px] mx-auto pt-[60px]">
        {/* Image on top */}
        <div className="flex justify-center items-center p-4 w-full">
          <div className="w-[min(50vw,200px)] h-[min(50vw,200px)]">
            <BloodCellViewer />
            {/* <p className="text-gray-400 italic">Real output data.</p> */}
          </div>
        </div>

        {/* Text on bottom */}
        <div className="flex flex-col items-center justify-start p-6 md:p-8 lg:p-12 w-full gap-4">
          <div className="tracking-tight text-white font-bold text-[32px] md:text-[30px] lg:text-[30px]">
            <p><span>The tools we build for researchers are </span><TypingWordRotate /></p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={scrollToContact}
            className="border border-gray-600 bg-zinc-900 text-gray-300 hover:bg-gray-800 hover:border-gray-500 font-medium py-3 px-6 text-sm rounded-full"
          >
            Book a Free Consultation
          </Button>
        </div>
      </div>
    </div>
  )
}
