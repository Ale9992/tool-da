const API_BASE_URL = 'http://localhost:8000'

import { ProcessingJob, DSAProfile } from '@/types'

export interface ProcessingOptions {
  dsa_profile: DSAProfile
  output_formats: ('docx' | 'pdf' | 'epub')[]
  output_directory: string
  ocr_language: 'ita' | 'eng' | 'ita+eng'
  enable_deskew: boolean
  enable_denoise: boolean
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async getHealth() {
    return this.request<{ status: string; components: any }>('/health')
  }

  async getDSAProfiles() {
    return this.request<DSAProfile[]>('/dsa-profiles')
  }

  async processPDF(file: File, options: ProcessingOptions): Promise<{ job_id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))

    const response = await fetch(`${API_BASE_URL}/process-pdf`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob> {
    return this.request<ProcessingJob>(`/job-status/${jobId}`)
  }

  async deleteJob(jobId: string) {
    return this.request(`/job/${jobId}`, { method: 'DELETE' })
  }
}

export const apiService = new ApiService()
