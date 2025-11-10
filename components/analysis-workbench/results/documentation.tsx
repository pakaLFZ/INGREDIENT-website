"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LaTeX } from "@/components/ui/latex"
import React from "react"
import { documentationDatabase, type DocumentationData } from "./documentation-data"

/**
 * Single documentation popup component with LaTeX rendering
 * Uses data-driven approach with switch statement for content selection
 */

interface DocumentationProps {
  metric?: string
}

/**
 * Documentation component providing mathematical explanations for analysis metrics
 * Uses professional LaTeX rendering and bullet-point parameter explanations
 */
export const Documentation: React.FC<DocumentationProps> = ({ metric }) => {
  const getDocumentationContent = (metricKey: string): DocumentationData | null => {
    switch (metricKey) {
      case 'sparc_value':
      case 'mean_curvature':
      case 'overall_circularity':
      case 'form_factor':
      case 'eccentricity':
      case 'rms_error':
      case 'r_squared':
      case 'missing_area':
      case 'excess_area':
      case 'radius_deviation':
      case 'quality_score':
        return documentationDatabase[metricKey]
      default:
        return null
    }
  }

  if (!metric) {
    return (
      <div className="grid gap-4 max-h-96 overflow-y-auto p-2">
        {Object.entries(documentationDatabase).map(([key, data]) => (
          <DocumentationCard key={key} data={data} />
        ))}
      </div>
    )
  }

  const content = getDocumentationContent(metric)
  if (!content) {
    return (
      <div className="p-4 text-center text-gray-500">
        No documentation available for this metric.
      </div>
    )
  }

  return <DocumentationCard data={content} />
}

interface DocumentationCardProps {
  data: DocumentationData
}

const DocumentationCard: React.FC<DocumentationCardProps> = ({ data }) => {
  return (
    <Card className="w-full max-w-lg border-0">
      <CardContent className="space-y-1">
        <CardTitle className="text-base font-bold">{data.title}</CardTitle>
        <p className="text-xs font-medium">{data.concept}</p>
        <div>
          <p className="text-xs font-medium">MATHEMATICAL FORMULA</p>
          <LaTeX math={data.formula} block displayMode={true} />
        </div>
        
        <div>
          <p className="text-xs font-medium mb-1">PARAMETERS</p>
          <ul className="space-y-0.5">
            {data.parameters.map((param, index) => (
              <li key={index} className="text-xs flex items-start">
                <span className="mr-1.5">•</span>
                <span>
                  <LaTeX math={param.symbol} className="font-semibold mr-1.5" /> = {param.definition}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <div>
            <p className="text-xs font-medium mb-0.5">DESCRIPTION</p>
            <p className="text-xs text-gray-700 leading-snug">{data.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5">INTERPRETATION</p>
            <p className="text-xs text-gray-700 leading-snug">{data.interpretation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}