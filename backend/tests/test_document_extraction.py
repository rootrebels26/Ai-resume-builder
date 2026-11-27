import asyncio
import json
import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.document_extraction import (
    DOCUMENT_EXTRACTION_SCHEMA,
    build_document_extraction_prompt,
    coerce_document_extraction,
    merge_extraction_payloads,
    normalize_document_extraction,
    run_document_extraction,
    split_document_chunks,
)


SAMPLE_PAYLOAD = {
    "schema_version": "1.0",
    "document_info": {
        "document_type": "resume",
        "pages_processed": [1, 2],
        "language": "en",
        "extraction_status": "complete",
        "warnings": [{"code": "OCR_LOW_QUALITY", "message": "Low OCR confidence on page 2."}],
    },
    "personal_information": {
        "full_name": "Jane Doe",
        "professional_title": "Backend Engineer",
        "email": "jane@example.com",
        "phone": "+91 98765 43210",
        "location": None,
        "city": "Kolkata",
        "state": "West Bengal",
        "country": "India",
        "linkedin": "https://linkedin.com/in/janedoe",
        "github": "https://github.com/janedoe",
        "portfolio": None,
        "website": None,
        "other_links": [{"label": "GitLab", "url": "https://gitlab.com/janedoe"}],
        "other_details": [{"text": "Open to relocation"}],
    },
    "professional_summary": [
        {"text": "Backend engineer focused on reliable data pipelines."},
        {"text": "Second paragraph preserved verbatim."},
    ],
    "work_experience": [
        {
            "company_name": "Acme Technologies Pvt. Ltd.",
            "job_title": "Senior Software Engineer",
            "employment_type": "Full-time",
            "location": "Bengaluru",
            "start_date": {"raw": "Jan 2023", "value": "2023-01"},
            "end_date": {"raw": "Present", "value": None},
            "current_employment_status": "Current",
            "responsibilities": [
                "Reduced API response time by 40% by adding Redis caching",
                "Built the billing dashboard in React and TypeScript",
            ],
            "achievements": ["Promoted from Software Engineer to Senior Software Engineer"],
            "technologies": ["Python", "Redis"],
            "source_pages": [1],
        }
    ],
    "internships": [
        {
            "organization": "Beta Labs",
            "role": "Data Intern",
            "location": "Remote",
            "start_date": "Jun 2020",
            "end_date": "Aug 2020",
            "responsibilities": ["Cleaned a 2M row dataset"],
            "technologies": ["pandas"],
            "source_pages": [2],
        }
    ],
    "projects": [
        {
            "project_name": "Resume Builder",
            "project_category": "Web Application",
            "description": "Lets users export a resume as PDF.",
            "bullet_points": ["Exports ATS-safe PDFs", "Supports 12 templates"],
            "technologies": ["Next.js", "PostgreSQL"],
            "github_url": "https://github.com/janedoe/resume-builder",
            "demo_url": "https://resume.example.com",
            "start_date": "2021",
            "end_date": "2022",
            "source_pages": [2],
        }
    ],
    "education": [
        {
            "institution": "Jadavpur University",
            "degree": "B.Tech",
            "field_of_study": "Computer Science and Engineering",
            "start_year": "2017",
            "end_year": "2021",
            "cgpa": "8.7/10",
            "coursework": ["Databases", "Operating Systems"],
            "source_pages": [2],
        }
    ],
    "skills": {
        "programming_languages": ["Python", "python", "C++"],
        "frameworks": ["React", {"name": "FastAPI", "level": "Advanced"}],
        "libraries": [],
        "databases": ["PostgreSQL"],
        "cloud_platforms": [],
        "machine_learning": [],
        "ai": [],
        "data_analysis": [],
        "data_engineering": ["ETL"],
        "devops": [],
        "tools": ["Git"],
        "soft_skills": ["Mentoring"],
        "other_skills": [],
    },
    "certifications": [
        {
            "name": "AWS Certified Cloud Practitioner",
            "issuing_organization": "Amazon Web Services",
            "issue_date": "Mar 2022",
            "credential_url": "https://aws.example.com/verify",
        }
    ],
    "courses": [
        {
            "course_name": "Advanced SQL",
            "provider": "Coursera",
            "completion_date": "2021",
        }
    ],
    "awards": [{"title": "Best Capstone Project", "issuer": "Jadavpur University", "date": "2021"}],
    "achievements": [{"title": "Hackathon Winner", "description": "First place at HackKolkata 2020"}],
    "publications": [
        {
            "title": "Reliable ETL at Scale",
            "journal": "Data Engineering Notes",
            "year": "2022",
            "url": "https://example.com/paper",
        }
    ],
    "research": [{"title": "Streaming Systems", "description": "Undergraduate research on streaming joins"}],
    "patents": [{"title": "Cache Warming Method", "description": "Provisional patent filed in 2023"}],
    "volunteering": [
        {
            "organization": "Code for Kolkata",
            "role": "Mentor",
            "start_date": "2021",
            "end_date": "2022",
            "description": "Mentored 20 students",
        }
    ],
    "leadership": [{"title": "Technical Lead", "description": "Led a 6-person platform team"}],
    "languages": [{"name": "English", "proficiency": "Fluent"}, {"name": "Hindi", "proficiency": "Native"}],
    "extracurricular_activities": [{"title": "Debate Club", "description": "President"}],
    "interests": [{"title": "Open source", "description": "Maintains a CLI tool"}],
    "references": [{"title": "Dr. A. Sen", "description": "sen@college.edu"}],
    "custom_sections": [
        {
            "original_section_heading": "Grants",
            "normalized_category": "grants",
            "entries": [{"title": "Research Grant", "date_raw": "2022", "bullets": ["Awarded INR 2,00,000"]}],
        }
    ],
    "unclassified_content": [
        {"raw_text": "Available for relocation", "reason": "no matching field", "source_pages": [2]}
    ],
    "validation": {
        "all_pages_considered": True,
        "all_source_blocks_accounted_for": True,
        "possible_missing_content": [],
        "possible_duplicates": [],
        "uncertain_fields": ["work_experience[0].department"],
        "completeness_notes": ["Page 2 sidebar merged into main column by the parser."],
    },
}


def test_prompt_contains_spec_schema_and_data_markers():
    prompt = build_document_extraction_prompt("Jane Doe\njane@example.com", {"page_count": 2, "layout_type": "two_column"})

    assert "<<<RESUME_TEXT" in prompt
    assert "RESUME_TEXT>>>" in prompt
    assert "Jane Doe" in prompt
    assert "two_column" in prompt
    assert "Never invent information." in prompt
    assert "unclassified_content" in prompt
    assert "work_experience" in prompt


def test_coerce_fills_all_top_level_keys_and_preserves_unknowns():
    coerced, warnings = coerce_document_extraction({"personal_information": {"full_name": "Jane"}, "extra_field": 1})

    assert set(DOCUMENT_EXTRACTION_SCHEMA).issubset(coerced.keys())
    assert coerced["personal_information"]["full_name"] == "Jane"
    assert any(w["code"] == "UNKNOWN_FIELD" for w in warnings)
    assert "extra_field" in json.dumps(coerced["unclassified_content"])
    assert isinstance(coerced["skills"]["programming_languages"], list)


def test_normalize_maps_every_section_into_resume_shape():
    resume, warnings = normalize_document_extraction(SAMPLE_PAYLOAD)

    assert resume["personalInfo"]["fullName"] == "Jane Doe"
    assert resume["personalInfo"]["professionalTitle"] == "Backend Engineer"
    assert resume["personalInfo"]["location"] == "Kolkata, West Bengal, India"
    assert resume["personalInfo"]["gitlab"] == "https://gitlab.com/janedoe"

    assert "Second paragraph preserved verbatim." in resume["professionalSummary"]

    exp = resume["experience"][0]
    assert exp["company"] == "Acme Technologies Pvt. Ltd."
    assert exp["position"] == "Senior Software Engineer"
    assert exp["current"] is True
    assert exp["endDate"] == "Present"
    assert exp["startDate"] == "Jan 2023"
    assert exp["sourcePage"] == 1
    assert "Reduced API response time by 40% by adding Redis caching" in exp["responsibilities"]
    assert exp["achievements"] == ["Promoted from Software Engineer to Senior Software Engineer"]

    internship = resume["internships"][0]
    assert internship["organization"] == "Beta Labs"
    assert internship["startDate"] == "Jun 2020"
    assert internship["technologies"] == ["pandas"]

    project = resume["projects"][0]
    assert project["name"] == "Resume Builder"
    assert project["githubUrl"] == "https://github.com/janedoe/resume-builder"
    assert project["liveUrl"] == "https://resume.example.com"
    assert project["technologies"] == ["Next.js", "PostgreSQL"]
    assert project["highlights"] == ["Exports ATS-safe PDFs", "Supports 12 templates"]

    education = resume["education"][0]
    assert education["institution"] == "Jadavpur University"
    assert education["degree"] == "B.Tech"
    assert education["fieldOfStudy"] == "Computer Science and Engineering"
    assert education["endDate"] == "2021"
    assert education["cgpa"] == "8.7/10"
    assert "Databases" in education["description"]

    skill_categories = {category["category"]: category["items"] for category in resume["skills"]}
    assert skill_categories["Programming Languages"] == ["Python", "C++"]
    assert "FastAPI (Advanced)" in skill_categories["Frameworks"]

    assert [cert["name"] for cert in resume["certifications"]] == [
        "AWS Certified Cloud Practitioner",
        "Advanced SQL",
    ]

    achievement_titles = {item["title"] for item in resume["achievements"]}
    assert {"Best Capstone Project", "Hackathon Winner"} == achievement_titles

    assert resume["publications"][0]["url"] == "https://example.com/paper"
    assert resume["volunteerExperience"][0]["duration"] == "2021 - 2022"
    assert [lang["name"] for lang in resume["languages"]] == ["English", "Hindi"]

    custom_titles = {section["sectionTitle"] for section in resume["customSections"]}
    for expected in (
        "Grants",
        "Research",
        "Patents",
        "Leadership",
        "Extracurricular Activities",
        "Interests",
        "References",
        "Unclassified Content (Review)",
        "Other Details",
    ):
        assert expected in custom_titles

    unclassified = next(section for section in resume["customSections"] if section["sectionTitle"] == "Unclassified Content (Review)")
    assert "Available for relocation" in unclassified["items"][0]["description"]

    codes = {warning["code"] for warning in warnings}
    assert {"OCR_LOW_QUALITY", "UNCERTAIN_FIELD", "COMPLETENESS_NOTE"}.issubset(codes)


def test_no_source_bullets_are_dropped():
    resume, _ = normalize_document_extraction(SAMPLE_PAYLOAD)
    serialized = json.dumps(resume, ensure_ascii=False)
    for bullet in (
        "Reduced API response time by 40% by adding Redis caching",
        "Built the billing dashboard in React and TypeScript",
        "Exports ATS-safe PDFs",
        "Supports 12 templates",
    ):
        assert bullet in serialized


def test_split_document_chunks_keeps_every_line_instead_of_truncating():
    lines = [f"line {index} of the resume" for index in range(500)]
    text = "\n".join(lines)
    chunks = split_document_chunks(text, max_chars=500)

    assert len(chunks) > 1
    assert all(len(chunk) <= 500 for chunk in chunks)
    recovered = [line for chunk in chunks for line in chunk.splitlines()]
    assert recovered == lines


def test_merge_extraction_payloads_combines_chunks_without_duplicates():
    first = {
        "personal_information": {"full_name": "Jane Doe"},
        "work_experience": [{"company_name": "Acme", "job_title": "Engineer"}],
        "projects": [{"project_name": "One"}],
        "skills": {"programming_languages": ["Python"]},
        "document_info": {"pages_processed": [1], "warnings": []},
    }
    second = {
        "personal_information": {"email": "jane@example.com"},
        "work_experience": [
            {"company_name": "Acme", "job_title": "Engineer"},
            {"company_name": "Beta", "job_title": "Intern"},
        ],
        "projects": [{"project_name": "Two"}],
        "skills": {"programming_languages": ["python", "Go"]},
        "document_info": {"pages_processed": [2], "warnings": [{"code": "NOTE", "message": "x"}]},
    }

    merged = merge_extraction_payloads([first, second])

    assert merged["personal_information"]["full_name"] == "Jane Doe"
    assert merged["personal_information"]["email"] == "jane@example.com"
    assert [job["company_name"] for job in merged["work_experience"]] == ["Acme", "Beta"]
    assert [project["project_name"] for project in merged["projects"]] == ["One", "Two"]
    assert merged["skills"]["programming_languages"] == ["Python", "Go"]
    assert merged["document_info"]["pages_processed"] == [1, 2]
    assert len(merged["document_info"]["warnings"]) == 1


@pytest.mark.asyncio
async def test_run_document_extraction_chunks_and_normalizes_via_call_fn():
    seen_prompts = []

    async def fake_call(prompt, timeout_seconds=30.0):
        seen_prompts.append(prompt)
        return SAMPLE_PAYLOAD

    text = "\n".join(f"content line {index}" for index in range(4000))
    resume = await run_document_extraction(fake_call, text, {"page_count": 3}, max_chars=5000)

    assert resume is not None
    assert len(seen_prompts) > 1
    assert all("content line" in prompt for prompt in seen_prompts)
    assert resume["personalInfo"]["fullName"] == "Jane Doe"
    assert resume["experience"][0]["company"] == "Acme Technologies Pvt. Ltd."
    assert resume["_extractionWarnings"]


@pytest.mark.asyncio
async def test_cloud_providers_use_shared_document_extraction(monkeypatch):
    from app.providers.gemini import GeminiProvider
    from app.providers.groq import GroqProvider
    from app.providers.openrouter import OpenRouterProvider

    for provider_cls, method in (
        (GroqProvider, "_call_groq"),
        (GeminiProvider, "_call_gemini"),
        (OpenRouterProvider, "_call_openrouter"),
    ):
        provider = provider_cls(api_key="test-key")
        prompts = []

        async def fake_call(prompt, *args, _prompts=prompts, **kwargs):
            _prompts.append(prompt)
            return SAMPLE_PAYLOAD

        monkeypatch.setattr(provider, method, fake_call)
        result = await provider.parse_resume_document("Jane Doe\njane@example.com\nEXPERIENCE\nAcme | Engineer | 2020 - Present")

        assert result["personalInfo"]["fullName"] == "Jane Doe"
        assert len(prompts) == 1
        assert "<<<RESUME_TEXT" in prompts[0]
        assert "unclassified_content" in prompts[0]
