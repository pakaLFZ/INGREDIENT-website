"use client"

import { MetricRow } from "../results"

interface DefectStats {
    total_count?: number
    average_count_per_sample?: number
    average_area?: number
    min_area?: number
    max_area?: number
    total_area?: number
    images_affected?: number
    [key: string]: number | undefined
}

interface DefectStatisticsDetailProps {
    statistics: Record<string, DefectStats>
}

const NON_DEFECTS = ['reference_contour', 'perfect_circle_fit', 'best_ellipse_fit']

const normalizeKey = (key: string): string => {
    const normalized = key.toLowerCase()
    // Backwards compatibility with historical dataset keys such as "electrode_contour"
    if (normalized === 'electrode_contour') return 'reference_contour'
    return normalized
}

const LABEL_OVERRIDES: Record<string, string> = {
    reference_contour: 'Reference Contour'
}

const formatLabel = (key: string): string => {
    const normalizedKey = normalizeKey(key)
    return LABEL_OVERRIDES[normalizedKey] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatValue = (value: any): string => {
    if (typeof value === 'number') return value.toFixed(3)
    return String(value)
}

/**
 * Displays detailed defect statistics for each defect type
 * Filters out non-defects like reference contours or fitted primitives
 * @param statistics - Record of defect statistics with nested properties
 */
export function DefectStatisticsDetail({ statistics }: DefectStatisticsDetailProps) {
    const defectEntries = Object.entries(statistics).filter(
        ([key]) => !NON_DEFECTS.includes(normalizeKey(key))
    )

    if (defectEntries.length === 0) return null

    return (
        <div className="space-y-3">
            {defectEntries.map(([defectType, stats]) => (
                <div key={defectType} className="border rounded-lg bg-background">
                    <div className="p-4 border-b">
                        <h3 className="text-sm font-medium">{formatLabel(defectType)}</h3>
                    </div>
                    <div className="p-4 space-y-1">
                        {Object.entries(stats).map(([key, value]) => (
                            <MetricRow
                                key={key}
                                label={formatLabel(key)}
                                value={formatValue(value)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
