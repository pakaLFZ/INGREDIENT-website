"use client"

import { Button } from "@/components/ui/button"

interface IgnoreCacheButtonProps {
    ignoreCache: boolean
    onIgnoreCacheChange: (ignoreCache: boolean) => void
}

/**
 * Toggle button component for ignoring cache
 * @param ignoreCache - Current ignore cache state
 * @param onIgnoreCacheChange - Callback when ignore cache state changes
 */
export function IgnoreCacheButton({ ignoreCache, onIgnoreCacheChange }: IgnoreCacheButtonProps) {
    return (
        <Button
            onClick={() => onIgnoreCacheChange(!ignoreCache)}
            size="sm"
            className="h-6 text-xs px-2 flex-shrink-0"
            variant={ignoreCache ? "default" : "outline"}
        >
            Overwrite Cache
        </Button>
    )
}