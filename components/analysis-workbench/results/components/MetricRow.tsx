interface MetricRowProps {
    label: string
    value: string
}

/**
 * Simple label-value row display component
 * Displays a metric label on the left and its value on the right
 * @param label - Label text for the metric
 * @param value - Value to display
 */
export function MetricRow({ label, value }: MetricRowProps) {
    return (
        <div className="flex justify-between items-center text-sm py-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}
