#!/usr/bin/env python3
"""
Script per buildare il backend Python con PyInstaller
"""

import os
import sys
import subprocess
from pathlib import Path

def build_backend():
    """Builda il backend Python"""
    backend_dir = Path(__file__).parent
    
    # Comando PyInstaller
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--name", "pdf-processor",
        "--distpath", "../dist/backend",
        "--workpath", "../build/backend",
        "--specpath", "../build/backend",
        "--add-data", f"{backend_dir}/src:src",
        "--hidden-import", "uvicorn",
        "--hidden-import", "fastapi",
        "--hidden-import", "pydantic",
        "main.py"
    ]
    
    print("Building backend with PyInstaller...")
    subprocess.run(cmd, cwd=backend_dir, check=True)
    print("Backend build completed!")

if __name__ == "__main__":
    build_backend()
