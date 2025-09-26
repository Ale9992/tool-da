from pydantic import BaseModel
from typing import List, Optional, Literal
from enum import Enum

class DSAProfile(BaseModel):
    id: str
    name: str
    description: str
    font: str
    fontSize: int
    lineHeight: float
    maxWidth: int
    textAlign: Literal['left', 'center', 'justify']
    backgroundColor: str
    textColor: str
    paragraphSpacing: int
    linkColor: str

class ProcessingJob(BaseModel):
    id: str
    file_path: str
    file_name: str
    status: Literal['pending', 'processing', 'completed', 'error']
    progress: int
    error: Optional[str] = None
    output_files: Optional[List[str]] = None

class ProcessingOptions(BaseModel):
    dsa_profile: DSAProfile
    output_formats: List[Literal['docx', 'pdf', 'epub']]
    output_directory: str
    ocr_language: Literal['ita', 'eng', 'ita+eng'] = 'ita+eng'
    enable_deskew: bool = True
    enable_denoise: bool = True

class PDFInfo(BaseModel):
    is_native: bool
    page_count: int
    has_text: bool
    estimated_scan_quality: Literal['low', 'medium', 'high']

class TextContent(BaseModel):
    raw_text: str
    normalized_text: str
    structured_content: dict
    metadata: dict

class ExportResult(BaseModel):
    format_type: str
    output_path: str
    file_size: int
    success: bool
    error: Optional[str] = None
