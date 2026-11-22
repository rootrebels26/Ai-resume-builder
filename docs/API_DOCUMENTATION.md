# API DOCUMENTATION: AI RESUME BUILDER

Base URL: `/api/v1`
Interactive Swagger Documentation: `http://localhost:8000/docs`
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. Health

### `GET /api/v1/health`
Verifies backend operational status and AI provider configuration.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "development",
    "ai_provider": "local",
    "ai_configured": true,
    "storage_mode": "browser_indexeddb_privacy_first"
  },
  "message": "Application is healthy and operational.",
  "error": null
}
```

---

## 2. Resume Parsing & Extraction

### `POST /api/v1/resume/parse`
Extracts structured resume data from uploaded PDF or DOCX file.

- **Content-Type**: `multipart/form-data`
- **Body**: `file` (binary PDF or DOCX, max 10MB)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "filename": "my_resume.pdf",
    "raw_text_length": 3410,
    "resume_data": {
      "personalInfo": {
        "fullName": "Jane Doe",
        "email": "jane@example.com"
      },
      "experience": [...],
      "education": [...],
      "skills": [...]
    },
    "warnings": []
  },
  "message": "Resume extracted and parsed successfully.",
  "error": null
}
```

---

## 3. AI Services

### `POST /api/v1/ai/generate-summary`
Generates professional resume summaries aligned with candidate experience level.

**Request Body:**
```json
{
  "role": "Full Stack Engineer",
  "experience_level": "experienced",
  "key_skills": ["React", "FastAPI", "Docker", "PostgreSQL"],
  "existing_summary": ""
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summaries": [
      "Dynamic and results-driven Full Stack Engineer with comprehensive experience...",
      "High-performing Full Stack Engineer adept at modern software practices...",
      "Innovative Full Stack Engineer with strong background in deploying enterprise-grade applications..."
    ],
    "selected_summary": "Dynamic and results-driven Full Stack Engineer...",
    "suggested_headline": "Full Stack Engineer | React Specialist"
  },
  "message": "Professional summary generated successfully.",
  "error": null
}
```

### `POST /api/v1/ai/improve-bullet`
Enhances experience bullet point using the STAR method, strong action verbs, and quantified metrics.

**Request Body:**
```json
{
  "bullet": "worked on optimizing database queries and api response time",
  "role": "Backend Engineer"
}
```

### `POST /api/v1/ai/improve-project`
Enhances technical project descriptions and extracts relevant tech stack tags.

### `POST /api/v1/ai/review-resume`
Performs holistic quality review checking for missing fields, contact info gaps, and reading time.

---

## 4. Job Description & Gap Analysis

### `POST /api/v1/jobs/analyze`
Extracts technical skills, soft skills, educational requirements, and responsibilities from a job posting.

### `POST /api/v1/jobs/match-resume`
Compares an existing `ResumeData` object against a job description, calculating match percentage and identifying missing skills.

---

## 5. ATS Compliance Engine

### `POST /api/v1/ats/analyze`
Audits resume against applicant tracking system parsing requirements, evaluating contact completeness, action verbs, and formatting.

**Request Body:**
```json
{
  "resume_data": { ... },
  "job_description": "Looking for a Python and React developer..."
}
```

---

## 6. Job-Specific Tailoring

### `POST /api/v1/resume/tailor`
Generates tailored professional summary and targeted experience bullet points for a specific job posting without fabricating qualifications.
