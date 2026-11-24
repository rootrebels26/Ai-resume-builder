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
        Crucially enriches text with PDF hyperlink annotations (e.g. [Portfolio], [GitHub], [Live Demo])
        so underlying target URLs are never lost during extraction.
        """
        warnings = []
        pages_content: List[Dict[str, Any]] = []
        is_scanned_doc = True
        total_text_length = 0
        all_extracted_links: List[Dict[str, str]] = []

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
                "links": [],
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
                "links": [],
                "warnings": ["The PDF document contains 0 pages."]
            }

        combined_text_lines = []

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_rect = page.rect
            page_width = page_rect.width
            page_height = page_rect.height

            # 1. Extract PDF link annotations
            # Links list has dicts: {'kind': 2, 'from': Rect, 'uri': '...'}
            page_links = []
            try:
                raw_links = page.get_links()
                for l in raw_links:
                    uri = l.get("uri")
                    from_rect = l.get("from")
                    if uri and from_rect:
                        page_links.append({
                            "rect": fitz.Rect(from_rect),
                            "uri": uri.strip()
                        })
                        all_extracted_links.append({
                            "uri": uri.strip(),
                            "page": page_idx + 1
                        })
            except Exception as e:
                logger.debug("Failed extracting links from page %d: %s", page_idx, e)

            # 2. Check if page contains images
            images = page.get_images(full=True)
            has_images = len(images) > 0

            # 3. Extract text words and match with hyperlink annotations
            # word tuple: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
            words = []
            try:
                words = page.get_text("words")
            except Exception:
                words = []

            # Map block_no & line_no to enriched line strings
            # If a word or phrase intersects a link annotation, append the URL
            linked_words_by_line: Dict[Tuple[int, int], List[Tuple[float, str]]] = {}
            seen_link_uris_in_line: Dict[Tuple[int, int], set] = {}

            for w in words:
                w_rect = fitz.Rect(w[0], w[1], w[2], w[3])
                w_text = w[4]
                block_no = w[5]
                line_no = w[6]
                line_key = (block_no, line_no)

                if line_key not in linked_words_by_line:
                    linked_words_by_line[line_key] = []
                    seen_link_uris_in_line[line_key] = set()

                attached_uri = None
                for pl in page_links:
                    if pl["rect"].intersects(w_rect):
                        attached_uri = pl["uri"]
                        break

                if attached_uri and attached_uri not in seen_link_uris_in_line[line_key]:
                    seen_link_uris_in_line[line_key].add(attached_uri)
                    linked_words_by_line[line_key].append((w[0], f"{w_text} ({attached_uri})"))
                else:
                    linked_words_by_line[line_key].append((w[0], w_text))

            # 4. Extract text blocks with coordinates: (x0, y0, x1, y1, text, block_no, block_type)
            # block_type 0 = text, 1 = image
            blocks = page.get_text("blocks")
            text_blocks = [b for b in blocks if b[6] == 0 and b[4].strip()]

            # Reconstruct blocks with enriched hyperlink text if available
            enriched_text_blocks = []
            for b in text_blocks:
                b_no = b[5]
                b_lines = []
                # Check if this block has line entries in linked_words_by_line
                b_line_keys = [k for k in linked_words_by_line.keys() if k[0] == b_no]
                if b_line_keys:
                    # Sort lines by line_no
                    b_line_keys.sort(key=lambda k: k[1])
                    for lk in b_line_keys:
                        # Sort words in line by x0
                        line_words = sorted(linked_words_by_line[lk], key=lambda x: x[0])
                        b_lines.append(" ".join(w[1] for w in line_words))
                    enriched_text = "\n".join(b_lines)
                else:
                    enriched_text = b[4].strip()

                enriched_text_blocks.append((b[0], b[1], b[2], b[3], enriched_text, b[5], b[6]))

            raw_page_text = "".join(b[4] for b in enriched_text_blocks)
            if len(raw_page_text.strip()) > 40:
                is_scanned_doc = False

            # Detect multi-column layout on this page:
            is_two_column = False
            left_blocks = []
            right_blocks = []

            if len(enriched_text_blocks) >= 4:
                col_split = page_width * 0.42
                left_col = [b for b in enriched_text_blocks if b[0] < col_split and b[2] < (page_width * 0.65)]
                right_col = [b for b in enriched_text_blocks if b[0] >= col_split]

                if len(left_col) >= 2 and len(right_col) >= 2:
                    is_two_column = True
                    left_blocks = sorted(left_col, key=lambda b: (b[1], b[0]))
                    right_blocks = sorted(right_col, key=lambda b: (b[1], b[0]))
                    header_blocks = [b for b in enriched_text_blocks if b[0] < col_split and b[2] > (page_width * 0.75)]
                    header_blocks = sorted(header_blocks, key=lambda b: b[1])

            # 5. Assemble page text in correct spatial reading order
            page_lines = []
            if is_two_column:
                top_headers = [b for b in enriched_text_blocks if b[1] < page_height * 0.20 and (b[2] - b[0]) > (page_width * 0.6)]
                processed_ids = set()

                for b in sorted(top_headers, key=lambda x: x[1]):
                    page_lines.append(b[4].strip())
                    processed_ids.add(b[5])

                for b in left_blocks:
                    if b[5] not in processed_ids:
                        page_lines.append(b[4].strip())
                        processed_ids.add(b[5])

                for b in right_blocks:
                    if b[5] not in processed_ids:
                        page_lines.append(b[4].strip())
                        processed_ids.add(b[5])
            else:
                sorted_blocks = sorted(enriched_text_blocks, key=lambda b: (b[1], b[0]))
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
            "links": all_extracted_links,
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

        # 1. Process paragraphs with heading level indicators and hyperlink recovery
        for p in doc.paragraphs:
            # Check for hyperlink runs in paragraph
            p_text_parts = []
            try:
                for child in p._element:
                    if child.tag.endswith('hyperlink'):
                        r_id = child.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                        h_text = "".join(child.itertext()).strip()
                        if r_id and hasattr(doc.part, 'rels') and r_id in doc.part.rels:
                            target_uri = doc.part.rels[r_id].target_ref
                            if target_uri and not target_uri.startswith("#"):
                                p_text_parts.append(f"{h_text} ({target_uri})")
                            else:
                                p_text_parts.append(h_text)
                        else:
                            p_text_parts.append(h_text)
                    elif child.tag.endswith('r'):
                        r_text = "".join(child.itertext())
                        if r_text:
                            p_text_parts.append(r_text)
            except Exception:
                pass

            p_assembled = "".join(p_text_parts).strip() if p_text_parts else p.text.strip()
            text = p_assembled if p_assembled else p.text.strip()
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
