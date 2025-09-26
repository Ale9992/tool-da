import { DSAProfile } from '@/types'

export const DSA_PROFILES: DSAProfile[] = [
  {
    id: 'base',
    name: 'DSA Base',
    description: 'Profilo base per la leggibilità DSA',
    font: 'Atkinson Hyperlegible',
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 68,
    textAlign: 'left',
    backgroundColor: '#F7F3E8',
    textColor: '#111111',
    paragraphSpacing: 8,
    linkColor: '#2563EB'
  },
  {
    id: 'high-readability',
    name: 'Alta Leggibilità',
    description: 'Profilo ottimizzato per massima leggibilità',
    font: 'Atkinson Hyperlegible',
    fontSize: 18,
    lineHeight: 1.75,
    maxWidth: 62,
    textAlign: 'left',
    backgroundColor: '#F7F3E8',
    textColor: '#111111',
    paragraphSpacing: 12,
    linkColor: '#2563EB'
  },
  {
    id: 'pastel',
    name: 'Pastello',
    description: 'Profilo con colori più tenui e rilassanti',
    font: 'Atkinson Hyperlegible',
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 68,
    textAlign: 'left',
    backgroundColor: '#F2EDE6',
    textColor: '#2D2D2D',
    paragraphSpacing: 8,
    linkColor: '#7C3AED'
  },
  {
    id: 'opendyslexic',
    name: 'OpenDyslexic',
    description: 'Profilo con font OpenDyslexic per dislessia',
    font: 'OpenDyslexic',
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 68,
    textAlign: 'left',
    backgroundColor: '#F7F3E8',
    textColor: '#111111',
    paragraphSpacing: 8,
    linkColor: '#2563EB'
  }
]

export const getDefaultProfile = (): DSAProfile => DSA_PROFILES[0]
