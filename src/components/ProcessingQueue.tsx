// import React from 'react' // Non necessario in React 17+
import { X, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react'
import { ProcessingJob } from '@/types'

interface ProcessingQueueProps {
  jobs: ProcessingJob[]
  onRemoveJob: (jobId: string) => void
  onClearCompleted: () => void
}

export function ProcessingQueue({ jobs, onRemoveJob, onClearCompleted }: ProcessingQueueProps) {
  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return 'Completato'
      case 'error':
        return 'Errore'
      case 'processing':
        return 'Elaborazione...'
      default:
        return 'In attesa'
    }
  }

  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun file in elaborazione</h3>
          <p className="text-gray-500">Trascina o seleziona i tuoi PDF per iniziare</p>
        </div>
      </div>
    )
  }

  const completedJobs = jobs.filter(job => job.status === 'completed')
  const hasCompletedJobs = completedJobs.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Coda di Elaborazione
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {jobs.length} file{jobs.length !== 1 ? 's' : ''} in coda
            </p>
          </div>
          {hasCompletedJobs && (
            <button
              onClick={onClearCompleted}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Pulisci completati</span>
            </button>
          )}
        </div>
      </div>

      <div className="divide-y">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`p-4 ${getStatusColor(job.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(job.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {job.fileName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {getStatusText(job.status)}
                    </span>
                    {job.status === 'processing' && (
                      <span className="text-xs text-gray-500">
                        {job.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {job.status === 'processing' && (
                <div className="w-24 ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {job.status !== 'processing' && (
                <button
                  onClick={() => onRemoveJob(job.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {job.error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                {job.error}
              </div>
            )}

            {job.outputFiles && job.outputFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">File generati:</p>
                <div className="space-y-1">
                  {job.outputFiles.map((file, index) => (
                    <div key={index} className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
