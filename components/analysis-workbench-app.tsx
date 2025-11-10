"use client"

import { useCallback, useState, useEffect } from "react"
import { ResizablePanels } from "@/components/ui/resizable-panels"
import { FilePanel } from "./analysis-workbench/file-panel/file-panel"
import { ImagePreview } from "./analysis-workbench/preview/image-preview"
import { AnalysisResults } from "./analysis-workbench/results/analysis-results"
import { ErrorDisplay } from "./analysis-workbench/shared/error-display"
import { getAvailableImages, loadAnalysisResults, ImageData, ComprehensiveAnalysisResults, ContourGroup } from "@/utils/staticDataLoader"
import { ImageMask } from "@/lib/store/analysisSlice"

export default function AnalysisWorkbenchApp() {
    const [images, setImages] = useState<ImageData[]>([])
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
    const [analysisResults, setAnalysisResults] = useState<ComprehensiveAnalysisResults | null>(null)
    const [edgeQualityMasks, setEdgeQualityMasks] = useState<ImageMask[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("filename")
    const [ignoreCache, setIgnoreCache] = useState(true)
    const [fakeProgressToken, setFakeProgressToken] = useState<number | null>(null)
    const [isProgressComplete, setIsProgressComplete] = useState(true)

    // Load images on mount
    useEffect(() => {
        const allImages = getAvailableImages()
        setImages(allImages)
        if (allImages.length > 0) {
            setSelectedImage(allImages[0])
        }
    }, [])

    // Load analysis when image changes
    useEffect(() => {
        if (!selectedImage) return

        const loadAnalysis = async () => {
            setLoading(true)
            setError(null)
            try {
                const results = await loadAnalysisResults(selectedImage.image_id)
                setAnalysisResults(results)

                // Convert contours to ImageMask format for visualization
                const masks = convertContoursToMasks(results.contours)
                setEdgeQualityMasks(masks)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load analysis")
            } finally {
                setLoading(false)
            }
        }

        loadAnalysis()
    }, [selectedImage])

    const handleImageSelect = useCallback((image: ImageData) => {
        setSelectedImage(image)
        if (ignoreCache) {
            setIsProgressComplete(false)
            setFakeProgressToken(Date.now())
        }
    }, [ignoreCache])

    const handleIgnoreCacheChange = useCallback((nextIgnoreCache: boolean) => {
        setIgnoreCache(nextIgnoreCache)
        if (!nextIgnoreCache) {
            setFakeProgressToken(null)
        }
    }, [])

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    const handleSortChange = useCallback((sort: string) => {
        setSortBy(sort)
    }, [])

    const handleProgressComplete = useCallback((isComplete: boolean) => {
        setIsProgressComplete(isComplete)
    }, [])

    const filteredAndSortedImages = images
        .filter(img =>
            img.filename.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "size":
                    return a.size - b.size
                case "date":
                    return new Date(a.modified_date).getTime() - new Date(b.modified_date).getTime()
                case "dimensions":
                    return (a.dimensions[0] * a.dimensions[1]) - (b.dimensions[0] * b.dimensions[1])
                case "filename":
                default:
                    return a.filename.localeCompare(b.filename)
            }
        })

    function convertContoursToMasks(contourGroups: ContourGroup[]): ImageMask[] {
        const masks: ImageMask[] = []

        contourGroups.forEach((group, index) => {
            // Create mask for the contour group
            const maskId = `contour_${group.name}_${index}`
            masks.push({
                id: maskId,
                name: `${group.name} (${group.number} detected)`,
                color: group.color,
                description: `${group.name} contours`,
                visible: true,
                url: `data:mask/${maskId}`,
                thickness: 0.5,
                opacity: 100,
                contourData: {
                    contours: group.contours,
                    image_dimensions: { width: 512, height: 512 }
                }
            })

            // Create centroid mask if individual contours have centroid data
            const hasCentroidData = group.contours.some(c => c.centroid && c.centroid.x && c.centroid.y)
            if (hasCentroidData) {
                masks.push({
                    id: `${group.name}_centroid_${index}`,
                    name: `${group.name} centroid`,
                    color: group.color,
                    description: `Centroid of ${group.name} contours`,
                    visible: false,
                    url: `data:mask/${group.name}_centroid_${index}`,
                    thickness: 0.5,
                    opacity: 100,
                    contourData: {
                        contours: group.contours,
                        image_dimensions: { width: 512, height: 512 }
                    }
                })
            }
        })

        return masks
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden touch-manipulation">
            <FilePanel
                folderPath="C:\\Users\\researcher\\Documents\\RedBloodCells\\Samples\\2024-11-10-Demo"
                selectedImage={selectedImage}
                searchQuery={searchQuery}
                sortBy={sortBy}
                loading={loading}
                filteredAndSortedImages={filteredAndSortedImages}
                pagination={{ page: 1, per_page: 50, total: filteredAndSortedImages.length, pages: 1 }}
                onFolderSelect={() => {}}
                onImageSelect={handleImageSelect}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onPageChange={() => {}}
                onPerPageChange={() => {}}
                onAnalyzeFolder={() => {}}
                ignoreCache={ignoreCache}
                onIgnoreCacheChange={handleIgnoreCacheChange}
                disableFolderChange={true}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <ErrorDisplay
                    error={error}
                    onClear={() => setError(null)}
                />

                <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
                    <ResizablePanels
                        topPanel={
                            <ImagePreview
                                selectedImage={selectedImage}
                                edgeQualityMasks={edgeQualityMasks}
                                isProgressComplete={isProgressComplete}
                            />
                        }
                        bottomPanel={
                            <AnalysisResults
                                analysisResults={analysisResults}
                                currentAnalysis={null}
                                fakeProgressToken={fakeProgressToken}
                                isProgressComplete={isProgressComplete}
                                onProgressComplete={handleProgressComplete}
                            />
                        }
                        initialTopHeight={60}
                        minTopHeight={30}
                        maxTopHeight={80}
                        allowParentScroll={true}
                    />
                </div>
            </div>
        </div>
    )
}

