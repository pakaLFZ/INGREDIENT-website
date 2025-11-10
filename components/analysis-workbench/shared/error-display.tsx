"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

interface ErrorDisplayProps {
    error: string | null
    onClear: () => void
}

/**
 * Component for displaying error messages with dismiss functionality
 * @param error - Error message to display
 * @param onClear - Callback function to clear the error
 */
export function ErrorDisplay({ error, onClear }: ErrorDisplayProps) {
    if (!error) return null

    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
                <XCircle className="h-3 w-3" />
                {error}
                <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-6 w-6 p-0"
                    onClick={onClear}
                >
                    ×
                </Button>
            </div>
        </div>
    )
}