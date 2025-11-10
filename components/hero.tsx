"use client"

import { useEffect, useState } from "react"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { BloodCellViewer } from "@/components/demo-1/blood-cell-viewer"
import { Button } from "@/components/ui/button"
import { calculateWordWidths } from "@/lib/utils"

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
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const GAP_OFFSET = 4
  const CURSOR_WIDTH = 3

  useEffect(() => {
    const widthMap = calculateWordWidths(
      tools,
      'font-bold leading-none text-[32px] md:text-[30px] lg:text-[30px]'
    )
    setWidthMap(widthMap)
    setIsReady(true)
  }, [])

  useEffect(() => {
    const rotate = () => {
      setIndex((prevIndex) => (prevIndex + 1) % tools.length)
    }

    let rotationTimer: NodeJS.Timeout | null = null
    let firstRotateTimer: NodeJS.Timeout | null = null

    // Display first word with animation, then start rotation
    const initialTimeout = setTimeout(() => {
      setIsFirstLoad(false)
      // Rotate to second word synchronized with blood cell viewer cycle (6500ms)
      firstRotateTimer = setTimeout(() => {
        rotate()
        rotationTimer = setInterval(rotate, 6500)
      }, 6500)
    }, 50)

    return () => {
      clearTimeout(initialTimeout)
      if (firstRotateTimer) {
        clearTimeout(firstRotateTimer)
      }
      if (rotationTimer) {
        clearInterval(rotationTimer)
      }
    }
  }, [])

  const fullWord = tools[index]
  const fullWidth = widthMap[fullWord] || 0
  const adjustedWidth = Math.max(0, fullWidth - GAP_OFFSET + CURSOR_WIDTH)
  const transition = isFirstLoad ? 'none' : 'width 0.5s ease-in-out'

  if (!isReady) {
    return <span style={{ display: 'inline-block', width: '0px', overflow: 'hidden' }} />
  }

  return (
    <span style={{ display: 'inline-block', width: `${adjustedWidth}px`, overflow: 'hidden', transition }}>
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
