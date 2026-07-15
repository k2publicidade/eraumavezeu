from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject


MM_TO_PT = 72 / 25.4
BLEED = 0.5 * MM_TO_PT

pdf_path = Path(__file__).resolve().parents[1] / "output" / "illustrator" / "mundo_1_layout_vetor_impressao.pdf"
temp_path = pdf_path.with_name(pdf_path.stem + "_boxes.pdf")

reader = PdfReader(pdf_path, strict=True)
writer = PdfWriter(reader)
writer._header = b"%PDF-1.6"
page = writer.pages[0]
width = float(page.mediabox.width)
height = float(page.mediabox.height)

page.mediabox = RectangleObject((0, 0, width, height))
page.cropbox = RectangleObject((0, 0, width, height))
page.bleedbox = RectangleObject((0, 0, width, height))
page.trimbox = RectangleObject((BLEED, BLEED, width - BLEED, height - BLEED))

with temp_path.open("wb") as output:
    writer.write(output)

writer.close()
temp_path.replace(pdf_path)
print(pdf_path)
