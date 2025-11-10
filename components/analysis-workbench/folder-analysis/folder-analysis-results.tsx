"use client"

import { MetricRow } from "../results"
import type { FolderAnalysisResultsData } from "@/utils/hooks/useFolderAnalysis"

interface FolderAnalysisResultsProps {
    results: FolderAnalysisResultsData
    sessionId?: string
}

const formatNumber = (value: number, digits = 0) =>
    Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits })

const formatArea = (value: number) => `${formatNumber(value, 2)} px²`
const formatDeviation = (value: number) => formatNumber(value, 4)

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper?: string }) => (
    <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
)

export function FolderAnalysisResults({ results }: FolderAnalysisResultsProps) {
    const { aggregated_metrics, per_image_metrics, processing_summary } = results

    return (
        <div className="space-y-4 p-4">
            <div className="border rounded-lg bg-background">
                <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Overall Cell Summary</h3>
                    <p className="text-xs text-muted-foreground">
                        Aggregated from {aggregated_metrics.total_images} images in the selected folder.
                    </p>
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-3">
                    <MetricCard label="Total RBCs" value={formatNumber(aggregated_metrics.total_rbc)} helper="All detected red blood cells" />
                    <MetricCard label="Total WBCs" value={formatNumber(aggregated_metrics.total_wbc)} helper="All detected white blood cells" />
                    <MetricCard label="Total Cells" value={formatNumber(aggregated_metrics.total_cells)} helper="Combined RBC + WBC count" />
                    <MetricCard label="Avg RBC Area" value={formatArea(aggregated_metrics.avg_rbc_area)} helper="Weighted average size" />
                    <MetricCard label="Avg WBC Area" value={formatArea(aggregated_metrics.avg_wbc_area)} helper="Weighted average size" />
                    <MetricCard label="Avg RBC Shape Deviation" value={formatDeviation(aggregated_metrics.avg_rbc_shape_dev)} helper="0 = perfect circle" />
                </div>
            </div>

            <div className="border rounded-lg bg-background">
                <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Per-Image Metrics</h3>
                    <p className="text-xs text-muted-foreground">Detailed breakdown for each analyzed sample.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-muted-foreground text-left border-b">
                                <th className="px-4 py-2 font-medium">Image</th>
                                <th className="px-4 py-2 font-medium">RBCs</th>
                                <th className="px-4 py-2 font-medium">WBCs</th>
                                <th className="px-4 py-2 font-medium">Total</th>
                                <th className="px-4 py-2 font-medium">Avg RBC Area</th>
                                <th className="px-4 py-2 font-medium">Avg WBC Area</th>
                                <th className="px-4 py-2 font-medium">Avg RBC Shape Dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            {per_image_metrics.map(metric => (
                                <tr key={metric.image_id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-medium">{metric.filename}</td>
                                    <td className="px-4 py-3">{formatNumber(metric.rbc_count)}</td>
                                    <td className="px-4 py-3">{formatNumber(metric.wbc_count)}</td>
                                    <td className="px-4 py-3">{formatNumber(metric.total_cells)}</td>
                                    <td className="px-4 py-3">{formatArea(metric.avg_rbc_area)}</td>
                                    <td className="px-4 py-3">{formatArea(metric.avg_wbc_area)}</td>
                                    <td className="px-4 py-3">{formatDeviation(metric.avg_rbc_shape_dev)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border rounded-lg bg-background">
                <div className="p-4 border-b">
                    <h3 className="text-base font-medium">Processing Summary</h3>
                </div>
                <div className="p-4 space-y-2">
                    <MetricRow label="Folder Path" value={processing_summary.folder_path || 'N/A'} />
                    <MetricRow label="Ignore Cache" value={processing_summary.ignore_cache ? 'Yes' : 'No'} />
                    <MetricRow label="Analyzed At" value={new Date(processing_summary.analyzed_at).toLocaleString()} />
                    <MetricRow label="Total Images" value={formatNumber(processing_summary.total_images)} />
                    <MetricRow label="Duration (s)" value={formatNumber(processing_summary.duration_seconds, 2)} />
                </div>
            </div>
        </div>
    )
}
