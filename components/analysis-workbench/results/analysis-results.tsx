"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Download, ImageDown, Table } from "lucide-react"
import { downloadJson } from './downloaders/download-json'
import { downloadPngFromCanvas } from './downloaders/download-png'
import { downloadCompositePng } from './downloaders/download-png-composite'
import { downloadPreviewSnapshot } from './downloaders/download-preview-snapshot'
import { downloadCsv } from './downloaders/download-csv'
import React, { useMemo } from "react"
import { EmptyState } from './components/EmptyState'
import { FeaturesTable } from './components/FeaturesTable'
import { useTaskPolling } from '@/hooks/useTaskPolling'

interface Feature {
  name: string
  description: string
  value: number
}

interface AnalysisResultsProps {
  analysisResults: any
  currentAnalysis: any
}

/**
 * Component for displaying analysis results in standardized feature format
 * Shows analysis progress when running and feature table when completed
 *
 * @param analysisResults - Results with features array
 * @param currentAnalysis - Current analysis status
 */
export function AnalysisResults({ analysisResults, currentAnalysis }: AnalysisResultsProps) {
  // Derive taskId when available from currentAnalysis (supports multiple sources)
  const taskId: string | undefined = useMemo(() => {
    return currentAnalysis?.task_id || currentAnalysis?.taskId || currentAnalysis?.id || undefined
  }, [currentAnalysis])

  // Poll backend task; auto-fetch final result when done
  const { status, progress, step, errorMessage, result } = useTaskPolling(taskId || null)

  // Backward compatibility: prefer new `result` from /result endpoint; fallback to prop
  const effectiveResults = result || analysisResults
  const features: Feature[] = effectiveResults?.features || []

  const isAnalysisRunning = (currentAnalysis?.taskStatus === 'running' ||
                             currentAnalysis?.taskStatus === 'pending' ||
                             currentAnalysis?.taskStatus === 'processing' ||
                             currentAnalysis?.taskStatus === 'queued') ||
                            status === 'polling'

  const handleDownload = () => downloadJson(analysisResults)

  const handleDownloadPng = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#analysis-render-canvas')
    if (canvas) return downloadPngFromCanvas('#analysis-render-canvas')

    // Fallback: compose <img> + SVG masks from the preview
    // Try to detect image and svg in preview container
    // Snapshot whatever is plotted in the preview at original pixels
    await downloadPreviewSnapshot('.image-preview-container')
  }

  const handleDownloadCsv = () => downloadCsv(features)

  return (
    <div className="p-3 space-y-3 h-full">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-medium text-gray-900">Analysis Results</h3>
        <div className="flex items-center gap-2">
          {analysisResults && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2"
                title="Download JSON"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadPng}
                className="h-7 px-2"
                title="Download PNG"
              >
                <ImageDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadCsv}
                className="h-7 px-2"
                title="Download CSV"
              >
                <Table className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {currentAnalysis && (
            <Badge variant="outline" className="text-xs">
              {(currentAnalysis.taskStatus === 'running' || currentAnalysis.taskStatus === 'processing') &&
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {currentAnalysis.taskStatus === 'completed' ? 'Completed' :
               currentAnalysis.taskStatus === 'running' ? 'Running' :
               currentAnalysis.taskStatus === 'processing' ? 'Processing' :
               currentAnalysis.taskStatus === 'pending' || currentAnalysis.taskStatus === 'queued' ? 'Queued' :
               currentAnalysis.taskStatus === 'failed' ? 'Failed' :
               currentAnalysis.taskStatus === 'cancelled' ? 'Cancelled' : 'Unknown'}
            </Badge>
          )}
        </div>
      </div>

      {isAnalysisRunning && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
          <div className="text-xs text-gray-500">
            {step ? `${step} (${progress}%)` : (currentAnalysis?.taskStatus === 'queued' ? 'Analysis queued...' : 'Analyzing image...')}
          </div>
          {status === 'error' && errorMessage && (
            <div className="text-xs text-red-500 mt-1">{errorMessage}</div>
          )}
        </div>
      )}

      {effectiveResults ? (
        <div className="space-y-3 max-w-[900px] mx-auto pb-4">
          <FeaturesTable features={features} />
        </div>
      ) : (
        <EmptyState currentAnalysis={currentAnalysis} />
      )}
    </div>
  )
}
