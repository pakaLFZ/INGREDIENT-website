"use client"

import { Separator } from "@/components/ui/separator"
import { ResizablePanel } from "@/components/ui/resizable-panel"
import { ImageData } from "@/utils/staticDataLoader"
import { FolderSelector } from "./folder-selector"
import { SearchSort } from "./search-sort"
import { ImageList } from "./image-list"
import { PaginationControls } from "./pagination-controls"
import { Button } from "@/components/ui/button"

interface FilePanelProps {
    folderPath: string | null
    selectedImage: ImageData | null
    searchQuery: string
    sortBy: string
    loading: boolean
    filteredAndSortedImages: ImageData[]
    pagination: {
        page: number
        per_page: number
        total: number
        pages: number
    }
    onFolderSelect: (folderPath: string) => void
    onImageSelect: (image: ImageData) => void
    onSearchChange: (query: string) => void
    onSortChange: (sortBy: string) => void
    onPageChange: (page: number) => void
    onPerPageChange: (perPage: number) => void
    onAnalyzeFolder?: (ignoreCache?: boolean) => void
    ignoreCache?: boolean
    onIgnoreCacheChange?: (ignoreCache: boolean) => void
    disableFolderChange?: boolean
}

/**
 * File panel component containing folder selection, search/sort, and image list
 * Features a resizable interface with drag functionality for width adjustment
 * @param folderPath - Current selected folder path
 * @param selectedImage - Currently selected image
 * @param searchQuery - Current search query
 * @param sortBy - Current sort criteria
 * @param loading - Loading state
 * @param filteredAndSortedImages - Filtered and sorted image array
 * @param onFolderSelect - Callback for folder selection with mode and filenames
 * @param onImageSelect - Callback for image selection
 * @param onSearchChange - Callback for search changes
 * @param onSortChange - Callback for sort changes
 */
export function FilePanel({
    folderPath,
    selectedImage,
    searchQuery,
    sortBy,
    loading,
    filteredAndSortedImages,
    pagination,
    onFolderSelect,
    onImageSelect,
    onSearchChange,
    onSortChange,
    onPageChange,
    onPerPageChange,
    onAnalyzeFolder,
    ignoreCache,
    onIgnoreCacheChange,
    disableFolderChange = false
}: FilePanelProps) {
    return (
        <ResizablePanel defaultWidth={350} minWidth={200} maxWidth={600}>
            <div className="h-screen bg-muted/30 border-r flex flex-col overflow-hidden">
                <div className="flex-none p-2">
                    <FolderSelector
                        folderPath={folderPath}
                        loading={loading}
                        onFolderSelect={onFolderSelect}
                        showAnalyzeButton={true}
                        onAnalyzeFolder={onAnalyzeFolder}
                        ignoreCache={ignoreCache}
                        onIgnoreCacheChange={onIgnoreCacheChange}
                        disableFolderChange={disableFolderChange}
                    />
                    {folderPath && (
                        <>
                            <Separator className="my-2" />
                            <SearchSort
                                searchQuery={searchQuery}
                                onSearchChange={onSearchChange}
                            />
                        </>
                    )}
                </div>
                {folderPath && (
                    <>
                        <Separator />
                        <div className="flex-1 min-h-0 flex flex-col p-2">
                            <ImageList
                                images={filteredAndSortedImages}
                                selectedImage={selectedImage}
                                sortBy={sortBy}
                                onImageSelect={onImageSelect}
                                onSortChange={onSortChange}
                            />
                            <div className="flex-none mt-2 pt-2 border-t">
                                <PaginationControls
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    perPage={pagination.per_page}
                                    totalItems={pagination.total}
                                    onPageChange={onPageChange}
                                    onPerPageChange={onPerPageChange}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ResizablePanel>
    )
}
