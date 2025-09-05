# PDF Gears - Python Backend Setup

This version uses a Python Flask backend with PyPDF2 and other powerful libraries for comprehensive PDF processing.

## 🚀 Quick Start

### Option 1: Automatic Setup
```bash
python setup.py
```

### Option 2: Manual Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

## 📋 Requirements

- **Python 3.7+**
- **pip** (Python package manager)

## 🔧 Dependencies

The following Python libraries will be installed:

- **Flask** - Web framework for API endpoints
- **Flask-CORS** - Cross-origin resource sharing
- **PyPDF2** - PDF manipulation and text extraction
- **Pillow** - Image processing
- **PyMuPDF** - Advanced PDF rendering and conversion
- **python-docx** - Word document creation
- **pandas** - Excel file handling
- **reportlab** - PDF generation
- **openpyxl** - Excel file processing

## 🌐 Usage

1. **Start Backend**: Run `python app.py` or `python setup.py`
2. **Open Frontend**: Open `index.html` in your browser
3. **Use Tools**: The frontend will automatically communicate with the Python backend

## 🔗 API Endpoints

- `POST /api/pdf-to-word` - Convert PDF to Word document
- `POST /api/pdf-to-excel` - Convert PDF to Excel spreadsheet
- `POST /api/pdf-to-images` - Convert PDF pages to images
- `POST /api/merge-pdf` - Merge multiple PDF files
- `POST /api/split-pdf` - Split PDF into individual pages
- `POST /api/rotate-pdf` - Rotate PDF pages
- `POST /api/compress-pdf` - Compress PDF file size
- `POST /api/images-to-pdf` - Convert images to PDF
- `GET /api/status` - Check backend status

## 🎯 Features

### Enhanced PDF Processing
- **Real Word Documents** - Creates proper .docx files using python-docx
- **Excel Integration** - Generates .xlsx files with pandas
- **High-Quality Images** - Uses PyMuPDF for superior image conversion
- **Advanced Compression** - Better PDF optimization
- **Robust Error Handling** - Comprehensive error messages

### Python Library Benefits
- **PyPDF2** - Industry-standard PDF manipulation
- **PyMuPDF** - Superior rendering and conversion quality
- **python-docx** - Native Word document creation
- **Pillow** - Professional image processing
- **ReportLab** - Advanced PDF generation

## 🛠 Development

### File Structure
```
pdf-gears/
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── setup.py           # Automatic setup script
├── index.html         # Frontend interface
├── script.js          # Updated JavaScript (calls Python APIs)
├── styles.css         # CSS styles
└── README_PYTHON.md   # This file
```

### Adding New Features
1. Add processing function to `PDFProcessor` class in `app.py`
2. Create API endpoint route
3. Update frontend JavaScript to call new endpoint

## 🔒 Security Notes

- Backend runs on localhost only (127.0.0.1:5000)
- Files are processed in memory, not saved to disk
- CORS enabled for frontend communication
- No file persistence - all processing is temporary

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check Python version
python --version

# Install dependencies manually
pip install Flask PyPDF2 Pillow PyMuPDF python-docx pandas reportlab openpyxl Flask-CORS

# Run with verbose output
python -v app.py
```

### Frontend Connection Issues
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_BASE_URL in script.js points to correct address

### Processing Errors
- Check file formats are supported
- Ensure files are not corrupted
- Monitor backend console for detailed error messages

## 📈 Performance

- **Memory Efficient** - Processes files in memory streams
- **Concurrent Processing** - Flask handles multiple requests
- **Optimized Libraries** - Uses fastest Python PDF libraries
- **Error Recovery** - Graceful handling of processing failures

## 🔄 Updates

To update dependencies:
```bash
pip install -r requirements.txt --upgrade
```

## 📞 Support

For issues:
1. Check backend console output
2. Verify all dependencies are installed
3. Ensure Python 3.7+ is being used
4. Check frontend browser console for API errors