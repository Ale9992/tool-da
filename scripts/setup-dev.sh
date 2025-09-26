#!/bin/bash

# Script di setup per ambiente di sviluppo
set -e

echo "🚀 Setting up PDF DSA Converter development environment..."

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

# Download binari (opzionale)
echo "🔧 Setting up binaries..."
if [ -f "scripts/download-binaries.sh" ]; then
    echo "⚠️  Binary download available but skipped to avoid blocking."
    echo "   Run './scripts/download-binaries.sh' manually if needed."
    echo "   Or install Tesseract and Poppler via your package manager."
else
    echo "⚠️  Binary download script not found. Please install Tesseract and Poppler manually."
fi

echo "✅ Development environment setup completed!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm run dist"
