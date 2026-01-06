import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings
import pytesseract
from pdf2image import convert_from_path

print("Testing PDF Extraction...")
print(f"PDF Directory: {settings.PDF_DIR}")
print(f"Tesseract CMD: {settings.TESSERACT_CMD}")
print(f"Poppler Path: {settings.POPPLER_PATH}")

if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    print(f"Tesseract configured: {pytesseract.pytesseract.tesseract_cmd}")

# Find PDF files
pdf_files = [f for f in os.listdir(settings.PDF_DIR) if f.lower().endswith('.pdf')]
print(f"\nPDF files found: {pdf_files}")

if pdf_files:
    test_pdf = settings.PDF_DIR / pdf_files[0]
    print(f"\nTesting: {test_pdf}")
    
    try:
        # Convert first page
        print("Converting PDF to image...")
        images = convert_from_path(
            test_pdf,
            dpi=300,
            first_page=1,
            last_page=1,
            poppler_path=settings.POPPLER_PATH
        )
        print(f"Converted {len(images)} pages")
        
        if images:
            # Extract text
            print("Extracting text with OCR...")
            text = pytesseract.image_to_string(images[0], config="--psm 4 -l eng")
            print(f"Extracted {len(text)} characters")
            print(f"\nFirst 500 characters:\n{text[:500]}")
            
            # Apply cleaning
            from backend.ingest import clean_ocr_text
            cleaned = clean_ocr_text(text)
            print(f"\nCleaned text ({len(cleaned)} chars):\n{cleaned[:500]}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
