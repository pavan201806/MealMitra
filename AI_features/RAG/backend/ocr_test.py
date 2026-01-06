# from pdf2image import convert_from_path
# import pytesseract
# import cv2
# import numpy as np

# # Set paths
# PDF_PATH = r"D:\VIBEAI\RAG\data\pdfs\xyz.pdf"
# POPPLER_PATH = r"C:\Program Files\poppler-24.02.0\Library\bin"  # change if different
    
# # Convert first page to image
# pages = convert_from_path(
#     PDF_PATH,
#     dpi=300,
#     first_page=1,
#     last_page=1,
#     poppler_path=r"C:\\Users\\pavan\\Downloads\\Release-23.08.0-0\\poppler-23.08.0\\Library\\bin"
# )



# img = pages[0]
# img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
# # Convert PIL -> OpenCV
# img = np.array(img)
# img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

# # Rotate 90 degrees clockwise (your PDF is sideways)
# img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

# # OCR
# text = pytesseract.image_to_string(
#     img,
#     config="--psm 6 -l eng"
# )


# print("Success")


# from pdf2image import convert_from_path
# import pytesseract
# import cv2
# import numpy as np

# PDF_PATH = r"D:\VIBEAI\RAG\data\pdfs\xyz.pdf"
# POPPLER_PATH = r"C:\Users\pavan\Downloads\Release-23.08.0-0\poppler-23.08.0\Library\bin"

# pages = convert_from_path(
#     PDF_PATH,
#     dpi=300,
#     first_page=1,
#     last_page=1,
#     poppler_path=POPPLER_PATH
# )

# img = np.array(pages[0])
# img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

# # rotate only if needed
# img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

# text = pytesseract.image_to_string(
#     img,
#     config="--psm 6 -l eng"
# )

# print("OCR SUCCESS")
# print(text[:500])


from pdf2image import convert_from_path
import pytesseract
import numpy as np
import cv2
import re

def clean_ocr_text(text: str) -> str:
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = line.strip()

        if not line:
            continue
        if len(line) < 15:
            continue
        if line.startswith('"') and line.endswith('"'):
            continue
        if "sorry if that wasn" in line.lower():
            continue
        if "ask again" in line.lower():
            continue

        cleaned.append(line)

    return " ".join(cleaned)


def extract_pdf_text(pdf_path: str, poppler_path: str):
    pages = convert_from_path(
        pdf_path,
        dpi=300,
        poppler_path=poppler_path
    )

    all_text = []

    for page_no, page in enumerate(pages, start=1):
        img = np.array(page)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

        # 🔹 Auto-rotation detection
        try:
            osd = pytesseract.image_to_osd(img)
            rotation = int(
                [l for l in osd.split("\n") if "Rotate:" in l][0].split(":")[1]
            )
            if rotation != 0:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        except:
            pass

        raw_text = pytesseract.image_to_string(img, config="--psm 4 -l eng")
        cleaned = clean_ocr_text(raw_text)

        if cleaned:
            all_text.append(cleaned)

    return "\n".join(all_text)
