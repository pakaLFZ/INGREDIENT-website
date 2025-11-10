import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Contour {
  cell_id: number
  contours: number[][][]
  bbox: {
    x_min: number
    y_min: number
    x_max: number
    y_max: number
  }
}

interface CellData {
  rbc: Contour[]
  wbc: Contour[]
}

function calculateContourMetrics(contour: number[][]) {
  if (!contour || contour.length === 0) return null

  // Calculate area using shoelace formula
  let area = 0
  for (let i = 0; i < contour.length; i++) {
    const j = (i + 1) % contour.length
    area += contour[i][0] * contour[j][1]
    area -= contour[j][0] * contour[i][1]
  }
  area = Math.abs(area) / 2

  // Calculate perimeter
  let perimeter = 0
  for (let i = 0; i < contour.length; i++) {
    const j = (i + 1) % contour.length
    const dx = contour[j][0] - contour[i][0]
    const dy = contour[j][1] - contour[i][1]
    perimeter += Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate centroid
  let cx = 0,
    cy = 0
  for (const point of contour) {
    cx += point[0]
    cy += point[1]
  }
  cx /= contour.length
  cy /= contour.length

  // Bounding box
  const xs = contour.map(p => p[0])
  const ys = contour.map(p => p[1])
  const x_min = Math.min(...xs)
  const y_min = Math.min(...ys)
  const x_max = Math.max(...xs)
  const y_max = Math.max(...ys)

  const width = x_max - x_min
  const height = y_max - y_min

  // Aspect ratio
  const aspect_ratio = width > 0 ? Math.max(width, height) / Math.min(width, height) : 1

  // Extent
  const bbox_area = width * height
  const extent = bbox_area > 0 ? area / bbox_area : 0

  // Convex hull area approximation
  const convex_hull_area = area * 1.5 // Simplified

  // Solidity
  const solidity = convex_hull_area > 0 ? area / convex_hull_area : 0

  return {
    area: Math.round(area * 100) / 100,
    perimeter: Math.round(perimeter * 100) / 100,
    centroid: { x: Math.round(cx), y: Math.round(cy) },
    bounding_box: { x: Math.round(x_min), y: Math.round(y_min), width: Math.round(width), height: Math.round(height) },
    convex_hull_area: Math.round(convex_hull_area * 100) / 100,
    solidity: Math.round(solidity * 1000) / 1000,
    aspect_ratio: Math.round(aspect_ratio * 1000) / 1000,
    extent: Math.round(extent * 1000) / 1000,
    point_count: contour.length
  }
}

function calculateCircularityDeviation(contour: number[][]) {
  const metrics = calculateContourMetrics(contour)
  if (!metrics) return 0

  // Circularity = 4π * Area / Perimeter²
  const circularity =
    (4 * Math.PI * metrics.area) / (metrics.perimeter * metrics.perimeter)

  // Deviation from perfect circle (1.0)
  const deviation = Math.abs(1 - circularity)
  return Math.round(deviation * 10000) / 10000
}

export async function POST(request: NextRequest) {
  try {
    const { task_id, image_id, folder_path } = await request.json()

    if (!image_id) {
      return NextResponse.json(
        { error: 'image_id is required' },
        { status: 400 }
      )
    }

    // Find contours JSON file
    // The image_id could be from image-4, image-33, etc.
    const contoursFile = path.join(
      process.cwd(),
      'public/red-blood-cells-data',
      `image-${image_id}_contours.json`
    )

    if (!fs.existsSync(contoursFile)) {
      return NextResponse.json(
        { error: 'No contours data found for this image' },
        { status: 404 }
      )
    }

    const cellData: CellData = JSON.parse(fs.readFileSync(contoursFile, 'utf-8'))

    // Process RBCs
    const rbcContours = cellData.rbc || []
    const rbcMetrics = rbcContours.map((rbc, idx) => {
      if (!rbc.contours || rbc.contours.length === 0) return null
      const mainContour = rbc.contours[0]
      const metrics = calculateContourMetrics(mainContour)
      return {
        contour_id: idx,
        ...metrics,
        contour_points: mainContour.slice(0, 10) // Include first 10 points only
      }
    })

    // Process WBCs
    const wbcContours = cellData.wbc || []
    const wbcMetrics = wbcContours.map((wbc, idx) => {
      if (!wbc.contours || wbc.contours.length === 0) return null
      const mainContour = wbc.contours[0]
      const metrics = calculateContourMetrics(mainContour)
      return {
        contour_id: idx,
        ...metrics,
        contour_points: mainContour.slice(0, 10)
      }
    })

    const validRbcMetrics = rbcMetrics.filter(m => m !== null)
    const validWbcMetrics = wbcMetrics.filter(m => m !== null)

    // Calculate averages
    const avgRbcArea =
      validRbcMetrics.length > 0
        ? Math.round(
            (validRbcMetrics.reduce((sum, m) => sum + (m?.area || 0), 0) /
              validRbcMetrics.length) *
              100
          ) / 100
        : 0

    const avgWbcArea =
      validWbcMetrics.length > 0
        ? Math.round(
            (validWbcMetrics.reduce((sum, m) => sum + (m?.area || 0), 0) /
              validWbcMetrics.length) *
              100
          ) / 100
        : 0

    // Average circularity deviation for RBCs
    const rbcCircularityDeviations = validRbcMetrics.map((m, idx) => {
      const contour = rbcContours[idx].contours[0]
      return calculateCircularityDeviation(contour)
    })

    const avgRbcCircularityDev =
      rbcCircularityDeviations.length > 0
        ? Math.round(
            (rbcCircularityDeviations.reduce((a, b) => a + b, 0) /
              rbcCircularityDeviations.length) *
              10000
          ) / 10000
        : 0

    // Build contours array for response
    const contoursArray = [
      {
        name: 'RBC',
        color: '#ff0000',
        area: Math.round(validRbcMetrics.reduce((sum, m) => sum + (m?.area || 0), 0) * 100) / 100,
        number: validRbcMetrics.length,
        contours: validRbcMetrics.map((m, idx) => ({
          contour_id: idx,
          area: m?.area || 0,
          perimeter: m?.perimeter || 0,
          centroid: m?.centroid || { x: 0, y: 0 },
          bounding_box: m?.bounding_box || { x: 0, y: 0, width: 0, height: 0 },
          contour_points: rbcContours[idx]?.contours[0]?.slice(0, 20) || [],
          convex_hull_area: m?.convex_hull_area || 0,
          solidity: m?.solidity || 0,
          aspect_ratio: m?.aspect_ratio || 0,
          extent: m?.extent || 0,
          point_count: m?.point_count || 0
        }))
      },
      {
        name: 'WBC',
        color: '#0000ff',
        area: Math.round(validWbcMetrics.reduce((sum, m) => sum + (m?.area || 0), 0) * 100) / 100,
        number: validWbcMetrics.length,
        contours: validWbcMetrics.map((m, idx) => ({
          contour_id: idx,
          area: m?.area || 0,
          perimeter: m?.perimeter || 0,
          centroid: m?.centroid || { x: 0, y: 0 },
          bounding_box: m?.bounding_box || { x: 0, y: 0, width: 0, height: 0 },
          contour_points: wbcContours[idx]?.contours[0]?.slice(0, 20) || [],
          convex_hull_area: m?.convex_hull_area || 0,
          solidity: m?.solidity || 0,
          aspect_ratio: m?.aspect_ratio || 0,
          extent: m?.extent || 0,
          point_count: m?.point_count || 0
        }))
      }
    ]

    const totalCells = validRbcMetrics.length + validWbcMetrics.length

    const response = {
      task_id: task_id || 'unknown',
      task_type: 'comprehensive_analysis',
      image_id,
      options: { skip_cache: false },
      contours: contoursArray,
      features: [
        {
          name: 'RBC Count',
          description: 'Total number of detected red blood cells',
          value: validRbcMetrics.length
        },
        {
          name: 'WBC Count',
          description: 'Total number of detected white blood cells',
          value: validWbcMetrics.length
        },
        {
          name: 'Total Cells',
          description: 'Combined count of all detected cells',
          value: totalCells
        },
        {
          name: 'Avg RBC Area',
          description: 'Mean area of all detected red blood cells',
          value: avgRbcArea
        },
        {
          name: 'Avg WBC Area',
          description: 'Mean area of all detected white blood cells',
          value: avgWbcArea
        },
        {
          name: 'RBC Shape Dev',
          description: 'Average deviation of RBC shape from circular form',
          value: avgRbcCircularityDev
        }
      ],
      completed_at: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
