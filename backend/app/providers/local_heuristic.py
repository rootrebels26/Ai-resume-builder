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
