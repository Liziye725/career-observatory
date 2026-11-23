"""Extract numbered text pages from an official PDF downloaded separately."""
import shutil
import subprocess
import sys
from pathlib import Path


def extract_pages(source):
    try:
        import fitz
    except ImportError:
        executable = shutil.which("pdftotext")
        if not executable:
            raise ValueError("Install PyMuPDF or Poppler's pdftotext.") from None
        output = subprocess.run(
            [executable, "-layout", str(source.resolve()), "-"],
            check=True, capture_output=True, encoding="utf-8", timeout=120,
        ).stdout
        pages = output.split("\f")
        if pages[-1] == "":
            pages.pop()
        return pages

    with fitz.open(source) as report:
        return [page.get_text() for page in report]


if len(sys.argv) != 3:
    raise SystemExit("Usage: extract-pdf.py input.pdf output.txt")

try:
    pages = extract_pages(Path(sys.argv[1]))
    if not any(page.strip() for page in pages):
        raise ValueError("No extractable text. Check whether the PDF needs OCR.")
    text = "\n".join(f"PDF PAGE {i + 1}\n{page}" for i, page in enumerate(pages))
    Path(sys.argv[2]).write_text(text, encoding="utf-8")
except (ValueError, OSError, RuntimeError, subprocess.SubprocessError) as error:
    raise SystemExit(f"PDF extraction failed: {error}") from None

print(f"Extracted {len(pages)} pages. Verify tables against the original PDF.")
