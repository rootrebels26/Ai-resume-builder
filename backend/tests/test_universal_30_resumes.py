import os
import sys
import asyncio
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.resume_parser import sanitize_and_hydrate_resume, assemble_resume_from_sections
from app.services.section_segmenter import SectionSegmenter
from app.services.extraction_validator import ExtractionValidator
from app.providers.local_heuristic import LocalHeuristicProvider
from app.services.document_extractor import DocumentExtractor


# 30 structurally diverse synthetic resume fixtures covering industries, layouts,
# languages, creative headings, custom sections, and anti-fabrication edge cases.
SYNTHETIC_RESUMES = [
    {
        "id": "01_swe_single_col",
        "text": """Aarav Mehta
Senior Backend Engineer
aarav.mehta@example.com | +91 9876543210 | Bengaluru, India
https://linkedin.com/in/aaravmehta | https://github.com/aaravmehta

PROFESSIONAL SUMMARY
Distributed systems engineer with 6 years building high-throughput payment pipelines in Go and Python.

EXPERIENCE
Senior Backend Engineer | Razorpay | Jan 2022 - Present
- Architected idempotent webhook processor handling 15,000 events/sec with Kafka and PostgreSQL.
- Reduced p99 settlement latency by 42% through Redis read-through caching.

PROJECTS
LedgerFlow | https://github.com/aaravmehta/ledgerflow
- Built double-entry accounting microservice in Go with deterministic replay and automated reconciliation.

EDUCATION
B.Tech in Computer Science, NIT Surathkal | 2015 - 2019 | CGPA: 8.9/10

SKILLS
Languages: Go, Python, SQL
Infrastructure: Kafka, PostgreSQL, Redis, Kubernetes""",
        "expect": {"name": "Aarav Mehta", "email": "aarav.mehta@example.com", "min_exp": 1, "min_proj": 1, "min_edu": 1, "min_skills": 2},
    },
    {
        "id": "02_two_col_sidebar",
        "text": """Elena Rostova
UX & Product Designer
elena.rostova@design.io | +1 415 555 0192 | San Francisco, CA
https://behance.net/elenarostova | https://dribbble.com/elenarostova

PROFILE
Human-centered product designer crafting accessible enterprise workflows and design systems.

WORK EXPERIENCE
Lead Product Designer | Figma Labs | Mar 2021 - Present
- Led redesign of multiplayer commenting workspace for 4M weekly active users.
- Established WCAG 2.1 AA component tokens across 6 product squads.

EDUCATION
BFA in Interaction Design, California College of the Arts | 2014 - 2018

SKILLS
Figma, Prototyping, Design Systems, User Research, Accessibility""",
        "expect": {"name": "Elena Rostova", "email": "elena.rostova@design.io", "min_exp": 1, "min_edu": 1, "min_skills": 3},
    },
    {
        "id": "03_three_col_compact",
        "text": """Marcus Vance
Cloud Solutions Architect
marcus@vancecloud.dev | +44 7700 900077 | London, UK
https://github.com/mvance

SUMMARY
Multi-cloud infrastructure architect specializing in Terraform, AWS Landing Zones, and FinOps.

EXPERIENCE
Principal Cloud Architect | CloudScale UK | 2020 - Present
- Migrated 120+ legacy workloads to AWS EKS with zero customer downtime.

CERTIFICATIONS
AWS Certified Solutions Architect Professional | Amazon Web Services | 2023
CKA: Certified Kubernetes Administrator | CNCF | 2022

EDUCATION
MSc Distributed Computing, Imperial College London | 2014 - 2015

SKILLS
AWS, Terraform, Kubernetes, Python, Helm""",
        "expect": {"name": "Marcus Vance", "email": "marcus@vancecloud.dev", "min_exp": 1, "min_cert": 2, "min_edu": 1},
    },
    {
        "id": "04_academic_cv",
        "text": """Dr. Priya Subramanian
Assistant Professor of Computational Biology
priya.s@iisc.edu | +91 80 2293 0000 | Bengaluru, India
https://orcid.org/0000-0002-1234-5678

RESEARCH STATEMENT
Investigating single-cell RNA sequencing representations using graph neural networks.

ACADEMIC APPOINTMENTS
Assistant Professor | Indian Institute of Science | Aug 2021 - Present
- Principal investigator for 4 doctoral researchers in computational genomics.

PUBLICATIONS
GraphRNA: Cell-Type Annotation via Attention Networks | Nature Computational Science | 2023
Single-Cell Trajectory Inference at Scale | Bioinformatics | 2021

EDUCATION
Ph.D. in Computational Biology, ETH Zurich | 2016 - 2020

RESEARCH GRANTS
DBT Early Career Fellowship ($180,000) | 2022 - 2025""",
        "expect": {"name": "Dr. Priya Subramanian", "email": "priya.s@iisc.edu", "min_exp": 1, "min_edu": 1, "custom_or_pub": True},
    },
    {
        "id": "05_healthcare_nurse",
        "text": """Hannah O'Connor, RN, BSN
Registered Nurse - ICU
hannah.oconnor@carehealth.org | +1 617 555 0148 | Boston, MA

CAREER OBJECTIVE
Compassionate ICU Registered Nurse with 5 years of critical care experience in Level 1 trauma centers.

CLINICAL EXPERIENCE
ICU Registered Nurse | Massachusetts General Hospital | Jun 2019 - Present
- Managed ventilator-dependent trauma patients with 1:1 and 1:2 nurse-to-patient ratios.
- Coordinated rapid response code blue interventions alongside attending intensivists.

LICENSES & CERTIFICATIONS
Registered Nurse (RN) License #RN-482910 | Massachusetts Board of Nursing | 2019
ACLS & BLS Provider | American Heart Association | 2023

EDUCATION
Bachelor of Science in Nursing (BSN), Boston College | 2015 - 2019

SKILLS
Critical Care, Ventilator Management, Epic EHR, Hemodynamic Monitoring, Triage""",
        "expect": {"name": "Hannah O'Connor, RN, BSN", "email": "hannah.oconnor@carehealth.org", "no_engineer_title": True, "min_exp": 1, "min_edu": 1, "min_cert": 2},
    },
    {
        "id": "06_finance_ca",
        "text": """Rohan Kulkarni, CA, CFA
Senior Financial Controller
rohan.k@finadvisory.in | +91 9820011223 | Mumbai, India

EXECUTIVE SUMMARY
Chartered Accountant leading statutory audits, IFRS reporting, and treasury operations for manufacturing groups.

EXPERIENCE
Financial Controller | Tata Consumer Products | Apr 2020 - Present
- Closed quarterly consolidated financial statements under Ind AS and IFRS across 9 subsidiaries.
- Automated GST reconciliation saving 140 finance hours monthly.

EDUCATION
Chartered Accountant (CA), ICAI | 2016
B.Com (Hons), Narsee Monjee College | 2013

SKILLS
IFRS, Ind AS, SAP FICO, Financial Modeling, Statutory Audit""",
        "expect": {"name": "Rohan Kulkarni, CA, CFA", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "07_legal_counsel",
        "text": """Claire Beaumont, JD
Senior Corporate Counsel
claire.beaumont@lexfirm.com | +1 212 555 0171 | New York, NY

SUMMARY
Corporate M&A and technology licensing attorney advising SaaS growth companies.

EXPERIENCE
Senior Corporate Counsel | Stripe | 2021 - Present
- Negotiated enterprise master service agreements and cross-border data processing addenda.

BAR ADMISSIONS
New York State Bar Association | Admitted 2017

EDUCATION
Juris Doctor (JD), Columbia Law School | 2013 - 2016""",
        "expect": {"name": "Claire Beaumont, JD", "no_engineer_title": True, "min_exp": 1, "min_edu": 1, "min_custom": 1},
    },
    {
        "id": "08_creative_exhibitions",
        "text": """Mateo Silva
Creative Director & Motion Designer
mateo@silvastudio.co | +34 612 345 678 | Madrid, Spain
https://behance.net/mateosilva

ABOUT ME
Art director blending 3D typography, kinetic branding, and spatial installations.

EXPERIENCE
Creative Director | Studio Norte | 2019 - Present
- Directed broadcast rebrand packages for 14 European cultural networks.

EXHIBITIONS
OFFF Barcelona Main Titles Showcase | 2023
Pictoplasma Berlin Character Design | 2022

EDUCATION
BA Graphic Design, Elisava Barcelona | 2014 - 2018""",
        "expect": {"name": "Mateo Silva", "no_engineer_title": True, "min_exp": 1, "min_edu": 1, "min_custom": 1},
    },
    {
        "id": "09_fresh_grad_internships",
        "text": """Ananya Sharma
B.Tech Computer Science Student
ananya.sharma@iitd.ac.in | +91 9911223344 | New Delhi, India
https://github.com/ananyasharma

OBJECTIVE
Final-year Computer Science undergraduate seeking Software Engineering roles.

INTERNSHIPS
Software Engineering Intern | Microsoft India | May 2025 - Jul 2025
- Built telemetry ingestion worker in C# reducing Azure Cosmos DB RU consumption by 22%.

ACADEMIC PROJECTS
CampusRide | https://github.com/ananyasharma/campusride
- Real-time carpooling Android app with Firebase Auth and Google Maps polyline matching.

EDUCATION
B.Tech in Computer Science and Engineering, IIT Delhi | 2022 - 2026 | CGPA: 9.14/10

SKILLS
C++, Python, Java, React, SQL""",
        "expect": {"name": "Ananya Sharma", "min_intern": 1, "min_proj": 1, "min_edu": 1},
    },
    {
        "id": "10_executive_multipage",
        "text": """[[page 1]]
Jonathan Sterling
Chief Operating Officer
j.sterling@globalops.com | +1 312 555 0109 | Chicago, IL

EXECUTIVE PROFILE
Operations executive scaling logistics networks across North America and EMEA.

EXPERIENCE
Chief Operating Officer | FreightPulse Inc. | 2021 - Present
- Grew annual recurring revenue from $45M to $190M while expanding gross margin by 7 points.

[[page 2]]
VP of Operations | Midwest Supply Co. | 2016 - 2021
- Consolidated 11 regional warehouses into 4 automated fulfillment hubs.

[[page 3]]
BOARD MEMBERSHIPS
Advisory Board Member, SupplyChain AI Forum | 2022 - Present

EDUCATION
MBA, University of Chicago Booth School of Business | 2010 - 2012""",
        "expect": {"name": "Jonathan Sterling", "min_exp": 2, "min_edu": 1, "min_pages": 3, "min_custom": 1},
    },
    {
        "id": "11_freelancer_consultant",
        "text": """Liam O'Brien
Independent Shopify & Full-Stack Consultant
liam@obriencommerce.dev | +353 87 123 4567 | Dublin, Ireland
https://obriencommerce.dev

SUMMARY
Independent e-commerce engineer delivering headless storefronts and custom checkout extensions.

EXPERIENCE
Principal Consultant | O'Brien Digital | 2020 - Present
- Delivered 18 headless Shopify Plus storefronts using Next.js and GraphQL.

PROJECTS
NordicRoast Headless Store | https://nordicroast.example.com
- Custom subscription portal handling 12,000 monthly recurring coffee orders.

EDUCATION
B.Sc. Computer Applications, Dublin City University | 2013 - 2017""",
        "expect": {"name": "Liam O'Brien", "min_exp": 1, "min_proj": 1, "min_edu": 1},
    },
    {
        "id": "12_data_scientist",
        "text": """Mei-Ling Chen
Senior Data Scientist
meiling.chen@mlresearch.ai | +1 206 555 0183 | Seattle, WA
https://github.com/meilingchen

SUMMARY
Applied scientist specializing in demand forecasting, causal inference, and ranking models.

EXPERIENCE
Senior Data Scientist | Nordstrom | 2021 - Present
- Deployed gradient-boosted ranking model increasing search conversion rate by 4.8%.

PROJECTS
DemandCast Prophet Pipeline | https://github.com/meilingchen/demandcast
- Multi-horizon retail forecasting pipeline evaluated with WAPE 6.2% across 50,000 SKUs.

EDUCATION
M.S. in Statistics, University of Washington | 2017 - 2019""",
        "expect": {"name": "Mei-Ling Chen", "min_exp": 1, "min_proj": 1, "min_edu": 1},
    },
    {
        "id": "13_devops_architect",
        "text": """Vikramaditya Rao
Site Reliability Engineer
vikram.rao@srehub.io | +91 9845012345 | Hyderabad, India

SUMMARY
SRE focused on observability, incident automation, and multi-region Kubernetes reliability.

EXPERIENCE
Staff SRE | Freshworks | 2020 - Present
- Reduced mean time to recovery (MTTR) from 38 minutes to 6 minutes using Prometheus alert routing.

CERTIFICATIONS
Certified Kubernetes Security Specialist (CKS) | CNCF | 2024 | AWS DevOps Engineer | Amazon | 2022

EDUCATION
B.E. Electronics, RV College of Engineering | 2014 - 2018""",
        "expect": {"name": "Vikramaditya Rao", "min_exp": 1, "min_cert": 2, "min_edu": 1},
    },
    {
        "id": "14_mechanical_engineer",
        "text": """Daniel Weber, PE
Senior Mechanical Design Engineer
d.weber@precisionmech.de | +49 170 1234567 | Munich, Germany

PROFILE
Mechanical engineer with 8 years in precision robotics actuators and thermal FEA.

EXPERIENCE
Senior Mechanical Engineer | KUKA Robotics | 2019 - Present
- Designed harmonic drive housing reducing actuator weight by 18% under ANSYS modal analysis.

PATENTS
EP3912041: Compact Cycloidal Gearbox for Collaborative Robots | 2022

EDUCATION
M.Sc. Mechanical Engineering, Technical University of Munich | 2013 - 2016""",
        "expect": {"name": "Daniel Weber, PE", "min_exp": 1, "min_edu": 1, "min_custom": 1},
    },
    {
        "id": "15_educator_professor",
        "text": """Prof. Sarah Jenkins
High School Physics & AP Calculus Teacher
s.jenkins@oakridge.edu | +1 512 555 0164 | Austin, TX

PERSONAL STATEMENT
STEM educator with 11 years preparing students for AP Physics C and national olympiads.

EXPERIENCE
Lead Physics Educator | Oakridge Preparatory Academy | 2016 - Present
- Raised AP Physics pass rate from 71% to 94% over 5 academic cycles.

COURSES TAUGHT
AP Physics C: Mechanics & Electricity, AP Calculus BC, Robotics Lab

EDUCATION
M.Ed. Curriculum & Instruction, University of Texas at Austin | 2012 - 2014""",
        "expect": {"name": "Prof. Sarah Jenkins", "no_engineer_title": True, "min_exp": 1, "min_edu": 1, "min_custom": 1},
    },
    {
        "id": "16_sales_bd",
        "text": """Carlos Mendoza
Enterprise Account Executive
carlos.m@saasgrowth.com | +1 305 555 0122 | Miami, FL

SUMMARY
Enterprise quota-crushing AE closing $2M+ annual contracts across healthcare and fintech.

EXPERIENCE
Enterprise Account Executive | Datadog | 2021 - Present
- Achieved 148% of $1.8M annual quota in FY2024; closed 6 Fortune 500 logos.

AWARDS
President's Club Winner | 2022, 2023, 2024

EDUCATION
B.S. Business Administration, University of Florida | 2014 - 2018""",
        "expect": {"name": "Carlos Mendoza", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "17_marketing_growth",
        "text": """Chloe Martin
Head of Growth Marketing
chloe@growthloop.fr | +33 6 12 34 56 78 | Paris, France

ABOUT ME
B2B SaaS growth marketer driving organic pipeline, lifecycle CRM, and paid acquisition.

EXPERIENCE
Head of Growth | Alan | 2020 - Present
- Scaled inbound SQL pipeline 3.4x while lowering blended CAC by 29%.

LANGUAGES
French: Native
English: Fluent
Spanish: Conversational

EDUCATION
Master in Marketing, HEC Paris | 2015 - 2018""",
        "expect": {"name": "Chloe Martin", "no_engineer_title": True, "min_exp": 1, "min_edu": 1, "min_lang": 2},
    },
    {
        "id": "18_hr_people_ops",
        "text": """Nadia Al-Mansoor
People Operations Manager
nadia@peoplefirst.ae | +971 50 123 4567 | Dubai, UAE

CAREER OVERVIEW
HR leader building inclusive hiring pipelines and Workday HRIS automation across MENA.

EXPERIENCE
People Operations Manager | Careem | 2020 - Present
- Reduced time-to-hire for engineering roles from 52 days to 28 days.

EDUCATION
BA Human Resource Management, American University of Sharjah | 2014 - 2018""",
        "expect": {"name": "Nadia Al-Mansoor", "no_engineer_title": True, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "19_product_manager",
        "text": """Kevin Park
Senior Product Manager
kevin.park@pmcraft.io | +1 408 555 0199 | San Jose, CA

SUMMARY
Product leader shipping B2B payments and developer APIs from 0-to-1 to $50M ARR.

EXPERIENCE
Senior Product Manager | Plaid | 2021 - Present
- Launched Instant Bank Verification API adopted by 1,200+ fintech apps in 6 months.

EDUCATION
B.S. Industrial Engineering, UC Berkeley | 2014 - 2018""",
        "expect": {"name": "Kevin Park", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "20_cybersecurity",
        "text": """Tariq Hassan
Offensive Security Engineer
tariq@redteam.sec | +44 7911 123456 | Manchester, UK

SUMMARY
Penetration tester and red team operator specializing in cloud IAM and web application security.

EXPERIENCE
Security Consultant | NCC Group | 2020 - Present
- Conducted 40+ black-box penetration tests for FTSE 100 banking platforms.

CERTIFICATIONS
OSCP | Offensive Security | 2021
CISSP | ISC2 | 2023

EDUCATION
BSc Cyber Security, University of Manchester | 2016 - 2019""",
        "expect": {"name": "Tariq Hassan", "min_exp": 1, "min_cert": 2, "min_edu": 1},
    },
    {
        "id": "21_multilingual_spanish",
        "text": """Sofía Morales
Desarrolladora Full Stack
sofia.morales@ejemplo.es | +34 699 887 766 | Valencia, España

RESUMEN PROFESIONAL
Ingeniera de software con 4 años de experiencia en React, Node.js y bases de datos PostgreSQL.

EXPERIENCIA LABORAL
Desarrolladora Full Stack | Mercadona Tech | 2021 - Presente
- Desarrolló microservicios de logística en tiempo real reduciendo errores de inventario en un 19%.

EDUCACIÓN
Grado en Ingeniería Informática, Universitat Politècnica de València | 2016 - 2020

IDIOMAS
Español: Nativo
Inglés: Avanzado""",
        "expect": {"name": "Sofía Morales", "min_exp": 1, "min_edu": 1, "min_lang": 2},
    },
    {
        "id": "22_creative_headings",
        "text": """Noah Brooks
Creative Technologist
noah@brooks.studio | +1 503 555 0135 | Portland, OR

WHO I AM
Prototyping interactive WebGL installations and AI-assisted audio tools.

MY JOURNEY
Creative Technologist | Instrument | 2021 - Present
- Built custom Three.js WebGPU product configurator for Nike Global.

WHAT I'VE BUILT
SynthGrid | https://github.com/noahbrooks/synthgrid
- Browser-based polyphonic WebAudio synthesizer with MIDI controller mapping.

WHERE I STUDIED
B.S. Digital Media, NYU Interactive Telecommunications | 2016 - 2020

TOOLBOX
TypeScript, Three.js, WebGL, WebAudio, GLSL""",
        "expect": {"name": "Noah Brooks", "min_exp": 1, "min_proj": 1, "min_edu": 1, "min_skills": 3},
    },
    {
        "id": "23_custom_sections_rich",
        "text": """Dr. Aris Thorne
Quantum Algorithms Researcher
aris@quantumlab.ch | +41 44 632 1111 | Zurich, Switzerland

EXPERIENCE
Research Scientist | IBM Quantum Zurich | 2020 - Present
- Designed error-mitigated VQE circuits for molecular ground-state estimation.

SPEAKING ENGAGEMENTS
QIP 2024 Invited Keynote: Fault-Tolerant Surface Codes | Taipei | Jan 2024
APS March Meeting Tutorial on Error Mitigation | 2023

OPEN SOURCE CONTRIBUTIONS
Qiskit Terra Core Maintainer | 45+ merged PRs on transpiler passes

EDUCATION
Ph.D. Physics, University of Oxford | 2015 - 2019""",
        "expect": {"name": "Dr. Aris Thorne", "min_exp": 1, "min_edu": 1, "min_custom": 2},
    },
    {
        "id": "24_zero_projects_no_fabrication",
        "text": """Grace Hopper-Test
Operations Analyst
grace.test@ops.org | +1 202 555 0101 | Washington, DC

EXPERIENCE
Operations Analyst | Federal Transit Office | 2020 - Present
- Analyzed monthly ridership datasets and prepared quarterly compliance reports.
- Built pivot tables in Excel for budget forecasting.

EDUCATION
B.A. Economics, George Washington University | 2016 - 2020""",
        "expect": {"name": "Grace Hopper-Test", "exact_proj": 0, "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "25_zero_education_no_fabrication",
        "text": """Lucas Vance
Self-Taught Systems Programmer
lucas.vance@kernel.org | +1 206 555 0144 | Seattle, WA

SUMMARY
Self-taught systems programmer contributing to Linux eBPF tooling and Rust async runtimes.

EXPERIENCE
Systems Engineer | Cloudflare | 2021 - Present
- Maintained packet-filtering eBPF programs processing 10M packets/sec per edge node.""",
        "expect": {"name": "Lucas Vance", "exact_edu": 0, "min_exp": 1},
    },
    {
        "id": "26_zero_summary_no_fabrication",
        "text": """Mia Patel
QA Automation Engineer
mia.patel@testlabs.io | +1 416 555 0188 | Toronto, Canada

EXPERIENCE
QA Automation Engineer | Shopify | 2021 - Present
- Built Playwright end-to-end test suites covering 320 checkout edge cases.

EDUCATION
B.Eng Software Engineering, University of Waterloo | 2017 - 2021""",
        "expect": {"name": "Mia Patel", "exact_summary": "", "min_exp": 1, "min_edu": 1},
    },
    {
        "id": "27_pipe_separated_certs",
        "text": """Sagnik Sen
Software Development Engineer
sagnik.sen.iitm@gmail.com | +91 9635290126 | Habra, West Bengal, India

EXPERIENCE
Machine Learning Engineer Intern | Learn Depth | Aug 2026 - Oct 2026
- Built data preprocessing and feature-engineering pipelines in Python.

CERTIFICATIONS
Claude 101 and AI Fluency for Students (Anthropic) | Jul 2026 | SQL (Basic) (HackerRank) | Aug 2026

EDUCATION
BS in Data Science and Applications, Indian Institute of Technology Madras | Present""",
        "expect": {"name": "Sagnik Sen", "min_cert": 2, "min_edu": 1},
    },
    {
        "id": "28_cgpa_and_percentage_exact",
        "text": """Kavya Nair
Data Analyst
kavya.nair@analytics.in | +91 9876012345 | Kochi, India

EDUCATION
M.Sc. Data Science, Cochin University | 2021 - 2023 | CGPA: 9.14/10
Higher Secondary (Class XII), Kendriya Vidyalaya | 2018 | Percentage: 92.4%

SKILLS
Python, SQL, Power BI, Tableau""",
        "expect": {"name": "Kavya Nair", "min_edu": 2, "preserve_cgpa": "9.14"},
    },
    {
        "id": "29_verbatim_long_project_description",
        "text": """Devansh Gupta
Full Stack Developer
devansh.g@builders.dev | +91 9811122233 | Noida, India

PROJECTS
AI Interview Preparation System | https://github.com/devansh/ai-interview
- Built a multi-page Streamlit application with profile management, skill assessment (DSA, DBMS, OS), analytics dashboards, a JSON-backed question bank by topic and difficulty, and progress tracking. Trained a Decision Tree Classifier to predict interview readiness (Low / Medium / Good / Excellent) and auto-generate personalized learning roadmaps from weak topics.

EDUCATION
B.Tech CSE, IIIT Delhi | 2020 - 2024""",
        "expect": {
            "name": "Devansh Gupta",
            "min_proj": 1,
            "preserve_phrase": "Trained a Decision Tree Classifier to predict interview readiness",
        },
    },
    {
        "id": "30_gitlab_portfolio_multi_phone",
        "text": """Henrik Lindqvist
Embedded Firmware Engineer
henrik@lindqvist-fw.se | +46 70 123 4567 | +46 8 555 0199 | Stockholm, Sweden
https://gitlab.com/hlindqvist | https://lindqvist-fw.se

EXPERIENCE
Firmware Engineer | Ericsson | 2019 - Present
- Developed RTOS CAN-bus drivers in C11 for 5G baseband radio units.

EDUCATION
M.Sc. Embedded Systems, KTH Royal Institute of Technology | 2014 - 2019""",
        "expect": {"name": "Henrik Lindqvist", "min_exp": 1, "min_edu": 1, "has_gitlab_or_site": True},
    },
]


def _run_sync_coro(coro):
    """Drive an async function that has no I/O awaits without creating an OS socketpair."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value
    raise RuntimeError("Unexpected yield in synchronous pipeline test")


def _run_pipeline_sync(raw_text: str, layout_metadata: dict):
    provider = LocalHeuristicProvider()
    blocks = SectionSegmenter.segment(raw_text)
    blocks_and_results = []
    for blk in blocks:
        sec_type = blk["section_type"]
        sec_text = blk["text"]
        heading_raw = blk.get("heading_raw", "")
        res = _run_sync_coro(provider.parse_section(sec_type, sec_text, heading_raw=heading_raw))
        cleaned, _, ground_warnings = ExtractionValidator.verify_section_grounding(sec_type, sec_text, res)
        if ground_warnings:
            cleaned["warnings"] = list(cleaned.get("warnings") or []) + ground_warnings
        blocks_and_results.append((blk, cleaned))

    resume_data, structured_warnings, unmapped = assemble_resume_from_sections(blocks_and_results)

    # Secondary safety-net merge matching parse_resume_document_pipeline
    h_dict = provider.parse_resume_document_sync(raw_text, layout_metadata=layout_metadata)
    h_resume = sanitize_and_hydrate_resume(h_dict, raw_text=raw_text)
    if not resume_data.internships and h_resume.internships:
        resume_data.internships = h_resume.internships
    if not resume_data.achievements and h_resume.achievements:
        resume_data.achievements = h_resume.achievements
    if not resume_data.publications and h_resume.publications:
        resume_data.publications = h_resume.publications
    if not resume_data.volunteerExperience and h_resume.volunteerExperience:
        resume_data.volunteerExperience = h_resume.volunteerExperience
    if not resume_data.languages and h_resume.languages:
        resume_data.languages = h_resume.languages
    if not resume_data.customSections and h_resume.customSections:
        resume_data.customSections = h_resume.customSections

    val = ExtractionValidator.validate(
        raw_text,
        resume_data.model_dump(),
        layout_metadata=layout_metadata,
        structured_warnings=structured_warnings,
        unmapped=unmapped,
    )
    return resume_data, val


def test_universal_30_synthetic_resumes():
    results = []
    tp = 0
    fp = 0
    fn = 0
    desc_total = 0
    desc_preserved = 0
    custom_expected = 0
    custom_preserved = 0

    for fx in SYNTHETIC_RESUMES:
        lang = DocumentExtractor.detect_language(fx["text"])
        resume_data, val = _run_pipeline_sync(
            fx["text"],
            layout_metadata={"extraction_method": "text", "language": lang},
        )
        exp = fx["expect"]

        # Measure Precision/Recall on key structured entities
        if exp.get("name"):
            if resume_data.personalInfo.fullName:
                tp += 1
            else:
                fn += 1

        if exp.get("email"):
            if resume_data.personalInfo.email == exp["email"]:
                tp += 1
            else:
                fn += 1

        if exp.get("min_exp"):
            if len(resume_data.experience) >= exp["min_exp"]:
                tp += 1
            else:
                fn += 1

        if exp.get("min_intern"):
            if (len(resume_data.internships) + len(resume_data.experience)) >= exp["min_intern"]:
                tp += 1
            else:
                fn += 1

        if exp.get("min_proj"):
            if len(resume_data.projects) >= exp["min_proj"]:
                tp += 1
            else:
                fn += 1
        if "exact_proj" in exp:
            if len(resume_data.projects) == exp["exact_proj"]:
                tp += 1
            else:
                fp += 1

        if exp.get("min_edu"):
            if len(resume_data.education) >= exp["min_edu"]:
                tp += 1
            else:
                fn += 1
        if "exact_edu" in exp:
            if len(resume_data.education) == exp["exact_edu"]:
                tp += 1
            else:
                fp += 1

        if "exact_summary" in exp:
            if resume_data.professionalSummary == exp["exact_summary"]:
                tp += 1
            else:
                fp += 1

        if exp.get("no_engineer_title"):
            title = (resume_data.personalInfo.professionalTitle or "").lower()
            if title in ("engineer", "software engineer"):
                fp += 1
            else:
                tp += 1

        if exp.get("min_custom"):
            custom_expected += 1
            if len(resume_data.customSections) >= exp["min_custom"]:
                custom_preserved += 1
                tp += 1
            else:
                fn += 1

        if exp.get("preserve_phrase"):
            desc_total += 1
            joined_proj = " ".join(
                (p.description or "") + " " + " ".join(p.highlights or [])
                for p in resume_data.projects
            )
            if exp["preserve_phrase"] in joined_proj:
                desc_preserved += 1
                tp += 1
            else:
                fn += 1

        if exp.get("preserve_cgpa"):
            desc_total += 1
            joined_edu = " ".join(
                f"{e.cgpa} {e.degree} {e.description}" for e in resume_data.education
            )
            if exp["preserve_cgpa"] in joined_edu:
                desc_preserved += 1
                tp += 1
            else:
                fn += 1

        results.append({
            "id": fx["id"],
            "exp": len(resume_data.experience),
            "intern": len(resume_data.internships),
            "edu": len(resume_data.education),
            "proj": len(resume_data.projects),
            "cert": len(resume_data.certifications),
            "skills": sum(len(s.items) for s in resume_data.skills),
            "custom": len(resume_data.customSections),
            "conf": val.get("confidence", 0.0),
        })

    precision = tp / (tp + fp) if (tp + fp) else 1.0
    recall = tp / (tp + fn) if (tp + fn) else 1.0
    print("\n=== UNIVERSAL 30-RESUME BENCHMARK ===")
    for r in results:
        print(
            f"  {r['id']}: exp={r['exp']} intern={r['intern']} edu={r['edu']} "
            f"proj={r['proj']} cert={r['cert']} skills={r['skills']} custom={r['custom']} conf={r['conf']}"
        )
    print(
        f"METRICS: TP={tp} FP={fp} FN={fn} | Precision={precision:.4f} | Recall={recall:.4f} | "
        f"DescPreserved={desc_preserved}/{desc_total} | CustomPreserved={custom_preserved}/{custom_expected}"
    )

    assert len(results) == 30
    assert precision >= 0.90, f"Precision too low: {precision:.4f}"
    assert recall >= 0.85, f"Recall too low: {recall:.4f}"
    assert desc_preserved == desc_total, "Original descriptions/CGPA were altered or truncated"
