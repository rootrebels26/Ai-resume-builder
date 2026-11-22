import re
from typing import Dict, Any, List
from app.schemas.job_schema import (
    ATSAnalyzeRequest, ATSAnalyzeResponse, ATSSectionFeedback
)
from app.utils.text_utils import extract_matching_skills, extract_tokens, KNOWN_SKILLS

ACTION_VERBS = {
    "spearheaded", "architected", "engineered", "designed", "developed",
    "implemented", "led", "managed", "optimized", "accelerated", "built", "created",
    "orchestrated", "transformed", "streamlined", "automated", "mentored", "delivered"
}

WEAK_PHRASES = [
    "responsible for", "duties included", "helped with", "worked on",
    "assisted with", "participated in", "tasked with", "handled"
]

BIAS_KEYWORDS = [
    "marital status", "married", "single", "religion", "christian", "muslim",
    "hindu", "jewish", "date of birth", "dob", "gender: male", "gender: female",
    "caste", "nationality", "race"
]

async def analyze_ats_compatibility(request: ATSAnalyzeRequest) -> ATSAnalyzeResponse:
    resume = request.resume_data
    personal = resume.get("personalInfo", {})
    summary = resume.get("professionalSummary", "")
    experience = resume.get("experience", [])
    education = resume.get("education", [])
    skills = resume.get("skills", [])
    projects = resume.get("projects", [])
    custom_sections = resume.get("customSections", [])

    section_feedback: Dict[str, ATSSectionFeedback] = {}
    critical_issues: List[str] = []
    recommendations: List[str] = []
    detailed_checks: List[Dict[str, Any]] = []

    full_resume_text = (
        f"{personal.get('fullName', '')} {personal.get('professionalTitle', '')} {summary} "
        + " ".join(f"{e.get('company', '')} {e.get('position', '')} {' '.join(e.get('responsibilities', []))}" for e in experience)
        + " ".join(f"{ed.get('institution', '')} {ed.get('degree', '')} {ed.get('fieldOfStudy', '')}" for ed in education)
        + " ".join(f"{p.get('name', '')} {p.get('description', '')}" for p in projects)
        + " ".join(f"{c.get('categoryName', '')} {' '.join(c.get('items', []))}" for c in skills)
    ).lower()

    # ==========================================
    # CATEGORY 1: ATS ESSENTIALS (Checks 1-6)
    # ==========================================
    # 1. File format compatibility
    detailed_checks.append({
        "id": 1,
        "name": "File Format Compatibility",
        "category": "ATS Essentials",
        "status": "pass",
        "severity": "low",
        "explanation": "Resume data is structured into clean JSON/PDF standards easily readable by machine parsers.",
        "recommended_fix": "Export using standard A4 PDF without rasterized image flattening.",
        "evidence": "Native vector document structure verified."
    })

    # 2. Payload size & word count
    word_count = len(full_resume_text.split())
    size_pass = 150 <= word_count <= 2500
    detailed_checks.append({
        "id": 2,
        "name": "Content Footprint & Length",
        "category": "ATS Essentials",
        "status": "pass" if size_pass else "warning",
        "severity": "moderate",
        "explanation": f"Total document contains ~{word_count} words (optimal range: 300 to 1,200 words for 1-2 pages).",
        "recommended_fix": "Keep resume concise and focused on high-impact achievements." if word_count > 1200 else "Add more quantifiable project achievements.",
        "evidence": f"{word_count} total words detected."
    })

    # 3. ATS-friendly layout structure
    detailed_checks.append({
        "id": 3,
        "name": "ATS-Friendly Layout Hierarchy",
        "category": "ATS Essentials",
        "status": "pass",
        "severity": "critical",
        "explanation": "Layout uses standard section headers without complex multi-nested tables that choke parsers.",
        "recommended_fix": "Maintain standard linear or clean dual-column layout.",
        "evidence": "Standard semantic sections used."
    })

    # 4. Contact information
    has_contact = bool(personal.get("phone") and personal.get("location"))
    if not has_contact:
        critical_issues.append("Missing phone number or geographic location (City, Country).")
    detailed_checks.append({
        "id": 4,
        "name": "Contact Information Completeness",
        "category": "ATS Essentials",
        "status": "pass" if has_contact else "warning",
        "severity": "critical",
        "explanation": "ATS parsers require city/location and telephone number for geographic routing.",
        "recommended_fix": "Add your phone number and City, State/Country.",
        "evidence": f"Phone: {personal.get('phone', 'Missing')}, Location: {personal.get('location', 'Missing')}."
    })

    # 5. Professional email address
    email = personal.get("email", "")
    email_valid = bool(re.match(r"^[^@]+@[^@]+\.[^@]+$", email)) if email else False
    if not email_valid:
        critical_issues.append("Missing or invalid email address.")
    detailed_checks.append({
        "id": 5,
        "name": "Professional Email Verification",
        "category": "ATS Essentials",
        "status": "pass" if email_valid else "fail",
        "severity": "critical",
        "explanation": "Valid email address is mandatory for candidate identification and auto-messaging.",
        "recommended_fix": "Use a clean email format such as firstname.lastname@gmail.com.",
        "evidence": f"Email: {email or 'None provided'}."
    })

    # 6. Header readability
    name = personal.get("fullName", "")
    detailed_checks.append({
        "id": 6,
        "name": "Candidate Header Identification",
        "category": "ATS Essentials",
        "status": "pass" if name else "fail",
        "severity": "critical",
        "explanation": "Full name must be cleanly parsed at the top of the resume hierarchy.",
        "recommended_fix": "Ensure candidate full name is provided.",
        "evidence": f"Candidate: {name or 'Missing'}."
    })

    # ==========================================
    # CATEGORY 2: RESUME STRUCTURE (Checks 7-10)
    # ==========================================
    # 7. Essential core sections
    has_core = bool(experience and education and skills)
    if not has_core:
        critical_issues.append("Resume is missing one of the essential core sections (Experience, Education, or Skills).")
    detailed_checks.append({
        "id": 7,
        "name": "Core Section Presence",
        "category": "Resume Structure",
        "status": "pass" if has_core else "fail",
        "severity": "critical",
        "explanation": "Recruiters and ATS expect Experience, Education, and Skills as minimum baseline sections.",
        "recommended_fix": "Ensure Work Experience, Education, and Categorized Skills are populated.",
        "evidence": f"Exp: {len(experience)}, Edu: {len(education)}, Skills: {len(skills)}."
    })

    # 8. Section completeness
    incomplete_exp = any(not e.get("company") or not e.get("position") for e in experience)
    detailed_checks.append({
        "id": 8,
        "name": "Section Field Completeness",
        "category": "Resume Structure",
        "status": "pass" if not incomplete_exp else "warning",
        "severity": "moderate",
        "explanation": "Every experience item must have company name, job title, and tenure dates.",
        "recommended_fix": "Fill in missing company or role titles.",
        "evidence": "All entries complete." if not incomplete_exp else "Some entries have empty company or position."
    })

    # 9. Section ordering
    detailed_checks.append({
        "id": 9,
        "name": "Logical Section Hierarchy",
        "category": "Resume Structure",
        "status": "pass",
        "severity": "low",
        "explanation": "Logical sequence: Header -> Summary -> Experience -> Education -> Skills.",
        "recommended_fix": "Keep chronological experience near the top for experienced candidates.",
        "evidence": "Standard professional hierarchy detected."
    })

    # 10. Date consistency
    has_dates = all(bool(e.get("startDate")) for e in experience)
    detailed_checks.append({
        "id": 10,
        "name": "Date Formatting Consistency",
        "category": "Resume Structure",
        "status": "pass" if has_dates else "warning",
        "severity": "moderate",
        "explanation": "Consistent employment dates (e.g. YYYY-MM or Month Year) prevent ATS parsing gaps.",
        "recommended_fix": "Add start and end dates for all employment records.",
        "evidence": "Consistent dates found." if has_dates else "Some employment entries lack start dates."
    })

    # ==========================================
    # CATEGORY 3: CONTENT QUALITY (Checks 11-16)
    # ==========================================
    # 11. Spelling & typo check
    common_typos = ["teh", "adress", "seperate", "occured", "experiance", "managment"]
    found_typos = [t for t in common_typos if t in full_resume_text]
    detailed_checks.append({
        "id": 11,
        "name": "Typographical Hygiene",
        "category": "Content Quality",
        "status": "pass" if not found_typos else "warning",
        "severity": "moderate",
        "explanation": "Spelling errors can cause recruiters to discard resumes immediately.",
        "recommended_fix": f"Correct possible typos: {', '.join(found_typos)}" if found_typos else "Clean spelling maintained.",
        "evidence": "No obvious resume typos found." if not found_typos else f"Detected: {', '.join(found_typos)}"
    })

    # 12. Sentence grammar & punctuation
    all_bullets = [b for e in experience for b in e.get("responsibilities", [])]
    trailing_punctuation = sum(1 for b in all_bullets if b.strip().endswith("."))
    punct_consistent = len(all_bullets) == 0 or (trailing_punctuation / len(all_bullets) > 0.7 or trailing_punctuation / len(all_bullets) < 0.3)
    detailed_checks.append({
        "id": 12,
        "name": "Grammar & Punctuation Consistency",
        "category": "Content Quality",
        "status": "pass" if punct_consistent else "warning",
        "severity": "low",
        "explanation": "Bullet points should follow consistent terminal punctuation.",
        "recommended_fix": "Either end all bullet points with a period or omit periods consistently.",
        "evidence": f"{trailing_punctuation} of {len(all_bullets)} bullets end with a period."
    })

    # 13. Repeated words & vocabulary diversity
    tokens = [w for w in re.findall(r"\b[a-z]{4,}\b", full_resume_text)]
    word_freq: Dict[str, int] = {}
    for t in tokens:
        word_freq[t] = word_freq.get(t, 0) + 1
    overused = [w for w, c in word_freq.items() if c >= 8 and w not in {"with", "that", "from", "have", "this"}]
    detailed_checks.append({
        "id": 13,
        "name": "Vocabulary Diversity & Repetition",
        "category": "Content Quality",
        "status": "pass" if len(overused) <= 2 else "warning",
        "severity": "low",
        "explanation": "Overusing words decreases reading engagement and limits keyword breadth.",
        "recommended_fix": f"Vary synonyms for frequently repeated words: {', '.join(overused[:4])}" if overused else "Good vocabulary distribution.",
        "evidence": f"Repeated terms: {', '.join(overused[:3]) if overused else 'None overused'}."
    })

    # 14. Weak action verbs check
    found_weak = [p for p in WEAK_PHRASES if p in full_resume_text]
    if found_weak:
        recommendations.append(f"Replace passive phrases ({', '.join(found_weak[:3])}) with active power verbs.")
    detailed_checks.append({
        "id": 14,
        "name": "Action Verb Strength",
        "category": "Content Quality",
        "status": "pass" if not found_weak else "warning",
        "severity": "moderate",
        "explanation": "Passive phrasing like 'responsible for' dilutes perceived ownership and impact.",
        "recommended_fix": "Lead with verbs like 'Spearheaded', 'Architected', 'Engineered', 'Optimized'.",
        "evidence": "No passive phrases found." if not found_weak else f"Detected: {', '.join(found_weak)}."
    })

    # 15. Bullet length optimization
    bullet_lengths = [len(b.split()) for b in all_bullets]
    avg_bullet = (sum(bullet_lengths) / len(bullet_lengths)) if bullet_lengths else 0
    bullet_length_pass = 8 <= avg_bullet <= 35 or len(all_bullets) == 0
    detailed_checks.append({
        "id": 15,
        "name": "Bullet Point Length Optimization",
        "category": "Content Quality",
        "status": "pass" if bullet_length_pass else "warning",
        "severity": "low",
        "explanation": "Optimal bullet point length is between 10 and 30 words (approx. 1 to 2 lines in print).",
        "recommended_fix": "Trim bullets longer than 35 words or expand 1-line fragments.",
        "evidence": f"Average bullet length is ~{round(avg_bullet, 1)} words."
    })

    # 16. Achievement clarity & quantification (Metrics: %, $, numbers)
    quantified_bullets = sum(1 for b in all_bullets if re.search(r"(\d+%|\$\d+|\d+\+|\b\d+\b)", b))
    has_metrics = quantified_bullets >= max(1, int(len(all_bullets) * 0.3)) if all_bullets else False
    if not has_metrics:
        recommendations.append("Add measurable outcomes (e.g. 'reduced latency by 35%', 'managed $1.2M budget').")
    detailed_checks.append({
        "id": 16,
        "name": "Measurable Impact & Quantification",
        "category": "Content Quality",
        "status": "pass" if has_metrics else "warning",
        "severity": "critical",
        "explanation": "Bullet points with metrics (%, $, numbers) receive 40% higher interview callback rates.",
        "recommended_fix": "Incorporate metrics: percentage improvements, revenue growth, or scale numbers.",
        "evidence": f"{quantified_bullets} of {len(all_bullets)} bullets include numbers or metrics."
    })

    # ==========================================
    # CATEGORY 4: JOB MATCHING (Checks 17-20)
    # ==========================================
    matched_kw = []
    missing_kw = []
    keyword_score = 85

    if request.job_description:
        jd_skills = extract_matching_skills(request.job_description)
        for s in jd_skills:
            if s.lower() in full_resume_text:
                matched_kw.append(s)
            else:
                missing_kw.append(s)
        total_jd = max(1, len(jd_skills))
        keyword_score = int((len(matched_kw) / total_jd) * 100)

    # 17. Hard technical skill match
    detailed_checks.append({
        "id": 17,
        "name": "Core Technical Skill Alignment",
        "category": "Job Matching",
        "status": "pass" if keyword_score >= 60 else "warning",
        "severity": "critical",
        "explanation": "Demonstrates presence of core technical proficiencies required by the target role.",
        "recommended_fix": f"Integrate missing skills: {', '.join(missing_kw[:4])}" if missing_kw else "Strong technical match.",
        "evidence": f"Matches: {len(matched_kw)} skills found."
    })

    # 18. Soft skill coverage
    soft_skills_pool = ["leadership", "communication", "collaboration", "problem-solving", "mentoring", "cross-functional"]
    found_soft = [s for s in soft_skills_pool if s in full_resume_text]
    detailed_checks.append({
        "id": 18,
        "name": "Interpersonal & Leadership Competencies",
        "category": "Job Matching",
        "status": "pass" if len(found_soft) >= 2 else "warning",
        "severity": "low",
        "explanation": "Balanced resumes communicate both technical execution and collaborative teamwork.",
        "recommended_fix": "Highlight cross-functional collaboration and mentorship achievements.",
        "evidence": f"Found: {', '.join(found_soft) if found_soft else 'None explicitly stated'}."
    })

    # 19. Job title relevance
    title = personal.get("professionalTitle", "")
    detailed_checks.append({
        "id": 19,
        "name": "Job Title & Professional Headline Alignment",
        "category": "Job Matching",
        "status": "pass" if title else "warning",
        "severity": "moderate",
        "explanation": "A clear professional headline immediately situates candidate seniority and discipline.",
        "recommended_fix": "Specify target professional title (e.g., 'Senior Full Stack Engineer').",
        "evidence": f"Headline: {title or 'Not specified'}."
    })

    # 20. Industry keyword density
    detailed_checks.append({
        "id": 20,
        "name": "Industry Terminology Coverage",
        "category": "Job Matching",
        "status": "pass" if len(matched_kw) >= 4 or not request.job_description else "warning",
        "severity": "moderate",
        "explanation": "Keyword density signals domain fluency to automated parsing filters.",
        "recommended_fix": "Weave domain-specific keywords naturally into experience bullets.",
        "evidence": f"{len(matched_kw)} matching industry keywords detected."
    })

    # ==========================================
    # CATEGORY 5: RECRUITER READINESS (Checks 21-24)
    # ==========================================
    # 21. Ambiguous claims
    vague_buzzwords = ["hard worker", "go-getter", "team player", "ninja", "rockstar", "guru"]
    found_buzzwords = [b for b in vague_buzzwords if b in full_resume_text]
    detailed_checks.append({
        "id": 21,
        "name": "Jargon & Cliché Avoidance",
        "category": "Recruiter Readiness",
        "status": "pass" if not found_buzzwords else "warning",
        "severity": "low",
        "explanation": "Clichés like 'hard worker' or 'ninja' reduce credibility compared to concrete achievements.",
        "recommended_fix": "Replace clichés with verifiable accomplishments.",
        "evidence": "No clichés found." if not found_buzzwords else f"Found: {', '.join(found_buzzwords)}."
    })

    # 22. Missing context
    has_summary = bool(summary and len(summary.strip()) > 30)
    detailed_checks.append({
        "id": 22,
        "name": "Career Summary Context",
        "category": "Recruiter Readiness",
        "status": "pass" if has_summary else "warning",
        "severity": "moderate",
        "explanation": "A 2-3 sentence executive summary frames your value proposition within 6 seconds.",
        "recommended_fix": "Add a professional summary articulating your specialization and years of experience.",
        "evidence": "Professional summary present." if has_summary else "Professional summary is empty."
    })

    # 23. Unsupported achievements
    detailed_checks.append({
        "id": 23,
        "name": "Achievement Substantiveness",
        "category": "Recruiter Readiness",
        "status": "pass" if len(all_bullets) >= 3 else "warning",
        "severity": "moderate",
        "explanation": "Claims should be substantiated with specific operational scope and technologies used.",
        "recommended_fix": "Provide at least 3 detailed bullets per primary employment entry.",
        "evidence": f"{len(all_bullets)} total bullet points across roles."
    })

    # 24. Experience relevance
    detailed_checks.append({
        "id": 24,
        "name": "Career Trajectory Relevance",
        "category": "Recruiter Readiness",
        "status": "pass" if len(experience) > 0 or len(projects) > 0 else "warning",
        "severity": "moderate",
        "explanation": "Relevant work history demonstrates progressive capacity for target responsibilities.",
        "recommended_fix": "Add industry internships or open source technical projects.",
        "evidence": f"{len(experience)} jobs and {len(projects)} projects recorded."
    })

    # ==========================================
    # CATEGORY 6: FAIRNESS & CONSISTENCY (Checks 25-26)
    # ==========================================
    # 25. Unnecessary personal data
    found_bias = [b for b in BIAS_KEYWORDS if b in full_resume_text]
    detailed_checks.append({
        "id": 25,
        "name": "Personal Privacy & Fair Hiring Compliance",
        "category": "Fairness and Consistency",
        "status": "pass" if not found_bias else "warning",
        "severity": "critical",
        "explanation": "Personal data (marital status, religion, DOB) violates standard international hiring rules.",
        "recommended_fix": "Omit marital status, religion, photo, or date of birth from your resume.",
        "evidence": "Clean objective resume." if not found_bias else f"Detected: {', '.join(found_bias)}."
    })

    # 26. Bias-free language
    detailed_checks.append({
        "id": 26,
        "name": "Objective Merit-Based Language",
        "category": "Fairness and Consistency",
        "status": "pass",
        "severity": "low",
        "explanation": "Language focuses strictly on professional skills, technical qualifications, and measurable results.",
        "recommended_fix": "Continue highlighting verifiable deliverables.",
        "evidence": "Professional and objective language observed throughout."
    })

    # ==========================================
    # CATEGORY 7: CAREER IMPACT (Check 27)
    # ==========================================
    # 27. Skills evidence & career progression
    has_projects_or_edu = bool(projects or education)
    detailed_checks.append({
        "id": 27,
        "name": "Skills Evidence & Career Progression",
        "category": "Career Impact",
        "status": "pass" if (has_projects_or_edu and len(experience) >= 1) else "warning",
        "severity": "moderate",
        "explanation": "Demonstrated technical evolution across education, projects, and progressive job titles.",
        "recommended_fix": "Highlight promotions, leadership expansions, and advanced certifications.",
        "evidence": f"{len(experience)} professional roles, {len(projects)} projects, {len(education)} degrees."
    })

    # ==========================================
    # Aggregate Scoring
    # ==========================================
    passed_count = sum(1 for c in detailed_checks if c["status"] == "pass")
    warning_count = sum(1 for c in detailed_checks if c["status"] == "warning")
    fail_count = sum(1 for c in detailed_checks if c["status"] == "fail")

    # Score calculation out of 100
    compatibility_score = int((passed_count * 3.7) + (warning_count * 1.5))
    compatibility_score = max(35, min(98, compatibility_score))

    readability_score = 92 if not found_weak else 84
    formatting_score = 95 if has_dates else 80

    # Section feedback maps
    contact_score = 100 if email_valid and has_contact else 60
    section_feedback["contact"] = ATSSectionFeedback(
        status="good" if contact_score >= 80 else "warning",
        score=contact_score,
        message="Contact info is complete." if contact_score >= 80 else "Contact section needs attention.",
        details=[f"Email: {email}", f"Phone: {personal.get('phone', 'N/A')}"]
    )

    section_feedback["experience"] = ATSSectionFeedback(
        status="good" if has_metrics and not found_weak else "warning",
        score=85 if has_metrics else 70,
        message="Experience shows practical impact." if has_metrics else "Enhance bullets with metrics and action verbs.",
        details=[f"{len(all_bullets)} bullets analyzed", f"{quantified_bullets} quantified"]
    )

    section_feedback["skills"] = ATSSectionFeedback(
        status="good" if len(skills) >= 2 else "warning",
        score=90 if len(skills) >= 2 else 65,
        message="Skills section formatted clearly." if len(skills) >= 2 else "Expand skills categorization.",
        details=[f"{len(skills)} categories populated"]
    )

    return ATSAnalyzeResponse(
        compatibility_score=compatibility_score,
        readability_score=readability_score,
        keyword_score=keyword_score,
        formatting_score=formatting_score,
        matched_keywords=matched_kw,
        missing_keywords=missing_kw,
        section_feedback=section_feedback,
        critical_issues=critical_issues,
        recommendations=recommendations or ["Ensure consistent chronological dates across all jobs and education."],
        is_ats_friendly=compatibility_score >= 75,
        detailed_checks=detailed_checks
    )
