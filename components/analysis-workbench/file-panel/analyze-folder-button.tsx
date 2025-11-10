"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface AnalyzeFolderButtonProps {
    loading: boolean
    onAnalyzeFolder?: (ignoreCache?: boolean) => void
    hasCachedResults?: boolean
}

/**
 * Button component for triggering folder analysis with confirmation dialog
 * Shows cache state and allows user to confirm before overwriting existing cache
 * @param loading - Indicates if analysis is in progress
 * @param onAnalyzeFolder - Callback function when button is clicked, accepts ignoreCache parameter
 * @param hasCachedResults - Indicates if cached results exist for this folder
 */
export function AnalyzeFolderButton({ loading, onAnalyzeFolder, hasCachedResults = false }: AnalyzeFolderButtonProps) {
    const [open, setOpen] = useState(false)

    const handleConfirm = (ignoreCache: boolean = false) => {
        setOpen(false)
        onAnalyzeFolder?.(ignoreCache)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="h-6 text-xs px-2 flex-shrink-0 text-foreground"
                    disabled={loading || !onAnalyzeFolder}
                    variant="outline"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        "Analyze Folder"
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Folder Analysis</DialogTitle>
                    <DialogDescription>
                        {hasCachedResults ? (
                            <>
                                Cached results exist for this folder. You can use cached results or reanalyze all images.
                            </>
                        ) : (
                            <>
                                This will analyze all images in the selected folder.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {hasCachedResults && (
                        <Button
                            onClick={() => handleConfirm(false)}
                            variant="outline"
                        >
                            Use Cache
                        </Button>
                    )}
                    <Button
                        onClick={() => handleConfirm(true)}
                        variant={hasCachedResults ? "default" : "default"}
                    >
                        {hasCachedResults ? "Reanalyze All" : "Start Analysis"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}