export interface DSAProfile {
  id: string
  name: string
  description: string
  font: string
  fontSize: number
  lineHeight: number
  maxWidth: number
  textAlign: 'left' | 'center' | 'justify'
  backgroundColor: string
  textColor: string
  paragraphSpacing: number
  linkColor: string
}

export interface ProcessingJob {
  id: string
  filePath: string
  fileName: string
  file?: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  outputFiles?: string[]
}

export interface ProcessingOptions {
  dsaProfile: DSAProfile
  outputFormats: ('docx' | 'pdf' | 'epub')[]
  outputDirectory: string
  ocrLanguage: 'ita' | 'eng' | 'ita+eng'
  enableDeskew: boolean
  enableDenoise: boolean
}

export interface PDFInfo {
  isNative: boolean
  pageCount: number
  hasText: boolean
  estimatedScanQuality: 'low' | 'medium' | 'high'
}
