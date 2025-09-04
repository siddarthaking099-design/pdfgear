from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import PyPDF2
import io
import fitz  # PyMuPDF
from docx import Document
import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4, legal
from reportlab.lib.utils import ImageReader
import zipfile
from PIL import Image

app = Flask(__name__)
CORS(app)

class PDFProcessor:
    
    @staticmethod
    def pdf_to_word(pdf_file):
        """Convert PDF to Word using PyMuPDF"""
        try:
            pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
            doc = Document()
            
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                if page_num > 0:
                    doc.add_page_break()
                
                blocks = page.get_text("dict")["blocks"]
                for block in blocks:
                    if "lines" in block:
                        for line in block["lines"]:
                            line_text = ""
                            for span in line["spans"]:
                                line_text += span["text"]
                            if line_text.strip():
                                p = doc.add_paragraph(line_text.strip())
            
            pdf_document.close()
            output = io.BytesIO()
            doc.save(output)
            output.seek(0)
            return output
        except Exception as e:
            raise Exception(f"Error converting PDF to Word: {str(e)}")

    @staticmethod
    def pdf_to_excel(pdf_file):
        """Convert PDF to Excel"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            data = []
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                lines = text.split('\n')
                for line_num, line in enumerate(lines):
                    if line.strip():
                        data.append({
                            'Page': page_num + 1,
                            'Line': line_num + 1,
                            'Content': line.strip()
                        })
            
            df = pd.DataFrame(data)
            output = io.BytesIO()
            df.to_excel(output, index=False)
            output.seek(0)
            return output
        except Exception as e:
            raise Exception(f"Error converting PDF to Excel: {str(e)}")
    
    @staticmethod
    def pdf_to_images(pdf_file, image_format='png', quality=2):
        """Convert PDF pages to images"""
        try:
            pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
            images = []
            zoom_matrix = fitz.Matrix(quality, quality)
            
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                pix = page.get_pixmap(matrix=zoom_matrix)
                
                if image_format.lower() == 'jpg':
                    img_data = pix.tobytes("jpeg")
                    ext = 'jpg'
                else:
                    img_data = pix.tobytes("png")
                    ext = 'png'
                
                images.append((img_data, ext))
            
            pdf_document.close()
            
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                for i, (img_data, ext) in enumerate(images):
                    zip_file.writestr(f'page_{i+1}.{ext}', img_data)
            
            zip_buffer.seek(0)
            return zip_buffer
        except Exception as e:
            raise Exception(f"Error converting PDF to images: {str(e)}")
    
    @staticmethod
    def images_to_pdf(image_files, page_size='letter', fit_mode='fit'):
        """Convert images to PDF"""
        try:
            page_sizes = {'letter': letter, 'a4': A4, 'legal': legal}
            page_size_tuple = page_sizes.get(page_size, letter)
            width, height = page_size_tuple
            
            output = io.BytesIO()
            c = canvas.Canvas(output, pagesize=page_size_tuple)
            
            for image_file in image_files:
                image_file.seek(0)
                img = Image.open(image_file)
                img_width, img_height = img.size
                
                if fit_mode == 'stretch':
                    new_width, new_height = width * 0.9, height * 0.9
                    x, y = width * 0.05, height * 0.05
                elif fit_mode == 'fill':
                    scale = max(width/img_width, height/img_height) * 0.9
                    new_width, new_height = img_width * scale, img_height * scale
                    x = (width - new_width) / 2
                    y = (height - new_height) / 2
                else:
                    scale = min(width/img_width, height/img_height) * 0.8
                    new_width, new_height = img_width * scale, img_height * scale
                    x = (width - new_width) / 2
                    y = (height - new_height) / 2
                
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                temp_img = io.BytesIO()
                img.save(temp_img, format='JPEG', quality=85)
                temp_img.seek(0)
                
                c.drawImage(temp_img, x, y, new_width, new_height)
                c.showPage()
            
            c.save()
            output.seek(0)
            return output
        except Exception as e:
            raise Exception(f"Error converting images to PDF: {str(e)}")

    @staticmethod
    def merge_pdfs(pdf_files):
        """Merge multiple PDF files"""
        try:
            merger = PyPDF2.PdfMerger()
            for pdf_file in pdf_files:
                merger.append(pdf_file)
            output = io.BytesIO()
            merger.write(output)
            merger.close()
            output.seek(0)
            return output
        except Exception as e:
            raise Exception(f"Error merging PDFs: {str(e)}")

# API Routes
@app.route('/api/pdf-to-word', methods=['POST'])
def pdf_to_word():
    try:
        file = request.files['file']
        result = PDFProcessor.pdf_to_word(file)
        return send_file(result, as_attachment=True, download_name='converted.docx', 
                        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pdf-to-excel', methods=['POST'])
def pdf_to_excel():
    try:
        file = request.files['file']
        result = PDFProcessor.pdf_to_excel(file)
        return send_file(result, as_attachment=True, download_name='converted.xlsx', 
                        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pdf-to-images', methods=['POST'])
def pdf_to_images():
    try:
        file = request.files['file']
        image_format = request.form.get('format', 'png')
        quality = int(request.form.get('quality', 2))
        result = PDFProcessor.pdf_to_images(file, image_format, quality)
        return send_file(result, as_attachment=True, download_name='images.zip', 
                        mimetype='application/zip')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images-to-pdf', methods=['POST'])
def images_to_pdf():
    try:
        files = request.files.getlist('files')
        page_size = request.form.get('page_size', 'letter')
        fit_mode = request.form.get('fit_mode', 'fit')
        result = PDFProcessor.images_to_pdf(files, page_size, fit_mode)
        return send_file(result, as_attachment=True, download_name='images_to_pdf.pdf', 
                        mimetype='application/pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/merge-pdf', methods=['POST'])
def merge_pdf():
    try:
        files = request.files.getlist('files')
        result = PDFProcessor.merge_pdfs(files)
        return send_file(result, as_attachment=True, download_name='merged.pdf', 
                        mimetype='application/pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'status': 'running', 'message': 'PDF Gears Python backend is active'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)