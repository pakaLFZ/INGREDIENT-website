"use client"

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageData } from "@/utils/staticDataLoader"

interface ImageListProps {
    images: ImageData[]
    selectedImage: ImageData | null
    sortBy: string
    onImageSelect: (image: ImageData) => void
    onSortChange: (sortBy: string) => void
}

/**
 * Component displaying the list of available images in a table format
 * @param images - Array of image data objects
 * @param selectedImage - Currently selected image
 * @param onImageSelect - Callback when an image is selected
 */
export function ImageList({ images, selectedImage, sortBy, onImageSelect, onSortChange }: ImageListProps) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">Images</h3>
                    {images.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {images.length} images
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="h-6 w-24 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="filename">Name</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="dimensions">Dims</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="border rounded-md flex-1 overflow-hidden">
                <div className="h-full overflow-auto ">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="h-8 text-xs font-medium">Name</TableHead>
                                <TableHead className="h-8 text-xs font-medium">Size</TableHead>
                                <TableHead className="h-8 text-xs font-medium">Format</TableHead>
                                <TableHead className="h-8 text-xs font-medium">Modified</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {images.length > 0 ? (
                                images.map((image) => (
                                    <TableRow
                                        key={image.image_id}
                                        className={`cursor-pointer transition 
                                                ${selectedImage?.image_id === image.image_id
                                                    ? "bg-gray-300 border-y-2 border-l-2 border-r-2 border-gray-500"
                                                    : "hover:bg-gray-300"
                                                }`}

                                        onClick={() => onImageSelect(image)}
                                    >
                                        <TableCell className="text-xs font-medium truncate max-w-32" title={image.filename}>
                                            {image.filename}
                                        </TableCell>
                                        <TableCell className="text-xs">{image.size_formatted}</TableCell>
                                        <TableCell className="text-xs">{image.format}</TableCell>
                                        <TableCell className="text-xs">{new Date(image.modified_date).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                                        {images.length === 0 ? "No images loaded" : "No images match your search"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}