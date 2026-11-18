"""ASSISTANT: optional extraction utility matching the original research method.
Usage: python scripts/extract-pdf.py downloaded-official-report.pdf output.txt
Download the official document separately; preserve its URL and observed date in sources.
"""
import sys
from pathlib import Path
try:
    import fitz
except ImportError:
    raise SystemExit('Install optional research dependencies: pip install -r requirements-research.txt')
if len(sys.argv) != 3:
    raise SystemExit('Usage: extract-pdf.py input.pdf output.txt')
with fitz.open(sys.argv[1]) as report:
    text = '\n'.join(f'PDF PAGE {i + 1}\n{page.get_text()}' for i, page in enumerate(report))
    Path(sys.argv[2]).write_text(text, encoding='utf-8')
    print(f'Extracted {len(report)} pages; check tables against original PDF before using figures.')
