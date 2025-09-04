#!/usr/bin/env python3
"""
PDF Gears Setup Script
Installs required Python dependencies and starts the Flask server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def start_server():
    """Start the Flask development server"""
    print("Starting PDF Gears Python backend...")
    try:
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    print("🔧 PDF Gears Python Backend Setup")
    print("=" * 40)
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found!")
        return
    
    # Install dependencies
    if install_requirements():
        print("\n🚀 Starting server...")
        print("Backend will be available at: http://localhost:5000")
        print("Press Ctrl+C to stop the server")
        print("-" * 40)
        start_server()
    else:
        print("❌ Setup failed. Please install dependencies manually:")
        print("pip install -r requirements.txt")

if __name__ == "__main__":
    main()