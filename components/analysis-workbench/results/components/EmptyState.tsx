interface EmptyStateProps {
  currentAnalysis: any | null
}

/**
 * Empty state component shown when no analysis is available or running
 * Displays appropriate message based on analysis state
 */
export function EmptyState({ currentAnalysis }: EmptyStateProps) {
  if (currentAnalysis) {
    return null
  }

  return (
    <div className="text-center py-8">
      <div className="text-xs text-gray-500">Ready for Analysis</div>
      <div className="text-xs text-gray-400 mt-1">Select an image to start</div>
    </div>
  )
}