import asyncio
import sys
import os
import pymupdf as fitz

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.resume_parser import extract_text_from_pdf, parse_resume_document_pipeline
from app.services.extraction_validator import ExtractionValidator

SAMPLE_REALISTIC_RESUME = """
ALEX RIVERA
alex.rivera@example.com | (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexrivera-dev | github.com/alexrivera-tech

PROFESSIONAL SUMMARY
High-velocity Senior Full Stack Engineer with 7+ years of experience architecting distributed microservices and modern React applications. Proven track record reducing API latency by 45% and mentoring 12+ engineers.

WORK EXPERIENCE
Apex Cloud Solutions | Senior Full Stack Engineer
Jun 2021 - Present | San Francisco, CA
- Architected and deployed multi-tenant telemetry dashboard serving 250,000+ daily active users with React, TypeScript, and FastAPI.
- Refactored legacy REST microservices into GraphQL and event-driven architecture, reducing API payload sizes by 40%.
- Led a squad of 6 engineers across sprint planning, code reviews, and automated CI/CD pipeline modernization.

NovaTech Innovations | Software Engineer
Jul 2018 - May 2021 | San Jose, CA
- Developed core billing and subscription management workflows with Node.js, Express, and PostgreSQL processing $12M+ annually.
- Engineered responsive user interfaces with React and Tailwind CSS, increasing mobile checkout conversion by 18%.
- Wrote comprehensive unit and integration test suites achieving 88% code coverage across critical service modules.

EDUCATION
University of California, Berkeley
Bachelor of Science in Computer Science | Aug 2014 - May 2018
- CGPA: 3.85 / 4.0
- Relevant Coursework: Distributed Systems, Operating Systems, Algorithms

TECHNICAL PROJECTS
PulseQueue - Distributed Task Broker | github.com/alexrivera/pulsequeue
Jan 2023 - Present
- High-throughput asynchronous job processing engine with real-time dead-letter queue recovery.
- Handled 15,000 msg/sec with sub-5ms queue dispatch latency using Go, Redis, and Docker.

SKILLS
Programming Languages: Python, TypeScript, JavaScript, Go, SQL
Frameworks & Libraries: React, Node.js, FastAPI, Express, Tailwind CSS
Databases & Cloud: PostgreSQL, Redis, MongoDB, AWS (ECS, S3, RDS), Docker, Kubernetes
Developer Tools: Git, GitHub Actions, Docker, Linux, Jest
Core Competencies: Distributed Systems, System Architecture, Agile / Scrum, Technical Leadership

CERTIFICATIONS
AWS Certified Solutions Architect - Associate | Amazon Web Services | 2022
Certified Kubernetes Administrator (CKA) | Cloud Native Computing Foundation | 2023

LANGUAGES
English (Native), Spanish (Fluent)
"""

def create_synthetic_two_column_pdf(file_path: str):
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)
    # Left column (x=36 to 200)
    left_col_text = (
        "Jane Doe\n"
        "Senior Cloud Architect\n\n"
        "CONTACT\n"
        "jane.doe@cloudcorp.com\n"
        "+1 (415) 555-0199\n"
        "Seattle, WA\n"
        "linkedin.com/in/janedoe-cloud\n\n"
        "SKILLS\n"
        "Python, Go, Rust, SQL\n"
        "Kubernetes, Docker, AWS\n"
        "Terraform, PostgreSQL, Redis\n"
    )
    page.insert_text((36, 50), left_col_text, fontsize=11)

    # Right column (x=220 to 570)
    right_col_text = (
        "PROFESSIONAL SUMMARY\n"
        "Visionary cloud architect with 8+ years experience scaling enterprise platforms.\n\n"
        "WORK EXPERIENCE\n"
        "CloudCorp Technologies | Principal Architect\n"
        "2021 - Present | Seattle, WA\n"
        "- Spearheaded Kubernetes platform scaling to 10M events daily.\n"
        "- Reduced cloud infrastructure spend by $450K annually.\n\n"
        "DataMesh Inc | Senior DevOps Engineer\n"
        "2018 - 2021 | San Francisco, CA\n"
        "- Built automated CI/CD pipeline reducing release cycles by 60%.\n\n"
        "EDUCATION\n"
        "University of Washington\n"
        "Bachelor of Science in Computer Engineering | 2014 - 2018\n"
        "- GPA 3.9 / 4.0\n"
    )
    page.insert_text((220, 50), right_col_text, fontsize=11)
    doc.save(file_path)
    doc.close()

async def test_parsing_engine():
    print("Testing Resume Parsing Engine...", flush=True)

    # Test 1: Plain text structured resume
    resume_data, validation = await parse_resume_document_pipeline(SAMPLE_REALISTIC_RESUME)

    assert resume_data.personalInfo.fullName.lower() == "alex rivera", f"Name mismatch: {resume_data.personalInfo.fullName}"
    assert "alex.rivera@example.com" in resume_data.personalInfo.email, f"Email mismatch: {resume_data.personalInfo.email}"
    assert "555" in resume_data.personalInfo.phone, f"Phone mismatch: {resume_data.personalInfo.phone}"
    assert "San Francisco" in resume_data.personalInfo.location, f"Location mismatch: {resume_data.personalInfo.location}"
    assert "linkedin" in resume_data.personalInfo.linkedin
    assert "github" in resume_data.personalInfo.github
    print("✓ Test 1: Text-based Personal Info extracted accurately")

    assert len(resume_data.experience) >= 2, f"Expected at least 2 experiences, got {len(resume_data.experience)}"
    exp1 = resume_data.experience[0]
    assert "Apex Cloud" in exp1.company or "Apex" in exp1.company
    assert len(exp1.responsibilities) >= 1
    assert exp1.startDate != ""
    print(f"✓ Test 1: Work Experience: {len(resume_data.experience)} jobs extracted with dates and responsibilities")

    assert len(resume_data.education) >= 1
    edu1 = resume_data.education[0]
    assert "Berkeley" in edu1.institution or "California" in edu1.institution
    print(f"✓ Test 1: Education: {edu1.institution} ({edu1.degree}) extracted")

    assert len(resume_data.skills) >= 2
    total_skills = sum(len(c.items) for c in resume_data.skills)
    assert total_skills >= 8
    print(f"✓ Test 1: Skills: {total_skills} skills grouped across {len(resume_data.skills)} categories")

    assert validation["overallConfidence"] >= 80
    assert validation["qualityChecks"]["hasName"] is True
    assert validation["qualityChecks"]["hasEmail"] is True
    assert validation["qualityChecks"]["hasExperience"] is True
    assert validation["qualityChecks"]["hasEducation"] is True
    print(f"✓ Test 1: Validation: Overall Confidence = {validation['overallConfidence']}%, Level = {validation['confidenceLevel']}")

    # Test 2: Binary Multi-Column PDF
    temp_pdf_path = os.path.join(os.path.dirname(__file__), "test_sample_twocolumn.pdf")
    try:
        create_synthetic_two_column_pdf(temp_pdf_path)
        pdf_text, pdf_warns, pdf_layout = extract_text_from_pdf(temp_pdf_path)
        assert len(pdf_text) > 100, "Failed to extract text from 2-column PDF"
        print(f"\n✓ Test 2: Multi-Column PDF text extracted ({len(pdf_text)} chars, {pdf_layout['page_count']} page)")

        pdf_resume, pdf_val = await parse_resume_document_pipeline(pdf_text, pdf_layout)
        assert "Jane Doe" in pdf_resume.personalInfo.fullName
        assert "jane.doe@cloudcorp.com" in pdf_resume.personalInfo.email
        assert len(pdf_resume.experience) >= 1
        assert len(pdf_resume.education) >= 1
        print(f"✓ Test 2: Extracted {pdf_resume.personalInfo.fullName} ({pdf_resume.personalInfo.email})")
        print(f"✓ Test 2: Experience entries: {len(pdf_resume.experience)}, Education: {len(pdf_resume.education)}")
        print(f"✓ Test 2: Spatial column sorting preserved section boundaries correctly!")
    finally:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

    print("\n=========================================")
    print("ALL MULTI-STAGE PARSING BENCHMARKS PASSED! ✓")
    print("=========================================")

if __name__ == "__main__":
    asyncio.run(test_parsing_engine())
