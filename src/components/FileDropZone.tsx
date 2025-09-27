import React, { useCallback, useState } from 'react'
import { Upload, FileText, Plus } from 'lucide-react'

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function FileDropZone({ onFilesSelected }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    )
    
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }, [onFilesSelected])

  const handleFileSelect = useCallback(async () => {
    try {
      const selectedFiles = await window.electronAPI.selectFiles()
      if (selectedFiles.length > 0) {
        const files = selectedFiles.map(fileData => {
          const binaryString = atob(fileData.data)
          const bytes = new Uint8Array(binaryString.length)

          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          const file = new File([bytes], fileData.name, { type: fileData.type })

          Object.defineProperty(file, 'path', {
            value: fileData.path,
            configurable: false,
            enumerable: false,
            writable: false
          })

          return file
        })
        onFilesSelected(files)
      }
    } catch (error) {
      console.error('Errore nella selezione file:', error)
    }
  }, [onFilesSelected])

  return (
    <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100 p-8">
      <div
        className={`relative transition-all duration-300 ${
          isDragOver 
            ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 scale-105' 
            : 'border-2 border-dashed border-gray-200 hover:border-gray-300'
        } rounded-2xl p-12 text-center group`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="20" cy="20" r="2" />
            <circle cx="80" cy="20" r="2" />
            <circle cx="20" cy="80" r="2" />
            <circle cx="80" cy="80" r="2" />
            <circle cx="50" cy="50" r="1" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Carica i tuoi PDF
            </h3>
            <p className="text-gray-600 mb-6">
              Trascina i file qui oppure clicca per selezionare
            </p>
            
            <button
              onClick={handleFileSelect}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Seleziona File</span>
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Supporta PDF nativi e scannerizzati</span>
          </div>
        </div>
      </div>
    </div>
  )
}
