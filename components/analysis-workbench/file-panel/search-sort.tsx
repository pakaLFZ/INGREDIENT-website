"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchSortProps {
    searchQuery: string
    onSearchChange: (query: string) => void
}

/**
 * Component for searching and sorting image list
 * @param searchQuery - Current search query
 * @param sortBy - Current sort criteria
 * @param imageCount - Number of available images
 * @param onSearchChange - Callback for search query changes
 * @param onSortChange - Callback for sort criteria changes
 */
export function SearchSort({ searchQuery, onSearchChange }: SearchSortProps) {
    return (
        <div className="space-y-3">
            <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 text-xs"
            />
        </div>
    )
}