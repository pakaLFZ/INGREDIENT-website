'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Circle, X, Settings, Palette } from 'lucide-react'
import { ImageMask } from '../preview/types'
import { useCallback, useMemo, useState, useRef, useEffect } from 'react'

/**
 * Debounces function calls to prevent excessive execution
 * Waits for specified delay after last call before executing
 */
const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}


interface MaskVisibilityControlsProps {
  masks: ImageMask[]
  onToggleMask: (maskId: string) => void
  onExportMask: (mask: ImageMask) => void
  onUpdateMask: (maskId: string, updates: Partial<ImageMask>) => void
  onExportComposite?: () => void
}

/**
 * Component for controlling mask visibility and export functionality
 * Shows all available mask types dynamically based on the analysis results
 */
export function MaskVisibilityControls({
  masks,
  onToggleMask,
  onExportMask,
  onUpdateMask
}: MaskVisibilityControlsProps) {
  // Group masks by their base name, excluding centroids as they'll be handled as sub-controls
  const maskGroups = useMemo(() => {
    const groups = new Map<string, ImageMask[]>()

    masks.forEach(mask => {
      // Extract base name by removing common suffixes
      let baseName = mask.name
        .replace(' centroid', '')
        .replace(/ \(\d+ detected\)/g, '') // Remove count info like " (1 detected)"
        .trim()

      if (!groups.has(baseName)) {
        groups.set(baseName, [])
      }
      groups.get(baseName)!.push(mask)
    })

    return Array.from(groups.entries()).map(([baseName, maskList]) => ({
      baseName,
      masks: maskList,
      displayName: baseName // Use the actual name from API
    }))
  }, [masks])

  return (
    <div className="space-y-2">
      {maskGroups.map(({ baseName, masks: groupMasks, displayName }) => (
        <MaskLineControl
          key={baseName}
          masks={groupMasks}
          allMasks={masks}
          displayName={displayName}
          onToggle={onToggleMask}
          onExport={onExportMask}
          onUpdate={onUpdateMask}
        />
      ))}
    </div>
  )
}



interface MaskLineControlProps {
  masks: ImageMask[]
  allMasks: ImageMask[]
  displayName: string
  onToggle: (maskId: string) => void
  onExport: (mask: ImageMask) => void
  onUpdate: (maskId: string, updates: Partial<ImageMask>) => void
}

/**
 * Component for a single line control (contour, circle, or ellipse)
 * Shows main shape visibility, centroid visibility, color legend, and settings in one line
 */
function MaskLineControl({ masks, allMasks, displayName, onToggle, onExport, onUpdate }: MaskLineControlProps) {
  const mainMask = useMemo(() => masks.find(m => !m.id.includes('centroid')), [masks])
  const centroidMask = useMemo(() => masks.find(m => m.id.includes('centroid')), [masks])

  // Check if the main mask has centroid data available
  const hasCentroidData = useMemo(() => {
    if (!mainMask?.contourData) return false

    // Check if contourData has centroids object with actual centroid coordinates
    if (mainMask.contourData.centroids) {
      const centroids = mainMask.contourData.centroids
      return !!(centroids.contour_centroid || centroids.circle_centroid || centroids.ellipse_centroid)
    }

    // Fallback: check if any contour in the contours array has centroid data
    if (mainMask.contourData.contours && Array.isArray(mainMask.contourData.contours)) {
      return mainMask.contourData.contours.some((contour: any) =>
        contour.centroid && typeof contour.centroid.x === 'number' && typeof contour.centroid.y === 'number'
      )
    }

    return false
  }, [mainMask])

  // Local state for immediate feedback
  const [localThickness, setLocalThickness] = useState(mainMask?.thickness ?? 0.5)
  const [localOpacity, setLocalOpacity] = useState(mainMask?.opacity ?? 100)
  const [localColor, setLocalColor] = useState(mainMask?.color ?? '#ffffff')

  // Update local state when mask changes from props
  useEffect(() => {
    if (mainMask) {
      setLocalThickness(mainMask.thickness ?? 0.5)
      setLocalOpacity(mainMask.opacity ?? 100)
      setLocalColor(mainMask.color ?? '#ffffff')
    }
  }, [mainMask])

  // Debounce updates to prevent browser stress during dragging
  const debouncedThicknessUpdate = useDebounce((value: number) => {
    if (mainMask) onUpdate(mainMask.id, { thickness: value })
    if (centroidMask) onUpdate(centroidMask.id, { thickness: value })
  }, 100)

  const debouncedOpacityUpdate = useDebounce((value: number) => {
    if (mainMask) onUpdate(mainMask.id, { opacity: value })
    if (centroidMask) onUpdate(centroidMask.id, { opacity: value })
  }, 100)

  const debouncedColorUpdate = useDebounce((value: string) => {
    if (mainMask) onUpdate(mainMask.id, { color: value })
    if (centroidMask) onUpdate(centroidMask.id, { color: value })
  }, 100)

  // Handle slider changes
  const handleThicknessChange = useCallback((values: number[]) => {
    const value = values[0]
    setLocalThickness(value)
    debouncedThicknessUpdate(value)
  }, [debouncedThicknessUpdate])

  const handleOpacityChange = useCallback((values: number[]) => {
    const value = values[0]
    setLocalOpacity(value)
    debouncedOpacityUpdate(value)
  }, [debouncedOpacityUpdate])

  const [showColorPicker, setShowColorPicker] = useState(false)
  
  const handleColorClick = useCallback(() => {
    setShowColorPicker(!showColorPicker)
  }, [showColorPicker])

  const handleColorSelect = useCallback((selectedColor: string) => {
    setLocalColor(selectedColor)
    debouncedColorUpdate(selectedColor)
    setShowColorPicker(false)
  }, [debouncedColorUpdate])

  // Extract existing colors from all masks and combine with default colors
  const availableColors = useMemo(() => {
    const defaultColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
      '#ffffff', '#000000', '#808080', '#800000', '#008000', '#000080',
      '#808000', '#800080', '#008080', '#c0c0c0', '#ffa500', '#a52a2a']
    
    const existingColors = allMasks
      .map(mask => mask.color)
      .filter((color, index, arr) => color && arr.indexOf(color) === index) // Remove duplicates and nulls
    
    // Combine existing colors first, then default colors (avoiding duplicates)
    const combinedColors = [
      ...existingColors,
      ...defaultColors.filter(color => !existingColors.includes(color))
    ]
    
    return combinedColors
  }, [allMasks])

  if (!mainMask) return null

  return (
    <div className="flex items-center gap-1 rounded-lg p-2">
      {/* Main shape visibility */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(mainMask.id)}
              className={`h-6 w-6 p-0 shrink-0 ${
                mainMask.visible ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-muted'
              }`}
            >
              <Circle className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show {displayName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Centroid visibility - only show if mask has centroid data */}
      {centroidMask && hasCentroidData && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(centroidMask.id)}
                className={`h-6 w-6 p-0 shrink-0 ${
                  centroidMask.visible ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-muted'
                }`}
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show {displayName} centroid</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Color legend circle */}
      <div className="flex items-center shrink-0">
        <Circle
          className="h-3 w-3"
          style={{ 
            color: localColor,
            fill: mainMask.visible ? localColor : 'transparent'
          }}
        />
      </div>

      {/* Display name */}
      <span
        className="text-xs flex-1 cursor-pointer"
        style={{
          color: mainMask.visible ? localColor : 'currentColor'
        }}
        onClick={() => onToggle(mainMask.id)}
      >
        {displayName}
      </span>

      {/* Settings popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
            <Settings className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium mb-2">Color</div>
              <div className="flex items-center gap-2">
                <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                  <PopoverTrigger asChild>
                    <div
                      onClick={handleColorClick}
                      className="w-8 h-8 rounded-full cursor-pointer border border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: localColor }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-6 gap-1">
                      {availableColors.map((color) => (
                        <div
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`w-6 h-6 rounded cursor-pointer border transition-colors ${
                            color === localColor 
                              ? 'border-blue-500 border-2' 
                              : 'border-gray-300 hover:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <span className="text-xs text-muted-foreground font-mono">
                  {localColor.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium mb-2 flex justify-between">
                <span>Thickness</span>
                <span className="text-muted-foreground">{localThickness}px</span>
              </div>
              <Slider
                value={[localThickness]}
                onValueChange={handleThicknessChange}
                min={0.1}
                max={10}
                step={0.05}
                className="w-full"
              />
            </div>
            <div>
              <div className="text-xs font-medium mb-2 flex justify-between">
                <span>Opacity</span>
                <span className="text-muted-foreground">{localOpacity}%</span>
              </div>
              <Slider
                value={[localOpacity]}
                onValueChange={handleOpacityChange}
                min={10}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

    </div>
  )
}