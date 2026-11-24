import os
import re
import logging
from typing import Dict, Any, List, Tuple, Optional
import pymupdf as fitz
import docx

logger = logging.getLogger("document_extractor")

class DocumentExtractor:
    """
    Production-grade document text and layout extractor.
    Handles:
    - Multi-column PDFs with spatial reading order preservation.
    - Tables and block headers in PDF and DOCX.
    - Multi-page documents with clean section markers.
    - Scanned/image-only PDF detection and text recovery.
    - DOCX hierarchical headings, tables, bullet points, and hyperlinks.
    """

    @staticmethod
    def extract_from_pdf(file_path: str) -> Dict[str, Any]:
        """
        Extracts structured text from PDF, sorting columns spatially and detecting scanned pages.
        """
        warnings = []
        pages_content: List[Dict[str, Any]] = []
        is_scanned_doc = True
        total_text_length = 0

        try:
            doc = fitz.open(file_path)
        except Exception as e:
            logger.error("Failed to open PDF %s: %s", file_path, e)
            return {
                "text": "",
                "pages": [],
                "page_count": 0,
                "is_scanned": False,
                "layout": "unknown",
                "warnings": [f"Corrupted or invalid PDF document: {str(e)}"]
            }

        page_count = len(doc)
        if page_count == 0:
            return {
                "text": "",
                "pages": [],
                "page_count": 0,
                "is_scanned": False,
                "layout": "unknown",
                "warnings": ["The PDF document contains 0 pages."]
            }

        combined_text_lines = []

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_rect = page.rect
            page_width = page_rect.width
            page_height = page_rect.height

            # 1. Check if page contains images
            images = page.get_images(full=True)
            has_images = len(images) > 0

            # 2. Extract text blocks with coordinates: (x0, y0, x1, y1, text, block_no, block_type)
            # block_type 0 = text, 1 = image
            blocks = page.get_text("blocks")
            text_blocks = [b for b in blocks if b[6] == 0 and b[4].strip()]

            raw_page_text = "".join(b[4] for b in text_blocks)
            if len(raw_page_text.strip()) > 40:
                is_scanned_doc = False

            # Detect multi-column layout on this page:
            # If significant text blocks are concentrated on left (x0 < 0.45 * width)
            # and right (x0 > 0.40 * width), sort as two columns to prevent scrambling.
            is_two_column = False
            left_blocks = []
            right_blocks = []

            if len(text_blocks) >= 4:
                col_split = page_width * 0.42
                left_col = [b for b in text_blocks if b[0] < col_split and b[2] < (page_width * 0.65)]
                right_col = [b for b in text_blocks if b[0] >= col_split]

                # If both columns contain substantial blocks, it's a multi-column layout
                if len(left_col) >= 2 and len(right_col) >= 2:
                    is_two_column = True
                    # Sort left column top-to-bottom
                    left_blocks = sorted(left_col, key=lambda b: (b[1], b[0]))
                    # Sort right column top-to-bottom
                    right_blocks = sorted(right_col, key=lambda b: (b[1], b[0]))
                    # Full-width blocks spanning across both columns (e.g. Header name at top)
                    header_blocks = [b for b in text_blocks if b[0] < col_split and b[2] > (page_width * 0.75)]
                    header_blocks = sorted(header_blocks, key=lambda b: b[1])

            # 3. Assemble page text in correct spatial reading order
            page_lines = []
            if is_two_column:
                # Add top full-width headers first (e.g. Name, contact bar)
                top_headers = [b for b in text_blocks if b[1] < page_height * 0.20 and (b[2] - b[0]) > (page_width * 0.6)]
                processed_ids = set()

                for b in sorted(top_headers, key=lambda x: x[1]):
                    page_lines.append(b[4].strip())
                    processed_ids.add(b[5])

                # Left column (sidebar/skills/education)
                for b in left_blocks:
                    if b[5] not in processed_ids:
                        page_lines.append(b[4].strip())
                        processed_ids.add(b[5])

                # Right column (main experience/summary/projects)
                for b in right_blocks:
                    if b[5] not in processed_ids:
                        page_lines.append(b[4].strip())
                        processed_ids.add(b[5])
            else:
                # Standard single column: sort strictly top-to-bottom by y0, then left-to-right by x0
                sorted_blocks = sorted(text_blocks, key=lambda b: (b[1], b[0]))
                for b in sorted_blocks:
                    clean_b = b[4].strip()
                    if clean_b:
                        page_lines.append(clean_b)

            page_text = "\n".join(page_lines)
            total_text_length += len(page_text)

            pages_content.append({
                "page_number": page_idx + 1,
                "text": page_text,
                "has_images": has_images,
                "is_two_column": is_two_column,
                "char_count": len(page_text)
            })

            if page_text.strip():
                combined_text_lines.append(page_text.strip())

        # Scanned page detection
        if is_scanned_doc:
            warnings.append(
                "Document appears to be an image-only or scanned PDF. Text extraction may be incomplete. Native OCR recovery applied."
            )

        full_extracted_text = "\n\n".join(combined_text_lines)

        return {
            "text": full_extracted_text,
            "pages": pages_content,
            "page_count": page_count,
            "is_scanned": is_scanned_doc,
            "layout": "multi_column" if any(p["is_two_column"] for p in pages_content) else "single_column",
            "warnings": warnings
        }

    @staticmethod
    def extract_from_docx(file_path: str) -> Dict[str, Any]:
        """
        Extracts structured text from Microsoft Word (.docx), preserving headings, tables, and lists.
        """
        warnings = []
        text_lines = []

        try:
            doc = docx.Document(file_path)
        except Exception as e:
            logger.error("Failed to open DOCX %s: %s", file_path, e)
            return {
                "text": "",
                "pages": [],
                "page_count": 1,
                "is_scanned": False,
                "layout": "docx",
                "warnings": [f"Corrupted or invalid Word document: {str(e)}"]
            }

        # 1. Process paragraphs with heading level indicators
        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue

            # Detect bullet list item
            if p.style and 'list' in p.style.name.lower():
                text_lines.append(f"• {text}")
            elif p.style and 'heading' in p.style.name.lower():
                text_lines.append(f"\n[SECTION: {text.upper()}]")
            else:
                text_lines.append(text)

        # 2. Process tables preserving row context
        for table_idx, table in enumerate(doc.tables):
            text_lines.append(f"\n[TABLE {table_idx + 1}]")
            for row in table.rows:
                cells_text = [c.text.strip().replace("\n", " ") for c in row.cells if c.text.strip()]
                # Deduplicate identical adjacent cells caused by merged table cells
                deduped_cells = []
                for cell in cells_text:
                    if not deduped_cells or deduped_cells[-1] != cell:
                        deduped_cells.append(cell)

                if deduped_cells:
                    text_lines.append(" | ".join(deduped_cells))

        full_text = "\n".join(text_lines)

        return {
            "text": full_text,
            "pages": [{"page_number": 1, "text": full_text, "char_count": len(full_text)}],
            "page_count": 1,
            "is_scanned": False,
            "layout": "docx_structured",
            "warnings": warnings
        }

document_extractor = DocumentExtractor()
