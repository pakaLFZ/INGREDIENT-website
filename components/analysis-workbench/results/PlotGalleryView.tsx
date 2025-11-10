'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface Plot {
  id: string
  title: string
  description: string
  url: string
}

interface PlotGalleryViewProps {
  plots: Plot[]
  onExportPlot: (plotId: string, url: string) => void
}

/**
 * Component for displaying a gallery of analysis plots with export functionality
 * Shows plot thumbnails with titles, descriptions, and export buttons
 */
export function PlotGalleryView({ plots, onExportPlot }: PlotGalleryViewProps) {
  const availablePlots = plots.filter(plot => plot.url)

  if (availablePlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No plots available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Available Plots
      </h4>
      
      <div className="space-y-2">
        {availablePlots.map(plot => (
          <PlotCard
            key={plot.id}
            plot={plot}
            onExport={onExportPlot}
          />
        ))}
      </div>
    </div>
  )
}

interface PlotCardProps {
  plot: Plot
  onExport: (plotId: string, url: string) => void
}

function PlotCard({ plot, onExport }: PlotCardProps) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">{plot.title}</h5>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport(plot.id, plot.url)}
          className="h-6 w-6 p-0"
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">{plot.description}</p>
      
      <div className="border rounded overflow-hidden">
        <img
          src={plot.url}
          alt={plot.title}
          className="w-full h-auto max-h-32 object-contain bg-white"
        />
      </div>
    </div>
  )
}