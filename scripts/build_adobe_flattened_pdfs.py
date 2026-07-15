from __future__ import annotations

from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


MM_TO_PT = 72 / 25.4
PAGE_W_MM = 51.0
PAGE_H_MM = 31.0
BLEED_MM = 0.5

ROOT = Path(__file__).resolve().parents[1]
RASTER_DIR = ROOT / "tmp" / "pdfs" / "flattened_600dpi"
OUTPUT_DIR = ROOT / "output" / "pdf" / "compatibilidade_maxima"


def build_pdf(index: int) -> Path:
    source_image = RASTER_DIR / f"mundo_{index}.png"
    temp_jpeg = RASTER_DIR / f"mundo_{index}_cmyk_600dpi.jpg"
    temp_pdf = RASTER_DIR / f"mundo_{index}_base.pdf"
    output_pdf = OUTPUT_DIR / (
        f"de_para_3x5_infantil_mundo_{index}_compatibilidade_maxima_600dpi.pdf"
    )

    with Image.open(source_image) as image:
        image.convert("CMYK").save(
            temp_jpeg,
            "JPEG",
            quality=100,
            subsampling=0,
            dpi=(600, 600),
            optimize=True,
        )

    page_w = PAGE_W_MM * MM_TO_PT
    page_h = PAGE_H_MM * MM_TO_PT
    pdf = canvas.Canvas(str(temp_pdf), pagesize=(page_w, page_h), pageCompression=1)
    pdf.setTitle(f"Mundo Encantado {index} - compatibilidade maxima")
    pdf.setCreator("Adobe-compatible flattened prepress rebuild")
    pdf.drawImage(
        ImageReader(str(temp_jpeg)),
        0,
        0,
        width=page_w,
        height=page_h,
        preserveAspectRatio=False,
        mask=None,
    )
    pdf.showPage()
    pdf.save()

    reader = PdfReader(temp_pdf, strict=True)
    writer = PdfWriter()
    writer.add_page(reader.pages[0])
    page = writer.pages[0]
    bleed = BLEED_MM * MM_TO_PT
    page.mediabox = RectangleObject((0, 0, page_w, page_h))
    page.cropbox = RectangleObject((0, 0, page_w, page_h))
    page.bleedbox = RectangleObject((0, 0, page_w, page_h))
    page.trimbox = RectangleObject((bleed, bleed, page_w - bleed, page_h - bleed))
    if "/ArtBox" in page:
        del page["/ArtBox"]
    writer._header = b"%PDF-1.7"
    writer.add_metadata(
        {
            "/Title": f"Mundo Encantado {index} - compatibilidade maxima 600 dpi",
            "/Creator": "Adobe-compatible flattened prepress rebuild",
            "/Producer": "ReportLab and pypdf",
        }
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with output_pdf.open("wb") as stream:
        writer.write(stream)
    return output_pdf


def main() -> None:
    for index in range(1, 5):
        print(build_pdf(index))


if __name__ == "__main__":
    main()
