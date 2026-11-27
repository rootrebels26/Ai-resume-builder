import io
import os
import sys
import tempfile
import docx
import pymupdf as fitz
import pytest
from starlette.datastructures import UploadFile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.exceptions import FileValidationError
from app.core.security import validate_uploaded_file
from app.services.document_extractor import DocumentExtractor
from app.services.extraction_reconciliation import reconcile_extraction
from tests.test_universal_30_resumes import SYNTHETIC_RESUMES, _run_pipeline_sync


EXTRA_20_RESUMES = [
    {
        "id": "31_europass_style",
        "text": """CURRICULUM VITAE
PERSONAL INFORMATION
Lukas Novak
lukas.novak@europass.cz | +420 777 123 456 | Prague, Czech Republic

WORK EXPERIENCE
01/03/2021 - Current
Systems Integrator | Skoda Digital | Prague
- Integrated telemetry Kafka streams across connected vehicle fleets.

EDUCATION AND TRAINING
09/2016 - 06/2020
Bachelor in Software Engineering | Czech Technical University""",
        "expect": {"name": "Lukas Novak", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "32_overlapping_dates",
        "text": """Priya Verma
Full Stack Engineer
priya.v@overlap.io | +91 9810098100 | Gurugram, India

EXPERIENCE
Full Stack Engineer | Zomato | Mar 2022 - Present
- Built order tracking WebSocket gateway serving 80k concurrent users.
Open Source Maintainer | FastAPI Plugins | Jan 2021 - Present
- Maintained async rate-limiter middleware with 1.2M PyPI downloads.

EDUCATION
B.Tech IT, NSUT Delhi | 2017 - 2021""",
        "expect": {"name": "Priya Verma", "min_exp": 2, "min_edu": 1},
    },
    {
        "id": "33_incomplete_contact",
        "text": """Samir Khan
Backend Developer

EXPERIENCE
Backend Developer | FinStack | 2022 - Present
- Built reconciliation batch jobs in Python and PostgreSQL.

EDUCATION
B.Sc. Computer Science, Pune University | 2018 - 2021""",
        "expect": {"name": "Samir Khan", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "34_inconsistent_date_formats",
        "text": """Nina Kowalski
QA Lead
nina@qa.pl | Warsaw, Poland

EXPERIENCE
QA Lead | Allegro | 05/2021 - Present
- Automated 450 Playwright regression tests.
QA Engineer | CD Projekt | Jan 2019 to Apr 2021
- Executed API load tests in k6.

EDUCATION
B.Eng Computer Science | 2014 - 2018 | Warsaw University of Technology""",
        "expect": {"name": "Nina Kowalski", "min_exp": 2, "min_edu": 1},
    },
    {
        "id": "35_four_page_academic",
        "text": """[[page 1]]
Dr. Vikram Sethi
Principal Research Scientist
vikram.sethi@research.edu | +1 650 555 0112 | Palo Alto, CA

EXPERIENCE
Principal Scientist | Stanford AI Lab | 2020 - Present
- Led multimodal foundation model alignment research.

[[page 2]]
Senior Researcher | FAIR | 2017 - 2020
- Published 9 NeurIPS/ICML papers on self-supervised vision.

[[page 3]]
PUBLICATIONS
Scaling Sparse Mixture-of-Experts | NeurIPS | 2023

[[page 4]]
EDUCATION
Ph.D. Machine Learning, Carnegie Mellon University | 2012 - 2017""",
        "expect": {"name": "Dr. Vikram Sethi", "min_exp": 2, "min_edu": 1, "min_pages": 4},
    },
    {
        "id": "36_multiple_internships",
        "text": """Riya Deshmukh
Computer Science Undergraduate
riya.d@bits.ac.in | +91 9823012345 | Pilani, India

INTERNSHIPS
Software Engineering Intern | Google | May 2025 - Jul 2025
- Implemented Spanner query profiler metrics in Go.
Backend Intern | Swiggy | Dec 2024 - Feb 2025
- Optimized Redis geospatial cache hit rate by 14%.

EDUCATION
B.E. Computer Science, BITS Pilani | 2022 - 2026""",
        "expect": {"name": "Riya Deshmukh", "min_intern": 2, "min_edu": 1},
    },
    {
        "id": "37_unusual_headings",
        "text": """Oliver Grant
Product Designer
oliver@grant.design | +44 7700 900111 | Bristol, UK

CAREER TRAJECTORY
Senior Designer | Monzo | 2021 - Present
- Redesigned savings pots onboarding increasing conversion by 11%.

ACADEMIC CREDENTIALS
BA Product Design, University of the Arts London | 2015 - 2018""",
        "expect": {"name": "Oliver Grant", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "38_multiple_projects_heavy",
        "text": """Arjun Nair
AI Engineer
arjun.nair@ai.dev | +91 9740011223 | Kochi, India

PROJECTS
DocuMind RAG | https://github.com/arjun/documind
- Built hybrid BM25 + dense vector retrieval pipeline in FastAPI and Qdrant.
VoiceAgent Live | https://github.com/arjun/voiceagent
- Streaming WebRTC voice bot with Whisper ASR and sub-400ms latency.
SQLCopilot | https://github.com/arjun/sqlcopilot
- Text-to-SQL compiler with schema-grounded AST validation.

EDUCATION
B.Tech AI & DS, CUSAT | 2020 - 2024""",
        "expect": {"name": "Arjun Nair", "min_proj": 3, "min_edu": 1},
    },
    {
        "id": "39_volunteer_leadership",
        "text": """Maya Lin
Community Operations Lead
maya@community.org | +1 206 555 0177 | Seattle, WA

EXPERIENCE
Operations Lead | CodeForGood | 2021 - Present
- Coordinated 350 civic tech volunteers across 12 cities.

VOLUNTEER EXPERIENCE
Mentor | Girls Who Code | 2019 - Present
- Taught Python and web fundamentals to 60 high school students.

EDUCATION
B.A. Public Policy, University of Washington | 2015 - 2019""",
        "expect": {"name": "Maya Lin", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "40_certifications_heavy",
        "text": """Siddharth Joshi
Cloud Security Engineer
sid.joshi@cloudsec.in | +91 9900112233 | Pune, India

EXPERIENCE
Cloud Security Engineer | Palo Alto Networks | 2021 - Present
- Automated AWS IAM least-privilege policy remediation.

CERTIFICATIONS
AWS Certified Security Specialty | Amazon | 2024
CISSP | ISC2 | 2023
CKS | CNCF | 2022

EDUCATION
B.E. Information Technology, COEP | 2016 - 2020""",
        "expect": {"name": "Siddharth Joshi", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "41_graphic_icon_bullets",
        "text": """Elena Petrova
BI Developer
elena@bi.bg | Sofia, Bulgaria

EXPERIENCE
BI Developer | Paysafe | 2020 - Present
▸ Built executive Power BI dashboards tracking $400M monthly payment volume.
★ Reduced SQL warehouse query runtime by 48%.

EDUCATION
M.Sc. Business Informatics, Sofia University | 2016 - 2018""",
        "expect": {"name": "Elena Petrova", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "42_parenthesized_dates",
        "text": """Mateusz Zielinski
Frontend Engineer
mateusz@fe.pl | Krakow, Poland

EXPERIENCE
(2021 - Present)
Senior Frontend Engineer | Brainly
- Built accessible React 18 math editor used by 20M students.

EDUCATION
(2016 - 2020)
B.Sc. Computer Science | AGH University""",
        "expect": {"name": "Mateusz Zielinski", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "43_custom_patents_grants",
        "text": """Dr. Helene Laurent
Biomedical Engineer
helene@medtech.fr | Lyon, France

EXPERIENCE
R&D Lead | Medtronic | 2019 - Present
- Designed low-power ECG signal filtering ASIC.

PATENTS
EP4102931: Ultra-low-power Wearable Arrhythmia Detector | 2023

EDUCATION
Ph.D. Biomedical Engineering, INSA Lyon | 2014 - 2018""",
        "expect": {"name": "Dr. Helene Laurent", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "44_contract_freelance",
        "text": """Devon Brooks
Contract DevOps Consultant
devon@infra.dev | +1 512 555 0190 | Austin, TX

EXPERIENCE
DevOps Consultant | HashiCorp Partner Network | 2020 - Present
- Migrated 30+ Kubernetes clusters to GitOps with ArgoCD.

EDUCATION
B.S. Information Systems, Texas A&M | 2014 - 2018""",
        "expect": {"name": "Devon Brooks", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "45_hyperlinks_preserved",
        "text": """Kabir Malhotra
Developer Advocate
kabir@devrel.io | +91 9811998877 | Bengaluru, India
https://linkedin.com/in/kabirmalhotra | https://github.com/kabirdev

EXPERIENCE
Developer Advocate | Postman | 2022 - Present
- Authored 25 API engineering workshops reaching 50,000 developers.

EDUCATION
B.Tech CSE, VIT Vellore | 2017 - 2021""",
        "expect": {"name": "Kabir Malhotra", "email": "kabir@devrel.io", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "46_no_experience_student",
        "text": """Tanya Roy
Data Science Student
tanya.roy@univ.edu | +91 9830011223 | Kolkata, India

PROJECTS
Churn Predictor | https://github.com/tanya/churn
- Trained XGBoost model achieving 0.89 ROC-AUC on telecom dataset.

EDUCATION
B.Sc. Data Science, St. Xavier's College | 2023 - 2026

SKILLS
Python, Pandas, Scikit-learn, SQL""",
        "expect": {"name": "Tanya Roy", "min_proj": 1, "min_edu": 1},
    },
    {
        "id": "47_supply_chain_ops",
        "text": """Rajeshwar Iyer
Supply Chain Manager
rajeshwar@logistics.in | +91 9840055667 | Chennai, India

EXPERIENCE
Supply Chain Manager | Ashok Leyland | 2018 - Present
- Reduced vendor lead time by 21% across 45 Tier-1 automotive suppliers.

EDUCATION
MBA Operations Management, NITIE Mumbai | 2016 - 2018""",
        "expect": {"name": "Rajeshwar Iyer", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "48_journalism_media",
        "text": """Clara Morales
Investigative Data Journalist
clara@press.org | +1 646 555 0155 | New York, NY

EXPERIENCE
Data Journalist | ProPublica | 2020 - Present
- Analyzed 4M municipal housing records using Python and SQLite.

EDUCATION
M.S. Journalism, Columbia University | 2018 - 2019""",
        "expect": {"name": "Clara Morales", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "49_architecture_cad",
        "text": """Nikhil Deshpande
Licensed Architect
nikhil@spatialarch.in | +91 9822011223 | Pune, India

EXPERIENCE
Project Architect | Hafeez Contractor Studio | 2019 - Present
- Delivered LEED Gold commercial tower (450,000 sq ft) using Revit BIM.

EDUCATION
B.Arch, Sir JJ College of Architecture | 2014 - 2019""",
        "expect": {"name": "Nikhil Deshpande", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "50_executive_cfo",
        "text": """Evelyn Vance, CPA
Chief Financial Officer
evelyn@vancecapital.com | +1 212 555 0133 | New York, NY

EXPERIENCE
Chief Financial Officer | Meridian HealthTech | 2019 - Present
- Led $120M Series D financing and SOX 404 internal controls audit.

EDUCATION
MBA Finance, Wharton School | 2008 - 2010""",
        "expect": {"name": "Evelyn Vance, CPA", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
]


def test_50_resume_universal_benchmark():
    all_50 = SYNTHETIC_RESUMES + EXTRA_20_RESUMES
    assert len(all_50) == 50

    tp = fp = fn = 0
    for fx in all_50:
        lang = DocumentExtractor.detect_language(fx["text"])
        resume_data, _ = _run_pipeline_sync(
            fx["text"],
            layout_metadata={"extraction_method": "text", "language": lang},
        )
        exp = fx["expect"]
        if exp.get("name"):
            tp += 1 if resume_data.personalInfo.fullName else 0
            fn += 0 if resume_data.personalInfo.fullName else 1
        if exp.get("email"):
            tp += 1 if resume_data.personalInfo.email == exp["email"] else 0
            fn += 0 if resume_data.personalInfo.email == exp["email"] else 1
        if exp.get("min_exp"):
            tp += 1 if len(resume_data.experience) >= exp["min_exp"] else 0
            fn += 0 if len(resume_data.experience) >= exp["min_exp"] else 1
        if exp.get("min_intern"):
            tp += 1 if (len(resume_data.internships) + len(resume_data.experience)) >= exp["min_intern"] else 0
            fn += 0 if (len(resume_data.internships) + len(resume_data.experience)) >= exp["min_intern"] else 1
        if exp.get("min_proj"):
            tp += 1 if len(resume_data.projects) >= exp["min_proj"] else 0
            fn += 0 if len(resume_data.projects) >= exp["min_proj"] else 1
        if exp.get("min_edu"):
            tp += 1 if len(resume_data.education) >= exp["min_edu"] else 0
            fn += 0 if len(resume_data.education) >= exp["min_edu"] else 1
        if exp.get("no_engineer_title"):
            title = (resume_data.personalInfo.professionalTitle or "").lower()
            if title in ("engineer", "software engineer"):
                fp += 1
            else:
                tp += 1

    precision = tp / (tp + fp) if (tp + fp) else 1.0
    recall = tp / (tp + fn) if (tp + fn) else 1.0
    print(f"\n50-RESUME BENCHMARK: TP={tp} FP={fp} FN={fn} Precision={precision:.4f} Recall={recall:.4f}")
    assert precision >= 0.92
    assert recall >= 0.88


def test_file_signature_and_docx_table_and_reconciliation():
    # 1. Magic-byte rejection on spoofed .pdf
    bad_pdf = UploadFile(filename="fake.pdf", file=io.BytesIO(b"MZ_NOT_A_PDF"))
    with pytest.raises(FileValidationError):
        validate_uploaded_file(bad_pdf, b"MZ_NOT_A_PDF")

    # 2. Empty file rejection
    empty_pdf = UploadFile(filename="empty.pdf", file=io.BytesIO(b""))
    with pytest.raises(FileValidationError):
        validate_uploaded_file(empty_pdf, b"")

    # 3. Real DOCX with table-based layout
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        docx_path = tmp.name
    try:
        doc = docx.Document()
        doc.add_heading("Rohan Verma", level=1)
        tbl = doc.add_table(rows=2, cols=2)
        tbl.cell(0, 0).text = "EXPERIENCE"
        tbl.cell(0, 1).text = "Python Developer | TCS | 2022 - Present"
        tbl.cell(1, 0).text = "EDUCATION"
        tbl.cell(1, 1).text = "B.Tech CSE, VIT | 2018 - 2022"
        doc.save(docx_path)

        res = DocumentExtractor.extract_document(docx_path, "table_resume.docx")
        assert "rohan verma" in res["text"].lower()
        assert "TCS" in res["text"]
        assert "VIT" in res["text"]
    finally:
        if os.path.exists(docx_path):
            os.unlink(docx_path)

    # 4. Real PyMuPDF 2-column PDF + source_blocks + reconciliation report
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_pdf:
        pdf_path = tmp_pdf.name
    try:
        pdf = fitz.open()
        page = pdf.new_page()
        page.insert_text((50, 60), "Ananya Iyer\nBackend Engineer\nananya@example.com", fontsize=12)
        page.insert_text((50, 150), "SKILLS\nPython\nFastAPI\nPostgreSQL", fontsize=10)
        page.insert_text((300, 150), "EXPERIENCE\nBackend Engineer | Razorpay | 2022 - Present\n- Built REST APIs", fontsize=10)
        pdf.save(pdf_path)
        pdf.close()

        ext_res = DocumentExtractor.extract_document(pdf_path, "two_col.pdf")
        assert len(ext_res.get("source_blocks", [])) >= 2
        parsed, _ = _run_pipeline_sync(ext_res["text"], ext_res)
        rec = reconcile_extraction(parsed.model_dump(), ext_res["text"], ext_res)
        assert rec["extracted_blocks"] >= 2
        assert rec["text_extraction_coverage"] == 1.0
    finally:
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
