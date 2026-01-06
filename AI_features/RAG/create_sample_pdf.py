from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

# Create a PDF with caffeine information
pdf_path = "data/pdfs/caffeine_info.pdf"

c = canvas.Canvas(pdf_path, pagesize=letter)
width, height = letter

# Title
c.setFont("Helvetica-Bold", 16)
c.drawString(1*inch, height - 1*inch, "Caffeine Information Guide")

# Content
c.setFont("Helvetica", 12)
y_position = height - 1.5*inch

content = [
    "What is Caffeine?",
    "",
    "Caffeine is a natural stimulant most commonly found in tea, coffee, and cacao plants.",
    "It works by stimulating the brain and central nervous system, helping you stay alert",
    "and prevent the onset of tiredness.",
    "",
    "Sources of Caffeine:",
    "- Coffee: 95mg per 8oz cup",
    "- Black tea: 47mg per 8oz cup", 
    "- Green tea: 28mg per 8oz cup",
    "- Energy drinks: 80-150mg per 8oz",
    "- Dark chocolate: 12mg per ounce",
    "",
    "Effects of Caffeine:",
    "Caffeine blocks adenosine receptors in the brain, which normally promote sleep.",
    "This leads to increased alertness, improved mood, and enhanced physical performance.",
    "Most people can safely consume up to 400mg of caffeine per day.",
    "",
    "Side Effects:",
    "Excessive caffeine consumption may cause anxiety, jitters, rapid heartbeat,",
    "and difficulty sleeping. It's best to limit intake and avoid caffeine late in the day.",
]

for line in content:
    c.drawString(1*inch, y_position, line)
    y_position -= 0.25*inch

c.save()
print(f"✅ Created PDF with caffeine information: {pdf_path}")
