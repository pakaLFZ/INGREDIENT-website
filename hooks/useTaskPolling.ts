import { useState, useEffect, useRef } from 'react'

const RAW_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const API_BASE_URL = RAW_BACKEND_URL.replace(/\/+$/, '')

interface TaskStatus {
  status: 'idle' | 'polling' | 'completed' | 'failed' | 'cancelled'
  progress: number
  step: string
  errorMessage: string | null
  result: any
}

/**
 * Hook for polling task status and fetching results when complete
 * Automatically polls backend task endpoint at regular intervals
 * Auto-fetches final result when task is completed
 *
 * @param taskId - Task ID to poll (null disables polling)
 * @returns Object containing task status, progress, step info, and results
 */
export function useTaskPolling(taskId: string | null) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({
    status: 'idle',
    progress: 0,
    step: '',
    errorMessage: null,
    result: null
  })

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Fetch task status
  const checkStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`)
      if (!response.ok) throw new Error('Failed to get task status')

      const data = await response.json()

      if (!mountedRef.current) return

      const status = data.status || 'unknown'
      const progress = data.progress || 0
      const step = data.step || ''
      const errorMessage = data.error_message || null

      setTaskStatus(prev => ({
        ...prev,
        status: status as 'idle' | 'polling' | 'completed' | 'failed' | 'cancelled',
        progress,
        step,
        errorMessage
      }))

      // Auto-fetch result when completed
      if (status === 'completed' || status === 'done') {
        fetchResult(id)
      } else if (status === 'failed' || status === 'error') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    } catch (error) {
      if (!mountedRef.current) return

      setTaskStatus(prev => ({
        ...prev,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Failed to fetch task status'
      }))
    }
  }

  // Fetch final results
  const fetchResult = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/result`)
      if (!response.ok) throw new Error('Failed to get task result')

      const data = await response.json()

      if (!mountedRef.current) return

      setTaskStatus(prev => ({
        ...prev,
        result: data,
        status: 'completed'
      }))

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    } catch (error) {
      if (!mountedRef.current) return

      setTaskStatus(prev => ({
        ...prev,
        errorMessage: error instanceof Error ? error.message : 'Failed to fetch task result'
      }))
    }
  }

  // Start polling when taskId changes
  useEffect(() => {
    if (!taskId) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      setTaskStatus({
        status: 'idle',
        progress: 0,
        step: '',
        errorMessage: null,
        result: null
      })
      return
    }

    setTaskStatus(prev => ({
      ...prev,
      status: 'polling'
    }))

    // Initial check immediately
    checkStatus(taskId)

    // Poll every 1 second
    pollingIntervalRef.current = setInterval(() => {
      checkStatus(taskId)
    }, 1000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [taskId])

  return {
    status: taskStatus.status,
    progress: taskStatus.progress,
    step: taskStatus.step,
    errorMessage: taskStatus.errorMessage,
    result: taskStatus.result
  }
}
