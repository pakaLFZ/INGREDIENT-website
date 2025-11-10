import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Type definitions for task queue API response
export interface TaskQueueResponse {
  success: boolean;
  task: {
    task_id: string;
    task_type: string;
    status: 'pending' | 'running' | 'done' | 'error' | 'processing' | 'completed' | 'failed' | 'cancelled';
    note: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    worker_id?: number;
    result?: ComprehensiveAnalysisResults;
    error_message?: string;
    progress_percentage: number;
    current_step: string;
  };
}

export interface AnalysisResult {
  analysis_id: string;
  analysis_type: string;
  image_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  progress_percentage: number;
  current_step: string;
  duration_seconds?: number;
  has_results: boolean;
  has_plot: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  analysis_id: string;
  analysis_type: string;
  message: string;
}

export interface ContourData {
  contour_id: number;
  area: number;
  perimeter: number;
  centroid: { x: number; y: number };
  bounding_box: { x: number; y: number; width: number; height: number };
  contour_points: number[][];
  confidence: number;
}

export interface ContourGroup {
  name: string;
  color: string;
  area: number;
  number: number;
  contours: ContourData[];
  centroids?: {
    contour_centroid?: { x: number; y: number; color: string };
    circle_centroid?: { x: number; y: number; color: string };
    ellipse_centroid?: { x: number; y: number; color: string };
  };
  description?: string;
}

export interface ComprehensiveAnalysisResults {
  contours: ContourGroup[];
  image_path: string;
  overall_quality_score: number;
  quality_score?: number | null;
  plot_available: boolean;
  plots: Record<string, any>;
  summary: {
    total_features: number;
    feature_counts: Record<string, number>;
    traditional_analysis: string[];
  };
  edge_quality?: any;
  curvature_analysis?: any;
  surface_defects?: any;
  coordinate_transform?: any;
  image_dimensions: { width: number; height: number };
  analysis_id: string;
  analysis_type: string;
  completed_at?: string | null;
}

export interface AnalysisResultsResponse {
  analysis_id: string;
  analysis_type: string;
  results: ComprehensiveAnalysisResults | any;
  completed_at: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API functions
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('image/') || contentType?.includes('application/')) {
      return response.blob() as any;
    } else {
      return response.text() as any;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error}`, 0);
  }
};

const runComprehensiveAnalysis = async (imageId: number, options?: { threshold?: number, min_area?: number, apply_edge_filtering?: boolean, skip_cache?: boolean }): Promise<{ task_id: string; type: string; status: string }> => {
  return apiRequest('/api/analysis/start', {
    method: 'POST',
    body: JSON.stringify({ image_id: imageId, method: 'comprehensive_analysis', options: options || {} }),
  });
};

const getTaskStatus = async (taskId: string): Promise<{ status: string; task?: any; error_message?: string }> => {
  return apiRequest('/api/analysis/status', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
};

const getAnalysisStatus = async (analysisId: string): Promise<AnalysisResult> => {
  const status = await getTaskStatus(analysisId);
  return {
    analysis_id: analysisId,
    analysis_type: 'comprehensive_analysis',
    image_id: '',
    status: status.status as any,
    started_at: new Date().toISOString(),
    progress_percentage: status.status === 'completed' ? 100 : 50,
    current_step: status.status === 'completed' ? 'Complete' : 'Processing',
    has_results: status.status === 'completed',
    has_plot: status.status === 'completed'
  };
};

const getAnalysisResults = async (analysisId: string, imageId?: number): Promise<AnalysisResultsResponse> => {
  const results = await apiRequest('/api/analysis/results', {
    method: 'POST',
    body: JSON.stringify({ task_id: analysisId, image_id: imageId }),
  }) as any;
  return {
    analysis_id: analysisId,
    analysis_type: 'comprehensive_analysis',
    results,
    completed_at: results.completed_at || new Date().toISOString()
  };
};


// Helper function to get color for different contour types
const getContourColor = (contourName: string): string => {
  const colorMap: { [key: string]: string } = {
    'edge': '#0066cc',
    'scratch': '#ff6600',
    'delam': '#cc00cc',
    'crack': '#ff0000',
    'cracks': '#ff0000',
    'hole': '#00cc00',
    'particle': '#ffcc00'
  }
  return colorMap[contourName.toLowerCase()] || '#888888'
}

export interface ImageMask {
  id: string
  name: string
  color: string
  url: string
  visible: boolean
  description?: string
  groupId?: string // For grouping related masks (e.g., circle with its centroid)
  thickness?: number
  opacity?: number
  contourData?: any // Store actual contour data for direct rendering
}

export interface AnalysisState {
  currentAnalysis: {
    taskId: string
    type: string
    taskStatus: string
    task?: any
  } | null
  analysisResults: any
  plotImageUrl: string | null
  edgeQualityPlotUrls: Record<string, string>
  edgeQualityMasks: ImageMask[]
  pollingIntervalId: number | null
  error: string
}

const initialState: AnalysisState = {
  currentAnalysis: null,
  analysisResults: null,
  plotImageUrl: null,
  edgeQualityPlotUrls: {},
  edgeQualityMasks: [],
  pollingIntervalId: null,
  error: ''
}

export const startAnalysis = createAsyncThunk(
  'analysis/start',
  async ({ method, imageId, options, ignoreCache }: { method: string; imageId: number; options?: any; ignoreCache?: boolean }, { rejectWithValue }) => {
    try {
      let taskResponse: { task_id: string; type: string; status: string }
      switch (method) {
        case "Comprehensive Analysis":
          taskResponse = await runComprehensiveAnalysis(imageId, { ...options, skip_cache: ignoreCache })
          break
        default:
          throw new Error("Unknown analysis method")
      }

      const taskId = taskResponse.task_id
      const taskStatusResponse = await getTaskStatus(taskId)

      return {
        taskId: taskId,
        type: method,
        taskStatus: taskStatusResponse.status || 'processing',
        task: { status: taskStatusResponse.status || 'processing' }
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : `Failed to start ${method} analysis`
      return rejectWithValue(errorMsg)
    }
  }
)

export const checkAnalysisStatus = createAsyncThunk(
  'analysis/checkStatus',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const taskStatusResponse = await getTaskStatus(taskId)

      if (taskStatusResponse.status === 'completed') {
        return {
          status: 'completed',
          has_results: true,
          task: taskStatusResponse,
          result: {}
        }
      } else if (taskStatusResponse.status === 'failed') {
        return {
          status: 'failed',
          error_message: taskStatusResponse.error_message,
          task: taskStatusResponse
        }
      } else if (taskStatusResponse.status === 'processing') {
        return {
          status: 'running',
          task: taskStatusResponse
        }
      } else {
        return {
          status: taskStatusResponse.status,
          task: taskStatusResponse
        }
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to check task status'
      return rejectWithValue(errorMsg)
    }
  }
)

export const fetchAnalysisResults = createAsyncThunk(
  'analysis/fetchResults',
  async ({ taskId, analysisType }: { taskId: string; analysisType: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { analysis: AnalysisState; images: any }
      const imageId = state.images?.selectedImage?.image_id

      const analysisResponse = await getAnalysisResults(taskId, imageId)
      const results = analysisResponse.results
      let edgeQualityMasks: ImageMask[] = []

      if (analysisType === 'Comprehensive Analysis') {
        // Handle contours from comprehensive analysis - create masks from the actual contour data
        if (results.contours && Array.isArray(results.contours)) {
          // Use actual image dimensions from backend analysis results
          const imageDimensions = results.image_dimensions || { width: 2592, height: 1944 }

          edgeQualityMasks = results.contours.map((contourGroup: any, groupIndex: number) => {
            const color = contourGroup.color || getContourColor(contourGroup.name)
            const maskId = `contour_${contourGroup.name}_${groupIndex}`

            return {
              id: maskId,
              name: `${contourGroup.name} (${contourGroup.number} detected)`,
              color: color,
              description: contourGroup.description || `${contourGroup.name} contours`,
              visible: true,
              url: `data:mask/${maskId}`,
              groupId: `contour_group_${contourGroup.name}`,
              thickness: 0.5,
              opacity: 100,
              contourData: {
                ...contourGroup,
                image_dimensions: imageDimensions
              }
            }
          })

          // Add centroids only for contour groups that have centroid data
          const centroidMasks = results.contours.map((contourGroup: any, groupIndex: number) => {
            const hasCentroidData = contourGroup.centroids &&
              (contourGroup.centroids.contour_centroid ||
               contourGroup.centroids.circle_centroid ||
               contourGroup.centroids.ellipse_centroid)

            const hasIndividualCentroidData = contourGroup.contours &&
              contourGroup.contours.some((contour: any) =>
                contour.centroid && typeof contour.centroid.x === 'number' && typeof contour.centroid.y === 'number'
              )

            if (hasCentroidData || hasIndividualCentroidData) {
              return {
                id: `${contourGroup.name}_centroid_${groupIndex}`,
                name: `${contourGroup.name} centroid`,
                color: contourGroup.color || getContourColor(contourGroup.name),
                description: `Centroid of ${contourGroup.name} contours`,
                visible: false,
                url: `data:mask/${contourGroup.name}_centroid_${groupIndex}`,
                groupId: `contour_group_${contourGroup.name}`,
                thickness: 0.5,
                opacity: 100,
                contourData: {
                  ...contourGroup,
                  image_dimensions: imageDimensions
                }
              }
            }
            return null
          }).filter(Boolean)

          edgeQualityMasks = [...edgeQualityMasks, ...centroidMasks]
        }
      }

      return {
        results: results,
        edgeQualityMasks
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to fetch analysis results'
      return rejectWithValue(errorMsg)
    }
  }
)

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    updateAnalysisStatus: (state, action: PayloadAction<any>) => {
      if (state.currentAnalysis) {
        state.currentAnalysis.taskStatus = action.payload.status || action.payload.taskStatus
        state.currentAnalysis.task = action.payload.task || action.payload
      }
    },
    setPollingInterval: (state, action: PayloadAction<number | null>) => {
      state.pollingIntervalId = action.payload
    },
    clearAnalysis: (state) => {
      state.currentAnalysis = null
      state.analysisResults = null
      state.plotImageUrl = null
      state.edgeQualityPlotUrls = {}
      state.edgeQualityMasks = []
      state.error = ''
    },
    clearAnalysisError: (state) => {
      state.error = ''
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startAnalysis.fulfilled, (state, action) => {
        state.currentAnalysis = action.payload
        state.analysisResults = null
        state.plotImageUrl = null
        state.edgeQualityPlotUrls = {}
        state.edgeQualityMasks = []
        state.error = ''
      })
      .addCase(startAnalysis.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(checkAnalysisStatus.fulfilled, (state, action) => {
        if (state.currentAnalysis) {
          state.currentAnalysis.taskStatus = action.payload.status
          state.currentAnalysis.task = action.payload.task
        }
      })
      .addCase(fetchAnalysisResults.fulfilled, (state, action) => {
        state.analysisResults = action.payload.results
        state.edgeQualityMasks = action.payload.edgeQualityMasks
        if (state.currentAnalysis) {
          state.currentAnalysis.taskStatus = 'completed'
        }
      })
      .addCase(fetchAnalysisResults.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const {
  updateAnalysisStatus,
  setPollingInterval,
  clearAnalysis,
  clearAnalysisError
} = analysisSlice.actions

export default analysisSlice.reducer
