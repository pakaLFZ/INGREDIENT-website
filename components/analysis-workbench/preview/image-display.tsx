"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ImageIcon, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageData } from "@/lib/store/imageSlice"
import { ImageMask } from "./types"

/**
 * Component that renders masks as pure SVG paths with proper stroke width control
 * Uses contour data from backend analysis instead of PNG masks
 *
 * Key Features:
 * - Fetches raw contour/shape data from backend API
 * - Converts data to SVG paths for scalable rendering
 * - Supports dynamic stroke thickness via strokeWidth attribute
 * - Falls back to PNG masks while SVG data loads
 * - Handles different mask types: contour, circle, ellipse
 */
function MaskRenderer({
    mask,
    transformStyle,
    imageDimensions
}: {
    mask: ImageMask
    transformStyle: React.CSSProperties
    imageDimensions?: [number, number]
}) {
    if (!mask.visible) {
        return null
    }
    const [svgPath, setSvgPath] = useState<string>('')
    const fallbackWidth = imageDimensions?.[0] ?? 512
    const fallbackHeight = imageDimensions?.[1] ?? 512
    const [dimensions, setDimensions] = useState({ width: fallbackWidth, height: fallbackHeight })

    console.log('[MaskRenderer] Rendering mask:', {
        maskId: mask.id,
        maskName: mask.name,
        visible: mask.visible,
        hasContourData: !!mask.contourData,
        url: mask.url
    })

    useEffect(() => {
        // If mask has contour data directly, use it instead of fetching
        if (mask.contourData) {
            let path = ''
            // Use image dimensions from contour data or fall back to default
            const contourDimensions = mask.contourData.image_dimensions
            const resolvedDimensions = contourDimensions || { width: fallbackWidth, height: fallbackHeight }

            // Handle centroid masks
            if (mask.id.includes('centroid')) {
                path = createCentroidPath(mask, resolvedDimensions)
                setSvgPath(path)
                setDimensions(resolvedDimensions)
                return
            }

            // Handle all contour types uniformly (edge, scratch, delam, crack, etc.)
            if (mask.contourData.contours && Array.isArray(mask.contourData.contours)) {
                path = createContourPath(mask.contourData.contours, resolvedDimensions)
            }

            setSvgPath(path)
            setDimensions(resolvedDimensions)
            return
        }

        // Fallback: Extract task ID from mask URL and fetch contour data from task API
        if (!mask.url.startsWith('data:')) {
            const urlParts = mask.url.split('/')
            const tasksIndex = urlParts.findIndex(part => part === 'tasks')
            const taskId = tasksIndex !== -1 && tasksIndex + 1 < urlParts.length
                ? urlParts[tasksIndex + 1]
                : null

            if (!taskId) {
                console.warn('Could not extract task ID from mask URL:', mask.url)
                return
            }

            // Use queue tasks endpoint for comprehensive analysis data
            const endpoint = `/api/queue/tasks/${taskId}/`

            fetch(endpoint)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
                    }
                    return res.json()
                })
                .then(response => {
                    // Backend returns {task: {...}} from /api/queue/tasks/{taskId}/
                    if (!response.task || !response.task.result) {
                        console.warn('Invalid task response structure')
                        return
                    }

                    const data = response.task.result
                    let path = ''
                    // Prefer dimensions based on coordinates_space
                    const coordinatesSpace = data.coordinates_space as ('original'|'processed'|undefined)
                    // Backend now returns a single image_dimensions matching coordinates_space
                    let dimensions = data.image_dimensions || { width: fallbackWidth, height: fallbackHeight }

                    // Handle comprehensive analysis results with contours array
                    if (data.contours && Array.isArray(data.contours)) {
                        // Extract contour type from mask URL
                        const contourType = mask.url.split('/contour/')[1]
                        const contourGroup = data.contours.find((c: any) => c.name === contourType)

                        if (contourGroup && contourGroup.contours) {
                            // Combine all contours of this type into one path
                            const paths: string[] = []
                            contourGroup.contours.forEach((contour: any) => {
                                if (contour.contour_points && contour.contour_points.length > 2) {
                                    const points = contour.contour_points
                                    const pathCommands = [`M ${points[0][0]} ${points[0][1]}`]
                                    for (let i = 1; i < points.length; i++) {
                                        pathCommands.push(`L ${points[i][0]} ${points[i][1]}`)
                                    }
                                    pathCommands.push('Z')
                                    paths.push(pathCommands.join(' '))
                                }
                            })
                            path = paths.join(' ')
                        }
                    } else {
                        // Handle edge quality analysis data
                        path = createSVGPath(mask, data)
                    }

                    setSvgPath(path)
                    setDimensions(dimensions)
                })
                .catch(err => console.error('Failed to fetch contour data:', err))
        }
    }, [mask.url, mask.id, mask.contourData, fallbackWidth, fallbackHeight])

    // Calculate stroke width scaled to viewBox dimensions for consistent appearance
    const scaledStrokeWidth = (mask.thickness ?? 0.25) * 2
    

    return (
        <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={transformStyle}
        >
            {svgPath ? (
                <svg
                    className="w-full h-full select-none"
                    viewBox={`0 0 ${dimensions.width / 2} ${dimensions.height / 2}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ opacity: (mask.opacity ?? 100) / 100 }}
                >
                    <path
                        d={svgPath}
                        fill="none"
                        stroke={mask.color}
                        strokeWidth={scaledStrokeWidth}
                        style={{
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                        }}
                    />
                </svg>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No contour data available
                </div>
            )}
        </div>
    )
}

/**
 * Create SVG path from contour points for any contour type
 * Reusable for all mask types (edge, scratch, delam, crack, etc.)
 *
 * Coordinates from backend match the image_dimensions returned in the API
 * No scaling needed - use coordinates directly
 */
function createContourPath(contours: any[], displayDimensions: {width: number, height: number}): string {
    const paths: string[] = []
    contours.forEach((contour: any) => {
        if (contour.contour_points && contour.contour_points.length > 2) {
            const points = contour.contour_points

            // Backend coordinates match the image_dimensions, use directly
            const pathCommands = [`M ${points[0][0]} ${points[0][1]}`]

            for (let i = 1; i < points.length; i++) {
                pathCommands.push(`L ${points[i][0]} ${points[i][1]}`)
            }
            pathCommands.push('Z')
            paths.push(pathCommands.join(' '))
        }
    })
    return paths.join(' ')
}

/**
 * Create SVG path for centroid markers using contour data
 * Works for any contour type (edge, scratch, delam, crack, etc.)
 *
 * Coordinates from backend match the image_dimensions returned in the API
 * Use coordinates directly without scaling
 */
function createCentroidPath(mask: ImageMask, displayDimensions: {width: number, height: number}): string {
    if (!mask.contourData) {
        return ''
    }

    let centroidX: number, centroidY: number

    // Check if we have centroids object (new API format)
    if (mask.contourData.centroids) {
        const centroids = mask.contourData.centroids
        let selectedCentroid: any = null

        // Determine which centroid to use based on mask type
        if (mask.id.includes('ellipse') && centroids.ellipse_centroid) {
            selectedCentroid = centroids.ellipse_centroid
        } else if (mask.id.includes('circle') && centroids.circle_centroid) {
            selectedCentroid = centroids.circle_centroid
        } else if (centroids.contour_centroid) {
            selectedCentroid = centroids.contour_centroid
        }

        if (!selectedCentroid) {
            return ''
        }

        centroidX = selectedCentroid.x
        centroidY = selectedCentroid.y
    } else if (mask.contourData.contours && Array.isArray(mask.contourData.contours) && mask.contourData.contours.length > 0) {
        // Calculate combined centroid from all contours weighted by area
        let totalArea = 0
        let weightedSumX = 0
        let weightedSumY = 0

        mask.contourData.contours.forEach((contour: any) => {
            if (contour.centroid && contour.area > 0) {
                totalArea += contour.area
                weightedSumX += contour.centroid.x * contour.area
                weightedSumY += contour.centroid.y * contour.area
            }
        })

        if (totalArea === 0) {
            return ''
        }

        centroidX = weightedSumX / totalArea
        centroidY = weightedSumY / totalArea
    } else {
        return ''
    }

    // Backend coordinates match the image_dimensions, calculate marker size based on actual dimensions
    const referenceSize = Math.max(displayDimensions.width, displayDimensions.height)
    const size = Math.max(5, referenceSize * 0.02)
    return `M ${centroidX - size} ${centroidY - size} L ${centroidX + size} ${centroidY + size} M ${centroidX + size} ${centroidY - size} L ${centroidX - size} ${centroidY + size}`
}

/**
 * Create SVG path from backend contour/shape data
 * Handles different mask types: contour, circle, ellipse
 * Note: Contours are now in 512x512 processed coordinate system, matching the display
 */
function createSVGPath(mask: ImageMask, data: any): string {
    const maskType = mask.name.toLowerCase()
    
    // Prioritize centroid masks first to avoid them being captured by broader shape checks (e.g., "circle_centroid" also contains "circle")
    if (maskType.includes('centroid')) {
        // Create X mark at centroid point
        let centroidX, centroidY

        if (maskType.includes('ellipse')) {
            // Use ellipse centroid
            const ellipseData = data.ellipse_comparison
            if (!ellipseData?.ellipse_centroid) return ''
            centroidX = ellipseData.ellipse_centroid[0]
            centroidY = ellipseData.ellipse_centroid[1]
        } else {
            // Use combined centroid from all contours (works for general, circle-, and contour-centroid masks)
            const contours = data.contour_data?.contours || []
            if (contours.length === 0) return ''

            let totalArea = 0
            let weightedSumX = 0
            let weightedSumY = 0

            contours.forEach((contour: any) => {
                if (contour.centroid && contour.area > 0) {
                    totalArea += contour.area
                    weightedSumX += contour.centroid.x * contour.area
                    weightedSumY += contour.centroid.y * contour.area
                }
            })

            if (totalArea === 0) return ''

            centroidX = weightedSumX / totalArea
            centroidY = weightedSumY / totalArea
        }

        // Draw X mark (cross lines) at centroid position
        const referenceSize = data.image_dimensions
            ? Math.max(data.image_dimensions.width, data.image_dimensions.height)
            : 800 // Fallback reference size
        const size = referenceSize * 0.02 // Size of X mark
        return `M ${centroidX - size} ${centroidY - size} L ${centroidX + size} ${centroidY + size} M ${centroidX + size} ${centroidY - size} L ${centroidX - size} ${centroidY + size}`

    } else if (maskType.includes('contour')) {
        // Use actual contour points from backend
        const contours = data.contour_data?.contours || []
        if (contours.length === 0) return ''
        
        const largestContour = contours.reduce((max: any, current: any) => 
            current.area > max.area ? current : max
        )
        
        const points = largestContour.contour_points || []
        if (points.length < 3) return ''
        
        const pathCommands = [`M ${points[0][0]} ${points[0][1]}`]
        for (let i = 1; i < points.length; i++) {
            pathCommands.push(`L ${points[i][0]} ${points[i][1]}`)
        }
        pathCommands.push('Z')
        
        return pathCommands.join(' ')
        
    } else if (maskType.includes('circle')) {
        // Create perfect circle from centroid and radius
        const contours = data.contour_data?.contours || []
        if (contours.length === 0) return ''
        
        const largestContour = contours.reduce((max: any, current: any) => 
            current.area > max.area ? current : max
        )
        
        const centroid = largestContour.centroid
        const radius = data.edge_smoothness?.ideal_radius || 50
        
        return `M ${centroid.x - radius} ${centroid.y} A ${radius} ${radius} 0 1 1 ${centroid.x + radius} ${centroid.y} A ${radius} ${radius} 0 1 1 ${centroid.x - radius} ${centroid.y} Z`
        
    } else if (maskType.includes('ellipse')) {
        // Create ellipse from ellipse parameters
        const ellipseData = data.ellipse_comparison
        if (!ellipseData) return ''
        
        const ellipse = ellipseData.ellipse_opencv_format
        const [center, axes, angle] = ellipse
        const [cx, cy] = center
        const [majorAxis, minorAxis] = axes
        const rx = majorAxis / 2
        const ry = minorAxis / 2
        
        // Create ellipse path with rotation
        const radians = (angle * Math.PI) / 180
        const cos = Math.cos(radians)
        const sin = Math.sin(radians)
        
        // Calculate ellipse points
        const points = []
        const numPoints = 100
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * 2 * Math.PI
            const x = rx * Math.cos(t)
            const y = ry * Math.sin(t)
            
            // Apply rotation and translation
            const rotatedX = x * cos - y * sin + cx
            const rotatedY = x * sin + y * cos + cy
            
            points.push([rotatedX, rotatedY])
        }
        
        const pathCommands = [`M ${points[0][0]} ${points[0][1]}`]
        for (let i = 1; i < points.length; i++) {
            pathCommands.push(`L ${points[i][0]} ${points[i][1]}`)
        }
        pathCommands.push('Z')
        
        return pathCommands.join(' ')
        
    } else {
        return ''
    }
}

interface ImageDisplayProps {
    selectedImage: ImageData | null
    currentImageUrl: string | null
    masks: ImageMask[]
    hasEdgeQualityMasks: boolean
}

/**
 * Component that contains the image and masks with zoom and pan functionality
 * @param currentImageUrl - URL of the main image
 * @param selectedImage - Image metadata for alt text
 * @param masks - Array of mask overlays
 * @param hasEdgeQualityMasks - Whether to show edge quality masks
 * @param scale - Current zoom scale
 * @param panX - X offset for panning
 * @param panY - Y offset for panning
 * @param onMouseDown - Handler for pan start
 * @param onWheel - Handler for zoom via scroll
 */
function ImageWithMasks({
    currentImageUrl,
    selectedImage,
    masks,
    hasEdgeQualityMasks,
    scale,
    panX,
    panY,
    onMouseDown,
    onWheel
}: {
    currentImageUrl: string
    selectedImage: ImageData | null
    masks: ImageMask[]
    hasEdgeQualityMasks: boolean
    scale: number
    panX: number
    panY: number
    onMouseDown: (e: React.MouseEvent) => void
    onWheel: (e: React.WheelEvent) => void
}) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const imageDimensions = selectedImage?.dimensions

    // Attach non-passive wheel listener to allow preventDefault (for zoom) and avoid page scroll
    useEffect(() => {
        const node = containerRef.current
        if (!node) return

        const listener = (evt: WheelEvent) => {
            onWheel(evt as unknown as React.WheelEvent)
        }
        node.addEventListener('wheel', listener, { passive: false })
        return () => node.removeEventListener('wheel', listener)
    }, [onWheel])

    // Apply translate before scale so panning remains in screen space
    const transformStyle = {
        transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
        transformOrigin: 'center center'
    }


    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing overscroll-contain"
            onMouseDown={onMouseDown}
        >
            <img
                src={currentImageUrl}
                alt={selectedImage?.filename || "Analysis Plot"}
                className="w-full h-full object-contain select-none"
                style={transformStyle}
                draggable={false}
            />

            {hasEdgeQualityMasks && masks
                .filter(mask => mask.url)
                .map(mask => (
                    <MaskRenderer
                        key={mask.id}
                        mask={mask}
                        transformStyle={transformStyle}
                        imageDimensions={imageDimensions}
                    />
                ))
            }
        </div>
    )
}

/**
 * Container component with zoom controls and image display area
 * @param children - The ImageWithMasks component
 * @param onZoomIn - Handler for zoom in button
 * @param onZoomOut - Handler for zoom out button
 * @param onResetZoom - Handler for reset zoom button
 */
function ImageContainer({
    children,
    onZoomIn,
    onZoomOut,
    onResetZoom
}: {
    children: React.ReactNode
    onZoomIn: () => void
    onZoomOut: () => void
    onResetZoom: () => void
}) {
    return (
        <div className="h-full w-full relative">
            <div className="w-full h-full flex items-center justify-center relative">
                {/* Zoom controls */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onZoomIn}
                        className="w-8 h-8 p-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onZoomOut}
                        className="w-8 h-8 p-0"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onResetZoom}
                        className="w-8 h-8 p-0 text-xs"
                    >
                        1x
                    </Button>
                </div>
                {children}
            </div>
        </div>
    )
}

/**
 * Pure image display component with zoom and pan functionality
 * @param selectedImage - Currently selected image data
 * @param currentImageUrl - The current image URL to display
 * @param masks - Array of mask overlays to render
 * @param hasEdgeQualityMasks - Whether edge quality masks should be displayed
 */
export function ImageDisplay({
    selectedImage,
    currentImageUrl,
    masks,
    hasEdgeQualityMasks
}: ImageDisplayProps) {
    const [scale, setScale] = useState(1)
    const [panX, setPanX] = useState(0)
    const [panY, setPanY] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5))
    }, [])

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev / 1.2, 0.1))
    }, [])

    const handleResetZoom = useCallback(() => {
        setScale(1)
        setPanX(0)
        setPanY(0)
    }, [])

    // Scroll zoom handler
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Prevent the parent container from scrolling while zooming
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY * -0.001
        setScale(prev => Math.max(0.1, Math.min(5, prev + delta)))
    }, [])

    // Pan handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - panX * scale, y: e.clientY - panY * scale })
    }, [panX, panY, scale])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return
        const deltaX = (e.clientX - dragStart.x) / scale
        const deltaY = (e.clientY - dragStart.y) / scale
        setPanX(deltaX)
        setPanY(deltaY)
    }, [isDragging, dragStart, scale])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    // Mouse event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
        <div className="flex-1 p-4 min-w-0">
            <div className="h-full">
                {currentImageUrl ? (
                    <ImageContainer
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onResetZoom={handleResetZoom}
                    >
                        <ImageWithMasks
                            currentImageUrl={currentImageUrl}
                            selectedImage={selectedImage}
                            masks={masks}
                            hasEdgeQualityMasks={hasEdgeQualityMasks}
                            scale={scale}
                            panX={panX}
                            panY={panY}
                            onMouseDown={handleMouseDown}
                            onWheel={handleWheel}
                        />
                    </ImageContainer>
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center space-y-2">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div className="font-medium text-muted-foreground">No image selected</div>
                            <div className="text-xs text-muted-foreground">Select an image to begin analysis</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
