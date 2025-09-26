import { useCallback } from 'react'
import { FolderOpen } from 'lucide-react'
import { DSAProfile } from '@/types'
import { DSA_PROFILES } from '@/utils/dsaProfiles'

interface SettingsPanelProps {
  selectedProfile: DSAProfile
  onProfileChange: (profile: DSAProfile) => void
  outputDirectory: string
  onOutputDirectoryChange: (directory: string) => void
  outputFormats: ('docx' | 'pdf' | 'epub')[]
  onOutputFormatsChange: (formats: ('docx' | 'pdf' | 'epub')[]) => void
}

export function SettingsPanel({
  selectedProfile,
  onProfileChange,
  outputDirectory,
  onOutputDirectoryChange,
  outputFormats,
  onOutputFormatsChange
}: SettingsPanelProps) {
  const handleSelectOutputDirectory = useCallback(async () => {
    try {
      const directory = await window.electronAPI.selectOutputDirectory()
      if (directory) {
        onOutputDirectoryChange(directory)
      }
    } catch (error) {
      console.error('Errore nella selezione directory:', error)
    }
  }, [onOutputDirectoryChange])

  const handleFormatToggle = useCallback((format: 'docx' | 'pdf' | 'epub') => {
    if (outputFormats.includes(format)) {
      onOutputFormatsChange(outputFormats.filter(f => f !== format))
    } else {
      onOutputFormatsChange([...outputFormats, format])
    }
  }, [outputFormats, onOutputFormatsChange])

  const getFormatLabel = (format: 'docx' | 'pdf' | 'epub') => {
    switch (format) {
      case 'docx': return 'Word (DOCX)'
      case 'pdf': return 'PDF'
      case 'epub': return 'ePub'
    }
  }

  return (
    <div className="space-y-6">
      {/* Profilo DSA */}
      <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profilo DSA</h3>
            <p className="text-sm text-gray-600">Scegli il profilo di accessibilità</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {DSA_PROFILES.map((profile) => (
            <label
              key={profile.id}
              className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedProfile.id === profile.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="dsa-profile"
                value={profile.id}
                checked={selectedProfile.id === profile.id}
                onChange={() => onProfileChange(profile)}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-gray-900">{profile.name}</div>
                <div className="text-sm text-gray-600 mt-1">{profile.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Font: {profile.font} • {profile.fontSize}px • Line-height: {profile.lineHeight}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Directory di output */}
      <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Directory di Output</h3>
            <p className="text-sm text-gray-600">Scegli dove salvare i file</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleSelectOutputDirectory}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-left"
          >
            {outputDirectory ? (
              <div>
                <div className="text-sm font-medium text-gray-900">Directory selezionata:</div>
                <div className="text-xs text-gray-600 mt-1 truncate">{outputDirectory}</div>
              </div>
            ) : (
              <div className="text-gray-500">Seleziona directory di output</div>
            )}
          </button>
        </div>
      </div>

      {/* Formati di output */}
      <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Formati di Output</h3>
            <p className="text-sm text-gray-600">Scegli i formati di esportazione</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {(['docx', 'pdf', 'epub'] as const).map((format) => (
            <label
              key={format}
              className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                outputFormats.includes(format)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={outputFormats.includes(format)}
                onChange={() => handleFormatToggle(format)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">{getFormatLabel(format)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Anteprima profilo */}
      <div className="bg-white rounded-2xl shadow-dsa hover:shadow-dsa-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Anteprima</h3>
            <p className="text-sm text-gray-600">Come apparirà il testo</p>
          </div>
        </div>
        
        <div
          className="p-6 rounded-xl border-2 border-gray-200 shadow-sm"
          style={{
            fontFamily: selectedProfile.font,
            fontSize: `${selectedProfile.fontSize}px`,
            lineHeight: selectedProfile.lineHeight,
            maxWidth: `${selectedProfile.maxWidth}ch`,
            textAlign: selectedProfile.textAlign,
            backgroundColor: selectedProfile.backgroundColor,
            color: selectedProfile.textColor,
            marginBottom: `${selectedProfile.paragraphSpacing}px`
          }}
        >
          <h2 style={{ fontSize: `${selectedProfile.fontSize * 1.5}px`, fontWeight: 'bold', marginBottom: '16px' }}>
            Titolo di esempio
          </h2>
          <p style={{ marginBottom: `${selectedProfile.paragraphSpacing}px` }}>
            Questo è un paragrafo di esempio per mostrare come apparirà il testo con il profilo DSA selezionato. 
            Il testo è ottimizzato per la leggibilità e segue le linee guida per l'accessibilità.
          </p>
          <p>
            Un secondo paragrafo per mostrare la spaziatura tra i paragrafi e come il testo fluisce 
            naturalmente con le impostazioni scelte.
          </p>
        </div>
      </div>
    </div>
  )
}
