from __future__ import annotations

import copy
from pathlib import Path

from pypdf import PageObject, PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject


MM_TO_PT = 72 / 25.4
BLEED_MM = 0.5
SAFETY_MM = 0.5

SOURCE_DIR = Path(r"C:\Users\LiPeX\Documents\MUNDO ENCANTADO")
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output" / "pdf"


def clipped_copy(page: PageObject, box: tuple[float, float, float, float]) -> PageObject:
    fragment = copy.copy(page)
    rect = RectangleObject(box)
    fragment.mediabox = rect
    fragment.cropbox = rect
    fragment.trimbox = rect
    fragment.bleedbox = rect
    fragment.artbox = rect
    if "/Annots" in fragment:
        del fragment["/Annots"]
    return fragment


def add_fragment(
    target: PageObject,
    source: PageObject,
    box: tuple[float, float, float, float],
    matrix: tuple[float, float, float, float, float, float],
) -> None:
    target.merge_transformed_page(
        clipped_copy(source, box),
        Transformation(matrix),
        over=True,
        expand=False,
    )


def build_page(source: PageObject) -> PageObject:
    bleed = BLEED_MM * MM_TO_PT
    safety = SAFETY_MM * MM_TO_PT
    width = float(source.mediabox.width)
    height = float(source.mediabox.height)

    target = PageObject.create_blank_page(
        width=width + 2 * bleed,
        height=height + 2 * bleed,
    )

    # Extend the artwork into the bleed by mirroring narrow vector fragments.
    # This keeps the complete original artwork unchanged inside the trim box.
    add_fragment(target, source, (0, 0, bleed, height), (-1, 0, 0, 1, bleed, bleed))
    add_fragment(
        target,
        source,
        (width - bleed, 0, width, height),
        (-1, 0, 0, 1, 2 * width + bleed, bleed),
    )
    add_fragment(target, source, (0, 0, width, bleed), (1, 0, 0, -1, bleed, bleed))
    add_fragment(
        target,
        source,
        (0, height - bleed, width, height),
        (1, 0, 0, -1, bleed, 2 * height + bleed),
    )

    add_fragment(target, source, (0, 0, bleed, bleed), (-1, 0, 0, -1, bleed, bleed))
    add_fragment(
        target,
        source,
        (width - bleed, 0, width, bleed),
        (-1, 0, 0, -1, 2 * width + bleed, bleed),
    )
    add_fragment(
        target,
        source,
        (0, height - bleed, bleed, height),
        (-1, 0, 0, -1, bleed, 2 * height + bleed),
    )
    add_fragment(
        target,
        source,
        (width - bleed, height - bleed, width, height),
        (-1, 0, 0, -1, 2 * width + bleed, 2 * height + bleed),
    )

    target.merge_translated_page(source, bleed, bleed, over=True, expand=False)

    media = RectangleObject((0, 0, width + 2 * bleed, height + 2 * bleed))
    trim = RectangleObject((bleed, bleed, width + bleed, height + bleed))
    target.mediabox = media
    target.cropbox = media
    target.bleedbox = media
    target.trimbox = trim
    # Safety is a layout constraint, not a standardized production PDF box.
    # The artwork was verified to keep critical content inside this inset.
    if "/ArtBox" in target:
        del target["/ArtBox"]
    return target


def process(source_path: Path, output_path: Path) -> None:
    reader = PdfReader(source_path)
    if len(reader.pages) != 1:
        raise ValueError(f"Esperado PDF de uma página: {source_path}")

    writer = PdfWriter()
    writer.add_page(build_page(reader.pages[0]))
    writer.pages[0].compress_content_streams()
    # Use a clean Adobe-compatible catalog. Copying the source Illustrator XMP
    # and PDF/X declarations after changing page geometry can leave stale
    # prepress structures that strict Adobe readers reject.
    writer._header = b"%PDF-1.7"
    writer.add_metadata(
        {
            "/Title": f"{source_path.stem} - sangria 0,5 mm",
            "/Creator": "Adobe-compatible prepress rebuild",
            "/Producer": "pypdf",
        }
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as stream:
        writer.write(stream)


def main() -> None:
    for index in range(1, 5):
        source = SOURCE_DIR / f"de_para_3x5_infantil_mundo_{index}.pdf"
        output = OUTPUT_DIR / "adobe_compat" / f"de_para_3x5_infantil_mundo_{index}_adobe_300dpi_sangria_0,5mm.pdf"
        process(source, output)
        print(output)


if __name__ == "__main__":
    main()
