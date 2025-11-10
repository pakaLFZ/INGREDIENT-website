import { configureStore } from '@reduxjs/toolkit'
import imageReducer from './imageSlice'
import analysisReducer from './analysisSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    images: imageReducer,
    analysis: analysisReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['analysis/setPollingInterval']
      }
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch