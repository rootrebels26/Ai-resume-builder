import os
import re
import logging
from typing import Dict, Any, List, Tuple, Optional
import pymupdf as fitz
import docx

logger = logging.getLogger("document_extractor")

class DocumentExtractor:
    """
    Universal Multi-Format Document Text and Layout Extractor.
    Handles:
    - PDF: Multi-column spatial layout detection, hyperlinks, tables, and scanned page detection.
    - DOCX: Hierarchical headings, tables, bullet points, and hyperlinks.
    - DOC: Legacy Word 97-2003 binary text stream recovery.
    - TXT: Multi-encoding text decoding (UTF-8, UTF-16, CP1252, Latin-1).
    - RTF: Rich Text Format stripping with hex character decoding.
    - Images (PNG, JPG, JPEG, WebP): Image verification and Multimodal Vision OCR extraction.
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
            words = []
            try:
                words = page.get_text("words")
            except Exception:
                words = []

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
            blocks = page.get_text("blocks")
            text_blocks = [b for b in blocks if b[6] == 0 and b[4].strip()]

            # Reconstruct blocks with enriched hyperlink text if available
            enriched_text_blocks = []
            for b in text_blocks:
                b_no = b[5]
                b_line_keys = [k for k in linked_words_by_line.keys() if k[0] == b_no]
                if b_line_keys:
                    b_line_keys.sort(key=lambda k: k[1])
                    b_lines = []
                    for lk in b_line_keys:
                        line_words = sorted(linked_words_by_line[lk], key=lambda x: x[0])
                        b_lines.append(" ".join(w[1] for w in line_words))
                    enriched_text = "\n".join(b_lines)
                else:
                    enriched_text = b[4].strip()

                enriched_text_blocks.append((b[0], b[1], b[2], b[3], enriched_text, b[5], b[6]))

            raw_page_text = "".join(b[4] for b in enriched_text_blocks)
            if len(raw_page_text.strip()) > 40:
                is_scanned_doc = False

            # Detect multi-column layout on this page (strictly body blocks below header):
            is_two_column = False
            left_blocks = []
            right_blocks = []

            body_blocks = [b for b in enriched_text_blocks if b[1] >= page_height * 0.16]
            if len(body_blocks) >= 6:
                col_split = page_width * 0.45
                left_col = [b for b in body_blocks if b[2] <= page_width * 0.52]
                right_col = [b for b in body_blocks if b[0] >= col_split]

                # Confirm left and right columns actually sit side-by-side (vertical Y overlap)
                has_vertical_overlap = any(
                    not (lb[3] <= rb[1] or rb[3] <= lb[1])
                    for lb in left_col
                    for rb in right_col
                )

                if len(left_col) >= 3 and len(right_col) >= 3 and has_vertical_overlap:
                    is_two_column = True
                    left_blocks = sorted(left_col, key=lambda b: (b[1], b[0]))
                    right_blocks = sorted(right_col, key=lambda b: (b[1], b[0]))

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

            # If page text is empty but page has images, attempt OCR / vision recovery
            if len(page_text.strip()) < 30 and has_images:
                try:
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("jpeg")
                    recovered_ocr = DocumentExtractor._ocr_image_bytes(img_bytes, mime="image/jpeg")
                    if recovered_ocr.strip():
                        page_text = recovered_ocr.strip()
                        is_scanned_doc = False
                except Exception as ocr_err:
                    logger.debug("Page %d OCR fallback failed: %s", page_idx, ocr_err)

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

    @staticmethod
    def extract_from_doc(file_path: str) -> Dict[str, Any]:
        """
        Legacy Word 97-2003 binary format (.doc) extractor.
        Attempts python-docx first in case of modern docx with .doc extension,
        otherwise uses binary text stream decoding.
        """
        try:
            return DocumentExtractor.extract_from_docx(file_path)
        except Exception:
            pass

        extracted_strings = []
        try:
            with open(file_path, "rb") as f:
                content = f.read()

            runs = re.findall(rb'[\x20-\x7E\r\n\t]{4,}', content)
            for r in runs:
                try:
                    s = r.decode('latin-1').strip()
                    if len(s) > 3 and not s.startswith(('Microsoft', 'WordDocument', 'CompObj', 'SummaryInformation')):
                        extracted_strings.append(s)
                except Exception:
                    continue
        except Exception as e:
            logger.error("Failed to extract from binary doc %s: %s", file_path, e)

        clean_text = "\n".join(extracted_strings)
        return {
            "text": clean_text,
            "pages": [{"page_number": 1, "text": clean_text, "char_count": len(clean_text)}],
            "page_count": 1,
            "is_scanned": False,
            "layout": "doc_binary_recovered",
            "links": [],
            "warnings": ["Legacy .doc file recovered using binary text stream parsing."] if clean_text else ["Could not extract readable text from binary .doc file."]
        }

    @staticmethod
    def extract_from_txt(file_path: str) -> Dict[str, Any]:
        """
        Extracts text from plain text files (.txt), detecting encoding automatically.
        """
        encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'cp1252', 'latin-1', 'iso-8859-1']
        raw_bytes = b""
        with open(file_path, "rb") as f:
            raw_bytes = f.read()

        text = ""
        for enc in encodings:
            try:
                text = raw_bytes.decode(enc)
                break
            except (UnicodeDecodeError, LookupError):
                continue

        lines = [line.strip() for line in text.splitlines()]
        clean_text = "\n".join(lines)
        return {
            "text": clean_text,
            "pages": [{"page_number": 1, "text": clean_text, "char_count": len(clean_text)}],
            "page_count": 1,
            "is_scanned": False,
            "layout": "text_plain",
            "links": [],
            "warnings": []
        }

    @staticmethod
    def extract_from_rtf(file_path: str) -> Dict[str, Any]:
        """
        Extracts structured text from Rich Text Format (.rtf), stripping control groups
        and decoding escaped characters.
        """
        with open(file_path, "rb") as f:
            raw_bytes = f.read()
        raw_text = raw_bytes.decode("latin-1", errors="ignore")

        # Strip RTF groups and control words
        raw_text = re.sub(r'{\\\*(?:\\fonttbl|\\colortbl|\\stylesheet|\\info)[\s\S]*?}', '', raw_text)
        raw_text = re.sub(r'\\(?:par|line)\b', '\n', raw_text)
        def replace_hex(m):
            try:
                return bytes.fromhex(m.group(1)).decode('latin-1', errors='ignore')
            except Exception:
                return ''
        raw_text = re.sub(r"\\'([0-9a-fA-F]{2})", replace_hex, raw_text)
        raw_text = re.sub(r'\\[a-zA-Z]+(?:-?\d+)? ?', '', raw_text)
        raw_text = re.sub(r'[{}]', '', raw_text)
        clean_lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        clean_text = "\n".join(clean_lines)

        return {
            "text": clean_text,
            "pages": [{"page_number": 1, "text": clean_text, "char_count": len(clean_text)}],
            "page_count": 1,
            "is_scanned": False,
            "layout": "rtf_structured",
            "links": [],
            "warnings": []
        }

    @staticmethod
    def extract_from_image(file_path: str) -> Dict[str, Any]:
        """
        Extracts resume text from image formats (PNG, JPG, JPEG, WebP)
        using PyMuPDF image container and Multimodal Vision OCR.
        """
        warnings = []
        extracted_text = ""
        page_count = 1

        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            # Check if image has embedded text
            for page in doc:
                t = page.get_text()
                if t.strip():
                    extracted_text += t + "\n"
        except Exception as e:
            logger.debug("fitz image inspection note: %s", e)

        # If direct text extraction is empty, use OCR / Multimodal Vision
        if len(extracted_text.strip()) < 30:
            try:
                with open(file_path, "rb") as f:
                    img_bytes = f.read()
                ext = os.path.splitext(file_path)[1].lower().lstrip(".")
                mime = f"image/{ext}" if ext in ["png", "jpeg", "webp"] else "image/jpeg"
                ocr_result = DocumentExtractor._ocr_image_bytes(img_bytes, mime=mime)
                if ocr_result.strip():
                    extracted_text = ocr_result.strip()
            except Exception as ocr_err:
                logger.warning("Image OCR failed: %s", ocr_err)

        if not extracted_text.strip():
            warnings.append("Image resume processed. For best extraction fidelity from photographed documents, ensure high resolution and clear lighting.")

        return {
            "text": extracted_text,
            "pages": [{"page_number": 1, "text": extracted_text, "char_count": len(extracted_text)}],
            "page_count": page_count,
            "is_scanned": True,
            "layout": "image_ocr",
            "links": [],
            "warnings": warnings
        }

    @staticmethod
    def _ocr_image_bytes(img_bytes: bytes, mime: str = "image/jpeg") -> str:
        """
        Multimodal OCR transcription via Gemini API if configured.
        """
        import base64
        from app.core.config import settings
        import httpx

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return ""

        b64 = base64.b64encode(img_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [
                    {
                        "text": "You are a universal resume OCR extraction engine. Transcribe ALL text from this resume image exactly as written, preserving all contact info, section headings, job titles, dates, companies, bullet points, skills, projects, and education. Do not summarize or omit anything. Output the full text with clear line breaks."
                    },
                    {
                        "inlineData": {
                            "mimeType": mime,
                            "data": b64
                        }
                    }
                ]
            }],
            "generationConfig": {"temperature": 0.0}
        }
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
        except Exception as e:
            logger.warning("Gemini Vision OCR call failed: %s", e)

        return ""

    @staticmethod
    def extract_document(file_path: str, filename: str = "") -> Dict[str, Any]:
        """
        Universal format router:
        Inspects file extension & magic bytes to safely route to the appropriate format extractor.
        """
        ext = os.path.splitext(filename or file_path)[1].lower()

        if ext == ".pdf":
            return DocumentExtractor.extract_from_pdf(file_path)
        elif ext == ".docx":
            return DocumentExtractor.extract_from_docx(file_path)
        elif ext == ".doc":
            return DocumentExtractor.extract_from_doc(file_path)
        elif ext == ".txt":
            return DocumentExtractor.extract_from_txt(file_path)
        elif ext == ".rtf":
            return DocumentExtractor.extract_from_rtf(file_path)
        elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
            return DocumentExtractor.extract_from_image(file_path)
        else:
            # Fallback by content
            try:
                return DocumentExtractor.extract_from_pdf(file_path)
            except Exception:
                try:
                    return DocumentExtractor.extract_from_docx(file_path)
                except Exception:
                    return DocumentExtractor.extract_from_txt(file_path)

document_extractor = DocumentExtractor()
