import re
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class StructureReconstructor:
    def __init__(self):
        # Pattern per rilevare titoli
        self.title_patterns = [
            # Titoli con numerazione (1., 1.1, 1.1.1, etc.)
            re.compile(r'^\s*(\d+(?:\.\d+)*)\s+(.+)$', re.MULTILINE),
            # Titoli con numerazione romana (I., II., III., etc.)
            re.compile(r'^\s*([IVX]+\.?)\s+(.+)$', re.MULTILINE),
            # Titoli con lettere (A., B., C., etc.)
            re.compile(r'^\s*([A-Z]\.?)\s+(.+)$', re.MULTILINE),
            # Titoli in maiuscolo (solo se sono brevi)
            re.compile(r'^\s*([A-Z][A-Z\s]{2,50}[A-Z])\s*$', re.MULTILINE),
            # Titoli con sottolineatura
            re.compile(r'^(.+)\n[=\-_]{3,}$', re.MULTILINE),
        ]
        
        # Pattern per rilevare elenchi
        self.list_patterns = [
            # Elenchi puntati
            re.compile(r'^\s*[•·▪▫‣⁃]\s+(.+)$', re.MULTILINE),
            re.compile(r'^\s*[-*+]\s+(.+)$', re.MULTILINE),
            # Elenchi numerati
            re.compile(r'^\s*\d+[.)]\s+(.+)$', re.MULTILINE),
            re.compile(r'^\s*[a-z][.)]\s+(.+)$', re.MULTILINE),
            re.compile(r'^\s*[ivx]+[.)]\s+(.+)$', re.MULTILINE),
        ]
        
        # Pattern per rilevare citazioni
        self.quote_patterns = [
            re.compile(r'^["\'].*["\']$', re.MULTILINE),
            re.compile(r'^\s*>\s*(.+)$', re.MULTILINE),
        ]
        
        # Pattern per rilevare note
        self.note_patterns = [
            re.compile(r'^\s*\d+\.\s*(.+)$', re.MULTILINE),
            re.compile(r'^\s*\[\d+\]\s*(.+)$', re.MULTILINE),
        ]
    
    async def reconstruct_structure(self, text: str) -> Dict[str, Any]:
        """Ricostruisce la struttura del documento"""
        try:
            logger.info("Inizio ricostruzione struttura")
            
            # Divide il testo in righe
            lines = text.split('\n')
            
            # Analizza la struttura
            structure = {
                'title': self._extract_title(lines),
                'sections': self._extract_sections(lines),
                'paragraphs': self._extract_paragraphs(lines),
                'lists': self._extract_lists(lines),
                'quotes': self._extract_quotes(lines),
                'notes': self._extract_notes(lines),
                'metadata': {
                    'total_lines': len(lines),
                    'estimated_reading_time': self._estimate_reading_time(text),
                    'complexity_score': self._calculate_complexity_score(text)
                }
            }
            
            logger.info("Ricostruzione struttura completata")
            return structure
            
        except Exception as e:
            logger.error(f"Errore nella ricostruzione struttura: {e}")
            raise
    
    def _extract_title(self, lines: List[str]) -> Optional[str]:
        """Estrae il titolo principale del documento"""
        # Cerca nelle prime 10 righe
        for line in lines[:10]:
            line = line.strip()
            if line and len(line) < 100:
                # Controlla se sembra un titolo
                if (line.isupper() and len(line) > 10) or \
                   re.match(r'^[A-Z][a-z].*[.!?]$', line) or \
                   'capitolo' in line.lower() or \
                   'chapter' in line.lower():
                    return line
        
        return None
    
    def _extract_sections(self, lines: List[str]) -> List[Dict[str, Any]]:
        """Estrae le sezioni/titoli del documento"""
        sections = []
        current_section = None
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Controlla se la riga è un titolo
            title_match = self._is_title(line, lines, i)
            if title_match:
                # Salva la sezione precedente
                if current_section:
                    sections.append(current_section)
                
                # Inizia una nuova sezione
                current_section = {
                    'level': title_match['level'],
                    'title': title_match['title'],
                    'content': [],
                    'line_number': i
                }
            elif current_section:
                # Aggiungi contenuto alla sezione corrente
                current_section['content'].append(line)
        
        # Aggiungi l'ultima sezione
        if current_section:
            sections.append(current_section)
        
        return sections
    
    def _is_title(self, line: str, all_lines: List[str], line_index: int) -> Optional[Dict[str, Any]]:
        """Determina se una riga è un titolo e restituisce le informazioni"""
        # Controlla pattern di numerazione
        for pattern in self.title_patterns[:3]:  # Solo pattern numerici
            match = pattern.match(line)
            if match:
                level = self._calculate_title_level(match.group(1))
                return {
                    'level': level,
                    'title': match.group(2).strip(),
                    'type': 'numbered'
                }
        
        # Controlla titoli in maiuscolo (solo se brevi)
        if line.isupper() and 10 <= len(line) <= 80:
            return {
                'level': 1,
                'title': line,
                'type': 'uppercase'
            }
        
        # Controlla titoli con sottolineatura
        if line_index < len(all_lines) - 1:
            next_line = all_lines[line_index + 1].strip()
            if re.match(r'^[=\-_]{3,}$', next_line):
                return {
                    'level': 1,
                    'title': line,
                    'type': 'underlined'
                }
        
        return None
    
    def _calculate_title_level(self, numbering: str) -> int:
        """Calcola il livello di un titolo basato sulla numerazione"""
        if '.' in numbering:
            return len(numbering.split('.'))
        else:
            return 1
    
    def _extract_paragraphs(self, lines: List[str]) -> List[str]:
        """Estrae i paragrafi del documento"""
        paragraphs = []
        current_paragraph = []
        
        for line in lines:
            line = line.strip()
            if line:
                current_paragraph.append(line)
            else:
                if current_paragraph:
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []
        
        # Aggiungi l'ultimo paragrafo
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))
        
        return paragraphs
    
    def _extract_lists(self, lines: List[str]) -> List[Dict[str, Any]]:
        """Estrae gli elenchi dal documento"""
        lists = []
        current_list = None
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Controlla se la riga è un elemento di lista
            list_item = self._is_list_item(line)
            if list_item:
                if not current_list:
                    current_list = {
                        'type': list_item['type'],
                        'items': [],
                        'start_line': i
                    }
                current_list['items'].append({
                    'text': list_item['text'],
                    'level': list_item.get('level', 0)
                })
            else:
                # Fine della lista
                if current_list:
                    current_list['end_line'] = i - 1
                    lists.append(current_list)
                    current_list = None
        
        # Aggiungi l'ultima lista
        if current_list:
            current_list['end_line'] = len(lines) - 1
            lists.append(current_list)
        
        return lists
    
    def _is_list_item(self, line: str) -> Optional[Dict[str, Any]]:
        """Determina se una riga è un elemento di lista"""
        # Controlla pattern di elenchi
        for pattern in self.list_patterns:
            match = pattern.match(line)
            if match:
                item_type = 'bullet' if pattern in self.list_patterns[:2] else 'numbered'
                return {
                    'type': item_type,
                    'text': match.group(1).strip(),
                    'level': 0  # TODO: Implementare livelli annidati
                }
        
        return None
    
    def _extract_quotes(self, lines: List[str]) -> List[str]:
        """Estrae le citazioni dal documento"""
        quotes = []
        
        for line in lines:
            line = line.strip()
            if line:
                for pattern in self.quote_patterns:
                    if pattern.match(line):
                        quotes.append(line)
                        break
        
        return quotes
    
    def _extract_notes(self, lines: List[str]) -> List[Dict[str, Any]]:
        """Estrae le note dal documento"""
        notes = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line:
                for pattern in self.note_patterns:
                    match = pattern.match(line)
                    if match:
                        notes.append({
                            'number': i + 1,
                            'text': match.group(1).strip(),
                            'line_number': i
                        })
                        break
        
        return notes
    
    def _estimate_reading_time(self, text: str) -> int:
        """Stima il tempo di lettura in minuti"""
        # Assumendo 200 parole al minuto per lettori DSA
        words = len(text.split())
        return max(1, words // 200)
    
    def _calculate_complexity_score(self, text: str) -> float:
        """Calcola un punteggio di complessità del testo (0-1)"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        if not words or not sentences:
            return 0.0
        
        # Lunghezza media delle parole
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Lunghezza media delle frasi
        avg_sentence_length = len(words) / len(sentences)
        
        # Punteggio di complessità (normalizzato)
        complexity = (avg_word_length / 10.0 + avg_sentence_length / 20.0) / 2.0
        
        return min(1.0, max(0.0, complexity))
