#!/bin/bash

# Script di setup base (senza download binari)
set -e

echo "🚀 Setting up PDF DSA Converter (basic setup)..."

# Verifica prerequisiti
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

echo "✅ Prerequisites OK"
echo "   Node.js: $(node --version)"
echo "   Python: $(python3 --version)"

# Installa dipendenze frontend
echo "📦 Installing frontend dependencies..."
npm install

# Installa dipendenze backend
echo "🐍 Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt
cd ..

# Crea directory necessarie
echo "📁 Creating directories..."
mkdir -p dist build release
mkdir -p assets/{fonts,templates,icons}
mkdir -p binaries/{tesseract,poppler}

echo "✅ Basic setup completed!"
echo ""
echo "⚠️  Note: Tesseract and Poppler need to be installed separately:"
echo "   - macOS: brew install tesseract poppler"
echo "   - Ubuntu: sudo apt-get install tesseract-ocr poppler-utils"
echo "   - Windows: Download from official websites"
echo ""
echo "To start development:"
echo "  npm run dev"
