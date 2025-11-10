"use client"

import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react"

interface StatusBadgeProps {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | null
}

/**
 * Component for displaying analysis status with appropriate icons and colors
 * @param status - Current analysis status
 */
export function StatusBadge({ status }: StatusBadgeProps) {
    if (!status) return null

    switch (status) {
        case 'pending':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Pending
                </Badge>
            )
        case 'running':
            return (
                <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Running
                </Badge>
            )
        case 'completed':
            return (
                <Badge variant="default" className="text-xs bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                </Badge>
            )
        case 'failed':
            return (
                <Badge variant="destructive" className="text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Failed
                </Badge>
            )
        case 'cancelled':
            return (
                <Badge variant="secondary" className="text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancelled
                </Badge>
            )
        default:
            return null
    }
}