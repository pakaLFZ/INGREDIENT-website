"use client"

import { useEffect, useState } from "react"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { BloodCellViewer } from "@/components/demo-1/blood-cell-viewer"
import { Button } from "@/components/ui/button"

const tools = [
  "affordable",
  "efficient",
  "intuitive",
  "explainable",
  "collaborative",
  "flexible"
]

function TypingWordRotate() {
  const [index, setIndex] = useState(0)
  const [widthMap, setWidthMap] = useState<Record<string, number>>({})
  const GAP_OFFSET = 4

  useEffect(() => {
    const map: Record<string, number> = {}
    tools.forEach((word) => {
      for (let i = 1; i <= word.length; i++) {
        const substr = word.substring(0, i)
        const span = document.createElement('span')
        span.className = 'font-bold leading-none text-[32px] md:text-[30px] lg:text-[30px]'
        span.textContent = substr
        span.style.visibility = 'hidden'
        document.body.appendChild(span)
        map[substr] = span.offsetWidth
        document.body.removeChild(span)
      }
    })
    setWidthMap(map)
  }, [])

  useEffect(() => {
    const rotate = () => {
      setIndex((prevIndex) => (prevIndex + 1) % tools.length)
    }

    let rotationTimer: NodeJS.Timeout | null = null

    // Rotate at 50ms offset to sync with blood cell box visibility
    const initialTimeout = setTimeout(() => {
      rotate()
      rotationTimer = setInterval(rotate, 6500)
    }, 50)

    return () => {
      clearTimeout(initialTimeout)
      if (rotationTimer) {
        clearInterval(rotationTimer)
      }
    }
  }, [])

  const fullWord = tools[index]
  const fullWidth = widthMap[fullWord] || 0
  const adjustedWidth = Math.max(0, fullWidth - GAP_OFFSET)

  return (
    <span style={{ display: 'inline-block', width: `${adjustedWidth}px`, overflow: 'hidden', transition: 'width 0.5s ease-in-out' }}>
      <TypingAnimation
        key={fullWord}
        className="font-bold leading-none"
        duration={50}
        showCursor={true}
      >
        {fullWord}
      </TypingAnimation>
    </span>
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
      <div className="flex flex-col items-center mx-auto pt-[60px]">
        {/* Image on top */}
        <div className="flex justify-center items-center p-4 w-full">
          <div className="w-[min(50vw,200px)] h-[min(50vw,200px)]">
            <BloodCellViewer />
            {/* <p className="text-gray-400 italic">Real output data.</p> */}
          </div>
        </div>

        {/* Text on bottom */}
        <div className="flex flex-col items-center justify-start p-6 md:p-8 lg:p-12 w-full gap-4">
          <div className="tracking-tight text-white font-bold text-[32px] md:text-[30px] lg:text-[30px] leading-none">
            <p style={{ display: 'flex', alignItems: 'baseline', gap: '0.2em', flexWrap: 'wrap' }}>
              <span>We design</span>
              <TypingWordRotate />
              <span>tools for researchers</span>
            </p>
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
