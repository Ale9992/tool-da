import asyncio
import os
import tempfile
from pathlib import Path
from typing import List, Optional
import pdfplumber
import pdfminer
from pdfminer.high_level import extract_text as pdfminer_extract_text
from pdf2image import convert_from_path
import pytesseract
import cv2
import numpy as np
from PIL import Image
import logging

from .models import PDFInfo

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self):
        # Configura Tesseract per usare i binari bundled
        self.tesseract_path = self._get_tesseract_path()
        if self.tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_path
        
        # Configura Poppler per pdf2image
        self.poppler_path = self._get_poppler_path()
    
    def _get_tesseract_path(self) -> Optional[str]:
        """Trova il percorso di Tesseract bundled"""
        base_path = Path(__file__).parent.parent.parent / "binaries"
        
        if os.name == 'nt':  # Windows
            return str(base_path / "tesseract" / "tesseract.exe")
        elif os.name == 'posix':  # macOS/Linux
            return str(base_path / "tesseract" / "tesseract")
        
        return None
    
    def _get_poppler_path(self) -> Optional[str]:
        """Trova il percorso di Poppler bundled"""
        base_path = Path(__file__).parent.parent.parent / "binaries"
        
        if os.name == 'nt':  # Windows
            return str(base_path / "poppler" / "bin")
        elif os.name == 'posix':  # macOS/Linux
            return str(base_path / "poppler" / "bin")
        
        return None
    
    async def analyze_pdf(self, pdf_path: str) -> PDFInfo:
        """Analizza un PDF per determinare se è nativo o scannerizzato"""
        try:
            # Conta le pagine
            with pdfplumber.open(pdf_path) as pdf:
                page_count = len(pdf.pages)
            
            # Prova ad estrarre testo nativo
            try:
                native_text = pdfminer_extract_text(pdf_path)
                has_text = len(native_text.strip()) > 0
                
                # Se c'è poco testo, probabilmente è scannerizzato
                if has_text and len(native_text.strip()) < 100:
                    has_text = False
                
            except Exception:
                has_text = False
            
            # Determina se è nativo o scannerizzato
            is_native = has_text and len(native_text.strip()) > 200
            
            # Stima la qualità dello scan (semplificato)
            estimated_scan_quality = 'medium'
            if not is_native:
                # Converti una pagina in immagine per analizzare la qualità
                try:
                    images = convert_from_path(
                        pdf_path, 
                        first_page=1, 
                        last_page=1,
                        poppler_path=self.poppler_path
                    )
                    if images:
                        img = np.array(images[0])
                        # Analisi semplificata della qualità
                        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
                        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
                        
                        if blur > 1000:
                            estimated_scan_quality = 'high'
                        elif blur > 500:
                            estimated_scan_quality = 'medium'
                        else:
                            estimated_scan_quality = 'low'
                except Exception as e:
                    logger.warning(f"Errore nell'analisi della qualità: {e}")
                    estimated_scan_quality = 'medium'
            
            return PDFInfo(
                is_native=is_native,
                page_count=page_count,
                has_text=has_text,
                estimated_scan_quality=estimated_scan_quality
            )
            
        except Exception as e:
            logger.error(f"Errore nell'analisi del PDF: {e}")
            raise
    
    async def extract_text_native(self, pdf_path: str) -> str:
        """Estrae testo da PDF nativo"""
        try:
            # Prova prima con pdfplumber (migliore per layout complessi)
            text_parts = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            
            if text_parts:
                return '\n\n'.join(text_parts)
            
            # Fallback a pdfminer
            return pdfminer_extract_text(pdf_path)
            
        except Exception as e:
            logger.error(f"Errore nell'estrazione testo nativo: {e}")
            raise
    
    async def extract_text_ocr(
        self, 
        pdf_path: str, 
        language: str = 'ita+eng',
        enable_deskew: bool = True,
        enable_denoise: bool = True
    ) -> str:
        """Estrae testo da PDF scannerizzato usando OCR"""
        try:
            # Converti PDF in immagini
            images = convert_from_path(
                pdf_path,
                poppler_path=self.poppler_path,
                dpi=300  # DPI ottimale per OCR
            )
            
            text_parts = []
            
            for i, image in enumerate(images):
                # Preprocessa l'immagine
                processed_image = await self._preprocess_image(
                    image, 
                    enable_deskew=enable_deskew,
                    enable_denoise=enable_denoise
                )
                
                # OCR
                page_text = pytesseract.image_to_string(
                    processed_image,
                    lang=language,
                    config='--psm 1'  # Automatic page segmentation with OSD
                )
                
                if page_text.strip():
                    text_parts.append(page_text.strip())
                
                logger.info(f"Elaborata pagina {i+1}/{len(images)}")
            
            return '\n\n'.join(text_parts)
            
        except Exception as e:
            logger.error(f"Errore nell'OCR: {e}")
            raise
    
    async def _preprocess_image(
        self, 
        image: Image.Image, 
        enable_deskew: bool = True,
        enable_denoise: bool = True
    ) -> Image.Image:
        """Preprocessa un'immagine per migliorare l'OCR"""
        # Converti PIL a OpenCV
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Converti in scala di grigi
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Denoise
        if enable_denoise:
            gray = cv2.medianBlur(gray, 3)
            gray = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Deskew (raddrizzamento)
        if enable_deskew:
            gray = self._deskew_image(gray)
        
        # Migliora il contrasto
        gray = cv2.equalizeHist(gray)
        
        # Binarizzazione
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Converti di nuovo in PIL
        return Image.fromarray(binary)
    
    def _deskew_image(self, image: np.ndarray) -> np.ndarray:
        """Raddrizza un'immagine ruotata"""
        try:
            # Trova i contorni
            coords = np.column_stack(np.where(image > 0))
            
            if len(coords) == 0:
                return image
            
            # Calcola l'angolo di rotazione
            angle = cv2.minAreaRect(coords)[-1]
            
            # Correggi l'angolo
            if angle < -45:
                angle = 90 + angle
            
            # Ruota l'immagine se l'angolo è significativo
            if abs(angle) > 0.5:
                (h, w) = image.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                image = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            
            return image
            
        except Exception as e:
            logger.warning(f"Errore nel deskew: {e}")
            return image
