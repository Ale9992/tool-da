from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import os
import tempfile
import shutil
from pathlib import Path
import uuid
import json

from src.pdf_processor import PDFProcessor
from src.text_normalizer import TextNormalizer
from src.structure_reconstructor import StructureReconstructor
from src.export_manager import ExportManager
from src.models import ProcessingJob, ProcessingOptions, DSAProfile, PDFInfo

app = FastAPI(title="PDF DSA Converter API", version="1.0.0")

# CORS middleware per comunicazione con Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inizializza i componenti
pdf_processor = PDFProcessor()
text_normalizer = TextNormalizer()
structure_reconstructor = StructureReconstructor()
export_manager = ExportManager()

# Store per i job in corso
processing_jobs: Dict[str, ProcessingJob] = {}

class ProcessingRequest(BaseModel):
    file_path: str
    options: ProcessingOptions

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    error: Optional[str] = None
    output_files: Optional[List[str]] = None

@app.get("/")
async def root():
    return {"message": "PDF DSA Converter API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "components": {
        "pdf_processor": "ready",
        "text_normalizer": "ready", 
        "structure_reconstructor": "ready",
        "export_manager": "ready"
    }}

@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    """Analizza un PDF per determinare se è nativo o scannerizzato"""
    try:
        # Salva il file temporaneamente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Analizza il PDF
        pdf_info = await pdf_processor.analyze_pdf(tmp_file_path)
        
        # Pulisci il file temporaneo
        os.unlink(tmp_file_path)
        
        return pdf_info.dict()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nell'analisi del PDF: {str(e)}")

@app.post("/process-pdf")
async def process_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    options: str = None
):
    """Avvia l'elaborazione di un PDF"""
    try:
        # Parse delle opzioni
        processing_options = ProcessingOptions.parse_raw(options) if options else ProcessingOptions()
        
        # Genera ID job
        job_id = str(uuid.uuid4())
        
        # Salva il file temporaneamente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Crea il job
        job = ProcessingJob(
            id=job_id,
            file_path=tmp_file_path,
            file_name=file.filename,
            status="pending",
            progress=0
        )
        
        processing_jobs[job_id] = job
        
        # Avvia l'elaborazione in background
        background_tasks.add_task(process_pdf_background, job_id, processing_options)
        
        return {"job_id": job_id, "status": "started"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nell'avvio dell'elaborazione: {str(e)}")

async def process_pdf_background(job_id: str, options: ProcessingOptions):
    """Elabora un PDF in background"""
    try:
        job = processing_jobs[job_id]
        job.status = "processing"
        job.progress = 10
        
        # 1. Analizza il PDF
        pdf_info = await pdf_processor.analyze_pdf(job.file_path)
        job.progress = 20
        
        # 2. Estrai il testo
        if pdf_info.is_native:
            text_content = await pdf_processor.extract_text_native(job.file_path)
        else:
            text_content = await pdf_processor.extract_text_ocr(
                job.file_path, 
                language=options.ocr_language,
                enable_deskew=options.enable_deskew,
                enable_denoise=options.enable_denoise
            )
        job.progress = 50
        
        # 3. Normalizza il testo
        normalized_text = await text_normalizer.normalize_text(text_content)
        job.progress = 70
        
        # 4. Ricostruisci la struttura
        structured_content = await structure_reconstructor.reconstruct_structure(normalized_text)
        job.progress = 80
        
        # 5. Esporta nei formati richiesti
        output_files = []
        for format_type in options.output_formats:
            output_path = await export_manager.export_document(
                structured_content,
                options.dsa_profile,
                format_type,
                options.output_directory,
                job.file_name
            )
            output_files.append(output_path)
        
        job.progress = 100
        job.status = "completed"
        job.output_files = output_files
        
        # Pulisci il file temporaneo
        if os.path.exists(job.file_path):
            os.unlink(job.file_path)
    
    except Exception as e:
        job = processing_jobs[job_id]
        job.status = "error"
        job.error = str(e)
        
        # Pulisci il file temporaneo
        if os.path.exists(job.file_path):
            os.unlink(job.file_path)

@app.get("/job-status/{job_id}")
async def get_job_status(job_id: str):
    """Ottieni lo stato di un job"""
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job non trovato")
    
    job = processing_jobs[job_id]
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        error=job.error,
        output_files=job.output_files
    )

@app.get("/jobs")
async def list_jobs():
    """Lista tutti i job"""
    return [job.dict() for job in processing_jobs.values()]

@app.delete("/job/{job_id}")
async def delete_job(job_id: str):
    """Elimina un job"""
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job non trovato")
    
    job = processing_jobs[job_id]
    
    # Pulisci il file temporaneo se esiste
    if os.path.exists(job.file_path):
        os.unlink(job.file_path)
    
    del processing_jobs[job_id]
    return {"message": "Job eliminato"}

@app.get("/dsa-profiles")
async def get_dsa_profiles():
    """Ottieni i profili DSA disponibili"""
    return [
        {
            "id": "base",
            "name": "DSA Base",
            "description": "Profilo base per la leggibilità DSA",
            "font": "Atkinson Hyperlegible",
            "fontSize": 16,
            "lineHeight": 1.6,
            "maxWidth": 68,
            "textAlign": "left",
            "backgroundColor": "#F7F3E8",
            "textColor": "#111111",
            "paragraphSpacing": 8,
            "linkColor": "#2563EB"
        },
        {
            "id": "high-readability",
            "name": "Alta Leggibilità",
            "description": "Profilo ottimizzato per massima leggibilità",
            "font": "Atkinson Hyperlegible",
            "fontSize": 18,
            "lineHeight": 1.75,
            "maxWidth": 62,
            "textAlign": "left",
            "backgroundColor": "#F7F3E8",
            "textColor": "#111111",
            "paragraphSpacing": 12,
            "linkColor": "#2563EB"
        },
        {
            "id": "pastel",
            "name": "Pastello",
            "description": "Profilo con colori più tenui e rilassanti",
            "font": "Atkinson Hyperlegible",
            "fontSize": 16,
            "lineHeight": 1.6,
            "maxWidth": 68,
            "textAlign": "left",
            "backgroundColor": "#F2EDE6",
            "textColor": "#2D2D2D",
            "paragraphSpacing": 8,
            "linkColor": "#7C3AED"
        },
        {
            "id": "opendyslexic",
            "name": "OpenDyslexic",
            "description": "Profilo con font OpenDyslexic per dislessia",
            "font": "OpenDyslexic",
            "fontSize": 16,
            "lineHeight": 1.6,
            "maxWidth": 68,
            "textAlign": "left",
            "backgroundColor": "#F7F3E8",
            "textColor": "#111111",
            "paragraphSpacing": 8,
            "linkColor": "#2563EB"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
