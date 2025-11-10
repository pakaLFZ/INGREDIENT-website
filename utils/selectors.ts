/**
 * Redux state selectors for extracting specific pieces of state
 * 
 * Provides typed selectors for accessing different parts of the Redux store
 * including images, analysis, and UI state.
 */

import { RootState } from '@/lib/store/index'

// Image selectors
export const selectImages = (state: RootState) => state.images.images
export const selectSelectedImage = (state: RootState) => state.images.selectedImage
export const selectFolderPath = (state: RootState) => state.images.folderPath
export const selectImageLoading = (state: RootState) => state.images.loading
export const selectImageError = (state: RootState) => state.images.error
export const selectSearchQuery = (state: RootState) => state.images.searchQuery
export const selectSortBy = (state: RootState) => state.images.sortBy

// Analysis selectors
export const selectCurrentAnalysis = (state: RootState) => state.analysis.currentAnalysis
export const selectAnalysisResults = (state: RootState) => state.analysis.analysisResults
export const selectPlotImageUrl = (state: RootState) => state.analysis.plotImageUrl
export const selectAnalysisError = (state: RootState) => state.analysis.error

// UI selectors
export const selectGlobalError = (state: RootState) => state.ui.globalError
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading
export const selectLeftPanelWidth = (state: RootState) => state.ui.leftPanelWidth