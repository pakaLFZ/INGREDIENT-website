"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    perPage: number
    totalItems: number
    onPageChange: (page: number) => void
    onPerPageChange: (perPage: number) => void
}

/**
 * Pagination controls component for navigating through image pages
 * Includes page navigation buttons and items per page selector
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param perPage - Number of items per page
 * @param totalItems - Total number of items
 * @param onPageChange - Callback when page changes
 * @param onPerPageChange - Callback when items per page changes
 */
export function PaginationControls({
    currentPage,
    totalPages,
    perPage,
    totalItems,
    onPageChange,
    onPerPageChange
}: PaginationControlsProps) {
    const startItem = Math.min((currentPage - 1) * perPage + 1, totalItems)
    const endItem = Math.min(currentPage * perPage, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 text-xs p-2 sm:p-0">
            <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">
                    {totalItems > 0 ? `${startItem}-${endItem} of ${totalItems}` : "0 images"}
                </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                <Select value={perPage.toString()} onValueChange={(value) => onPerPageChange(Number(value))}>
                    <SelectTrigger className="h-8 w-18 text-xs touch-manipulation">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 touch-manipulation"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>

                    <span className="text-muted-foreground min-w-16 text-center text-xs">
                        {totalPages > 0 ? `${currentPage}/${totalPages}` : "0/0"}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 touch-manipulation"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}