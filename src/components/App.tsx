import { useState, useCallback, useEffect } from 'react'
import { FileDropZone } from './FileDropZone'
import { ProcessingQueue } from './ProcessingQueue'
import { SettingsPanel } from './SettingsPanel'
import { DSAProfile, ProcessingJob } from '@/types'
import { getDefaultProfile } from '@/utils/dsaProfiles'
import { apiService, ProcessingOptions } from '@/utils/api'

export default function App() {
  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [selectedProfile, setSelectedProfile] = useState<DSAProfile>(getDefaultProfile())
  const [outputDirectory, setOutputDirectory] = useState<string>('')
  const [outputFormats, setOutputFormats] = useState<('docx' | 'pdf' | 'epub')[]>(['docx'])
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiConnected, setApiConnected] = useState(false)

  // Verifica connessione API all'avvio
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        await apiService.getHealth()
        setApiConnected(true)
        console.log('✅ API connessa')
      } catch (error) {
        setApiConnected(false)
        console.error('❌ API non connessa:', error)
      }
    }
    
    checkApiConnection()
  }, [])

  const handleFilesSelected = useCallback((files: File[]) => {
    const newJobs: ProcessingJob[] = files.map((file, index) => ({
      id: `job-${Date.now()}-${index}`,
      filePath: file.path || file.name,
      fileName: file.name,
      status: 'pending',
      progress: 0
    }))
    
    setJobs(prev => [...prev, ...newJobs])
  }, [])

  const handleStartProcessing = useCallback(async () => {
    if (jobs.length === 0 || !outputDirectory) return

    setIsProcessing(true)
    
    const options: ProcessingOptions = {
      dsa_profile: selectedProfile,
      output_formats: outputFormats,
      output_directory: outputDirectory,
      ocr_language: 'ita+eng',
      enable_deskew: true,
      enable_denoise: true
    }

    try {
      // Processa ogni job
      for (const job of jobs) {
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'processing' } : j
        ))

        try {
          // Crea un File object dal percorso (per ora simulato)
          const file = new File([''], job.fileName, { type: 'application/pdf' })
          
          // Avvia il processing
          const result = await apiService.processPDF(file, options)
          
          // Polling per lo stato del job
          const pollJobStatus = async () => {
            const status = await apiService.getJobStatus(result.job_id)
            
            setJobs(prev => prev.map(j => 
              j.id === job.id ? { ...j, ...status } : j
            ))

            if (status.status === 'processing') {
              setTimeout(pollJobStatus, 1000) // Poll ogni secondo
            }
          }
          
          pollJobStatus()
          
        } catch (error) {
          console.error('Errore nel processing del job:', error)
          setJobs(prev => prev.map(j => 
            j.id === job.id ? { ...j, status: 'error', error: String(error) } : j
          ))
        }
      }
    } catch (error) {
      console.error('Errore durante il processing:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [jobs, selectedProfile, outputFormats, outputDirectory])

  const handleRemoveJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId))
  }, [])

  const handleClearCompleted = useCallback(() => {
    setJobs(prev => prev.filter(job => job.status !== 'completed'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header moderno con glassmorphism */}
      <header className="bg-white/25 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDF DSA Converter
                </h1>
                <p className="text-sm text-gray-600">Trasforma i tuoi PDF in formato DSA-friendly</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status API */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/50 backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-700">
                  {apiConnected ? 'API Connessa' : 'API Disconnessa'}
                </span>
              </div>
              
              {/* Pulsante principale */}
              <button
                onClick={handleStartProcessing}
                disabled={jobs.length === 0 || !outputDirectory || isProcessing || !apiConnected}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Elaborazione...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Avvia Conversione</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content con layout moderno */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Area principale - File Drop e Queue */}
          <div className="xl:col-span-2 space-y-6">
            <FileDropZone onFilesSelected={handleFilesSelected} />
            <ProcessingQueue 
              jobs={jobs}
              onRemoveJob={handleRemoveJob}
              onClearCompleted={handleClearCompleted}
            />
          </div>
          
          {/* Sidebar - Settings */}
          <div className="space-y-6">
            <SettingsPanel
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              outputDirectory={outputDirectory}
              onOutputDirectoryChange={setOutputDirectory}
              outputFormats={outputFormats}
              onOutputFormatsChange={setOutputFormats}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
