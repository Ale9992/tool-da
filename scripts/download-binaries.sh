#!/bin/bash

# Script per scaricare e configurare i binari necessari
set -e

echo "Downloading binaries for PDF DSA Converter..."

# Crea le directory
mkdir -p binaries/tesseract
mkdir -p binaries/poppler
mkdir -p assets/fonts

# Funzione per scaricare Tesseract
download_tesseract() {
    echo "Downloading Tesseract..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detected macOS"
        if command -v brew &> /dev/null; then
            echo "Installing Tesseract via Homebrew..."
            brew install tesseract
            # Copia i binari
            cp /usr/local/bin/tesseract binaries/tesseract/ 2>/dev/null || cp /opt/homebrew/bin/tesseract binaries/tesseract/ 2>/dev/null || true
            # Copia i traineddata
            cp -r /usr/local/share/tessdata/* binaries/tesseract/ 2>/dev/null || cp -r /opt/homebrew/share/tessdata/* binaries/tesseract/ 2>/dev/null || true
        else
            echo "Homebrew not found. Please install Tesseract manually."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detected Linux"
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y tesseract-ocr tesseract-ocr-ita tesseract-ocr-eng
            cp /usr/bin/tesseract binaries/tesseract/
            cp -r /usr/share/tessdata/* binaries/tesseract/
        elif command -v yum &> /dev/null; then
            sudo yum install -y tesseract tesseract-langpack-ita tesseract-langpack-eng
            cp /usr/bin/tesseract binaries/tesseract/
            cp -r /usr/share/tessdata/* binaries/tesseract/
        else
            echo "Package manager not found. Please install Tesseract manually."
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        echo "Detected Windows"
        echo "Please download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki"
        echo "And extract to binaries/tesseract/"
    fi
}

# Funzione per scaricare Poppler
download_poppler() {
    echo "Downloading Poppler..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing Poppler via Homebrew..."
            brew install poppler
            # Copia i binari
            cp -r /usr/local/bin/* binaries/poppler/ 2>/dev/null || cp -r /opt/homebrew/bin/* binaries/poppler/ 2>/dev/null || true
        else
            echo "Homebrew not found. Please install Poppler manually."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y poppler-utils
            cp /usr/bin/pdf* binaries/poppler/ 2>/dev/null || true
        elif command -v yum &> /dev/null; then
            sudo yum install -y poppler-utils
            cp /usr/bin/pdf* binaries/poppler/ 2>/dev/null || true
        else
            echo "Package manager not found. Please install Poppler manually."
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        echo "Please download Poppler from: https://blog.alivate.com.au/poppler-windows/"
        echo "And extract to binaries/poppler/"
    fi
}

# Funzione per scaricare i font DSA
download_fonts() {
    echo "Downloading DSA fonts..."
    
    # Atkinson Hyperlegible
    echo "Downloading Atkinson Hyperlegible..."
    curl -L -o assets/fonts/AtkinsonHyperlegible-Regular.woff2 "https://fonts.gstatic.com/s/atkinsonhyperlegible/v9/9Bt43C1KxNDXMspQ1lPyU89-1h6ONqnl6jI9IXfGcm2Bw.woff2" || echo "Failed to download Atkinson Hyperlegible"
    curl -L -o assets/fonts/AtkinsonHyperlegible-Bold.woff2 "https://fonts.gstatic.com/s/atkinsonhyperlegible/v9/9Bt43C1KxNDXMspQ1lPyU89-1h6ONqnl6jI9IXfGcm2Bw.woff2" || echo "Failed to download Atkinson Hyperlegible Bold"
    
    # OpenDyslexic
    echo "Downloading OpenDyslexic..."
    curl -L -o assets/fonts/OpenDyslexic-Regular.woff2 "https://github.com/antijingoist/opendyslexic/raw/master/OpenDyslexic-Regular.woff2" || echo "Failed to download OpenDyslexic"
    curl -L -o assets/fonts/OpenDyslexic-Bold.woff2 "https://github.com/antijingoist/opendyslexic/raw/master/OpenDyslexic-Bold.woff2" || echo "Failed to download OpenDyslexic Bold"
}

# Esegui i download
download_tesseract
download_poppler
download_fonts

echo "Binary setup completed!"
echo "Note: Some binaries may need to be downloaded manually depending on your system."
