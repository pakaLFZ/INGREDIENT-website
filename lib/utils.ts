import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateWordWidths(
  words: string[],
  className: string
): Record<string, number> {
  const widthMap: Record<string, number> = {}

  words.forEach((word) => {
    for (let i = 1; i <= word.length; i++) {
      const substr = word.substring(0, i)
      const span = document.createElement('span')
      span.className = className
      span.textContent = substr
      span.style.visibility = 'hidden'
      document.body.appendChild(span)
      widthMap[substr] = span.offsetWidth
      document.body.removeChild(span)
    }
  })

  return widthMap
}
