"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
interface DefectData {
    name: string
    count: number
    area: number
    images: number
    color?: string
}

interface DefectDonutChartProps {
    defects: DefectData[]
}

/**
 * Displays defect distribution as a donut chart with segment labels and total count in center
 * Logic: Calculates total count, generates chart config with colors, renders donut chart with outer segment labels and center total
 * @param defects - Array of defect data with name, count, area, images, and color
 */
export function DefectDonutChart({ defects }: DefectDonutChartProps) {
    const totalCount = React.useMemo(() => defects.reduce((sum, d) => sum + d.count, 0), [defects])

    const chartConfig = React.useMemo(() => {
        return defects.reduce((config, defect, index) => ({
            ...config,
            [defect.name]: {
                label: defect.name.charAt(0).toUpperCase() + defect.name.slice(1),
                color: defect.color || `var(--chart-${(index % 5) + 1})`
            }
        }), {} as Record<string, { label: string; color: string }>)
    }, [defects])

    const chartData = React.useMemo(() =>
        defects.map(defect => ({
            ...defect,
            fill: chartConfig[defect.name]?.color || `var(--chart-1)`
        })), [defects, chartConfig])

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
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-base">Defect Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="mx-auto aspect-[2/1] max-h-[250px]">
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
                        >
                           
                        </Pie>
                    </PieChart>
                </div>
            </CardContent>
        </Card>
    )
}