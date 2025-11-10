"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FolderOpen, Loader2 } from "lucide-react"

interface FolderDialogButtonProps {
    folderPath: string | null
    loading: boolean
    inputPath: string
    folderMode: boolean
    filename: string
    isDialogOpen: boolean
    onDialogOpenChange: (open: boolean) => void
    onDialogOpen: () => void
    onInputPathChange: (path: string) => void
    onFolderModeChange: (mode: boolean) => void
    onFilenameChange: (filename: string) => void
    onSubmit: () => void
    disabled?: boolean
}

/**
 * Dialog button component for selecting folder path and configuration
 * @param folderPath - Current selected folder path
 * @param loading - Loading state indicator
 * @param inputPath - Input value for folder path
 * @param folderMode - Whether folder mode is enabled
 * @param filename - Filename to search for in folder mode
 * @param isDialogOpen - Dialog open state
 * @param onDialogOpenChange - Callback when dialog open state changes
 * @param onDialogOpen - Callback when dialog is opened
 * @param onInputPathChange - Callback when input path changes
 * @param onFolderModeChange - Callback when folder mode changes
 * @param onFilenameChange - Callback when filename changes
 * @param onSubmit - Callback when form is submitted
 */
export function FolderDialogButton({
    folderPath,
    loading,
    inputPath,
    folderMode,
    filename,
    isDialogOpen,
    onDialogOpenChange,
    onDialogOpen,
    onInputPathChange,
    onFolderModeChange,
    onFilenameChange,
    onSubmit,
    disabled = false
}: FolderDialogButtonProps) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
                <Button
                    onClick={onDialogOpen}
                    size="sm"
                    className="h-6 text-xs px-2 flex-shrink-0"
                    disabled={loading || disabled}
                    variant="outline"
                >
                    {loading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <FolderOpen className="w-3 h-3" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Folder Path</label>
                        <div className="flex gap-2">
                            <Input
                                value={inputPath}
                                onChange={(e) => onInputPathChange(e.target.value)}
                                placeholder="C:\\Data\\Projects\\Samples\\Images"
                                className="flex-1"
                            />
                            <Button onClick={onSubmit} size="sm">
                                Submit
                            </Button>
                        </div>
                    </div>

                    {/* Single-file selection removed: analyze all images in folder by default */}
                </div>
            </DialogContent>
        </Dialog>
    )
}
