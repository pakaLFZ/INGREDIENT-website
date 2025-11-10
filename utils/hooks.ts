/**
 * Custom React hooks for business logic and state management
 * 
 * Contains hooks that provide simplified interfaces to Redux state and actions,
 * including image filtering, sorting, and analysis lifecycle management.
 */

import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { 
  loadImagesFromFolder, 
  loadImagesPage,
  searchAndSortImages,
  setSelectedImage, 
  setSearchQuery, 
  setSortBy,
  setPage,
  setPerPage,
  clearError as clearImageError
} from '@/lib/store/imageSlice'
import { 
  startAnalysis, 
  checkAnalysisStatus, 
  fetchAnalysisResults,
  setPollingInterval,
  clearAnalysis,
  clearAnalysisError
} from '@/lib/store/analysisSlice'
import { setGlobalError, clearGlobalError } from '@/lib/store/uiSlice'
import { ImageData } from '@/lib/store/imageSlice'

/**
 * Hook for managing image operations including loading, filtering, and sorting
 *
 * @returns Object containing image state and management functions
 */
export const useImageManagement = (ignoreCache?: boolean) => {
  const dispatch = useAppDispatch()
  const {
    folderPath,
    images,
    selectedImage,
    searchQuery,
    sortBy,
    loading,
    error,
    pagination
  } = useAppSelector(state => state.images)

  const loadFolder = useCallback((path: string, mode?: string, filenames?: string[]) => {
    dispatch(loadImagesFromFolder({ folderPath: path, mode, filenames }))
  }, [dispatch])

  const selectImage = useCallback((image: ImageData | null) => {
    dispatch(setSelectedImage(image))
    dispatch(clearAnalysis())

    // Automatically start Comprehensive Analysis when an image is selected
    if (image) {
      setTimeout(() => {
        dispatch(startAnalysis({ method: "Comprehensive Analysis", imageId: image.image_id, ignoreCache }))
          .then((resultAction) => {
            if (startAnalysis.fulfilled.match(resultAction)) {
              const intervalId = window.setInterval(async () => {
                const statusAction = await dispatch(checkAnalysisStatus(resultAction.payload.taskId))
                if (checkAnalysisStatus.fulfilled.match(statusAction)) {
                  const status = statusAction.payload

                  if (status.status === 'completed') {
                    window.clearInterval(intervalId)
                    dispatch(setPollingInterval(null))
                    dispatch(fetchAnalysisResults({
                      taskId: resultAction.payload.taskId,
                      analysisType: resultAction.payload.type
                    }))
                  } else if (status.status === 'failed') {
                    window.clearInterval(intervalId)
                    dispatch(setPollingInterval(null))
                    dispatch(setGlobalError(`Analysis failed: ${status.error_message}`))
                  }
                }
              }, 2000)

              dispatch(setPollingInterval(intervalId))
            }
          })
          .catch((error) => {
            dispatch(setGlobalError(`Failed to start analysis: ${error.message}`))
          })
      }, 100) // Small delay to ensure UI updates
    }
  }, [dispatch, ignoreCache])

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateSearchQuery = useCallback((query: string) => {
    dispatch(setSearchQuery(query))
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Debounce API call by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(searchAndSortImages({ search: query, sort_by: sortBy }))
    }, 300)
  }, [dispatch, sortBy])

  const updateSortBy = useCallback((sort: string) => {
    dispatch(setSortBy(sort))
    dispatch(searchAndSortImages({ search: searchQuery, sort_by: sort }))
  }, [dispatch, searchQuery])

  const clearError = useCallback(() => {
    dispatch(clearImageError())
  }, [dispatch])

  const changePage = useCallback((page: number) => {
    dispatch(setPage(page))
    dispatch(loadImagesPage({ 
      page, 
      per_page: pagination.per_page, 
      search: searchQuery, 
      sort_by: sortBy 
    }))
  }, [dispatch, pagination.per_page, searchQuery, sortBy])

  const changePerPage = useCallback((perPage: number) => {
    dispatch(setPerPage(perPage))
    dispatch(loadImagesPage({ 
      page: 1, 
      per_page: perPage, 
      search: searchQuery, 
      sort_by: sortBy 
    }))
  }, [dispatch, searchQuery, sortBy])

  /**
   * Images are now filtered and sorted by the backend, so we just return them as-is
   */
  const filteredAndSortedImages = images

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return {
    folderPath,
    images,
    selectedImage,
    searchQuery,
    sortBy,
    loading,
    error,
    pagination,
    filteredAndSortedImages,
    loadFolder,
    selectImage,
    updateSearchQuery,
    updateSortBy,
    changePage,
    changePerPage,
    clearError
  }
}

/**
 * Hook for managing analysis operations including running analyses and polling status
 * 
 * @returns Object containing analysis state and management functions
 */
export const useAnalysisManagement = () => {
  const dispatch = useAppDispatch()
  const { 
    currentAnalysis, 
    analysisResults, 
    plotImageUrl, 
    edgeQualityPlotUrls,
    edgeQualityMasks,
    pollingIntervalId,
    error 
  } = useAppSelector(state => state.analysis)

  /**
   * Runs analysis and manages polling for status updates until completion
   * 
   * @param method - Analysis method to run
   * @param imageId - ID of image to analyze
   */
  const runAnalysis = useCallback(async (method: string, imageId: number) => {
    const resultAction = await dispatch(startAnalysis({ method, imageId }))
    if (startAnalysis.fulfilled.match(resultAction)) {
      const intervalId = window.setInterval(async () => {
        const statusAction = await dispatch(checkAnalysisStatus(resultAction.payload.taskId))
        if (checkAnalysisStatus.fulfilled.match(statusAction)) {
          const status = statusAction.payload

          if (status.status === 'completed' || status.status === 'done') {
            window.clearInterval(intervalId)
            dispatch(setPollingInterval(null))
            dispatch(fetchAnalysisResults({
              taskId: resultAction.payload.taskId,
              analysisType: resultAction.payload.type
            }))
          } else if (status.status === 'failed' || status.status === 'error') {
            window.clearInterval(intervalId)
            dispatch(setPollingInterval(null))
            dispatch(setGlobalError(`Analysis failed: ${status.error_message}`))
          }
        }
      }, 2000)
      
      dispatch(setPollingInterval(intervalId))
    }
  }, [dispatch])

  const clearAnalysisState = useCallback(() => {
    dispatch(clearAnalysis())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAnalysisError())
  }, [dispatch])

  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        window.clearInterval(pollingIntervalId)
        dispatch(setPollingInterval(null))
      }
    }
  }, [pollingIntervalId, dispatch])

  return {
    currentAnalysis,
    analysisResults,
    plotImageUrl,
    edgeQualityPlotUrls,
    edgeQualityMasks,
    error,
    runAnalysis,
    clearAnalysisState,
    clearError
  }
}

/**
 * Hook for managing global UI state including errors and loading states
 * 
 * @returns Object containing global UI state and management functions
 */
export const useGlobalUI = () => {
  const dispatch = useAppDispatch()
  const { globalError, globalLoading, leftPanelWidth } = useAppSelector(state => state.ui)

  const setError = useCallback((error: string) => {
    dispatch(setGlobalError(error))
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearGlobalError())
  }, [dispatch])

  return {
    globalError,
    globalLoading,
    leftPanelWidth,
    setError,
    clearError
  }
}
