# PDF Gears - Complete PDF Tools Suite

A comprehensive web-based PDF manipulation tool that runs entirely in your browser. No server required, all processing happens client-side for maximum privacy and security.

## Features

### Convert
- **PDF to Word** - Extract text from PDF files
- **PDF to Excel** - Extract tabular data from PDFs
- **PDF to Image** - Convert PDF pages to high-quality images (JPG/PNG)
- **Word to PDF** - Convert Word documents to PDF format
- **Excel to PDF** - Convert Excel spreadsheets to PDF format
- **Image to PDF** - Convert images to PDF documents

### Organize
- **Merge PDF** - Combine multiple PDF files into one document
- **Split PDF** - Split PDF into individual pages
- **Rotate PDF** - Rotate PDF pages (90°, 180°, 270°)
- **Delete Pages** - Remove specific pages from PDF documents

### Optimize
- **Compress PDF** - Reduce PDF file size
- **Unlock PDF** - Remove password protection from PDFs
- **Protect PDF** - Add password protection to PDF files

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Processing**: 
  - [PDF-lib](https://pdf-lib.js.org/) - PDF creation and manipulation
  - [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering and text extraction
- **UI/UX**: Font Awesome icons, CSS Grid, Flexbox
- **File Handling**: HTML5 File API, Drag & Drop API

## Setup Instructions

1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in a modern web browser
3. **Start using** the PDF tools immediately - no installation required!

### For Development

If you want to modify or enhance the application:

1. **Local Server** (recommended for development):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Access** the application at `http://localhost:8000`

## File Structure

```
pdf-gears/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # Main JavaScript logic and UI handling
├── pdf-processor.js    # Advanced PDF processing functions
└── README.md          # This file
```

## Browser Compatibility

- **Chrome** 60+ ✅
- **Firefox** 55+ ✅
- **Safari** 12+ ✅
- **Edge** 79+ ✅

## Usage Guide

### Basic Usage
1. **Select a Tool** - Click on any tool card (e.g., "Merge PDF")
2. **Upload Files** - Drag & drop files or click to browse
3. **Process** - Click "Process Files" button
4. **Download** - Download the processed files

### Advanced Features

#### Merge PDFs
- Upload multiple PDF files
- Files will be merged in the order they were selected
- Download the combined PDF

#### Split PDF
- Upload a single PDF file
- Each page will be extracted as a separate PDF
- Download individual page files

#### Convert Images to PDF
- Upload multiple images (JPG, PNG, GIF)
- Images will be combined into a single PDF
- Maintains aspect ratio and optimizes layout

#### PDF to Images
- Upload a PDF file
- Each page will be converted to a high-quality image
- Download individual image files

## Privacy & Security

- **100% Client-Side Processing** - No files are uploaded to any server
- **No Data Collection** - Your files never leave your device
- **Secure** - All processing happens in your browser's memory
- **No Registration Required** - Use immediately without accounts

## Limitations

- **File Size**: Large files (>100MB) may cause performance issues
- **Complex Layouts**: Some PDF conversions may not preserve complex formatting
- **Password Protected PDFs**: Limited support for encrypted PDFs
- **Browser Memory**: Very large files may exceed browser memory limits

## Contributing

Feel free to contribute to this project by:
1. Reporting bugs or issues
2. Suggesting new features
3. Submitting pull requests
4. Improving documentation

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure you're using a supported browser
3. Try with smaller file sizes if experiencing issues
4. Clear browser cache and try again

## Future Enhancements

- OCR support for scanned PDFs
- Advanced text formatting in conversions
- Batch processing improvements
- Mobile app version
- Cloud storage integration options
- Advanced compression algorithms