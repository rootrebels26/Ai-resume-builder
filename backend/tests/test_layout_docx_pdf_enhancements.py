import os
import sys
import docx
import pymupdf as fitz
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.document_extractor import DocumentExtractor
from tests.test_universal_30_resumes import _run_pipeline_sync


def test_docx_two_column_layout_table_reads_column_major(tmp_path):
    """2-column DOCX layout tables (sidebar + main) must be read column-by-column, not mashed with ' | '."""
    p = tmp_path / "two_col_layout.docx"
    d = docx.Document()
    d.add_paragraph("PRIYA NAIR")
    d.add_paragraph("priya.nair@example.com | +91 9811122233")

    tbl = d.add_table(rows=1, cols=2)
    left_cell, right_cell = tbl.rows[0].cells

    lp0 = left_cell.paragraphs[0]
    lp0.text = "SKILLS"
    left_cell.add_paragraph("Languages: Python, Go, SQL")
    left_cell.add_paragraph("Cloud: AWS, Docker, Kubernetes")
    left_cell.add_paragraph("EDUCATION")
    left_cell.add_paragraph("B.Tech in Computer Science, NIT Trichy (2018 - 2022)")

    rp0 = right_cell.paragraphs[0]
    rp0.text = "EXPERIENCE"
    right_cell.add_paragraph("Backend Engineer | FinStack | Jul 2022 - Present")
    right_cell.add_paragraph("- Built distributed ledger settlement service in Go handling 8k TPS.")
    right_cell.add_paragraph("PROJECTS")
    right_cell.add_paragraph("StreamIngest | Python, Kafka")
    right_cell.add_paragraph("- Implemented exactly-once CDC consumer with dead-letter recovery.")
    d.save(str(p))

    ext = DocumentExtractor.extract_document(str(p), "two_col_layout.docx")
    # Ensure left-column Skills/Education are not mashed onto the same line as right-column Experience
    assert " | Backend Engineer" not in ext["text"]

    rd, _ = _run_pipeline_sync(ext["text"], ext)
    assert "priya nair" in rd.personalInfo.fullName.lower()
    assert rd.personalInfo.email == "priya.nair@example.com"
    assert len(rd.experience) >= 1
    assert any("FinStack" in e.company for e in rd.experience)
    assert len(rd.projects) >= 1
    assert any("StreamIngest" in pr.name for pr in rd.projects)
    assert len(rd.education) >= 1
    assert len(rd.skills) >= 1


def test_docx_sdt_content_control_and_textbox_lines(tmp_path):
    """DOCX Content Controls (w:sdt) and multi-line textboxes (w:txbxContent) preserve structure."""
    p = tmp_path / "sdt_textbox.docx"
    d = docx.Document()
    d.add_paragraph("ARJUN KAPOOR")
    d.add_paragraph("arjun.kapoor@example.com | +91 9900011122")

    # Add a w:sdt content control containing Summary
    sdt = parse_xml(
        f'<w:sdt {nsdecls("w")}>'
        f'  <w:sdtContent>'
        f'    <w:p><w:r><w:t>PROFESSIONAL SUMMARY</w:t></w:r></w:p>'
        f'    <w:p><w:r><w:t>Staff platform engineer specializing in Kubernetes and Terraform.</w:t></w:r></w:p>'
        f'  </w:sdtContent>'
        f'</w:sdt>'
    )
    d.element.body.append(sdt)

    # Add a multi-paragraph w:txbxContent inside a paragraph run
    txbx_p = parse_xml(
        f'<w:p {nsdecls("w")}>'
        f'  <w:r><w:pict><v:shape xmlns:v="urn:schemas-microsoft-com:vml"><v:textbox>'
        f'    <w:txbxContent>'
        f'      <w:p><w:r><w:t>CERTIFICATIONS</w:t></w:r></w:p>'
        f'      <w:p><w:r><w:t>CKA - Certified Kubernetes Administrator (2024)</w:t></w:r></w:p>'
        f'    </w:txbxContent>'
        f'  </v:textbox></v:shape></w:pict></w:r>'
        f'</w:p>'
    )
    d.element.body.append(txbx_p)
    d.save(str(p))

    ext = DocumentExtractor.extract_document(str(p), "sdt_textbox.docx")
    assert "Staff platform engineer specializing in Kubernetes" in ext["text"]
    assert "CERTIFICATIONS\nCKA - Certified Kubernetes Administrator (2024)" in ext["text"]

    rd, _ = _run_pipeline_sync(ext["text"], ext)
    assert "Kubernetes" in rd.professionalSummary
    assert len(rd.certifications) >= 1


def test_pdf_mixed_columns_and_bottom_spanning_block(tmp_path):
    """A 2-column PDF with a full-width spanning section at the bottom must not drop the bottom block."""
    p = tmp_path / "mixed_cols.pdf"
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    # Top header (full width)
    page.insert_text((40, 45), "ROHAN VERMA", fontsize=16)
    page.insert_text((40, 65), "rohan.verma@example.com | +91 9876500001", fontsize=10)

    # Left column (y = 130..500, x = 40..250)
    page.insert_text((40, 140), "SKILLS", fontsize=12)
    page.insert_text((40, 165), "Languages: Python, TypeScript", fontsize=10)
    page.insert_text((40, 185), "Tools: FastAPI, Docker, Redis", fontsize=10)
    page.insert_text((40, 230), "EDUCATION", fontsize=12)
    page.insert_text((40, 255), "B.E. Computer Science", fontsize=10)
    page.insert_text((40, 275), "BITS Pilani (2017 - 2021)", fontsize=10)
    page.insert_text((40, 340), "CERTIFICATIONS", fontsize=12)
    page.insert_text((40, 365), "AWS Solutions Architect", fontsize=10)

    # Right column (y = 130..500, x = 310..555)
    page.insert_text((310, 140), "EXPERIENCE", fontsize=12)
    page.insert_text((310, 165), "Senior Engineer | CloudScale", fontsize=10)
    page.insert_text((310, 185), "Jan 2022 - Present", fontsize=10)
    page.insert_text((310, 205), "- Designed multi-tenant API gateway.", fontsize=10)
    page.insert_text((310, 230), "- Reduced p95 latency by 38%.", fontsize=10)
    page.insert_text((310, 280), "Software Engineer | DataPulse", fontsize=10)
    page.insert_text((310, 300), "Jun 2021 - Dec 2021", fontsize=10)
    page.insert_text((310, 320), "- Built ETL workers in Python.", fontsize=10)

    # Bottom full-width spanning section (x = 40..555, y = 620..740)
    page.insert_text((40, 620), "PROJECTS", fontsize=12)
    page.insert_text(
        (40, 645),
        "VectorSearch Engine | Built a low-latency hybrid BM25 + HNSW search service across 4M documents.",
        fontsize=10,
    )
    doc.save(str(p))
    doc.close()

    ext = DocumentExtractor.extract_document(str(p), "mixed_cols.pdf")
    assert "VectorSearch Engine" in ext["text"]

    rd, _ = _run_pipeline_sync(ext["text"], ext)
    assert rd.personalInfo.fullName.lower() == "rohan verma"
    assert len(rd.experience) >= 2
    assert len(rd.projects) >= 1
    assert any("VectorSearch" in pr.name for pr in rd.projects)
    assert len(rd.education) >= 1
    assert len(rd.skills) >= 1
