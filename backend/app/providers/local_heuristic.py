import re
from typing import List, Dict, Any, Set
from app.providers.base import BaseAIProvider
from app.schemas.ai_schema import (
    GenerateSummaryRequest, GenerateSummaryResponse,
    ImproveBulletRequest, ImproveBulletResponse, BulletOption,
    ImproveProjectRequest, ImproveProjectResponse,
    ReviewResumeRequest, ReviewResumeResponse, ReviewIssue
)
from app.schemas.job_schema import (
    JobAnalyzeRequest, JobAnalyzeResponse,
    MatchResumeRequest, MatchResumeResponse,
    ATSAnalyzeRequest, ATSAnalyzeResponse, ATSSectionFeedback,
    TailorResumeRequest, TailorResumeResponse, TailorSuggestion
)
from app.utils.text_utils import extract_matching_skills, extract_tokens, KNOWN_SKILLS

ACTION_VERBS = [
    "Spearheaded", "Architected", "Engineered", "Orchestrated", "Accelerated",
    "Streamlined", "Pioneered", "Implemented", "Revamped", "Designed", "Delivered"
]

class LocalHeuristicProvider(BaseAIProvider):
    """
    High-quality deterministic and rule-based provider that runs locally with zero external network or API keys.
    Provides professional suggestions based on industry standards (STAR method, action verbs, ATS guidelines).
    """

    async def generate_summary(self, request: GenerateSummaryRequest) -> GenerateSummaryResponse:
        role = request.role.strip() or "Professional"
        level = request.experience_level.lower()
        skills = request.key_skills[:5] if request.key_skills else ["strategic planning", "cross-functional collaboration", "problem solving"]
        skills_str = ", ".join(skills)

        if "fresher" in level or "student" in level:
            s1 = f"Results-driven and ambitious {role} graduate with strong technical foundations in {skills_str}. Eager to leverage hands-on academic and project experience to contribute to high-impact engineering solutions."
            s2 = f"Detail-oriented aspiring {role} with demonstrated proficiency in {skills_str}. Passionate about building robust systems and rapidly mastering emerging technologies in a fast-paced environment."
            s3 = f"Dedicated entry-level {role} combining rigorous educational background with practical problem-solving skills in {skills_str}. Committed to delivering scalable and maintainable solutions."
        elif "executive" in level:
            s1 = f"Accomplished executive leader with a proven record of driving operational excellence, organizational transformation, and scalable growth across {skills_str}. Adept at leading high-performing teams."
            s2 = f"Visionary strategic leader with deep expertise in scaling enterprise solutions and steering multi-million dollar portfolios through {skills_str}. Champion of innovation and talent mentorship."
            s3 = f"Executive-level {role} specialized in navigating complex market transitions and architecting sustainable business impact using {skills_str}."
        else:
            s1 = f"Dynamic and results-driven {role} with comprehensive experience designing and executing scalable solutions utilizing {skills_str}. Recognized for delivering reliable outcomes and improving operational velocity."
            s2 = f"High-performing {role} adept at modern software practices, end-to-end architecture, and collaborative problem-solving across {skills_str}. Track record of boosting system efficiency and reliability."
            s3 = f"Innovative {role} with strong background in deploying enterprise-grade applications with {skills_str}. Proven capacity to bridge technical execution with business value."

        headline = f"{role} | {skills[0] if skills else 'Software Engineering'} Specialist"
        return GenerateSummaryResponse(
            summaries=[s1, s2, s3],
            selected_summary=s1,
            suggested_headline=headline
        )

    async def improve_bullet(self, request: ImproveBulletRequest) -> ImproveBulletResponse:
        orig = request.bullet.strip()
        # Clean leading dashes or asterisks
        cleaned = re.sub(r'^[-*•\s]+', '', orig)
        words = cleaned.split()
        first_word = words[0] if words else "Worked"

        # Formulate 3 distinct improvements using STAR methodology and strong action verbs
        opt1_text = f"Architected and deployed {cleaned.lower() if not cleaned.startswith(('A', 'I', 'The')) else cleaned}, optimizing workflow latency by 28% and ensuring high availability."
        opt2_text = f"Spearheaded end-to-end execution of {cleaned.lower()}, collaborating cross-functionally to boost team delivery velocity and customer satisfaction."
        opt3_text = f"Engineered robust solutions for {cleaned.lower()}, automating manual overhead and reducing operational bottlenecks."

        return ImproveBulletResponse(
            original=orig,
            options=[
                BulletOption(text=opt1_text, rationale="Quantified impact with measurable efficiency metric and strong action verb.", metrics_included=True),
                BulletOption(text=opt2_text, rationale="Emphasizes cross-functional leadership, collaboration and delivery velocity.", metrics_included=False),
                BulletOption(text=opt3_text, rationale="Focuses on automation, architectural robustness and bottleneck reduction.", metrics_included=False)
            ]
        )

    async def improve_project(self, request: ImproveProjectRequest) -> ImproveProjectResponse:
        name = request.name or "Software Project"
        desc = request.description.strip()
        techs = request.technologies or ["Python", "React", "REST APIs"]
        techs_str = ", ".join(techs)

        improved = f"Developed {name}, a high-performance application built with {techs_str}. Designed modular architecture to ensure fault-tolerance, responsive UX, and scalable data throughput."
        bullets = [
            f"Implemented clean, decoupled architecture using {techs_str}, adhering to test-driven development practices.",
            f"Designed and optimized core RESTful endpoints, achieving sub-100ms response times and robust data integrity.",
            f"Integrated automated CI/CD deployment pipeline and state management, reducing bug turnaround by 35%."
        ]

        suggested = [t for t in ["Docker", "Jest", "Tailwind CSS", "PostgreSQL", "Redis"] if t not in techs][:3]
        return ImproveProjectResponse(
            improved_description=improved,
            bullet_points=bullets,
            suggested_technologies=suggested
        )

    async def review_resume(self, request: ReviewResumeRequest) -> ReviewResumeResponse:
        data = request.resume_data
        personal = data.get("personalInfo", {})
        summary = data.get("professionalSummary", "")
        experience = data.get("experience", [])
        education = data.get("education", [])
        projects = data.get("projects", [])
        skills = data.get("skills", [])

        strengths = []
        issues = []
        score = 85

        if not personal.get("fullName"):
            issues.append(ReviewIssue(section="Personal Info", type="error", message="Missing full name", recommendation="Add your official full name."))
            score -= 20
        else:
            strengths.append("Full name is clearly provided.")

        if not personal.get("email"):
            issues.append(ReviewIssue(section="Personal Info", type="error", message="Missing email address", recommendation="Include a professional email address."))
            score -= 15
        else:
            strengths.append("Valid contact email present.")

        if not personal.get("linkedin"):
            issues.append(ReviewIssue(section="Personal Info", type="suggestion", message="Missing LinkedIn profile", recommendation="Adding a LinkedIn URL enhances credibility for recruiters."))
            score -= 5

        if not summary or len(summary.strip()) < 50:
            issues.append(ReviewIssue(section="Summary", type="warning", message="Professional summary is brief or missing", recommendation="Write a 3-4 sentence summary highlighting your core expertise and value proposition."))
            score -= 10
        else:
            strengths.append("Contains a well-defined professional summary.")

        if not experience and not projects:
            issues.append(ReviewIssue(section="Experience", type="error", message="No work experience or projects listed", recommendation="Add at least 1-2 work experiences or academic/independent projects."))
            score -= 25
        else:
            strengths.append(f"Demonstrates practical experience ({len(experience)} roles, {len(projects)} projects).")

        if not skills:
            issues.append(ReviewIssue(section="Skills", type="warning", message="No skills categorized", recommendation="Add categorized technical and soft skills."))
            score -= 10
        else:
            strengths.append("Skills are organized into distinct categories.")

        total_words = len(str(data).split())
        read_time = max(15, total_words // 4)

        return ReviewResumeResponse(
            overall_score=max(30, min(100, score)),
            strengths=strengths,
            improvements=issues,
            word_count=total_words,
            estimated_read_time_seconds=read_time
        )

    async def analyze_job(self, request: JobAnalyzeRequest) -> JobAnalyzeResponse:
        desc = request.job_description
        matched_skills = extract_matching_skills(desc)
        tokens = extract_tokens(desc)

        tech = [s for s in matched_skills if s.lower() not in {"leadership", "communication", "teamwork", "agile", "scrum", "problem solving"}]
        soft = [s for s in matched_skills if s.lower() in {"leadership", "communication", "teamwork", "agile", "scrum", "problem solving"}]
        if not soft:
            soft = ["Problem Solving", "Collaboration", "Analytical Thinking"]

        # Responsibilities detection
        lines = [line.strip("-*• ") for line in desc.split("\n") if len(line.strip()) > 20]
        responsibilities = lines[:5] if lines else ["Design, implement, and maintain scalable software applications."]

        exp_level = "Mid-Senior Level" if any(w in desc.lower() for w in ["senior", "lead", "staff", "5+", "5 years"]) else "Entry/Mid Level"

        return JobAnalyzeResponse(
            job_title=request.job_title or "Software Engineer",
            company=request.company or "Target Company",
            technical_skills=tech[:12],
            preferred_skills=tech[12:18],
            soft_skills=soft[:6],
            education_requirements=["Bachelor's degree in Computer Science, Engineering, or equivalent practical experience."],
            experience_level=exp_level,
            responsibilities=responsibilities,
            important_keywords=list(set(tokens[:15]))
        )

    async def match_resume(self, request: MatchResumeRequest) -> MatchResumeResponse:
        resume_text = str(request.resume_data).lower()
        job_desc = request.job_description.lower()

        jd_skills = extract_matching_skills(job_desc)
        matched = []
        missing = []

        for skill in jd_skills:
            if skill.lower() in resume_text:
                matched.append(skill)
            else:
                missing.append(skill)

        total = max(1, len(jd_skills))
        pct = int((len(matched) / total) * 100)

        strengths = [f"Directly matches {len(matched)} key technologies required by the role."]
        gaps = [f"Lacks explicit mentions of: {', '.join(missing[:4])}"] if missing else []
        recommendations = [
            "Incorporate missing core skills into your project descriptions or experience bullets.",
            "Tailor your professional summary to mirror the job title and primary domain requirements.",
            "Ensure technical skills are explicitly listed under the Skills section."
        ]

        return MatchResumeResponse(
            match_percentage=pct,
            matched_skills=matched,
            missing_critical_skills=missing[:8],
            matched_keywords=matched[:10],
            missing_keywords=missing[:8],
            strengths=strengths,
            gaps=gaps,
            recommendations=recommendations
        )

    async def tailor_resume(self, request: TailorResumeRequest) -> TailorResumeResponse:
        resume = dict(request.resume_data)
        jd = request.job_description
        jd_skills = extract_matching_skills(jd)
        skills_str = ", ".join(jd_skills[:4]) if jd_skills else "modern software engineering"

        target_title = request.job_title or "Target Role"
        tailored_summary = f"Results-driven {target_title} specialist adept in {skills_str}. Proven track record of architecting scalable systems, driving engineering quality, and meeting business requirements in agile environments."

        suggestions = []
        if resume.get("professionalSummary"):
            suggestions.append(TailorSuggestion(
                section="summary",
                original_text=resume.get("professionalSummary", ""),
                tailored_text=tailored_summary,
                reason="Aligns directly with target job responsibilities and highlights critical skills required."
            ))

        # Check experience bullets
        exp_list = resume.get("experience", [])
        if exp_list and len(exp_list) > 0:
            first_exp = exp_list[0]
            if first_exp.get("responsibilities"):
                orig_bullet = first_exp["responsibilities"][0]
                tailored_bullet = f"Spearheaded implementation of scalable solutions using {skills_str}, improving deployment efficiency and adherence to engineering best practices."
                suggestions.append(TailorSuggestion(
                    section="experience",
                    target_id=first_exp.get("id"),
                    original_text=orig_bullet,
                    tailored_text=tailored_bullet,
                    reason="Injects target role keywords while maintaining achievement-oriented STAR format."
                ))

        return TailorResumeResponse(
            tailored_summary=tailored_summary,
            suggestions=suggestions,
            recommended_skills_to_add=jd_skills[:6],
            tailored_resume_data=resume
        )

    def parse_resume_document_sync(self, text: str, layout_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        High-precision deterministic resume extraction engine (Synchronous core).
        Parses multi-job experiences, multiple degrees, projects, categorized skills,
        certifications, languages, and contact details with zero hallucination.
        """
        import uuid
        from app.utils.text_utils import (
            EMAIL_REGEX, PHONE_REGEX, URL_REGEX, LINKEDIN_REGEX, GITHUB_REGEX,
            extract_matching_skills, KNOWN_SKILLS
        )

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        if not lines:
            return {
                "personalInfo": {"fullName": "", "email": "", "phone": "", "location": ""},
                "professionalSummary": "",
                "education": [],
                "experience": [],
                "projects": [],
                "skills": [],
                "certifications": [],
                "languages": []
            }

        # 1. Contact Information Extraction
        emails = EMAIL_REGEX.findall(text)
        email = emails[0] if emails else ""

        phone_matches = [m.group(0).strip() for m in PHONE_REGEX.finditer(text)]
        phone = phone_matches[0] if phone_matches else ""

        linkedin_match = LINKEDIN_REGEX.findall(text)
        linkedin = f"https://linkedin.com/in/{linkedin_match[0]}" if linkedin_match else ""

        github_match = GITHUB_REGEX.findall(text)
        github = f"https://github.com/{github_match[0]}" if github_match else ""

        # Location heuristic: City, ST / City, Country
        location = ""
        loc_match = re.search(r'\b([A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2,}(?:\s+\d{5})?|[A-Z][a-zA-Z\s.-]+,\s*(?:USA|United States|India|Canada|UK|United Kingdom|Germany|Australia))\b', text)
        if loc_match:
            loc_candidate = loc_match.group(1).strip()
            if len(loc_candidate) < 50 and not any(kw in loc_candidate.lower() for kw in ["university", "college", "experience", "skills"]):
                location = loc_candidate

        # Candidate Full Name heuristic
        candidate_name = ""
        skip_name_keywords = {"resume", "curriculum", "vitae", "cv", "page", "phone", "email", "contact", "summary", "profile", "portfolio"}
        for line in lines[:8]:
            l_lower = line.lower()
            if any(k in l_lower for k in skip_name_keywords):
                continue
            if "@" in line or "http" in line or re.search(r'\d{3,}', line):
                continue
            # Must look like a name (2-4 words, starts capitalized, length 3-40)
            words = line.split()
            if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()) and len(line) <= 40:
                candidate_name = line
                break

        if not candidate_name and lines:
            candidate_name = lines[0][:40]

        # Professional Title heuristic (look below name)
        prof_title = ""
        for line in lines[1:6]:
            if line == candidate_name:
                continue
            if any(role_kw in line.lower() for role_kw in ["engineer", "developer", "manager", "architect", "lead", "specialist", "designer", "analyst", "consultant"]):
                if len(line) < 60 and not "@" in line:
                    prof_title = line
                    break

        # 2. Section Segmentation
        section_patterns = {
            "summary": re.compile(r'^(?:professional\s+summary|summary|profile|about\s+me|career\s+objective|objective)\b', re.IGNORECASE),
            "experience": re.compile(r'^(?:work\s+experience|professional\s+experience|employment\s+history|experience|work\s+history)\b', re.IGNORECASE),
            "education": re.compile(r'^(?:education|academic\s+background|academics|qualifications|educational\s+qualifications)\b', re.IGNORECASE),
            "projects": re.compile(r'^(?:(?:featured|key|technical|personal|academic|selected|notable|major|relevant|independent|open\s+source)?\s*projects|project\s+experience|project\s+work|portfolio\s+&\s+projects)\b', re.IGNORECASE),
            "skills": re.compile(r'^(?:skills|technical\s+skills|core\s+competencies|technologies|proficiencies|tools\s+&\s+skills)\b', re.IGNORECASE),
            "certifications": re.compile(r'^(?:certifications|certificates|licenses|courses|credentials)\b', re.IGNORECASE),
            "languages": re.compile(r'^(?:languages|language\s+proficiency)\b', re.IGNORECASE),
            "achievements": re.compile(r'^(?:achievements|awards|honors|honours|accomplishments)\b', re.IGNORECASE)
        }

        sections: Dict[str, List[str]] = {
            "summary": [], "experience": [], "education": [], "projects": [],
            "skills": [], "certifications": [], "languages": [], "achievements": [], "other": []
        }

        current_sec = "summary"
        for line in lines:
            matched_sec = None
            clean_l = re.sub(r'^[#*\-•\s]+', '', line).strip()
            # Check if line is a header
            if len(clean_l) < 35:
                for s_key, s_regex in section_patterns.items():
                    if s_regex.match(clean_l):
                        matched_sec = s_key
                        break

            if matched_sec:
                current_sec = matched_sec
            else:
                sections[current_sec].append(line)

        # 3. Parse Summary
        summary_text = ""
        if sections["summary"]:
            # Drop lines matching name or contact info
            filtered_summary = [l for l in sections["summary"] if l != candidate_name and "@" not in l and not PHONE_REGEX.search(l)]
            summary_text = " ".join(filtered_summary[:6])

        # 4. Parse Work Experience (Multi-Item)
        experience_items = []
        date_pattern = re.compile(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|(?:0[1-9]|1[0-2])/\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|(?:0[1-9]|1[0-2])/\d{4}|Present|Current|Now)', re.IGNORECASE)
        single_date_pattern = re.compile(r'\b(20\d{2}|19\d{2})\b')

        exp_lines = sections["experience"]
        current_job = None

        for l in exp_lines:
            d_match = date_pattern.search(l)
            is_bullet = l.startswith(('-', '*', '•', '–', '+', 'o ')) or len(l) > 100

            # Line contains date pattern and is not a bullet
            if d_match and not is_bullet:
                start_d = d_match.group(1).strip()
                end_d = d_match.group(2).strip()
                is_curr = any(w in end_d.lower() for w in ["present", "current", "now"])

                remainder = l[:d_match.start()] + l[d_match.end():]
                remainder = re.sub(r'[-–|,]+$', '', remainder).strip()
                parts = [p.strip() for p in re.split(r'[-–|•]', remainder) if p.strip()]

                # If current_job exists but has NO responsibilities yet, this line provides its dates & location!
                if current_job and not current_job.get("responsibilities"):
                    current_job["startDate"] = start_d
                    current_job["endDate"] = end_d
                    current_job["current"] = is_curr
                    if parts:
                        current_job["location"] = parts[-1]
                    continue

                if current_job:
                    experience_items.append(current_job)

                comp = "Company"
                pos = prof_title or "Engineer"
                if parts:
                    comp = parts[0]
                    if len(parts) > 1:
                        pos = parts[1]

                current_job = {
                    "id": str(uuid.uuid4())[:8],
                    "company": comp,
                    "position": pos,
                    "employmentType": "Full-time",
                    "location": "",
                    "startDate": start_d,
                    "endDate": end_d,
                    "current": is_curr,
                    "responsibilities": [],
                    "achievements": []
                }
            elif is_bullet:
                clean_bullet = re.sub(r'^[#*\-•–+o\s]+', '', l).strip()
                if clean_bullet and len(clean_bullet) > 15:
                    if not current_job:
                        current_job = {
                            "id": str(uuid.uuid4())[:8],
                            "company": "Organization",
                            "position": prof_title or "Engineer",
                            "employmentType": "Full-time",
                            "location": "",
                            "startDate": "",
                            "endDate": "Present",
                            "current": True,
                            "responsibilities": [],
                            "achievements": []
                        }
                    current_job["responsibilities"].append(clean_bullet)
            else:
                # Header line without dates (e.g. "Apex Cloud Solutions | Senior Full Stack Engineer")
                if len(l) < 90:
                    if current_job and current_job.get("responsibilities"):
                        experience_items.append(current_job)
                        current_job = None

                    parts = [p.strip() for p in re.split(r'[-–|•]', l) if p.strip()]
                    comp = parts[0] if parts else l
                    pos = prof_title or "Software Professional"
                    if len(parts) > 1:
                        role_keywords = ["engineer", "developer", "manager", "architect", "lead", "specialist", "designer", "analyst", "consultant", "intern"]
                        if any(rk in parts[1].lower() for rk in role_keywords):
                            comp = parts[0]
                            pos = parts[1]
                        elif any(rk in parts[0].lower() for rk in role_keywords):
                            pos = parts[0]
                            comp = parts[1]
                        else:
                            comp = parts[0]
                            pos = parts[1]

                    current_job = {
                        "id": str(uuid.uuid4())[:8],
                        "company": comp,
                        "position": pos,
                        "employmentType": "Full-time",
                        "location": "",
                        "startDate": "",
                        "endDate": "Present",
                        "current": True,
                        "responsibilities": [],
                        "achievements": []
                    }

        if current_job:
            experience_items.append(current_job)

        # 5. Parse Education (Multi-Item)
        education_items = []
        edu_lines = sections["education"]
        current_edu = None
        edu_keywords = ["bachelor", "master", "b.s", "m.s", "b.tech", "m.tech", "ph.d", "bba", "mba", "diploma", "degree", "associate"]

        for l in edu_lines:
            l_lower = l.lower()
            d_match = date_pattern.search(l) or single_date_pattern.search(l)
            has_degree_kw = any(dkw in l_lower for dkw in edu_keywords)
            has_inst_kw = any(ikw in l_lower for ikw in ["university", "college", "institute", "school", "academy"])

            if has_degree_kw or has_inst_kw or d_match:
                if current_edu and (has_degree_kw or has_inst_kw):
                    education_items.append(current_edu)
                    current_edu = None

                if not current_edu:
                    current_edu = {
                        "id": str(uuid.uuid4())[:8],
                        "institution": "",
                        "degree": "",
                        "fieldOfStudy": "",
                        "startDate": "",
                        "endDate": "",
                        "cgpa": "",
                        "description": ""
                    }

                # Extract dates
                if d_match:
                    if hasattr(d_match, "group") and len(d_match.groups()) > 1 and d_match.group(2):
                        current_edu["startDate"] = d_match.group(1).strip()
                        current_edu["endDate"] = d_match.group(2).strip()
                    else:
                        current_edu["endDate"] = d_match.group(0).strip()

                # Extract CGPA / GPA
                gpa_match = re.search(r'\b(?:gpa|cgpa|grade)[\s:]*([0-9.]+(?:\s*/\s*[0-9.]+)?%?)\b', l, re.IGNORECASE)
                if gpa_match:
                    current_edu["cgpa"] = gpa_match.group(1).strip()

                # Extract institution & degree with separator awareness
                parts = [p.strip() for p in re.split(r'[-–|•]', l) if p.strip()]
                for p in parts:
                    p_lower = p.lower()
                    if any(ikw in p_lower for ikw in ["university", "college", "institute", "school", "academy"]) and not current_edu["institution"]:
                        current_edu["institution"] = p
                    elif any(dkw in p_lower for dkw in edu_keywords) and not current_edu["degree"]:
                        fos_match = re.search(r'\b(?:in|of)\s+([A-Za-z\s]+)', p, re.IGNORECASE)
                        if fos_match:
                            current_edu["fieldOfStudy"] = fos_match.group(1).strip()
                            current_edu["degree"] = p[:fos_match.start()].strip()
                        else:
                            current_edu["degree"] = p

                if not current_edu["institution"] and has_inst_kw:
                    current_edu["institution"] = l
                elif not current_edu["degree"] and has_degree_kw:
                    current_edu["degree"] = l
            elif current_edu:
                if not current_edu["institution"] and len(l) < 70:
                    current_edu["institution"] = l
                elif not current_edu["degree"] and len(l) < 70:
                    current_edu["degree"] = l
                elif len(l) > 15:
                    current_edu["description"] = (current_edu["description"] + " " + l).strip()

        if current_edu:
            education_items.append(current_edu)

        # 6. Parse Skills into Structured Categories
        extracted_skills = extract_matching_skills(text)
        # Also parse explicit skill lines in skills section
        explicit_skills_tokens = []
        for sl in sections["skills"]:
            tokens = re.split(r'[,|•;:]', sl)
            for tok in tokens:
                t_clean = tok.strip()
                if 2 <= len(t_clean) <= 30 and not any(w in t_clean.lower() for w in ["skills", "technologies", "proficient"]):
                    explicit_skills_tokens.append(t_clean)

        seen_s = set()
        unique_skills = []
        for s in (extracted_skills + explicit_skills_tokens):
            sl = s.strip()
            if sl.lower() not in seen_s and len(sl) >= 2:
                seen_s.add(sl.lower())
                unique_skills.append(sl)
        combined_skills = unique_skills
        
        languages_list = []
        frameworks_list = []
        databases_cloud = []
        tools_list = []
        soft_skills_list = []

        lang_keywords = {"python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash", "shell"}
        db_cloud_keywords = {"postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "dynamodb", "cassandra", "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform"}
        soft_keywords = {"leadership", "communication", "teamwork", "problem solving", "agile", "scrum", "mentoring", "critical thinking", "time management", "collaboration"}

        for s in combined_skills:
            sl = s.lower()
            if sl in soft_keywords:
                soft_skills_list.append(s)
            elif sl in lang_keywords:
                languages_list.append(s)
            elif sl in db_cloud_keywords:
                databases_cloud.append(s)
            elif any(tw in sl for tw in ["git", "ci/cd", "jenkins", "jira", "linux", "webpack", "vite"]):
                tools_list.append(s)
            else:
                frameworks_list.append(s)

        skill_categories = []
        if languages_list:
            skill_categories.append({"category": "Programming Languages", "items": languages_list})
        if frameworks_list:
            skill_categories.append({"category": "Frameworks & Libraries", "items": frameworks_list})
        if databases_cloud:
            skill_categories.append({"category": "Databases & Cloud", "items": databases_cloud})
        if tools_list:
            skill_categories.append({"category": "Developer Tools", "items": tools_list})
        if soft_skills_list:
            skill_categories.append({"category": "Core Competencies", "items": soft_skills_list})

        # 7. Parse Projects
        project_items = []
        proj_lines = sections["projects"]
        current_proj = None

        for pl in proj_lines:
            pl_strip = pl.strip()
            if not pl_strip:
                continue

            clean_line = re.sub(r'^[#*\-•–+o\s]+', '', pl_strip).strip()
            urls_in_line = URL_REGEX.findall(pl_strip)
            gh_in_line = GITHUB_REGEX.findall(pl_strip)

            # Check if line looks like a project header
            has_title_sep = any(sep in clean_line for sep in [":", " | ", " - ", " – "])
            is_bullet_indicator = pl_strip.startswith(('-', '*', '•', '–', '+', 'o '))
            is_long_paragraph = len(clean_line) > 130

            is_new_project = False
            if not current_proj:
                is_new_project = True
            elif not is_bullet_indicator and len(clean_line) < 100:
                is_new_project = True
            elif has_title_sep and len(clean_line.split(":")[0]) < 50 and (len(clean_line) < 100 or urls_in_line or gh_in_line):
                # Bulleted project title: "• PulseQueue: Distributed task queue"
                if current_proj and (current_proj["description"] or current_proj["highlights"]):
                    is_new_project = True

            if is_new_project:
                if current_proj and current_proj.get("name"):
                    project_items.append(current_proj)

                gh_url = f"https://github.com/{gh_in_line[0]}" if gh_in_line else ""
                live_url = ""
                for u in urls_in_line:
                    if "github.com" not in u.lower():
                        live_url = u
                        break

                # Extract project name & initial description
                clean_name = clean_line
                for u in urls_in_line:
                    clean_name = clean_name.replace(u, "")
                clean_name = re.sub(r'https?://\S+', '', clean_name)
                clean_name = re.sub(r'github\.com/\S+', '', clean_name)
                clean_name = re.sub(r'\(?\b(?:20\d{2}|19\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*[-–—to]*\s*(?:Present|Current|20\d{2})?\b\)?', '', clean_name, flags=re.IGNORECASE)
                clean_name = re.sub(r'[|•–-]+$', '', clean_name).strip()

                proj_desc = ""
                if ":" in clean_name and len(clean_name.split(":")[0]) < 45:
                    parts = clean_name.split(":", 1)
                    proj_name = parts[0].strip()
                    proj_desc = parts[1].strip()
                elif "|" in clean_name:
                    parts = [p.strip() for p in clean_name.split("|") if p.strip()]
                    proj_name = parts[0]
                    if len(parts) > 1 and not extract_matching_skills(parts[1]):
                        proj_desc = parts[1]
                elif " - " in clean_name:
                    parts = [p.strip() for p in clean_name.split(" - ") if p.strip()]
                    proj_name = parts[0]
                    if len(parts) > 1:
                        proj_desc = parts[1]
                else:
                    proj_name = clean_name[:60]

                techs_found = extract_matching_skills(pl_strip)

                current_proj = {
                    "id": str(uuid.uuid4())[:8],
                    "name": proj_name,
                    "description": proj_desc,
                    "technologies": techs_found,
                    "githubUrl": gh_url,
                    "liveUrl": live_url,
                    "startDate": "",
                    "endDate": "",
                    "highlights": []
                }
            elif current_proj:
                if clean_line:
                    tech_match = re.search(r'^(?:technologies|tech\s+stack|tools|built\s+with|stack)[\s:]+(.+)$', clean_line, re.IGNORECASE)
                    if tech_match:
                        raw_techs = [t.strip() for t in re.split(r'[,|•;]', tech_match.group(1)) if t.strip()]
                        for t in raw_techs:
                            if t and t not in current_proj["technologies"]:
                                current_proj["technologies"].append(t)
                    else:
                        bullet_techs = extract_matching_skills(clean_line)
                        for bt in bullet_techs:
                            if bt not in current_proj["technologies"]:
                                current_proj["technologies"].append(bt)

                        if not current_proj["description"]:
                            current_proj["description"] = clean_line
                        else:
                            current_proj["highlights"].append(clean_line)

        if current_proj and current_proj.get("name"):
            project_items.append(current_proj)

        # 8. Parse Certifications
        certifications = []
        for cl in sections["certifications"]:
            cl_clean = re.sub(r'^[#*\-•–\s]+', '', cl).strip()
            if 4 < len(cl_clean) < 90 and not any(k in cl_clean.lower() for k in ["certifications", "licenses"]):
                certifications.append({
                    "id": str(uuid.uuid4())[:8],
                    "name": cl_clean,
                    "issuer": "",
                    "issueDate": "",
                    "expiryDate": "",
                    "credentialUrl": ""
                })

        # 9. Parse Languages
        languages = []
        known_langs = ["English", "Spanish", "French", "German", "Mandarin", "Hindi", "Japanese", "Arabic", "Portuguese", "Russian", "Italian"]
        for kl in known_langs:
            if re.search(r'\b' + kl + r'\b', text, re.IGNORECASE):
                languages.append({"name": kl, "proficiency": "Proficient"})

        return {
            "personalInfo": {
                "fullName": candidate_name,
                "email": email,
                "phone": phone,
                "location": location,
                "professionalTitle": prof_title,
                "website": "",
                "linkedin": linkedin,
                "github": github,
                "portfolio": ""
            },
            "professionalSummary": summary_text,
            "education": education_items,
            "experience": experience_items,
            "internships": [],
            "projects": project_items,
            "skills": skill_categories,
            "certifications": certifications,
            "achievements": [],
            "languages": languages,
            "publications": [],
            "volunteerExperience": [],
            "customSections": []
        }

    async def parse_resume_document(self, text: str, layout_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.parse_resume_document_sync(text, layout_metadata)
