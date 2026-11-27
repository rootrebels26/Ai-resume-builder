import asyncio
import os
import sys
import tempfile
import docx
import pymupdf as fitz
import pytest
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.providers.local_heuristic import LocalHeuristicProvider
from app.services.ai_service import ai_service
from app.services.document_extractor import DocumentExtractor
from app.services.resume_parser import parse_resume_document_pipeline
from tests.test_universal_30_resumes import SYNTHETIC_RESUMES, _run_sync_coro
from tests.test_universal_50_benchmark import EXTRA_20_RESUMES


def _build_50_diverse_real_and_edge_resumes(tmp_dir: str):
    """
    Constructs 50 additional structurally diverse resumes (total 100 with the 50 baseline):
    - 20 real binary PDFs (2-col, 3-col, mixed 1+2 col, multi-page, dark-banner, links, non-tech)
    - 15 real binary DOCXs (2-col layout tables, nested tables, w:sdt, textboxes, headers/footers)
    - 15 international / creative / edge-case resumes (FR/DE/ES, PhD, RTF/TXT, career-switch)
    """
    cases = []

    # --- 20 Real Binary PDFs (51..70) ---
    pdf_specs = [
        ("51_pdf_2col_swe", "two_col", "Ananya Sharma", "ananya.sharma@tech.in", "+91 9820111222",
         "Software Engineer | CloudCore | Jan 2022 - Present\n- Built gRPC microservices in Go.",
         "SKILLS\nLanguages: Go, Python, SQL\nEDUCATION\nB.Tech CS, IIT Delhi (2017 - 2021)"),
        ("52_pdf_2col_ml", "two_col", "Kabir Malhotra", "kabir.ml@ai.io", "+91 9811223344",
         "ML Engineer | VisionLabs | 2023-01 - 2025-06\n- Trained PyTorch object detectors.",
         "SKILLS\nML: PyTorch, ONNX, OpenCV\nEDUCATION\nM.Tech AI, IISc Bangalore (2020 - 2022)"),
        ("53_pdf_2col_medical", "two_col", "Dr. Meera Iyer", "meera.iyer@hospital.org", "+91 9845012345",
         "Attending Physician | Apollo Hospitals | Mar 2019 - Present\n- Managed ICU triage for 40+ beds.",
         "SKILLS\nClinical: Critical Care, ACLS\nEDUCATION\nMD Internal Medicine, AIIMS (2015 - 2018)"),
        ("54_pdf_2col_legal", "two_col", "Vikramaditya Rao", "vikram.rao@lawfirm.in", "+91 9910022334",
         "Corporate Counsel | LexCorp | Jun 2020 - Present\n- Drafted SaaS MSAs and DPAs.",
         "SKILLS\nLegal: M&A, GDPR, IP Law\nEDUCATION\nLL.B, NLSIU Bangalore (2015 - 2020)"),
        ("55_pdf_2col_finance", "two_col", "Neha Kulkarni", "neha.k@finbank.com", "+91 9822334455",
         "Quantitative Analyst | AlphaQuant | Apr 2021 - Present\n- Built Monte Carlo VaR engine.",
         "SKILLS\nQuant: Python, C++, Kdb+\nEDUCATION\nM.Sc Finance, LSE (2019 - 2020)"),
        ("56_pdf_2col_marketing", "two_col", "Riya Deshmukh", "riya.d@growth.co", "+91 9765432100",
         "Growth Manager | ScaleUp | Aug 2021 - Present\n- Grew organic ARR by 65% YoY.",
         "SKILLS\nMarketing: SEO, HubSpot, SQL\nEDUCATION\nMBA Marketing, MDI Gurgaon (2019 - 2021)"),
        ("57_pdf_2col_design", "two_col", "Aarush Chatterjee", "aarush@studio.design", "+91 9830011223",
         "Product Designer | PixelCraft | Feb 2022 - Present\n- Led Figma design system for 12 squads.",
         "SKILLS\nDesign: Figma, Prototyping\nEDUCATION\nB.Des, NID Ahmedabad (2017 - 2021)"),
        ("58_pdf_mixed_1plus2", "mixed", "Siddharth Joshi", "sid.joshi@dev.io", "+91 9899001122",
         "Backend Lead | HyperScale | Jan 2021 - Present\n- Scaled Kafka cluster to 50k msg/s.",
         "SKILLS\nLanguages: Java, Kafka, Redis\nEDUCATION\nB.E. CS, RVCE (2016 - 2020)"),
        ("59_pdf_dark_banner", "dark_banner", "Tanvi Bansal", "tanvi.b@cloud.dev", "+91 9818099887",
         "DevOps Engineer | InfraOps | May 2022 - Present\n- Automated EKS clusters with Terraform.",
         "SKILLS\nInfra: Terraform, AWS, Helm\nEDUCATION\nB.Tech ECE, DTU (2018 - 2022)"),
        ("60_pdf_3col", "three_col", "Devansh Gupta", "devansh.g@data.ai", "+91 9871122334",
         "Data Engineer | Lakehouse | Jul 2021 - Present\n- Built Spark ETL pipelines on Delta Lake.",
         "SKILLS\nData: Spark, Airflow, dbt\nEDUCATION\nB.Tech IT, IIIT Allahabad (2017 - 2021)"),
        ("61_pdf_multipage_2p", "multipage", "Ishita Sen", "ishita.sen@corp.com", "+91 9831144556",
         "Staff Engineer | PayGrid | Jan 2020 - Present\n- Architected multi-region settlement ledger.",
         "SKILLS\nCore: Rust, Go, PostgreSQL\nEDUCATION\nB.Tech CS, Jadavpur University (2014 - 2018)"),
        ("62_pdf_multipage_3p", "multipage3", "Karanveer Singh", "karan.singh@ent.io", "+91 9815566778",
         "Principal Architect | GlobalBank | Mar 2018 - Present\n- Led core banking cloud migration.",
         "SKILLS\nArch: Java, Spring, Kubernetes\nEDUCATION\nM.S. CS, Georgia Tech (2013 - 2015)"),
        ("63_pdf_hyperlinks", "hyperlinks", "Pranav Menon", "pranav.m@oss.dev", "+91 9847011223",
         "Systems Engineer | EdgeNet | Sep 2021 - Present\n- Built eBPF packet filter in C and Rust.",
         "SKILLS\nSystems: Rust, C, eBPF, Linux\nEDUCATION\nB.Tech CS, NIT Calicut (2017 - 2021)"),
        ("64_pdf_timeline", "two_col", "Shruti Agarwal", "shruti.a@bio.org", "+91 9829011223",
         "Bioinformatics Scientist | GeneLab | Jun 2020 - Present\n- Built RNA-seq Nextflow pipelines.",
         "SKILLS\nBio: Python, R, Nextflow\nEDUCATION\nPh.D Computational Biology, NCBS (2015 - 2020)"),
        ("65_pdf_europass_pdf", "two_col", "Mateo Garcia", "mateo.g@eu.es", "+34 612345678",
         "Frontend Developer | IberTech | 02/2022 - Present\n- Built React 18 accessibility suite.",
         "SKILLS\nFrontend: React, TypeScript, CSS\nEDUCATION\nB.Sc Informatics, UPM Madrid (2017 - 2021)"),
        ("66_pdf_academic_cv", "two_col", "Prof. Elena Rossi", "elena.rossi@unibo.it", "+39 3331234567",
         "Associate Professor | University of Bologna | Sep 2019 - Present\n- Supervised 8 PhD theses in NLP.",
         "SKILLS\nResearch: NLP, Python, LaTeX\nEDUCATION\nPh.D Computer Science, ETH Zurich (2012 - 2016)"),
        ("67_pdf_sales", "two_col", "Raghavendra Prasad", "raghav@b2bsales.in", "+91 9880011223",
         "Enterprise AE | CloudCRM | Jan 2021 - Present\n- Closed $2.4M ARR across APAC.",
         "SKILLS\nSales: Salesforce, MEDDPICC\nEDUCATION\nMBA, IIM Kozhikode (2018 - 2020)"),
        ("68_pdf_cybersec", "two_col", "Zoya Mirza", "zoya.sec@cyber.io", "+91 9821199001",
         "Security Engineer | ShieldSec | Nov 2021 - Present\n- Led red-team pentests for SOC2.",
         "SKILLS\nSecurity: Burp Suite, AWS IAM\nEDUCATION\nB.Tech CS, Jamia Millia (2017 - 2021)"),
        ("69_pdf_mechanical", "two_col", "Harshvardhan Patil", "harsh.patil@auto.in", "+91 9823011223",
         "CAD Engineer | Tata Motors | Jul 2020 - Present\n- Designed EV battery thermal enclosure.",
         "SKILLS\nCAD: SolidWorks, ANSYS, MATLAB\nEDUCATION\nB.E. Mechanical, COEP Pune (2016 - 2020)"),
        ("70_pdf_entry_projects", "mixed", "Nandini Bose", "nandini.b@grad.in", "+91 9836011223",
         "Software Intern | StartUpX | May 2024 - Aug 2024\n- Built FastAPI auth service with JWT.",
         "SKILLS\nLanguages: Python, JavaScript, SQL\nEDUCATION\nB.Tech CS, Heritage Institute (2021 - 2025)"),
    ]

    for cid, layout_kind, name, email, phone, exp_txt, side_txt in pdf_specs:
        pdf_path = os.path.join(tmp_dir, f"{cid}.pdf")
        doc = fitz.open()
        page = doc.new_page(width=595, height=842)
        if layout_kind == "dark_banner":
            page.draw_rect(fitz.Rect(0, 0, 595, 95), color=(0.1, 0.15, 0.25), fill=(0.1, 0.15, 0.25))
            page.insert_text((40, 40), name.upper(), fontsize=16, color=(1, 1, 1))
            page.insert_text((40, 62), f"{email} | {phone}", fontsize=10, color=(1, 1, 1))
        else:
            page.insert_text((40, 42), name, fontsize=16)
            page.insert_text((40, 62), f"{email} | {phone}", fontsize=10)

        if layout_kind == "hyperlinks":
            r_gh = page.insert_text((40, 82), "GitHub Profile", fontsize=10)
            page.insert_link({"kind": fitz.LINK_URI, "from": fitz.Rect(40, 72, 130, 86), "uri": f"https://github.com/{cid}"})

        if layout_kind == "three_col":
            # Col 1: Skills, Col 2: Experience, Col 3: Education
            page.insert_text((30, 140), "SKILLS", fontsize=11)
            page.insert_text((30, 160), side_txt.splitlines()[1], fontsize=9)
            page.insert_text((30, 180), "Docker, Git, Linux", fontsize=9)
            page.insert_text((210, 140), "EXPERIENCE", fontsize=11)
            for idx_l, ln in enumerate(exp_txt.splitlines()):
                page.insert_text((210, 160 + idx_l * 18), ln, fontsize=9)
            page.insert_text((405, 140), "EDUCATION", fontsize=11)
            page.insert_text((405, 160), side_txt.splitlines()[-1], fontsize=9)
            page.insert_text((405, 180), "CGPA: 8.7/10", fontsize=9)
        else:
            # Left column: side_txt; Right column: exp_txt
            y_l = 140
            for ln in side_txt.splitlines():
                page.insert_text((40, y_l), ln, fontsize=10)
                y_l += 22
            y_r = 140
            page.insert_text((305, y_r), "EXPERIENCE", fontsize=11)
            y_r += 22
            for ln in exp_txt.splitlines():
                page.insert_text((305, y_r), ln, fontsize=10)
                y_r += 22

        if layout_kind == "mixed":
            page.insert_text((40, 620), "PROJECTS", fontsize=11)
            page.insert_text((40, 642), f"{cid}_proj | Built scalable service with Python and FastAPI.", fontsize=10)

        if layout_kind in ("multipage", "multipage3"):
            p2 = doc.new_page(width=595, height=842)
            p2.insert_text((40, 50), "PROJECTS", fontsize=12)
            p2.insert_text((40, 75), f"{cid}_p2 | Distributed cache engine in Rust.", fontsize=10)
            if layout_kind == "multipage3":
                p3 = doc.new_page(width=595, height=842)
                p3.insert_text((40, 50), "CERTIFICATIONS", fontsize=12)
                p3.insert_text((40, 75), "AWS Certified Solutions Architect - Professional", fontsize=10)

        doc.save(pdf_path)
        doc.close()
        cases.append({
            "id": cid,
            "file_path": pdf_path,
            "filename": f"{cid}.pdf",
            "expect": {
                "name": name,
                "email": email,
                "min_exp": 1,
                "min_edu": 1,
                "min_skills": 1,
                "min_proj": 1 if layout_kind in ("mixed", "multipage", "multipage3") else 0,
            },
            "reading_order_check": layout_kind in ("two_col", "mixed", "three_col", "dark_banner"),
        })

    # --- 15 Real Binary DOCXs (71..85) ---
    docx_specs = [
        ("71_docx_2col_table", "layout_table", "Divya Menon", "divya.m@soft.in"),
        ("72_docx_2col_table_proj", "layout_table", "Kunal Verma", "kunal.v@dev.io"),
        ("73_docx_sdt_summary", "sdt", "Pooja Nair", "pooja.n@cloud.com"),
        ("74_docx_textbox_certs", "textbox", "Aditya Joshi", "aditya.j@sec.org"),
        ("75_docx_header_contact", "header_footer", "Sneha Reddy", "sneha.r@fin.in"),
        ("76_docx_nested_table", "nested_table", "Manish Tiwari", "manish.t@data.ai"),
        ("77_docx_hyperlinks", "hyperlinks", "Ritu Sharma", "ritu.s@web.dev"),
        ("78_docx_bullets_list", "list_bullets", "Saurabh Jain", "saurabh.j@ops.io"),
        ("79_docx_academic", "standard", "Dr. Vivek Kulkarni", "vivek.k@univ.edu"),
        ("80_docx_corporate", "standard", "Ankita Deshpande", "ankita.d@bank.com"),
        ("81_docx_europass_docx", "layout_table", "Lucas Martin", "lucas.m@eu.fr"),
        ("82_docx_fresher", "standard", "Tanya Roy", "tanya.r@grad.in"),
        ("83_docx_data_table", "data_table", "Nikhil Kapoor", "nikhil.k@qa.io"),
        ("84_docx_custom_awards", "standard", "Gaurav Mishra", "gaurav.m@ai.in"),
        ("85_docx_multipage_docx", "standard", "Swati Kulkarni", "swati.k@ent.com"),
    ]

    for cid, mode, name, email in docx_specs:
        dpath = os.path.join(tmp_dir, f"{cid}.docx")
        d = docx.Document()
        if mode == "header_footer":
            d.sections[0].header.paragraphs[0].text = f"{name} | {email} | +91 9811100099"
        else:
            d.add_paragraph(name)
            d.add_paragraph(f"{email} | +91 9811100099")

        if mode == "sdt":
            sdt = parse_xml(
                f'<w:sdt {nsdecls("w")}><w:sdtContent>'
                f'<w:p><w:r><w:t>PROFESSIONAL SUMMARY</w:t></w:r></w:p>'
                f'<w:p><w:r><w:t>Cloud architect with 6 years building resilient platforms.</w:t></w:r></w:p>'
                f'</w:sdtContent></w:sdt>'
            )
            d.element.body.append(sdt)

        if mode == "layout_table":
            tbl = d.add_table(rows=1, cols=2)
            lc, rc = tbl.rows[0].cells
            lc.paragraphs[0].text = "SKILLS"
            lc.add_paragraph("Languages: Python, Go, SQL")
            lc.add_paragraph("EDUCATION")
            lc.add_paragraph("B.Tech CS, NIT Warangal (2017 - 2021)")
            rc.paragraphs[0].text = "EXPERIENCE"
            rc.add_paragraph("Software Engineer | TechFlow | Jan 2022 - Present")
            rc.add_paragraph("- Built distributed event router in Go.")
            rc.add_paragraph("PROJECTS")
            rc.add_paragraph("MetricPulse | Python, ClickHouse")
            rc.add_paragraph("- Built real-time observability ingestion.")
        else:
            d.add_paragraph("EXPERIENCE")
            d.add_paragraph("Senior Engineer | Acme Corp | Feb 2021 - Present")
            d.add_paragraph("- Delivered high-throughput Python microservices.")
            d.add_paragraph("PROJECTS")
            d.add_paragraph("DocParser | Python, FastAPI")
            d.add_paragraph("- Automated multi-format document ingestion.")
            d.add_paragraph("EDUCATION")
            d.add_paragraph("B.Tech Computer Science, VIT Vellore (2016 - 2020)")
            d.add_paragraph("SKILLS")
            d.add_paragraph("Languages: Python, TypeScript, SQL")

        if mode == "textbox":
            tx = parse_xml(
                f'<w:p {nsdecls("w")}><w:r><w:pict><v:shape xmlns:v="urn:schemas-microsoft-com:vml"><v:textbox>'
                f'<w:txbxContent>'
                f'<w:p><w:r><w:t>CERTIFICATIONS</w:t></w:r></w:p>'
                f'<w:p><w:r><w:t>CKA Kubernetes Administrator (2024)</w:t></w:r></w:p>'
                f'</w:txbxContent>'
                f'</v:textbox></v:shape></w:pict></w:r></w:p>'
            )
            d.element.body.append(tx)
        elif mode == "nested_table":
            outer = d.add_table(rows=1, cols=1)
            cell = outer.rows[0].cells[0]
            cell.paragraphs[0].text = "CERTIFICATIONS"
            inner = cell.add_table(rows=1, cols=2)
            inner.rows[0].cells[0].text = "AWS Solutions Architect"
            inner.rows[0].cells[1].text = "2024"
        elif mode == "data_table":
            dt = d.add_table(rows=2, cols=2)
            dt.rows[0].cells[0].text = "Certification"
            dt.rows[0].cells[1].text = "Year"
            dt.rows[1].cells[0].text = "GCP Professional Cloud Architect"
            dt.rows[1].cells[1].text = "2023"

        d.save(dpath)
        cases.append({
            "id": cid,
            "file_path": dpath,
            "filename": f"{cid}.docx",
            "expect": {
                "name": name,
                "email": email,
                "min_exp": 1,
                "min_edu": 1,
                "min_skills": 1,
                "min_proj": 1,
            },
            "reading_order_check": mode == "layout_table",
        })

    # --- 15 International / Creative / Edge-Case Resumes (86..100) ---
    edge_specs = [
        ("86_french_cv", "Camille Laurent\ncamille.laurent@paris.fr | +33 612345678\nPROFIL\nIngenieure backend Python.\nEXPERIENCE PROFESSIONNELLE\nDeveloppeuse Backend | Doctolib | Jan 2022 - Present\n- Concue API FastAPI haute disponibilite.\nFORMATION\nMaster Informatique, Sorbonne Universite | 2017 - 2021\nCOMPETENCES\nPython, PostgreSQL, Docker",
         {"name": "Camille Laurent", "email": "camille.laurent@paris.fr", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("87_german_cv", "Lukas Weber\nlukas.weber@berlin.de | +49 1701234567\nBERUFSERFAHRUNG\nSoftwareentwickler | SAP SE | 03/2021 - Present\n- Entwickelte Cloud-Microservices in Go.\nAUSBILDUNG\nB.Sc. Informatik, TU Munchen | 2016 - 2020\nKENNTNISSE\nGo, Kubernetes, SQL",
         {"name": "Lukas Weber", "email": "lukas.weber@berlin.de", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("88_spanish_cv", "Sofia Morales\nsofia.m@madrid.es | +34 699112233\nEXPERIENCIA LABORAL\nIngeniera de Datos | Telefonica | May 2021 - Present\n- Construyo pipelines Spark en AWS.\nEDUCACION\nGrado en Ingenieria Informatica, UAM | 2016 - 2020\nHABILIDADES\nPython, Spark, AWS",
         {"name": "Sofia Morales", "email": "sofia.m@madrid.es", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("89_phd_publications", "Dr. Arvind Krishnan\narvind.k@research.edu | +1 6175550199\nEXPERIENCE\nPostdoctoral Fellow | MIT CSAIL | 2022 - Present\n- Researched formal verification for distributed consensus.\nEDUCATION\nPh.D. Computer Science, Stanford University | 2017 - 2022\nPUBLICATIONS\nByzantine Consensus at Scale | SOSP 2023\nSKILLS\nCoq, Rust, TLA+",
         {"name": "Dr. Arvind Krishnan", "email": "arvind.k@research.edu", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("90_consulting_freelance", "Maya Lin\nmaya.lin@consult.io | +1 4155550144\nCAREER HISTORY\nIndependent Cloud Consultant | Self-Employed | 2020 - Present\n- Delivered FinOps savings of 35% across 6 SaaS clients.\nEDUCATION\nB.S. EECS, UC Berkeley | 2014 - 2018\nTECHNICAL SKILLS\nTerraform, AWS, Python",
         {"name": "Maya Lin", "email": "maya.lin@consult.io", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("91_military_transition", "Marcus Vance\nmarcus.vance@vet.org | +1 7035550188\nEXPERIENCE\nLogistics Operations Lead | US Army | 2017 - 2023\n- Directed supply chain telemetry for 1,200 personnel.\nEDUCATION\nB.S. Supply Chain Management, Penn State | 2013 - 2017\nSKILLS\nSAP, SQL, Operations",
         {"name": "Marcus Vance", "email": "marcus.vance@vet.org", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("92_career_switch", "Elena Petrova\nelena.p@tech.co | +44 7700900123\nSUMMARY\nFormer Mathematics Teacher transitioning into Backend Engineering.\nEXPERIENCE\nJunior Python Developer | FinTech Co | 2024 - Present\n- Built REST endpoints in FastAPI.\nMathematics Teacher | City Academy | 2019 - 2023\n- Taught AP Calculus to 120 students.\nPROJECTS\nGradeBook API | Python, FastAPI, SQLite\n- Automated grading analytics.\nEDUCATION\nB.Sc. Mathematics, University of Manchester | 2015 - 2018\nSKILLS\nPython, FastAPI, SQL",
         {"name": "Elena Petrova", "email": "elena.p@tech.co", "min_exp": 2, "min_proj": 1, "min_edu": 1, "min_skills": 1}),
        ("93_compact_headings", "Sagnik Test\nsagnik.test@example.com | +91 9000011111\nPROFESSIONALSUMMARY\nBackend & ML engineer building production APIs.\nPROFESSIONALEXPERIENCE\nRole 2025-01-2025-12\nML Engineer Intern | DeepLab\n- Built PyTorch training pipelines.\nKEYPROJECTS&SYSTEMS\nAgentFlow\nPython · FastAPI · Docker\n- Deployed multi-agent workflow engine.\nTECHNICALCORESKILLS\nLanguages: Python, SQL\nEDUCATION\nBS Data Science, IIT Madras | 2022 - 2026",
         {"name": "Sagnik Test", "email": "sagnik.test@example.com", "min_exp": 1, "min_proj": 1, "min_edu": 1, "min_skills": 1}),
        ("94_multi_role_same_company", "Daniel Cho\ndaniel.cho@bigtech.com | +1 2065550133\nEXPERIENCE\nStaff Software Engineer | Amazon | 2023 - Present\n- Led DynamoDB storage engine optimization.\nSenior Software Engineer | Amazon | 2020 - 2023\n- Reduced tail latency by 30%.\nEDUCATION\nB.S. CS, University of Washington | 2016 - 2020\nSKILLS\nJava, C++, Distributed Systems",
         {"name": "Daniel Cho", "email": "daniel.cho@bigtech.com", "min_exp": 2, "min_edu": 1, "min_skills": 1}),
        ("95_pipe_projects_links", "Owen Brooks\nowen.b@oss.io | +1 5125550177\nEXPERIENCE\nPlatform Engineer | Vercel | 2022 - Present\n- Built edge routing control plane.\nKEY PROJECTS\nEdgeKV | Rust, Tokio | https://github.com/owen/edgekv\n- Implemented Raft-backed KV store.\nEDUCATION\nB.S. CS, UT Austin | 2018 - 2022\nSKILLS\nRust, TypeScript, Go",
         {"name": "Owen Brooks", "email": "owen.b@oss.io", "min_exp": 1, "min_proj": 1, "min_edu": 1, "min_skills": 1}),
        ("96_volunteer_leadership", "Grace Kim\ngrace.kim@civic.org | +1 3125550166\nEXPERIENCE\nProduct Manager | CivicTech | 2021 - Present\n- Launched open-data portal for 500k residents.\nVOLUNTEER EXPERIENCE\nCode Mentor | Girls Who Code | 2020 - Present\n- Mentored 25 high-school students in Python.\nEDUCATION\nB.A. Economics, University of Chicago | 2017 - 2021\nSKILLS\nProduct Strategy, SQL, Python",
         {"name": "Grace Kim", "email": "grace.kim@civic.org", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("97_certifications_heavy", "Tariq Al-Mansoor\ntariq@cloudsec.ae | +971 501234567\nEXPERIENCE\nCloud Security Architect | GulfCloud | 2021 - Present\n- Designed zero-trust landing zones.\nCERTIFICATIONS\nCISSP - ISC2 (2023)\nAWS Security Specialty (2022)\nEDUCATION\nB.Sc. Computer Engineering, Khalifa University | 2016 - 2020\nSKILLS\nAWS, Zero Trust, Terraform",
         {"name": "Tariq Al-Mansoor", "email": "tariq@cloudsec.ae", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("98_achievements_metrics", "Hannah Abbott\nhannah.a@metrics.io | +1 6465550122\nEXPERIENCE\nSRE Lead | StreamCo | 2021 - Present\n- Improved SLA from 99.9% to 99.99%.\nACHIEVEMENTS\nWinner, Global FinTech Hackathon 2023\nEDUCATION\nB.S. CS, NYU | 2017 - 2021\nSKILLS\nGo, Prometheus, Kubernetes",
         {"name": "Hannah Abbott", "email": "hannah.a@metrics.io", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
        ("99_minimal_student", "Yuki Tanaka\nyuki.tanaka@uni.jp | +81 9012345678\nPROJECTS\nKanjiOCR | Python, PyTorch\n- Built CNN recognizer for handwritten Kanji.\nEDUCATION\nB.Eng Computer Science, University of Tokyo | 2022 - 2026\nSKILLS\nPython, PyTorch, C++",
         {"name": "Yuki Tanaka", "email": "yuki.tanaka@uni.jp", "min_proj": 1, "min_edu": 1, "min_skills": 1}),
        ("100_unusual_headings", "Liam O'Connor\nliam.oconnor@dublin.ie | +353 871234567\nABOUT ME\nFull-stack engineer focused on resilient web apps.\nWHERE I'VE WORKED\nSenior Developer | Stripe | 2021 - Present\n- Built idempotent payout APIs in Ruby and Go.\nACADEMIC BACKGROUND\nB.Sc. Computer Science, Trinity College Dublin | 2017 - 2021\nTOOLKIT\nRuby, Go, React, PostgreSQL",
         {"name": "Liam O'Connor", "email": "liam.oconnor@dublin.ie", "min_exp": 1, "min_edu": 1, "min_skills": 1}),
    ]

    for cid, text, expect in edge_specs:
        cases.append({"id": cid, "text": text, "expect": expect, "reading_order_check": False})

    return cases


def test_universal_100_resume_benchmark(tmp_path, monkeypatch):
    """
    Runs 100 structurally diverse resumes (50 baseline + 20 real binary PDFs + 15 real binary DOCXs + 15 edge/intl)
    through the ACTUAL production pipeline `parse_resume_document_pipeline` and reports:
    - Field Precision
    - Field Recall
    - Entry Completeness
    - Reading-Order Accuracy
    - Missing-Content Rate (unmapped blocks not covered)
    """
    # Use deterministic offline provider & synchronous gather inside parse_resume_document_pipeline
    # so all 100 resumes run through the real production pipeline without OS socketpair or API rate limits.
    monkeypatch.setattr(ai_service, "parse_section", LocalHeuristicProvider().parse_section)

    async def _sync_gather(*coros):
        return [_run_sync_coro(c) for c in coros]

    monkeypatch.setattr(asyncio, "gather", _sync_gather)
    baseline_50 = list(SYNTHETIC_RESUMES) + list(EXTRA_20_RESUMES)
    extra_50 = _build_50_diverse_real_and_edge_resumes(str(tmp_path))
    all_100 = baseline_50 + extra_50
    assert len(all_100) == 100

    tp = fp = fn = 0
    expected_entries = matched_entries = 0
    reading_order_total = reading_order_passed = 0
    total_source_blocks = total_unmapped_blocks = 0
    failures = []

    for fx in all_100:
        cid = fx["id"]
        exp = fx["expect"]
        if "file_path" in fx:
            ext = DocumentExtractor.extract_document(fx["file_path"], fx["filename"])
            raw_text = ext["text"]
            meta = ext
        else:
            raw_text = fx["text"]
            meta = {"page_count": 1, "layout_type": "single_column", "column_count": 1}

        rd, val = _run_sync_coro(parse_resume_document_pipeline(raw_text, layout_metadata=meta))
        recon = (rd.extractionReport or {}).get("reconciliation") or {}
        total_source_blocks += int(recon.get("extracted_blocks") or 0)
        total_unmapped_blocks += int(recon.get("unmapped_blocks") or 0)

        # 1. Field-level precision/recall checks
        if "name" in exp:
            if rd.personalInfo.fullName and exp["name"].lower() in rd.personalInfo.fullName.lower():
                tp += 1
            else:
                fn += 1
                failures.append((cid, "name", exp["name"], rd.personalInfo.fullName))

        if "email" in exp:
            if rd.personalInfo.email.lower() == exp["email"].lower():
                tp += 1
            else:
                fn += 1
                failures.append((cid, "email", exp["email"], rd.personalInfo.email))

        # Entry completeness checks
        for field_key, actual_count in (
            ("min_exp", len(rd.experience) + len(rd.internships)),
            ("min_proj", len(rd.projects)),
            ("min_edu", len(rd.education)),
            ("min_skills", len(rd.skills)),
        ):
            req = exp.get(field_key, 0)
            if req > 0:
                expected_entries += req
                matched_entries += min(req, actual_count)
                if actual_count >= req:
                    tp += 1
                else:
                    fn += 1
                    failures.append((cid, field_key, f">={req}", actual_count))

        # Reading order check for multi-column/layout-table documents
        if fx.get("reading_order_check"):
            reading_order_total += 1
            if len(rd.experience) >= exp.get("min_exp", 1) and len(rd.skills) >= exp.get("min_skills", 1):
                reading_order_passed += 1
            else:
                failures.append((cid, "reading_order", "exp+skills separated", f"exp={len(rd.experience)},skills={len(rd.skills)}"))

    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    entry_completeness = matched_entries / max(1, expected_entries)
    reading_order_acc = reading_order_passed / max(1, reading_order_total)
    missing_content_rate = total_unmapped_blocks / max(1, total_source_blocks)

    print(
        f"\n[100-RESUME BENCHMARK] count={len(all_100)} "
        f"precision={precision:.4f} recall={recall:.4f} "
        f"entry_completeness={entry_completeness:.4f} "
        f"reading_order_acc={reading_order_acc:.4f} ({reading_order_passed}/{reading_order_total}) "
        f"missing_content_rate={missing_content_rate:.4f} ({total_unmapped_blocks}/{total_source_blocks})"
    )
    if failures:
        print("FAILURES_SAMPLE:", failures[:20])

    assert len(all_100) == 100
    assert recall >= 0.90, f"Recall too low: {recall:.4f}, failures={failures[:10]}"
    assert entry_completeness >= 0.90, f"Entry completeness too low: {entry_completeness:.4f}"
    assert reading_order_acc >= 0.90, f"Reading order accuracy too low: {reading_order_acc:.4f}"
