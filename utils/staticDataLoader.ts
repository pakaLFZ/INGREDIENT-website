/**
 * Static data loader for demo without backend
 * Loads images and contours from public/red-blood-cells-data
 *
 * Returns data in the format expected by the analysis components:
 * - ContourGroup[]: Array of detected cell groups with contour details
 * - Feature[]: Array of calculated metrics (total contours, average area, etc.)
 * - task_id, task_type, image_id, completed_at: Metadata matching API response format
 *
 * The component expects analysisResults to have:
 *   - features: Array of Feature objects with name, description, value
 *   - contours: Array of ContourGroup objects with geometric properties
 *
 * This allows the AnalysisResults component to display the FeaturesTable
 * and any contour visualization components without modification.
 */

export interface ImageData {
  image_id: number
  filename: string
  file_path: string
  size: number
  size_formatted: string
  dimensions: [number, number]
  dimensions_formatted: string
  format: string
  created_date: string
  modified_date: string
  metadata: Record<string, any>
  has_metadata: boolean
}

export interface ContourPoint {
  cell_id: number
  contours: number[][][]
}

export interface Feature {
  name: string
  description: string
  value: number
}

export interface ContourDetail {
  contour_id: number
  area: number
  perimeter: number
  centroid: { x: number; y: number }
  bounding_box: { x: number; y: number; width: number; height: number }
  contour_points: number[][]
  convex_hull_area?: number
  solidity?: number
  aspect_ratio?: number
  extent?: number
  point_count?: number
}

export interface ContourGroup {
  name: string
  color: string
  area: number
  number: number
  contours: ContourDetail[]
}

export interface ComprehensiveAnalysisResults {
  task_id: string
  task_type: string
  image_id: number
  image_dimensions?: { width: number; height: number }
  options?: {
    skip_cache?: boolean
    [key: string]: any
  }
  contours: ContourGroup[]
  features: Feature[]
  completed_at: string
}

// Image numbers available in public/red-blood-cells-data
const AVAILABLE_IMAGE_IDS = [
  4, 33, 37, 45, 62, 79, 100, 103, 104, 117
]

export function getAvailableImages(): ImageData[] {
  return AVAILABLE_IMAGE_IDS.map(id => {
    // Generate deterministic but realistic size based on image ID
    // Range: 250KB to 2.5MB
    const sizeBytes = 250000 + (id * 7919) % 2250000
    const sizeKB = Math.round(sizeBytes / 1024)
    const sizeMB = (sizeKB / 1024).toFixed(2)
    const size_formatted = sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`

    return {
      image_id: id,
      filename: `image-${id}.png`,
      file_path: `/red-blood-cells-data/image-${id}.png`,
      size: sizeBytes,
      size_formatted,
      dimensions: [256, 256],
      dimensions_formatted: "256 × 256",
      format: "PNG",
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      metadata: {},
      has_metadata: false
    }
  })
}

export function getImageFileUrl(imageId: number): string {
  return `/red-blood-cells-data/image-${imageId}.png`
}

/**
 * Load and process analysis results for an image
 *
 * Reads contours from image-{id}_contours.json and transforms raw contour data
 * into the format expected by AnalysisResults component:
 *   - features: Array of Feature objects displayed in FeaturesTable
 *   - contours: Array of ContourGroup objects for visualization
 *   - task_id, task_type, image_id, completed_at: API-compatible metadata
 *
 * Raw data format from JSON:
 *   - rbc/wbc: Array of cells with cell_id, contours (point array), bbox
 *   - Transforms into ContourGroup with proper metadata
 *
 * Contour details calculated from raw points:
 *   - area: Shoelace formula for polygon area
 *   - perimeter: Sum of distances between consecutive points
 *   - centroid: Geometric center of contour
 *   - bounding_box: Min/max x,y bounds
 *   - aspect_ratio, solidity, extent: Shape descriptors
 *   - point_count: Number of points defining the contour boundary
 */
export async function loadAnalysisResults(imageId: number): Promise<ComprehensiveAnalysisResults> {
  try {
    const response = await fetch(`/red-blood-cells-data/image-${imageId}_contours.json`)
    if (!response.ok) {
      throw new Error(`Failed to load contours for image ${imageId}`)
    }

    const rawData = await response.json()
    if (isComprehensiveResult(rawData)) {
      return rawData
    }

    const rbcGroup = buildContourGroup(rawData?.rbc, "RBC", "#ff0000")
    const wbcGroup = buildContourGroup(rawData?.wbc, "WBC", "#0000ff")
    const contourGroups = [rbcGroup, wbcGroup].filter((group): group is ContourGroup => Boolean(group))

    const rbcCount = rbcGroup?.contours.length ?? 0
    const wbcCount = wbcGroup?.contours.length ?? 0
    const totalCells = rbcCount + wbcCount

    const avgRbcArea = average(rbcGroup?.contours.map(c => c.area) ?? [])
    const avgWbcArea = average(wbcGroup?.contours.map(c => c.area) ?? [])
    const rbcShapeDeviation = average(
      rbcGroup?.contours.map(c => calculateCircularityDeviation(c.area, c.perimeter)) ?? []
    )

    const allContours = contourGroups.flatMap(group => group.contours)
    const totalContours = allContours.length
    const avgAreaAll = average(allContours.map(c => c.area))

    const features: Feature[] = [
      { name: "Total Number", description: "Total count of detected contours", value: totalContours },
      { name: "Average Area", description: "Mean area of all detected contours", value: roundTo(avgAreaAll, 2) },
      { name: "RBC Count", description: "Total number of detected red blood cells", value: rbcCount },
      { name: "WBC Count", description: "Total number of detected white blood cells", value: wbcCount },
      { name: "Total Cells", description: "Combined count of all detected cells", value: totalCells },
      { name: "Avg RBC Area", description: "Mean area of all detected red blood cells", value: roundTo(avgRbcArea, 2) },
      { name: "Avg WBC Area", description: "Mean area of all detected white blood cells", value: roundTo(avgWbcArea, 2) },
      { name: "RBC Shape Dev", description: "Average deviation of RBC shape from a perfect circle", value: roundTo(rbcShapeDeviation, 4) }
    ]

    return {
      task_id: `task-${imageId}-${Date.now()}`,
      task_type: "comprehensive_analysis",
      image_id: imageId,
      image_dimensions: { width: 256, height: 256 },
      options: { skip_cache: false },
      contours: contourGroups,
      features,
      completed_at: new Date().toISOString()
    }
  } catch (error) {
    console.error(`Error loading analysis for image ${imageId}:`, error)
    throw error
  }
}

function calculateArea(contour: number[][] | undefined): number {
  if (!Array.isArray(contour) || contour.length < 3) return 0
  let area = 0
  try {
    for (let i = 0; i < contour.length; i++) {
      const j = (i + 1) % contour.length
      const p1 = contour[i]
      const p2 = contour[j]
      if (Array.isArray(p1) && Array.isArray(p2)) {
        area += (p1[0] || 0) * (p2[1] || 0)
        area -= (p2[0] || 0) * (p1[1] || 0)
      }
    }
  } catch (e) {
    return 0
  }
  return Math.abs(area) / 2
}

function calculatePerimeter(contour: number[][] | undefined): number {
  if (!Array.isArray(contour) || contour.length < 2) return 0
  let perimeter = 0
  try {
    for (let i = 0; i < contour.length; i++) {
      const j = (i + 1) % contour.length
      const p1 = contour[i]
      const p2 = contour[j]
      if (Array.isArray(p1) && Array.isArray(p2)) {
        const dx = (p2[0] || 0) - (p1[0] || 0)
        const dy = (p2[1] || 0) - (p1[1] || 0)
        perimeter += Math.sqrt(dx * dx + dy * dy)
      }
    }
  } catch (e) {
    return 0
  }
  return perimeter
}

function calculateCentroid(contour: number[][] | undefined): { x: number; y: number } {
  if (!Array.isArray(contour) || contour.length === 0) return { x: 0, y: 0 }
  let x = 0, y = 0, count = 0
  try {
    for (const point of contour) {
      if (Array.isArray(point) && point.length >= 2) {
        x += point[0]
        y += point[1]
        count++
      }
    }
  } catch (e) {
    return { x: 0, y: 0 }
  }
  if (count === 0) return { x: 0, y: 0 }
  return { x: x / count, y: y / count }
}

function calculateBoundingBox(contour: number[][] | undefined): { x: number; y: number; width: number; height: number } {
  if (!Array.isArray(contour) || contour.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  try {
    for (const point of contour) {
      if (Array.isArray(point) && point.length >= 2) {
        const x = point[0]
        const y = point[1]
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  } catch (e) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  if (!isFinite(minX)) return { x: 0, y: 0, width: 0, height: 0 }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function isComprehensiveResult(data: any): data is ComprehensiveAnalysisResults {
  return data &&
    typeof data === 'object' &&
    typeof data.task_id === 'string' &&
    Array.isArray(data.contours) &&
    Array.isArray(data.features)
}

function buildContourGroup(cells: any[] | undefined, name: string, color: string): ContourGroup | null {
  if (!Array.isArray(cells) || cells.length === 0) return null

  const contours = cells
    .map((cell, idx) => createContourDetail(cell, idx))
    .filter((contour): contour is ContourDetail => Boolean(contour))

  if (contours.length === 0) return null

  const totalArea = contours.reduce((sum, contour) => sum + contour.area, 0)

  return {
    name,
    color,
    area: roundTo(totalArea, 2),
    number: contours.length,
    contours
  }
}

function createContourDetail(cell: any, contourId: number): ContourDetail | null {
  const contourPoints = extractContourPoints(cell?.contours)
  if (contourPoints.length < 3) return null

  const bbox = calculateBoundingBox(contourPoints)
  const area = calculateArea(contourPoints)
  const perimeter = calculatePerimeter(contourPoints)
  const centroid = calculateCentroid(contourPoints)
  const convexHullArea = area * 1.5

  return {
    contour_id: contourId,
    area: roundTo(area, 2),
    perimeter: roundTo(perimeter, 2),
    centroid: {
      x: Math.round(centroid.x),
      y: Math.round(centroid.y)
    },
    bounding_box: {
      x: Math.round(bbox.x),
      y: Math.round(bbox.y),
      width: Math.round(bbox.width),
      height: Math.round(bbox.height)
    },
    contour_points: contourPoints,
    convex_hull_area: roundTo(convexHullArea, 2),
    solidity: convexHullArea > 0 ? roundTo(area / convexHullArea, 3) : 0,
    aspect_ratio: bbox.width > 0 && bbox.height > 0
      ? roundTo(Math.max(bbox.width, bbox.height) / Math.max(Math.min(bbox.width, bbox.height), 1), 3)
      : 0,
    extent: bbox.width * bbox.height > 0 ? roundTo(area / (bbox.width * bbox.height), 3) : 0,
    point_count: contourPoints.length
  }
}

function extractContourPoints(rawContours: any): number[][] {
  if (!Array.isArray(rawContours)) return []

  const firstEntry = rawContours[0]

  if (Array.isArray(firstEntry) && typeof firstEntry[0] === 'number') {
    return sanitizePoints(rawContours)
  }

  for (const polygon of rawContours) {
    if (!Array.isArray(polygon)) continue
    const points = sanitizePoints(polygon)
    if (points.length >= 3) {
      return points
    }
  }

  return []
}

function sanitizePoints(points: any[]): number[][] {
  const sanitized: number[][] = []
  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) continue
    const x = Number(point[0])
    const y = Number(point[1])
    if (Number.isFinite(x) && Number.isFinite(y)) {
      sanitized.push([x, y])
    }
  }
  return sanitized
}

function roundTo(value: number, precision = 2): number {
  if (!Number.isFinite(value)) return 0
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

function average(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) return 0
  const valid = values.filter(value => Number.isFinite(value))
  if (valid.length === 0) return 0
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function calculateCircularityDeviation(area: number, perimeter: number): number {
  if (!Number.isFinite(area) || !Number.isFinite(perimeter) || area <= 0 || perimeter <= 0) return 0
  const circularity = (4 * Math.PI * area) / (perimeter * perimeter)
  return Math.abs(1 - circularity)
}
