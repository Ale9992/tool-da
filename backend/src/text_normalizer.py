import re
import ftfy
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class TextNormalizer:
    def __init__(self):
        # Pattern per sillabazioni
        self.hyphenation_pattern = re.compile(r'(\w+)-\s*\n\s*(\w+)', re.MULTILINE)
        
        # Pattern per legature comuni
        self.ligature_patterns = [
            (r'ﬁ', 'fi'),
            (r'ﬂ', 'fl'),
            (r'ﬀ', 'ff'),
            (r'ﬃ', 'ffi'),
            (r'ﬄ', 'ffl'),
            (r'ﬆ', 'st'),
            (r'ﬅ', 'ft'),
            (r'ﬄ', 'ffl'),
            (r'ﬄ', 'ffl'),
        ]
        
        # Pattern per spazi multipli
        self.multiple_spaces_pattern = re.compile(r'\s+')
        
        # Pattern per righe vuote multiple
        self.multiple_newlines_pattern = re.compile(r'\n\s*\n\s*\n+')
        
        # Pattern per caratteri di controllo
        self.control_chars_pattern = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]')
        
        # Pattern per spazi a fine riga
        self.trailing_spaces_pattern = re.compile(r'[ \t]+$', re.MULTILINE)
        
        # Pattern per spazi all'inizio della riga
        self.leading_spaces_pattern = re.compile(r'^[ \t]+', re.MULTILINE)
    
    async def normalize_text(self, text: str) -> str:
        """Normalizza il testo per la leggibilità DSA"""
        try:
            logger.info("Inizio normalizzazione testo")
            
            # 1. Fix encoding issues
            text = ftfy.fix_text(text)
            
            # 2. Rimuovi caratteri di controllo
            text = self.control_chars_pattern.sub('', text)
            
            # 3. Unisci sillabazioni
            text = self._fix_hyphenations(text)
            
            # 4. Sostituisci legature
            text = self._fix_ligatures(text)
            
            # 5. Normalizza spazi
            text = self._normalize_spaces(text)
            
            # 6. Normalizza righe vuote
            text = self._normalize_newlines(text)
            
            # 7. Pulisci spazi finali e iniziali
            text = self.trailing_spaces_pattern.sub('', text)
            text = self.leading_spaces_pattern.sub('', text)
            
            # 8. Normalizza punteggiatura
            text = self._normalize_punctuation(text)
            
            logger.info("Normalizzazione testo completata")
            return text.strip()
            
        except Exception as e:
            logger.error(f"Errore nella normalizzazione: {e}")
            raise
    
    def _fix_hyphenations(self, text: str) -> str:
        """Unisce le sillabazioni spezzate su più righe"""
        # Pattern per sillabazioni comuni
        patterns = [
            # Sillabazione semplice: parola-\nparola
            (r'(\w+)-\s*\n\s*(\w+)', r'\1\2'),
            # Sillabazione con spazi: parola -\n parola
            (r'(\w+)\s*-\s*\n\s*(\w+)', r'\1\2'),
            # Sillabazione a fine pagina (con trattino a inizio riga)
            (r'(\w+)\s*\n\s*-(\w+)', r'\1\2'),
        ]
        
        for pattern, replacement in patterns:
            text = re.sub(pattern, replacement, text, flags=re.MULTILINE)
        
        return text
    
    def _fix_ligatures(self, text: str) -> str:
        """Sostituisce le legature tipografiche con caratteri normali"""
        for ligature, replacement in self.ligature_patterns:
            text = text.replace(ligature, replacement)
        return text
    
    def _normalize_spaces(self, text: str) -> str:
        """Normalizza gli spazi multipli"""
        # Sostituisci spazi multipli con uno spazio singolo
        text = self.multiple_spaces_pattern.sub(' ', text)
        
        # Mantieni un solo spazio dopo la punteggiatura
        text = re.sub(r'([.!?])\s+', r'\1 ', text)
        
        # Mantieni un solo spazio prima della punteggiatura
        text = re.sub(r'\s+([.!?,:;])', r'\1', text)
        
        return text
    
    def _normalize_newlines(self, text: str) -> str:
        """Normalizza le righe vuote multiple"""
        # Sostituisci righe vuote multiple con massimo due righe vuote
        text = self.multiple_newlines_pattern.sub('\n\n', text)
        
        # Rimuovi righe vuote all'inizio e alla fine
        text = text.strip()
        
        return text
    
    def _normalize_punctuation(self, text: str) -> str:
        """Normalizza la punteggiatura"""
        # Sostituisci virgolette tipografiche con virgolette normali
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace(''', "'").replace(''', "'")
        
        # Sostituisci trattini lunghi con trattini normali
        text = text.replace('—', '-').replace('–', '-')
        
        # Normalizza spazi prima e dopo la punteggiatura
        text = re.sub(r'\s+([.!?,:;])', r'\1', text)
        text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', text)
        
        return text
    
    def _detect_language(self, text: str) -> str:
        """Rileva la lingua del testo (semplificato)"""
        # Conta caratteri italiani comuni
        italian_chars = len(re.findall(r'[àèéìíîòóùú]', text, re.IGNORECASE))
        english_chars = len(re.findall(r'[th]', text, re.IGNORECASE))
        
        if italian_chars > english_chars:
            return 'ita'
        else:
            return 'eng'
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Divide il testo in frasi"""
        # Pattern per fine frase
        sentence_endings = re.compile(r'[.!?]+\s+')
        
        sentences = sentence_endings.split(text)
        
        # Ricostruisci le frasi con la punteggiatura
        result = []
        for i, sentence in enumerate(sentences):
            if sentence.strip():
                # Aggiungi la punteggiatura se non è l'ultima frase
                if i < len(sentences) - 1:
                    # Trova la punteggiatura originale
                    match = re.search(r'[.!?]+', text[text.find(sentence):])
                    if match:
                        sentence += match.group()
                
                result.append(sentence.strip())
        
        return result
    
    def _clean_paragraphs(self, text: str) -> str:
        """Pulisce e normalizza i paragrafi"""
        # Divide in paragrafi
        paragraphs = text.split('\n\n')
        
        cleaned_paragraphs = []
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if paragraph:
                # Normalizza spazi interni al paragrafo
                paragraph = re.sub(r'\s+', ' ', paragraph)
                cleaned_paragraphs.append(paragraph)
        
        return '\n\n'.join(cleaned_paragraphs)
