import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  globalError: string
  globalLoading: boolean
  leftPanelWidth: number
}

const initialState: UIState = {
  globalError: '',
  globalLoading: false,
  leftPanelWidth: 320
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalError: (state, action: PayloadAction<string>) => {
      state.globalError = action.payload
    },
    clearGlobalError: (state) => {
      state.globalError = ''
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
    setLeftPanelWidth: (state, action: PayloadAction<number>) => {
      state.leftPanelWidth = action.payload
    }
  }
})

export const {
  setGlobalError,
  clearGlobalError,
  setGlobalLoading,
  setLeftPanelWidth
} = uiSlice.actions

export default uiSlice.reducer