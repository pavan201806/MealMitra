import os
import json
import logging
import pytesseract
from pdf2image import convert_from_path
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def clean_ocr_text(text: str) -> str:
    """Clean OCR text but be less aggressive to avoid filtering everything"""
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = line.strip()

        # ❌ Drop only truly junk lines
        if not line:
            continue
        # Reduced from 15 to 3 to be less aggressive
        if len(line) < 3:
            continue
        # Filter out obvious OCR artifacts
        if "sorry if that wasn" in line.lower():
            continue
        if "ask again" in line.lower():
            continue

        cleaned.append(line)

    return " ".join(cleaned)


def load_pdfs():
    docs = []

    if not settings.PDF_DIR.exists():
        logger.warning("PDF directory not found")
        return docs

    for file in os.listdir(settings.PDF_DIR):
        if not file.lower().endswith(".pdf"):
            continue

        path = settings.PDF_DIR / file
        logger.info(f"📄 PDF: {path}")

        try:
            # Track which pages have native text (to avoid duplicate OCR)
            pages_with_native_text = set()
            total_pages = 0
            
            # STRATEGY 1: Try native PDF text extraction first
            native_extraction_success = False
            try:
                # Try PyPDF2 first
                try:
                    import PyPDF2
                    with open(path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        total_pages = len(reader.pages)
                        logger.info(f"   PDF has {total_pages} pages")
                        
                        for page_no, page in enumerate(reader.pages, start=1):
                            text = page.extract_text()
                            
                            if text and len(text.strip()) > 50:  # Meaningful text
                                # Native text found!
                                logger.info(f"   ✅ Page {page_no}: Extracted {len(text)} chars (native text)")
                                docs.append(
                                    Document(
                                        page_content=text.strip(),
                                        metadata={
                                            "source": "pdf",
                                            "file": file,
                                            "page": page_no,
                                            "extraction_method": "native"
                                        }
                                    )
                                )
                                pages_with_native_text.add(page_no)
                        
                        if len(pages_with_native_text) == total_pages:
                            logger.info(f"   ✅ Successfully extracted native text from all {total_pages} pages")
                            native_extraction_success = True
                            continue  # All pages done, skip OCR
                        elif pages_with_native_text:
                            logger.info(f"   ✅ Extracted native text from {len(pages_with_native_text)}/{total_pages} pages, using OCR for remaining pages")
                            native_extraction_success = True
                        else:
                            logger.info(f"   ⚠️ No native text found, trying pdfplumber as fallback")
                            
                except ImportError:
                    logger.info("   PyPDF2 not available, trying pdfplumber...")
                    raise
                except Exception as e:
                    logger.warning(f"   PyPDF2 extraction failed: {e}, trying pdfplumber...")
                    raise
                
                # Fallback to pdfplumber if PyPDF2 failed
                if not native_extraction_success:
                    try:
                        import pdfplumber
                        with pdfplumber.open(path) as pdf:
                            total_pages = len(pdf.pages)
                            logger.info(f"   PDF has {total_pages} pages (pdfplumber)")
                            
                            for page_no, page in enumerate(pdf.pages, start=1):
                                text = page.extract_text()
                                
                                if text and len(text.strip()) > 50:
                                    logger.info(f"   ✅ Page {page_no}: Extracted {len(text)} chars (pdfplumber)")
                                    docs.append(
                                        Document(
                                            page_content=text.strip(),
                                            metadata={
                                                "source": "pdf",
                                                "file": file,
                                                "page": page_no,
                                                "extraction_method": "native_pdfplumber"
                                            }
                                        )
                                    )
                                    pages_with_native_text.add(page_no)
                            
                            if len(pages_with_native_text) == total_pages:
                                logger.info(f"   ✅ Successfully extracted native text from all {total_pages} pages (pdfplumber)")
                                continue
                            elif pages_with_native_text:
                                logger.info(f"   ✅ Extracted native text from {len(pages_with_native_text)}/{total_pages} pages, using OCR for remaining")
                    except ImportError:
                        logger.info("   pdfplumber not available, using OCR for all pages")
                    except Exception as e:
                        logger.warning(f"   pdfplumber extraction failed: {e}, using OCR")
                    
            except ImportError:
                logger.info("   No PDF libraries available, using OCR for all pages")
            except Exception as e:
                logger.warning(f"   Native text extraction failed: {e}, trying OCR")
            
            # STRATEGY 2: Fall back to OCR for pages without native text
            try:
                images = convert_from_path(
                    path,
                    dpi=300,
                    poppler_path=settings.POPPLER_PATH if settings.POPPLER_PATH else None
                )
                logger.info(f"   Converting {len(images)} pages to images for OCR...")
            except Exception as e:
                logger.error(f"   ❌ Failed to convert PDF to images: {e}")
                logger.error(f"   Make sure Poppler is installed and POPPLER_PATH is set correctly")
                continue  # Skip this PDF and move to next
            
            for page_no, img in enumerate(images, start=1):
                # Skip OCR if we already have native text for this page
                if page_no in pages_with_native_text:
                    logger.info(f"   ⏭️ Page {page_no}: Skipping OCR (already has native text)")
                    continue
                # Try multiple OCR PSM modes for better text extraction
                raw_text = ""
                psm_modes = ["--psm 6", "--psm 4", "--psm 3", "--psm 1"]
                
                for psm_mode in psm_modes:
                    try:
                        test_text = pytesseract.image_to_string(img, config=f"{psm_mode} -l eng")
                        if len(test_text.strip()) > len(raw_text.strip()):
                            raw_text = test_text
                    except Exception as e:
                        logger.debug(f"   PSM mode {psm_mode} failed: {e}")
                        continue
                
                # If still no text, try without PSM mode
                if not raw_text.strip():
                    try:
                        raw_text = pytesseract.image_to_string(img, config="-l eng")
                    except Exception as e:
                        logger.warning(f"   OCR failed: {e}")
                
                logger.info(f"   Page {page_no}: OCR extracted {len(raw_text)} raw chars")
                
                # Only clean if we have text
                if raw_text.strip():
                    cleaned_text = clean_ocr_text(raw_text)
                    logger.info(f"   Page {page_no}: After cleaning: {len(cleaned_text)} chars")

                    if cleaned_text.strip():
                        logger.info(f"   ✅ Page {page_no}: Added to documents")
                        docs.append(
                            Document(
                                page_content=cleaned_text,
                                metadata={
                                    "source": "pdf",
                                    "file": file,
                                    "page": page_no,
                                    "extraction_method": "ocr"
                                }
                            )
                        )
                    else:
                        logger.warning(f"   ⚠️ Page {page_no}: Text was filtered out during cleaning")
                        # If cleaning removed everything, use raw text as fallback
                        if len(raw_text.strip()) > 50:
                            logger.info(f"   ✅ Page {page_no}: Using raw OCR text (cleaning was too aggressive)")
                            docs.append(
                                Document(
                                    page_content=raw_text.strip(),
                                    metadata={
                                        "source": "pdf",
                                        "file": file,
                                        "page": page_no,
                                        "extraction_method": "ocr_raw"
                                    }
                                )
                            )
                else:
                    logger.warning(f"   ❌ Page {page_no}: No text extracted from OCR")

        except Exception as e:
            logger.error(f"❌ Failed PDF {file}: {e}")
            import traceback
            traceback.print_exc()

    logger.info(f"📚 Total PDF pages loaded: {len(docs)}")
    return docs


# ---------- TXT LOADER ----------
def load_txts():
    docs = []
    if not settings.TEXT_DIR.exists():
        logger.warning(f"⚠️ TXT folder not found: {settings.TEXT_DIR}")
        return docs

    for file in os.listdir(settings.TEXT_DIR):
        if file.lower().endswith(".txt"):
            path = settings.TEXT_DIR / file
            logger.info(f"📄 TXT: {path}")
            text = open(path, encoding="utf-8").read()
            docs.append(Document(
                page_content=text,
                metadata={"source": file, "type": "txt"}
            ))

    return docs

# ---------- JSON LOADER ----------
def load_json():
    documents = []

    json_dir = settings.DATA_DIR / "json"
    if not json_dir.exists():
        logger.warning("JSON directory not found")
        return documents

    for file in os.listdir(json_dir):
        if not file.lower().endswith(".json"):
            continue

        path = json_dir / file
        logger.info(f"📦 JSON: {path}")

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Intent-style JSON
            if isinstance(data, dict) and "intents" in data:
                for intent in data["intents"]:
                    tag = intent.get("tag", "unknown")
                    for response in intent.get("responses", []):
                        documents.append(
                            Document(
                                page_content=response.strip(),
                                metadata={
                                    "source": "json",
                                    "file": file,
                                    "tag": tag
                                }
                            )
                        )

        except Exception as e:
            logger.error(f"❌ JSON error {file}: {e}")

    return documents



def main():
    logger.info("🚀 Starting document ingestion...")
    
    documents = []
    documents.extend(load_pdfs())
    documents.extend(load_txts())
    documents.extend(load_json())

    if not documents:
        logger.error("❌ No documents found to ingest")
        return

    logger.info(f"📄 Total documents loaded: {len(documents)}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP
    )

    chunks = splitter.split_documents(documents)
    logger.info(f"✂️ Created {len(chunks)} chunks")

    embeddings = HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL
    )

    logger.info("🧠 Creating FAISS index...")
    db = FAISS.from_documents(chunks, embeddings)
    db.save_local(settings.get_index_path())

    logger.info(f"✅ FAISS index created with {len(chunks)} chunks at {settings.get_index_path()}")

if __name__ == "__main__":
    main()
