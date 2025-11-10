"use client"

import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface LaTeXProps {
  math: string
  block?: boolean
  className?: string
  displayMode?: boolean
}

/**
 * Professional LaTeX math renderer using KaTeX
 * Provides academic-level mathematical typesetting with proper fonts, spacing, and symbols
 * Supports both inline and display mode rendering
 */
export const LaTeX: React.FC<LaTeXProps> = ({ 
  math, 
  block = false, 
  className = "",
  displayMode 
}) => {
  const renderKaTeX = (latex: string, display: boolean): string => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\QQ": "\\mathbb{Q}",
          "\\CC": "\\mathbb{C}",
        },
        fleqn: false,
        leqno: false,
        minRuleThickness: 0.04,
        colorIsTextColor: false,
        maxSize: Infinity,
        maxExpand: 1000,
        globalGroup: false
      })
    } catch (error) {
      console.warn('KaTeX rendering error:', error)
      return `<span style="color: red;">LaTeX Error: ${latex}</span>`
    }
  }

  const isDisplayMode = displayMode !== undefined ? displayMode : block
  const renderedHTML = renderKaTeX(math, isDisplayMode)

  if (block || isDisplayMode) {
    return (
      <div 
        className={`katex-block text-center ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHTML }}
        style={{
          fontSize: '1.1em',
          lineHeight: '1.4',
          padding: '0.5rem',
          overflow: 'auto'
        }}
      />
    )
  }

  return (
    <span 
      className={`katex-inline ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
      style={{
        fontSize: '0.95em',
        verticalAlign: 'baseline'
      }}
    />
  )
}