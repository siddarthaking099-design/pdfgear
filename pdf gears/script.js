// Global variables
let currentTool = '';
let selectedFiles = [];
let processedFiles = [];

// Tool configurations
const toolConfigs = {
    'pdf-to-word': { title: 'PDF to Word Converter', accept: '.pdf', output: 'docx' },
    'pdf-to-excel': { title: 'PDF to Excel Converter', accept: '.pdf', output: 'xlsx' },
    'pdf-to-image': { title: 'PDF to Image Converter', accept: '.pdf', output: 'jpg' },
    'word-to-pdf': { title: 'Word to PDF Converter', accept: '.doc,.docx', output: 'pdf' },
    'excel-to-pdf': { title: 'Excel to PDF Converter', accept: '.xls,.xlsx', output: 'pdf' },
    'image-to-pdf': { title: 'Image to PDF Converter', accept: '.jpg,.jpeg,.png,.gif', output: 'pdf' },
    'merge-pdf': { title: 'Merge PDF Files', accept: '.pdf', output: 'pdf' },
    'split-pdf': { title: 'Split PDF File', accept: '.pdf', output: 'pdf' },
    'rotate-pdf': { title: 'Rotate PDF Pages', accept: '.pdf', output: 'pdf' },
    'delete-pages': { title: 'Delete PDF Pages', accept: '.pdf', output: 'pdf' },
    'compress-pdf': { title: 'Compress PDF File', accept: '.pdf', output: 'pdf' },
    'unlock-pdf': { title: 'Unlock PDF File', accept: '.pdf', output: 'pdf' },
    'protect-pdf': { title: 'Protect PDF File', accept: '.pdf', output: 'pdf' }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeEventListeners();
    setupDragAndDrop();
    populateAboutSection();
    
    // Check backend status
    try {
        await autoStartBackend();
        const backendRunning = await checkBackendStatus();
        if (!backendRunning) {
            console.warn('Python backend not running. Some features may be limited.');
            showBackendWarning();
        }
    } catch (error) {
        console.log('Backend check failed:', error);
    }
});

// Auto-start Python backend
async function autoStartBackend() {
    try {
        // Check if backend is already running
        const isRunning = await checkBackendStatus();
        if (isRunning) {
            console.log('Backend already running');
            return;
        }
        
        console.log('Python backend not running. Some features may be limited.');
        
    } catch (error) {
        console.log('Could not check backend status:', error);
    }
}

function showBackendWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 1001;
        max-width: 320px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    warning.innerHTML = `
        <strong>Limited Mode</strong><br>
        Some features work client-side only.<br>
        For full features: <code>python app.py</code>
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">&times;</button>
    `;
    document.body.appendChild(warning);
    
    setTimeout(() => {
        if (warning.parentElement) {
            warning.remove();
        }
    }, 8000);
}

// Show compression level selection dialog
function showCompressionDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-top: 0; color: #667eea; text-align: center;">
                    <span class="diamond-accent diamond-small"></span>
                    Select Compression Level
                </h3>
                <div style="margin: 20px 0;">
                    <label style="display: block; margin: 10px 0; cursor: pointer;">
                        <input type="radio" name="compression" value="low" style="margin-right: 10px;">
                        <strong>Low</strong> - Minimal compression, best quality
                    </label>
                    <label style="display: block; margin: 10px 0; cursor: pointer;">
                        <input type="radio" name="compression" value="medium" checked style="margin-right: 10px;">
                        <strong>Medium</strong> - Balanced compression and quality
                    </label>
                    <label style="display: block; margin: 10px 0; cursor: pointer;">
                        <input type="radio" name="compression" value="high" style="margin-right: 10px;">
                        <strong>High</strong> - Maximum compression, smaller file
                    </label>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button id="compress-ok" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin-right: 10px;
                        cursor: pointer;
                    ">Compress</button>
                    <button id="compress-cancel" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#compress-ok').onclick = () => {
            const selected = dialog.querySelector('input[name="compression"]:checked');
            const level = selected ? selected.value : 'medium';
            document.body.removeChild(dialog);
            resolve(level);
        };
        
        dialog.querySelector('#compress-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
        
        dialog.onclick = (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
                resolve(null);
            }
        };
    });
}

// Populate About section with dynamic content
function populateAboutSection() {
    const features = {
        convert: [
            'PDF to Word - Extract text from PDF files',
            'PDF to Excel - Extract tabular data from PDFs', 
            'PDF to Image - Convert PDF pages to high-quality images',
            'Word to PDF - Convert Word documents to PDF format',
            'Excel to PDF - Convert Excel spreadsheets to PDF format',
            'Image to PDF - Convert images to PDF documents'
        ],
        organize: [
            'Merge PDF - Combine multiple PDF files into one document',
            'Split PDF - Split PDF into individual pages',
            'Rotate PDF - Rotate PDF pages (90°, 180°, 270°)',
            'Delete Pages - Remove specific pages from PDF documents'
        ],
        optimize: [
            'Compress PDF - Reduce PDF file size',
            'Unlock PDF - Remove password protection from PDFs',
            'Protect PDF - Add password protection to PDF files'
        ]
    };
    
    // Populate convert features
    const convertContainer = document.getElementById('convert-features');
    if (convertContainer) {
        features.convert.forEach(feature => {
            const featureDiv = document.createElement('div');
            featureDiv.className = 'feature-item';
            featureDiv.textContent = feature;
            convertContainer.appendChild(featureDiv);
        });
    }
    
    // Populate organize features
    const organizeContainer = document.getElementById('organize-features');
    if (organizeContainer) {
        features.organize.forEach(feature => {
            const featureDiv = document.createElement('div');
            featureDiv.className = 'feature-item';
            featureDiv.textContent = feature;
            organizeContainer.appendChild(featureDiv);
        });
    }
    
    // Populate optimize features
    const optimizeContainer = document.getElementById('optimize-features');
    if (optimizeContainer) {
        features.optimize.forEach(feature => {
            const featureDiv = document.createElement('div');
            featureDiv.className = 'feature-item';
            featureDiv.textContent = feature;
            optimizeContainer.appendChild(featureDiv);
        });
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Tool card clicks
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            openTool(tool);
        });
    });

    // File input change
    document.getElementById('file-input').addEventListener('change', handleFileSelect);

    // Process button
    document.getElementById('process-btn').addEventListener('click', processFiles);

    // Upload zone click
    document.getElementById('upload-zone').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const uploadZone = document.getElementById('upload-zone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, unhighlight, false);
    });

    uploadZone.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('upload-zone').classList.add('dragover');
}

function unhighlight(e) {
    document.getElementById('upload-zone').classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Open tool interface
function openTool(toolName) {
    currentTool = toolName;
    const config = toolConfigs[toolName];
    
    document.getElementById('tool-title').textContent = config.title;
    document.getElementById('file-input').setAttribute('accept', config.accept);
    document.getElementById('processing-area').style.display = 'block';
    
    // Scroll to processing area
    document.getElementById('processing-area').scrollIntoView({ behavior: 'smooth' });
    
    resetUpload();
}

// Close processing area
function closeProcessing() {
    document.getElementById('processing-area').style.display = 'none';
    resetUpload();
}

// Handle file selection
function handleFileSelect(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    selectedFiles = Array.from(files);
    displaySelectedFiles();
}

// Display selected files
function displaySelectedFiles() {
    const fileList = document.getElementById('file-list');
    const filesContainer = document.getElementById('files-container');
    
    if (selectedFiles.length === 0) {
        fileList.style.display = 'none';
        return;
    }
    
    fileList.style.display = 'block';
    filesContainer.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        filesContainer.appendChild(fileItem);
    });
}

// Create file item element
function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const icon = getFileIcon(file.name);
    const fileName = file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name;
    const fileSize = formatFileSize(file.size);
    
    fileInfo.innerHTML = `
        <i class="${icon}"></i>
        <span>${fileName} (${fileSize})</span>
    `;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => removeFile(index);
    
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    
    return fileItem;
}

// Get file icon based on extension
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image'
    };
    return iconMap[ext] || 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
}

// Reset upload area
function resetUpload() {
    selectedFiles = [];
    processedFiles = [];
    document.getElementById('file-list').style.display = 'none';
    document.getElementById('progress-area').style.display = 'none';
    document.getElementById('results-area').style.display = 'none';
    document.getElementById('file-upload').style.display = 'block';
    document.getElementById('file-input').value = '';
}

// Process files based on current tool
async function processFiles() {
    if (selectedFiles.length === 0) {
        alert('Please select files to process');
        return;
    }
    
    showProgress();
    
    try {
        // Validate files before processing
        const config = toolConfigs[currentTool];
        const allowedExtensions = config.accept.split(',').map(ext => ext.replace('.', ''));
        
        try {
            validateFiles(selectedFiles, allowedExtensions);
        } catch (error) {
            handleProcessingError(error, currentTool);
            return;
        }
        
        switch (currentTool) {
            case 'pdf-to-word':
                await convertPdfToWord();
                break;
            case 'pdf-to-excel':
                await convertPdfToExcel();
                break;
            case 'pdf-to-image':
                await convertPdfToImage();
                break;
            case 'word-to-pdf':
                await convertWordToPdf();
                break;
            case 'excel-to-pdf':
                await convertExcelToPdf();
                break;
            case 'image-to-pdf':
                await convertImageToPdf();
                break;
            case 'merge-pdf':
                await mergePdfFiles();
                break;
            case 'split-pdf':
                await splitPdfFile();
                break;
            case 'rotate-pdf':
                await rotatePdfPages();
                break;
            case 'delete-pages':
                await deletePdfPages();
                break;
            case 'compress-pdf':
                await compressPdfFile();
                break;
            case 'unlock-pdf':
                await unlockPdfFile();
                break;
            case 'protect-pdf':
                await protectPdfFile();
                break;
            default:
                throw new Error('Unknown tool: ' + currentTool);
        }
        
        showResults();
    } catch (error) {
        handleProcessingError(error, currentTool);
    }
}

// Show progress
function showProgress() {
    document.getElementById('file-upload').style.display = 'none';
    document.getElementById('file-list').style.display = 'none';
    document.getElementById('progress-area').style.display = 'block';
    
    let progress = 0;
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress > 95) progress = 95;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = `Processing... ${Math.round(progress)}%`;
    }, 300);
    
    window.progressInterval = interval;
}

// Hide progress
function hideProgress() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    document.getElementById('progress-area').style.display = 'none';
}

// Show results
function showResults() {
    hideProgress();
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    progressFill.style.width = '100%';
    progressText.textContent = 'Processing complete!';
    
    setTimeout(() => {
        document.getElementById('progress-area').style.display = 'none';
        document.getElementById('results-area').style.display = 'block';
        displayDownloadLinks();
    }, 1000);
}

// Display download links
function displayDownloadLinks() {
    const downloadContainer = document.getElementById('download-links');
    downloadContainer.innerHTML = '';
    
    processedFiles.forEach((file, index) => {
        const downloadItem = document.createElement('div');
        downloadItem.className = 'download-item';
        
        downloadItem.innerHTML = `
            <div class="file-info">
                <i class="${getFileIcon(file.name)}"></i>
                <span>${file.name}</span>
            </div>
            <a href="${file.url}" download="${file.name}" class="download-btn">
                <i class="fas fa-download"></i> Download
            </a>
        `;
        
        downloadContainer.appendChild(downloadItem);
    });
}

// PDF Processing Functions using Python backend

async function convertPdfToWord() {
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/pdf-to-word', file);
            processedFiles.push(result);
        } catch (error) {
            console.error('Error converting PDF to Word:', error);
        }
    }
}

async function convertPdfToExcel() {
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/pdf-to-excel', file);
            processedFiles.push(result);
        } catch (error) {
            console.error('Error converting PDF to Excel:', error);
        }
    }
}

async function convertPdfToImage() {
    try {
        const file = selectedFiles[0];
        
        // Scan PDF pages
        const formData = new FormData();
        formData.append('file', file);
        
        const scanResponse = await fetch(`${API_BASE_URL}/api/scan-pdf`, {
            method: 'POST',
            body: formData
        });
        
        if (!scanResponse.ok) {
            throw new Error('Failed to scan PDF');
        }
        
        const scanData = await scanResponse.json();
        const pages = scanData.pages;
        
        // Show page selection dialog
        const selectedPages = await showPageSelectionDialog(pages);
        if (!selectedPages || selectedPages.length === 0) return;
        
        // Get conversion options
        const options = await showImageOptionsDialog();
        if (!options) return;
        
        // Convert selected pages
        const convertFormData = new FormData();
        convertFormData.append('file', file);
        convertFormData.append('pages', selectedPages.join(','));
        convertFormData.append('format', options.format);
        convertFormData.append('quality', options.quality);
        
        const convertResponse = await fetch(`${API_BASE_URL}/api/convert-pages`, {
            method: 'POST',
            body: convertFormData
        });
        
        if (!convertResponse.ok) {
            throw new Error('Failed to convert pages');
        }
        
        const convertData = await convertResponse.json();
        const images = convertData.images;
        
        // Process images for download
        processedFiles = images.map(img => ({
            name: img.filename,
            url: `data:image/${options.format};base64,${img.data}`,
            blob: dataURLtoBlob(`data:image/${options.format};base64,${img.data}`)
        }));
        
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        throw error;
    }
}

async function convertWordToPdf() {
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/word-to-pdf', file);
            processedFiles.push(result);
        } catch (error) {
            console.error('Error converting Word to PDF:', error);
        }
    }
}

async function convertExcelToPdf() {
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/excel-to-pdf', file);
            processedFiles.push(result);
        } catch (error) {
            console.error('Error converting Excel to PDF:', error);
        }
    }
}

async function convertImageToPdf() {
    try {
        const orderedFiles = await showImageOrderDialog();
        if (!orderedFiles) return;
        
        const options = await showImageToPdfDialog();
        if (!options) return;
        
        // Try client-side conversion first
        try {
            const result = await convertImagesToPdfClientSide(orderedFiles, options);
            processedFiles = [result];
            return;
        } catch (clientError) {
            console.log('Client-side conversion failed, trying backend:', clientError);
        }
        
        // Fallback to backend
        const result = await callPythonAPIMultiple('/api/images-to-pdf', orderedFiles, options);
        processedFiles = [result];
    } catch (error) {
        console.error('Error converting images to PDF:', error);
        throw error;
    }
}

// Client-side images to PDF conversion using PDF-lib
async function convertImagesToPdfClientSide(imageFiles, options) {
    const { PDFDocument } = PDFLib;
    
    const pdfDoc = await PDFDocument.create();
    
    for (const imageFile of imageFiles) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const fileType = imageFile.type.toLowerCase();
        
        let image;
        if (fileType.includes('png')) {
            image = await pdfDoc.embedPng(arrayBuffer);
        } else if (fileType.includes('jpg') || fileType.includes('jpeg')) {
            image = await pdfDoc.embedJpg(arrayBuffer);
        } else {
            // Convert other formats to canvas then to JPEG
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = URL.createObjectURL(imageFile);
            });
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const jpegBlob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.9);
            });
            
            const jpegArrayBuffer = await jpegBlob.arrayBuffer();
            image = await pdfDoc.embedJpg(jpegArrayBuffer);
            
            URL.revokeObjectURL(img.src);
        }
        
        // Calculate page dimensions
        const { width: imgWidth, height: imgHeight } = image.scale(1);
        
        let pageWidth, pageHeight;
        if (options.page_size === 'a4') {
            pageWidth = 595; pageHeight = 842;
        } else if (options.page_size === 'legal') {
            pageWidth = 612; pageHeight = 1008;
        } else {
            pageWidth = 612; pageHeight = 792; // letter
        }
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        let drawWidth, drawHeight, x, y;
        
        if (options.fit_mode === 'stretch') {
            drawWidth = pageWidth * 0.9;
            drawHeight = pageHeight * 0.9;
            x = pageWidth * 0.05;
            y = pageHeight * 0.05;
        } else if (options.fit_mode === 'fill') {
            const scale = Math.max(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9;
            drawWidth = imgWidth * scale;
            drawHeight = imgHeight * scale;
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
        } else { // fit
            const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.8;
            drawWidth = imgWidth * scale;
            drawHeight = imgHeight * scale;
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
        }
        
        page.drawImage(image, {
            x: x,
            y: y,
            width: drawWidth,
            height: drawHeight
        });
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    return {
        name: 'images_to_pdf.pdf',
        blob: blob,
        url: URL.createObjectURL(blob)
    };
}

async function mergePdfFiles() {
    try {
        const orderedFiles = await showMergeOrderDialog();
        if (!orderedFiles) return;
        
        const result = await callPythonAPIMultiple('/api/merge-pdf', orderedFiles);
        processedFiles = [result];
    } catch (error) {
        console.error('Error merging PDFs:', error);
        throw error;
    }
}

async function splitPdfFile() {
    try {
        const file = selectedFiles[0];
        
        // Call split PDF API
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/split-pdf`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to split PDF');
        }
        
        const data = await response.json();
        const pages = data.pages;
        
        // Process pages for individual downloads
        processedFiles = pages.map(page => ({
            name: page.filename,
            url: `data:application/pdf;base64,${page.data}`,
            blob: dataURLtoBlob(`data:application/pdf;base64,${page.data}`)
        }));
        
    } catch (error) {
        console.error('Error splitting PDF:', error);
        throw error;
    }
}

async function rotatePdfPages() {
    const rotation = await showRotationDialog();
    if (!rotation) return;
    
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/rotate-pdf', file, {rotation: rotation});
            processedFiles.push(result);
        } catch (error) {
            console.error('Error rotating PDF:', error);
        }
    }
}

async function deletePdfPages() {
    const pagesToDelete = await showDeletePagesDialog();
    if (!pagesToDelete) return;
    
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/delete-pages', file, {pages: pagesToDelete});
            processedFiles.push(result);
        } catch (error) {
            console.error('Error deleting pages:', error);
        }
    }
}

async function compressPdfFile() {
    // Show compression level selection
    const compressionLevel = await showCompressionDialog();
    if (!compressionLevel) return;
    
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/compress-pdf', file, {compression_level: compressionLevel});
            processedFiles.push(result);
        } catch (error) {
            console.error('Error compressing PDF:', error);
        }
    }
}

async function unlockPdfFile() {
    const userChoice = confirm('Try to unlock PDF without password?\n\nClick OK to attempt automatic unlock\nClick Cancel to enter password manually');
    
    let password = '';
    if (!userChoice) {
        password = prompt('Enter PDF password:') || '';
    }
    
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/unlock-pdf', file, {password: password});
            processedFiles.push(result);
        } catch (error) {
            console.error('Error unlocking PDF:', error);
            alert(`Failed to unlock ${file.name}: ${error.message}`);
        }
    }
}

async function protectPdfFile() {
    const userPassword = prompt('Enter password for PDF protection:');
    if (!userPassword) {
        alert('Password is required for protection');
        return;
    }
    
    const ownerPassword = prompt('Enter owner password (optional, leave empty for auto-generated):');
    
    processedFiles = [];
    for (const file of selectedFiles) {
        try {
            const result = await callPythonAPI('/api/protect-pdf', file, {
                user_password: userPassword,
                owner_password: ownerPassword || ''
            });
            processedFiles.push(result);
        } catch (error) {
            console.error('Error protecting PDF:', error);
            alert(`Failed to protect ${file.name}: ${error.message}`);
        }
    }
}

// Utility functions
async function simulateProcessing() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000 + Math.random() * 3000);
    });
}

// Python API communication functions
const API_BASE_URL = 'http://localhost:5000';

// Helper function for page conversion API
async function callPythonAPIForPages(endpoint, file, selectedPages, options) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pages', selectedPages.join(','));
    formData.append('format', options.format);
    formData.append('quality', options.quality);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
    }
    
    return response;
}

// Helper function to convert data URL to blob
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
}

async function callPythonAPI(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Processing failed');
        }
        
        const blob = await response.blob();
        const filename = getFilenameFromResponse(response, file.name);
        
        return {
            name: filename,
            blob: blob,
            url: URL.createObjectURL(blob)
        };
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
}

async function callPythonAPIMultiple(endpoint, files, additionalData = {}) {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Processing failed');
        }
        
        const blob = await response.blob();
        const filename = getFilenameFromResponse(response, 'processed');
        
        return {
            name: filename,
            blob: blob,
            url: URL.createObjectURL(blob)
        };
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
}

function getFilenameFromResponse(response, defaultName) {
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[*]?=["']?([^"';]+)["']?/i);
        if (filenameMatch) {
            return filenameMatch[1];
        }
    }
    
    // Set proper extensions based on tool type
    const toolExtensions = {
        'pdf-to-word': '.docx',
        'pdf-to-excel': '.xlsx',
        'pdf-to-image': '.zip',
        'merge-pdf': '.pdf',
        'split-pdf': '.pdf',
        'rotate-pdf': '.pdf',
        'delete-pages': '.pdf',
        'compress-pdf': '.pdf',
        'unlock-pdf': '.pdf',
        'protect-pdf': '.pdf',
        'images-to-pdf': '.pdf'
    };
    
    const extension = toolExtensions[currentTool] || '.pdf';
    const baseName = defaultName.replace(/\.[^/.]+$/, '') || 'converted';
    return baseName + extension;
}

// Enhanced error handling
function handleProcessingError(error, toolName) {
    console.error(`Error in ${toolName}:`, error);
    hideProgress();
    alert(`Error processing files: ${error.message}\n\nMake sure the Python backend is running:\npython app.py`);
}

// Validate file types
function validateFiles(files, allowedTypes) {
    for (const file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            throw new Error(`Unsupported file type: .${extension}`);
        }
    }
    return true;
}

// Check if Python backend is running
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/status`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Show merge order selection dialog
function showMergeOrderDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        const fileList = selectedFiles.map((file, index) => 
            `<div class="merge-file-item" data-index="${index}" draggable="true"><span class="drag-handle">⋮⋮</span><span>${file.name}</span></div>`
        ).join('');
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%;"><h3 style="margin-top: 0; color: #667eea; text-align: center;">Arrange Merge Order</h3><p style="text-align: center; color: #666; margin-bottom: 20px;">Drag files to reorder</p><div id="merge-file-list" style="max-height: 300px; overflow-y: auto;">${fileList}</div><div style="text-align: center; margin-top: 20px;"><button id="merge-ok" class="btn-primary">Merge in Order</button><button id="merge-cancel" class="btn-secondary">Cancel</button></div></div>`;
        
        document.body.appendChild(dialog);
        
        // Setup drag and drop for reordering
        const fileListContainer = dialog.querySelector('#merge-file-list');
        let draggedElement = null;
        
        fileListContainer.addEventListener('dragstart', (e) => {
            draggedElement = e.target.closest('.merge-file-item');
            if (draggedElement) {
                draggedElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', draggedElement.outerHTML);
            }
        });
        
        fileListContainer.addEventListener('dragend', (e) => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                fileListContainer.classList.remove('drag-over');
            }
        });
        
        fileListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            fileListContainer.classList.add('drag-over');
            
            if (draggedElement) {
                const afterElement = getDragAfterElement(fileListContainer, e.clientY);
                if (afterElement == null) {
                    fileListContainer.appendChild(draggedElement);
                } else {
                    fileListContainer.insertBefore(draggedElement, afterElement);
                }
            }
        });
        
        fileListContainer.addEventListener('dragleave', (e) => {
            if (!fileListContainer.contains(e.relatedTarget)) {
                fileListContainer.classList.remove('drag-over');
            }
        });
        
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.merge-file-item:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        
        dialog.querySelector('#merge-ok').onclick = () => {
            const orderedIndexes = Array.from(dialog.querySelectorAll('.merge-file-item')).map(el => parseInt(el.dataset.index));
            const orderedFiles = orderedIndexes.map(index => selectedFiles[index]);
            document.body.removeChild(dialog);
            resolve(orderedFiles);
        };
        
        dialog.querySelector('#merge-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}



// Show rotation angle dialog
function showRotationDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%;"><h3 style="margin-top: 0; color: #667eea; text-align: center;">Select Rotation Angle</h3><div style="margin: 20px 0;"><label style="display: block; margin: 10px 0; cursor: pointer;"><input type="radio" name="rotation" value="90" checked style="margin-right: 10px;"><strong>90°</strong> - Rotate clockwise</label><label style="display: block; margin: 10px 0; cursor: pointer;"><input type="radio" name="rotation" value="180" style="margin-right: 10px;"><strong>180°</strong> - Rotate upside down</label><label style="display: block; margin: 10px 0; cursor: pointer;"><input type="radio" name="rotation" value="270" style="margin-right: 10px;"><strong>270°</strong> - Rotate counter-clockwise</label><label style="display: block; margin: 10px 0; cursor: pointer;"><input type="radio" name="rotation" value="custom" style="margin-right: 10px;"><strong>Custom</strong> - Enter angle</label><div id="custom-angle" style="margin-left: 25px; display: none;"><input type="number" placeholder="Enter angle (0-360)" min="0" max="360" style="width: 100%; padding: 5px; margin-top: 5px;"></div></div><div style="text-align: center; margin-top: 20px;"><button id="rotate-ok" class="btn-primary">Rotate PDF</button><button id="rotate-cancel" class="btn-secondary">Cancel</button></div></div>`;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('input[value="custom"]').onchange = () => dialog.querySelector('#custom-angle').style.display = 'block';
        dialog.querySelectorAll('input[name="rotation"]:not([value="custom"])').forEach(radio => {
            radio.onchange = () => dialog.querySelector('#custom-angle').style.display = 'none';
        });
        
        dialog.querySelector('#rotate-ok').onclick = () => {
            const selected = dialog.querySelector('input[name="rotation"]:checked');
            let rotation = selected.value;
            if (rotation === 'custom') {
                const customAngle = dialog.querySelector('#custom-angle input').value;
                if (!customAngle) { alert('Please enter a custom angle'); return; }
                rotation = parseInt(customAngle);
            } else {
                rotation = parseInt(rotation);
            }
            document.body.removeChild(dialog);
            resolve(rotation);
        };
        
        dialog.querySelector('#rotate-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

// Show delete pages dialog
function showDeletePagesDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%;"><h3 style="margin-top: 0; color: #667eea; text-align: center;">Delete Pages</h3><div style="margin: 20px 0;"><label style="display: block; margin-bottom: 10px; font-weight: bold;">Pages to delete:</label><input type="text" id="pages-input" placeholder="e.g., 1,3,5-7" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"><p style="font-size: 0.9em; color: #666; margin-top: 5px;">Examples:<br>• Single pages: 1,3,5<br>• Page ranges: 1-3,7-9<br>• Mixed: 1,3-5,8</p></div><div style="text-align: center; margin-top: 20px;"><button id="delete-ok" class="btn-primary">Delete Pages</button><button id="delete-cancel" class="btn-secondary">Cancel</button></div></div>`;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#delete-ok').onclick = () => {
            const pagesInput = dialog.querySelector('#pages-input').value.trim();
            if (!pagesInput) { alert('Please enter page numbers to delete'); return; }
            document.body.removeChild(dialog);
            resolve(pagesInput);
        };
        
        dialog.querySelector('#delete-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

// Show page selection dialog
function showPageSelectionDialog(pages) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        const pageGrid = pages.map(page => 
            `<div class="page-item" data-page="${page.page_num}">
                <img src="${page.preview}" style="width: 120px; height: 150px; object-fit: contain; border: 2px solid #ddd; border-radius: 5px; cursor: pointer;">
                <div style="text-align: center; margin-top: 5px;">
                    <input type="checkbox" id="page_${page.page_num}" value="${page.page_num}">
                    <label for="page_${page.page_num}">Page ${page.page_num}</label>
                </div>
            </div>`
        ).join('');
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 800px; width: 90%; max-height: 80%; overflow-y: auto;">
            <h3 style="margin-top: 0; color: #667eea; text-align: center;">Select Pages to Convert</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; margin: 20px 0;">${pageGrid}</div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="select-all" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 5px; margin-right: 10px; cursor: pointer;">Select All</button>
                <button id="page-ok" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-right: 10px; cursor: pointer;">Convert Selected</button>
                <button id="page-cancel" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        </div>`;
        
        document.body.appendChild(dialog);
        
        // Add click handlers for page selection
        dialog.querySelectorAll('.page-item img').forEach(img => {
            img.onclick = () => {
                const checkbox = img.parentElement.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                img.style.border = checkbox.checked ? '3px solid #667eea' : '2px solid #ddd';
            };
        });
        
        dialog.querySelector('#select-all').onclick = () => {
            const checkboxes = dialog.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
                const img = cb.parentElement.parentElement.querySelector('img');
                img.style.border = cb.checked ? '3px solid #667eea' : '2px solid #ddd';
            });
        };
        
        dialog.querySelector('#page-ok').onclick = () => {
            const selected = Array.from(dialog.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
            document.body.removeChild(dialog);
            resolve(selected);
        };
        
        dialog.querySelector('#page-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

// Show image conversion options dialog
function showImageOptionsDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%;"><h3 style="margin-top: 0; color: #667eea; text-align: center;">Image Conversion Options</h3><div style="margin: 20px 0;"><label style="display: block; margin: 10px 0; font-weight: bold;">Image Format:</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="format" value="png" checked style="margin-right: 10px;">PNG - Best quality, larger files</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="format" value="jpg" style="margin-right: 10px;">JPG - Smaller files, good quality</label><label style="display: block; margin: 15px 0 5px 0; font-weight: bold;">Quality:</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="quality" value="1" style="margin-right: 10px;">Low (Fast)</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="quality" value="2" checked style="margin-right: 10px;">Medium (Balanced)</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="quality" value="3" style="margin-right: 10px;">High (Best quality)</label></div><div style="text-align: center; margin-top: 20px;"><button id="image-ok" class="btn-primary">Convert</button><button id="image-cancel" class="btn-secondary">Cancel</button></div></div>`;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#image-ok').onclick = () => {
            const format = dialog.querySelector('input[name="format"]:checked').value;
            const quality = parseInt(dialog.querySelector('input[name="quality"]:checked').value);
            document.body.removeChild(dialog);
            resolve({ format, quality });
        };
        
        dialog.querySelector('#image-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

// Show image order selection dialog
function showImageOrderDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        const fileList = selectedFiles.map((file, index) => 
            `<div class="merge-file-item" data-index="${index}" draggable="true"><span class="drag-handle">⋮⋮</span><span>${file.name}</span></div>`
        ).join('');
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%;"><h3 style="margin-top: 0; color: #667eea; text-align: center;">Arrange Image Order</h3><p style="text-align: center; color: #666; margin-bottom: 20px;">Drag images to reorder</p><div id="image-file-list" style="max-height: 300px; overflow-y: auto;">${fileList}</div><div style="text-align: center; margin-top: 20px;"><button id="order-ok" class="btn-primary">Continue</button><button id="order-cancel" class="btn-secondary">Cancel</button></div></div>`;
        
        document.body.appendChild(dialog);
        
        // Setup drag and drop for reordering
        const fileListContainer = dialog.querySelector('#image-file-list');
        let draggedElement = null;
        
        fileListContainer.addEventListener('dragstart', (e) => {
            draggedElement = e.target.closest('.merge-file-item');
            if (draggedElement) {
                draggedElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        fileListContainer.addEventListener('dragend', (e) => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                fileListContainer.classList.remove('drag-over');
            }
        });
        
        fileListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            fileListContainer.classList.add('drag-over');
            
            if (draggedElement) {
                const afterElement = getDragAfterElement(fileListContainer, e.clientY);
                if (afterElement == null) {
                    fileListContainer.appendChild(draggedElement);
                } else {
                    fileListContainer.insertBefore(draggedElement, afterElement);
                }
            }
        });
        
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.merge-file-item:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        
        dialog.querySelector('#order-ok').onclick = () => {
            const orderedIndexes = Array.from(dialog.querySelectorAll('.merge-file-item')).map(el => parseInt(el.dataset.index));
            const orderedFiles = orderedIndexes.map(index => selectedFiles[index]);
            document.body.removeChild(dialog);
            resolve(orderedFiles);
        };
        
        dialog.querySelector('#order-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

// Show image to PDF conversion options dialog
function showImageToPdfDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
        
        dialog.innerHTML = `<div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%;"><h3 style="margin-top: 0; color: #667eea; text-align: center;">Image to PDF Options</h3><div style="margin: 20px 0;"><label style="display: block; margin: 10px 0; font-weight: bold;">Page Size:</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="page_size" value="letter" checked style="margin-right: 10px;">Letter (8.5" × 11")</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="page_size" value="a4" style="margin-right: 10px;">A4 (210mm × 297mm)</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="page_size" value="legal" style="margin-right: 10px;">Legal (8.5" × 14")</label><label style="display: block; margin: 15px 0 5px 0; font-weight: bold;">Fit Mode:</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="fit_mode" value="fit" checked style="margin-right: 10px;">Fit - Maintain aspect ratio</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="fit_mode" value="fill" style="margin-right: 10px;">Fill - Fill page, may crop</label><label style="display: block; margin: 5px 0; cursor: pointer;"><input type="radio" name="fit_mode" value="stretch" style="margin-right: 10px;">Stretch - Fill page exactly</label></div><div style="text-align: center; margin-top: 20px;"><button id="pdf-ok" class="btn-primary">Convert to PDF</button><button id="pdf-cancel" class="btn-secondary">Cancel</button></div></div>`;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#pdf-ok').onclick = () => {
            const page_size = dialog.querySelector('input[name="page_size"]:checked').value;
            const fit_mode = dialog.querySelector('input[name="fit_mode"]:checked').value;
            document.body.removeChild(dialog);
            resolve({ page_size, fit_mode });
        };
        
        dialog.querySelector('#pdf-cancel').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});