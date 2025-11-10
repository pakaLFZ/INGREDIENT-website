"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { MetricRow } from "../results"
import { DefectStatisticsDetail } from "./defect-statistics-detail"

interface DefectData {
    name: string
    count: number
    area: number
    images: number
    color?: string
}

interface FolderAnalysisResultsProps {
    results: {
        defects?: DefectData[]
        defect_statistics?: Record<string, any>
        quality_metrics?: Record<string, any>
        processing_summary?: Record<string, any>
    }
    sessionId?: string
}

const formatValue = (value: any): string => {
    if (typeof value === 'number') return value.toFixed(3)
    if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2)
    return String(value)
}

const formatLabel = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Displays folder analysis results with merged defect chart and quality metrics
 * Shows defect distribution chart with quality metrics, defect statistics, and processing summary
 * @param results - Analysis results containing defects, statistics, quality metrics, and processing summary
 * @param sessionId - Session ID for downloading raw results data
 */
export function FolderAnalysisResults({ results, sessionId }: FolderAnalysisResultsProps) {
    const { defects, defect_statistics, quality_metrics, processing_summary } = results

    const chartConfig = React.useMemo(() => {
        if (!defects) return {} as ChartConfig
        return defects.reduce((config, defect, index) => ({
            ...config,
            [defect.name]: {
                label: defect.name.charAt(0).toUpperCase() + defect.name.slice(1),
                color: defect.color || `var(--chart-${(index % 5) + 1})`
            }
        }), {} as Record<string, { label: string; color: string }>)
    }, [defects]) satisfies ChartConfig

    const chartData = React.useMemo(() =>
        defects?.map(defect => ({
            ...defect,
            fill: chartConfig[defect.name]?.color || `var(--chart-1)`
        })) || [], [defects, chartConfig])

    const renderLabel = (props: any) => {
        const { cx, cy, midAngle, outerRadius, name, percent } = props
        const RADIAN = Math.PI / 180
        const radius = outerRadius + 10 + Math.max(0, name.length * 2)
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)
        const textAnchor = x > cx ? "start" : "end"

        return (
            <text
                x={x}
                y={y}
                fill="hsl(var(--foreground))"
                textAnchor={textAnchor}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    return (
        <div className="space-y-4 p-4">
            {defects && defects.length > 0 && quality_metrics && (
                <div className="border rounded-lg bg-background">
                    <div className="p-4 border-b">
                        <h3 className="text-base font-medium">Defect Distribution & Quality Metrics</h3>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6 p-6">
                        <div className="flex flex-col items-center justify-center">
                            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] w-full">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="count"
                                        nameKey="name"
                                        innerRadius={60}
                                        outerRadius={80}
                                        strokeWidth={5}
                                        label={renderLabel}
                                        labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(quality_metrics).map(([key, value]) => (
                                <MetricRow
                                    key={key}
                                    label={formatLabel(key)}
                                    value={formatValue(value)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {defect_statistics && <DefectStatisticsDetail statistics={defect_statistics} />}

            {processing_summary && (
                <div className="border rounded-lg bg-background">
                    <div className="p-4 border-b">
                        <h3 className="text-base font-medium">Processing Summary</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {Object.entries(processing_summary).map(([key, value]) => (
                            <MetricRow
                                key={key}
                                label={formatLabel(key)}
                                value={formatValue(value)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
