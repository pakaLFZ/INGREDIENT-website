import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Type definitions
export interface ImageData {
  image_id: number;
  filename: string;
  file_path: string;
  size: number;
  size_formatted: string;
  dimensions: [number, number];
  dimensions_formatted: string;
  format: string;
  created_date: string;
  modified_date: string;
  metadata: Record<string, any>;
  has_metadata: boolean;
  has_analysis?: boolean;
  analysis_status?: {
    analysis_id: string;
    analysis_type: string;
    status: string;
    completed_at?: string;
  };
}

export interface PaginatedImagesResponse {
  images: ImageData[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
  folder_path: string | null;
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

const loadImagesFromFolderAPI = async (folderPath: string) => {
  return apiRequest<{
    images: ImageData[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
  }>('/api/images/list', {
    method: 'POST',
    body: JSON.stringify({ folder_path: folderPath, page: 1, per_page: 25 }),
  });
};

const getImagesAPI = async (params: {
  folder_path?: string;
  search?: string;
  sort_by?: string;
  page?: number;
  per_page?: number;
} = {}): Promise<PaginatedImagesResponse> => {
  return apiRequest('/api/images/list', {
    method: 'POST',
    body: JSON.stringify(params),
  }).then(response => ({
    ...response,
    folder_path: params.folder_path || null
  }));
};

export const getImageFileUrl = (imageId: number): string => {
  return `${API_BASE_URL}/api/images/${imageId}/file`;
};

export interface ImageState {
  folderPath: string
  images: ImageData[]
  selectedImage: ImageData | null
  searchQuery: string
  sortBy: string
  loading: boolean
  error: string
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
  }
}

const initialState: ImageState = {
  folderPath: '',
  images: [],
  selectedImage: null,
  searchQuery: '',
  sortBy: 'filename',
  loading: false,
  error: '',
  pagination: {
    page: 1,
    per_page: 25,
    total: 0,
    pages: 0
  }
}

export const loadImagesFromFolder = createAsyncThunk(
  'images/loadFromFolder',
  async (params: { folderPath: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { images: ImageState }
      const imagesResponse = await getImagesAPI({
        folder_path: params.folderPath,
        page: 1,
        per_page: state.images.pagination.per_page,
        search: '', // Reset search when loading new folder
        sort_by: 'filename' // Reset sort when loading new folder
      })
      return {
        folderPath: params.folderPath,
        images: imagesResponse.images,
        pagination: imagesResponse.pagination
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to load folder'
      return rejectWithValue(errorMsg)
    }
  }
)

export const loadImagesPage = createAsyncThunk(
  'images/loadPage',
  async (params: { page?: number; per_page?: number; search?: string; sort_by?: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { images: ImageState }
      const apiParams = {
        folder_path: state.images.folderPath,
        page: params.page,
        per_page: params.per_page,
        search: params.search ?? state.images.searchQuery,
        sort_by: params.sort_by ?? state.images.sortBy
      }
      const imagesResponse = await getImagesAPI(apiParams)
      return {
        images: imagesResponse.images,
        pagination: imagesResponse.pagination
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to load images'
      return rejectWithValue(errorMsg)
    }
  }
)

export const searchAndSortImages = createAsyncThunk(
  'images/searchAndSort',
  async (params: { search?: string; sort_by?: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { images: ImageState }
      const apiParams = {
        folder_path: state.images.folderPath,
        page: 1, // Reset to first page when searching/sorting
        per_page: state.images.pagination.per_page,
        search: params.search,
        sort_by: params.sort_by
      }
      const imagesResponse = await getImagesAPI(apiParams)
      return {
        images: imagesResponse.images,
        pagination: imagesResponse.pagination,
        searchQuery: params.search || '',
        sortBy: params.sort_by || 'filename'
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to search images'
      return rejectWithValue(errorMsg)
    }
  }
)

const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setSelectedImage: (state, action: PayloadAction<ImageData | null>) => {
      state.selectedImage = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.per_page = action.payload
      state.pagination.page = 1
    },
    clearError: (state) => {
      state.error = ''
    },
    resetImageState: (state) => {
      state.selectedImage = null
      state.searchQuery = ''
      state.error = ''
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadImagesFromFolder.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loadImagesFromFolder.fulfilled, (state, action) => {
        state.loading = false
        state.folderPath = action.payload.folderPath
        state.images = action.payload.images
        state.pagination = action.payload.pagination
        state.selectedImage = null
        state.searchQuery = '' // Reset search when loading new folder
        state.sortBy = 'filename' // Reset sort when loading new folder
        state.error = ''
      })
      .addCase(loadImagesPage.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loadImagesPage.fulfilled, (state, action) => {
        state.loading = false
        state.images = action.payload.images
        state.pagination = action.payload.pagination
        state.error = ''
      })
      .addCase(loadImagesPage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(loadImagesFromFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(searchAndSortImages.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(searchAndSortImages.fulfilled, (state, action) => {
        state.loading = false
        state.images = action.payload.images
        state.pagination = action.payload.pagination
        state.searchQuery = action.payload.searchQuery
        state.sortBy = action.payload.sortBy
        state.error = ''
      })
      .addCase(searchAndSortImages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setSelectedImage,
  setSearchQuery,
  setPage,
  setPerPage,
  setSortBy,
  clearError,
  resetImageState
} = imageSlice.actions

export default imageSlice.reducer
