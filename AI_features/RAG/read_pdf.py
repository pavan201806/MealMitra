import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.config import settings
import PyPDF2

pdf_file = settings.PDF_DIR / "xyz.pdf"

print(f"Analyzing PDF: {pdf_file}")
print(f"File exists: {pdf_file.exists()}")
print(f"File size: {os.path.getsize(pdf_file)} bytes\n")

with open(pdf_file, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    print(f"Number of pages: {len(reader.pages)}\n")
    
    for page_no, page in enumerate(reader.pages, start=1):
        print(f"=== Page {page_no} ===")
        text = page.extract_text()
        print(f"Text length: {len(text)}")
        print(f"Text content:\n{text}\n")
        print(f"First 500 chars: {text[:500]}\n")
