# PDF DSA Converter

Un'app desktop multipiattaforma per convertire PDF in formato DSA-friendly, completamente offline.

## Caratteristiche

- ✅ **100% Offline**: Nessuna connessione internet richiesta
- ✅ **Multipiattaforma**: Windows, macOS, Linux
- ✅ **OCR Locale**: Tesseract integrato per PDF scannerizzati
- ✅ **Profili DSA**: Font e stili ottimizzati per la leggibilità
- ✅ **Multi-formato**: Export in DOCX, PDF, ePub
- ✅ **Batch Processing**: Elaborazione multipla di documenti
- ✅ **Drag & Drop**: Interfaccia intuitiva

## Profili DSA Inclusi

1. **DSA Base**: Profilo standard con font Atkinson Hyperlegible
2. **Alta Leggibilità**: Ottimizzato per massima leggibilità
3. **Pastello**: Colori tenui e rilassanti
4. **OpenDyslexic**: Font specifico per dislessia

## Tecnologie

### Frontend
- **Electron 30+**: Framework desktop
- **React 18**: Interfaccia utente
- **TypeScript**: Type safety
- **TailwindCSS**: Styling moderno

### Backend
- **Python 3.11**: Elaborazione documenti
- **FastAPI**: API REST
- **Tesseract**: OCR locale
- **Poppler**: Conversione PDF→immagini
- **WeasyPrint**: Generazione PDF
- **python-docx**: Export Word
- **ebooklib**: Export ePub

## Installazione

### Prerequisiti

- Node.js 18+
- Python 3.11+
- Git

### Setup Sviluppo

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd pdf-dsa-converter
   ```

2. **Installa dipendenze frontend**
   ```bash
   npm install
   ```

3. **Installa dipendenze backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Scarica binari (Tesseract, Poppler, Font)**
   ```bash
   ./scripts/download-binaries.sh
   ```

5. **Avvia in modalità sviluppo**
   ```bash
   npm run dev
   ```

### Build per Produzione

```bash
# Build completo
npm run build

# Distribuzione per piattaforma specifica
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

## Utilizzo

1. **Avvia l'applicazione**
2. **Seleziona o trascina i PDF** da convertire
3. **Scegli il profilo DSA** più adatto
4. **Seleziona i formati di output** (DOCX, PDF, ePub)
5. **Scegli la directory di output**
6. **Avvia la conversione**

## API Backend

L'app include un'API REST per l'elaborazione:

- `POST /analyze-pdf`: Analizza un PDF
- `POST /process-pdf`: Avvia l'elaborazione
- `GET /job-status/{job_id}`: Stato di un job
- `GET /dsa-profiles`: Profili DSA disponibili

## Struttura Progetto

```
pdf-dsa-converter/
├── src/                    # Frontend Electron
│   ├── components/         # Componenti React
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── backend/               # Backend Python
│   ├── src/               # Codice sorgente
│   └── requirements.txt   # Dipendenze Python
├── binaries/              # Binari esterni
│   ├── tesseract/         # Tesseract OCR
│   └── poppler/           # Poppler utils
├── assets/                # Risorse
│   ├── fonts/             # Font DSA
│   └── templates/         # Template export
└── scripts/               # Script di setup
```

## Personalizzazione

### Aggiungere Nuovi Profili DSA

Modifica `src/utils/dsaProfiles.ts` per aggiungere nuovi profili:

```typescript
{
  id: 'custom',
  name: 'Profilo Personalizzato',
  description: 'Descrizione del profilo',
  font: 'Font Name',
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 68,
  textAlign: 'left',
  backgroundColor: '#F7F3E8',
  textColor: '#111111',
  paragraphSpacing: 8,
  linkColor: '#2563EB'
}
```

### Configurare Nuovi Formati Export

Estendi `ExportManager` in `backend/src/export_manager.py` per aggiungere nuovi formati.

## Risoluzione Problemi

### OCR Non Funziona
- Verifica che Tesseract sia installato correttamente
- Controlla che i traineddata (ita, eng) siano presenti
- Assicurati che Poppler sia configurato per pdf2image

### Font Non Caricati
- Verifica che i font siano nella directory `assets/fonts/`
- Controlla i percorsi nei file CSS

### Errori di Build
- Assicurati che tutte le dipendenze siano installate
- Verifica che i binari siano presenti in `binaries/`

## Licenza

MIT License - Vedi file LICENSE per dettagli.

## Contributi

I contributi sono benvenuti! Per favore:

1. Fork del repository
2. Crea un branch per la feature
3. Commit delle modifiche
4. Push al branch
5. Apri una Pull Request

## Supporto

Per problemi o domande:
- Apri una Issue su GitHub
- Contatta il team di sviluppo

---

**PDF DSA Converter** - Rendere i documenti accessibili a tutti.
# tool-da
