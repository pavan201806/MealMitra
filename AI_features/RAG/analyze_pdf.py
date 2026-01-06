import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings

pdf_file = settings.PDF_DIR / "xyz.pdf"

print(f"Analyzing PDF: {pdf_file}")
print(f"File size: {os.path.getsize(pdf_file)} bytes")

# Try PyPDF2 first (for native text PDFs)
try:
    import PyPDF2
    with open(pdf_file, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        print(f"\nPDF has {len(reader.pages)} pages")
        
        # Try to extract text from first page
        first_page = reader.pages[0]
        text = first_page.extract_text()
        
        if text and text.strip():
            print(f"✅ PDF has native text! ({len(text)} chars)")
            print(f"First 300 chars:\n{text[:300]}")
        else:
            print("❌ No native text found - this is likely a scanned image PDF")
            
except ImportError:
    print("PyPDF2 not installed, trying pdfplumber...")
    
    try:
        import pdfplumber
        with pdfplumber.open(pdf_file) as pdf:
            print(f"\nPDF has {len(pdf.pages)} pages")
            first_page = pdf.pages[0]
            text = first_page.extract_text()
            
            if text and text.strip():
                print(f"✅ PDF has native text! ({len(text)} chars)")
                print(f"First 300 chars:\n{text[:300]}")
            else:
                print("❌ No native text found - this is likely a scanned image PDF")
    except ImportError:
        print("Neither PyPDF2 nor pdfplumber installed")
    except Exception as e:
        print(f"Error with pdfplumber: {e}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

# Also check if OCR is actually working
print("\n" + "="*60)
print("Testing Tesseract OCR directly...")
print("="*60)

try:
    import pytesseract
    from PIL import Image
    
    if settings.TESSERACT_CMD:
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    
    # Test with a simple text image
    print(f"Tesseract version: {pytesseract.get_tesseract_version()}")
    print("✅ Tesseract is working!")
    
except Exception as e:
    print(f"❌ Tesseract error: {e}")
