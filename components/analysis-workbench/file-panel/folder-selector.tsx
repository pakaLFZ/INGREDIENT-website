"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FolderOpen, Loader2 } from "lucide-react"
import { AnalyzeFolderButton } from "./analyze-folder-button"
import { FolderDialogButton } from "./folder-dialog-button"
import { IgnoreCacheButton } from "./ignore-cache-button"

interface FolderSelectorProps {
    folderPath: string | null
    loading: boolean
    onFolderSelect: (folderPath: string) => void
    showAnalyzeButton?: boolean
    onAnalyzeFolder?: (ignoreCache?: boolean) => void
    ignoreCache?: boolean
    onIgnoreCacheChange?: (ignoreCache: boolean) => void
    disableFolderChange?: boolean
}

/**
 * Component for folder selection with Windows path format enforcement
 * IMPORTANT: This project is designed for Windows devices - always use Windows path format
 * @param folderPath - Current selected folder path (must be Windows format)
 * @param loading - Loading state indicator
 * @param onFolderSelect - Callback function when folder is selected with mode and filenames
 * @param showAnalyzeButton - Whether to show the analyze folder button
 * @param onAnalyzeFolder - Callback function when analyze folder button is clicked
 * @param ignoreCache - Whether to ignore cache
 * @param onIgnoreCacheChange - Callback function when ignore cache state changes
 */
export function FolderSelector({
    folderPath,
    loading,
    onFolderSelect,
    showAnalyzeButton = false,
    onAnalyzeFolder,
    ignoreCache = false,
    onIgnoreCacheChange,
    disableFolderChange = false
}: FolderSelectorProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [inputPath, setInputPath] = useState("sample_data_folder")
    

    const handleSubmit = useCallback(() => {
        if (inputPath && inputPath.trim()) {
            const cleanPath = inputPath.trim().replace(/['"]/g, '')
            onFolderSelect(cleanPath)
            setIsDialogOpen(false)
        }
    }, [inputPath, onFolderSelect])

    const handleDialogOpen = useCallback(() => {
        setInputPath(folderPath || "sample_data_folder")
        setIsDialogOpen(true)
    }, [folderPath])

    return (
        <div className={`${folderPath ? 'space-y-1' : 'space-y-3'}`}>
            {!folderPath && (
                <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Folder Selection</h3>
                </div>
            )}
            <div className="space-y-1">
                {folderPath ? (
                    <div className="space-y-1">
                        <p
                            className="text-xs text-muted-foreground truncate cursor-help"
                            title={folderPath}
                        >
                            {folderPath}
                        </p>
                        <div className="flex items-center justify-end gap-2 mt-2">
                            {onIgnoreCacheChange && (
                                <IgnoreCacheButton
                                    ignoreCache={ignoreCache}
                                    onIgnoreCacheChange={onIgnoreCacheChange}
                                />
                            )}

                            {showAnalyzeButton && (
                                <AnalyzeFolderButton
                                    loading={loading}
                                    onAnalyzeFolder={onAnalyzeFolder}
                                />
                            )}
                            <FolderDialogButton
                                folderPath={folderPath}
                                loading={loading}
                                inputPath={inputPath}
                                folderMode={true}
                                filename={""}
                                isDialogOpen={isDialogOpen}
                                onDialogOpenChange={setIsDialogOpen}
                                onDialogOpen={disableFolderChange ? () => {} : handleDialogOpen}
                                onInputPathChange={setInputPath}
                                onFolderModeChange={() => {}}
                                onFilenameChange={() => {}}
                                onSubmit={handleSubmit}
                                disabled={disableFolderChange}
                            />

                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground">
                            No folder selected
                        </p>
                        <div className="space-y-1">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={handleDialogOpen}
                                        size="sm"
                                        className="h-8 w-full"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <FolderOpen className="w-3 h-3 mr-1" />
                                                Browse Folder
                                            </>
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
                                                    onChange={(e) => setInputPath(e.target.value)}
                                                    placeholder="C:\\Data\\Projects\\Samples\\Images"
                                                    className="flex-1"
                                                />
                                                <Button onClick={handleSubmit} size="sm">
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Single-file selection removed */}</div>
                                </DialogContent>
                            </Dialog>
                            <div className="text-xs text-muted-foreground text-center">
                                Select folder with advanced options
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

