import re
from typing import List, Set, Dict, Any, Optional, Tuple

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')

# Robust international & domestic phone pattern (handles +91, +1, spaces, hyphens, brackets, 10-digit mobiles)
PHONE_REGEX = re.compile(
    r'(?:(?:\+|00)\d{1,3}[-.\s]*)?'                 # Country code e.g. +91, +1, 0044
    r'(?:\(?\d{2,5}\)?[-.\s]*)?'                   # Area code e.g. (555), 9876
    r'\d{3,5}[-.\s]*\d{3,5}\b'                     # Local digits
)

URL_REGEX = re.compile(r'https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*', re.IGNORECASE)
LINKEDIN_REGEX = re.compile(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)', re.IGNORECASE)

def clean_raw_url(url: str) -> str:
    """Removes enclosing brackets, parentheses, trailing punctuation and whitespace."""
    if not url:
        return ""
    u = url.strip()
    u = re.sub(r'^[\[\(\<]+', '', u)
    u = re.sub(r'[\)\]\>\.,;]+$', '', u)
    return u.strip()

def extract_phone_number(text: str) -> str:
    """
    Extracts the most probable candidate phone number, verifying digit count (10-15 digits)
    and strictly rejecting date ranges (e.g. 2020-2024), GPA strings, or numeric IDs inside emails.
    """
    if not text:
        return ""

    # 1. First prioritize explicit phone labels e.g. "Phone: +91 9635290126", "Mobile:", "Tel:"
    labeled_match = re.search(
        r'(?:phone|tel|mobile|cell|contact)[\s:|\-–]+((?:\+?\d{1,3}[-.\s]*)?\(?\d{2,5}\)?[-.\s]*\d{3,5}[-.\s]*\d{3,5})',
        text,
        re.IGNORECASE
    )
    if labeled_match:
        cand = labeled_match.group(1).strip()
        digits = re.sub(r'\D', '', cand)
        if 10 <= len(digits) <= 15:
            return cand

    # 2. Strip emails and URLs from text to avoid picking numbers inside emails or URLs
    text_clean = EMAIL_REGEX.sub(' ', text)
    text_clean = URL_REGEX.sub(' ', text_clean)

    # 3. Match international or domestic phone numbers
    candidates = []
    for match in PHONE_REGEX.finditer(text_clean):
        raw_val = match.group(0).strip()
        digits_only = re.sub(r'\D', '', raw_val)
        if len(digits_only) < 10 or len(digits_only) > 15:
            continue
        # Exclude date ranges like 2020 - 2024
        if re.search(r'\b(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}\b', raw_val):
            continue
        candidates.append(raw_val)

    # Prefer numbers with '+' country code if present
    for c in candidates:
        if c.startswith('+'):
            return c

    return candidates[0] if candidates else ""

def extract_portfolio_url(text: str, exclude_linkedin: str = "", exclude_github: str = "") -> str:
    """
    Locates personal portfolio or website URL from resume text.
    Handles explicit labels ('Portfolio: https://...', 'Portfolio (https://...)', 'Website: ...')
    as well as developer hosting domains (vercel.app, render.com, netlify.app, github.io, .dev, .me).
    """
    if not text:
        return ""

    # 1. Search for explicit portfolio / personal site label with URL in parentheses or after colon
    explicit_pattern = re.search(
        r'(?:portfolio|website|personal\s+site|web|site)\s*(?:[\(:]\s*(https?://[^\s\)]+)|[\s:|\-–]+(https?://\S+|[a-zA-Z0-9-]+\.(?:dev|me|io|app|site|com|net|org)(?:/\S*)?))',
        text,
        re.IGNORECASE
    )
    if explicit_pattern:
        cand = explicit_pattern.group(1) or explicit_pattern.group(2)
        if cand:
            clean_cand = clean_raw_url(cand)
            if not clean_cand.startswith("http"):
                clean_cand = f"https://{clean_cand}"
            return clean_cand

    # 2. Scan URLs in first 15 lines (header contact bar area)
    header_area = "\n".join(text.splitlines()[:18])
    excluded_domains = {
        "linkedin.com", "github.com", "google.com", "facebook.com", "twitter.com",
        "instagram.com", "youtube.com", "medium.com", "leetcode.com", "hackerrank.com",
        "study.iitm.ac.in", "gmail.com", "yahoo.com", "outlook.com"
    }

    all_urls = URL_REGEX.findall(header_area)
    for u in all_urls:
        u_clean = clean_raw_url(u)
        u_lower = u_clean.lower()
        if any(d in u_lower for d in excluded_domains):
            continue
        if exclude_linkedin and exclude_linkedin.lower() in u_lower:
            continue
        if exclude_github and exclude_github.lower() in u_lower:
            continue
        return u_clean

    # 3. Check for bare developer domains e.g. "alexrivera.dev", "sagnik.me", "portfolio.vercel.app"
    dev_domain_match = re.search(
        r'\b([a-zA-Z0-9-]+\.(?:dev|me|io|page|website|app|tech)(?:/\S*)?)\b',
        header_area,
        re.IGNORECASE
    )
    if dev_domain_match:
        cand = clean_raw_url(dev_domain_match.group(1))
        if not cand.startswith("http"):
            cand = f"https://{cand}"
        return cand

    return ""

def sanitize_project_data(
    name: str = "",
    desc: str = "",
    technologies: List[str] = None,
    github_url: str = "",
    live_url: str = "",
    highlights: List[str] = None
) -> Dict[str, Any]:
    """
    Cleans a project entry:
    1. Extracts liveUrl and githubUrl from name, description, and highlights if missing.
    2. Corrects pipe-separated title lines (e.g. "AI Agent | Python, LLMs | Live Demo").
    3. Strips raw URLs and noisy URL prefix labels ('Demo:', 'Live Demo:', 'GitHub:', 'Repo:', '[Demo]', '[GitHub]')
       from the project description and highlights so the text remains pristine, professional narrative text.
    4. Normalizes technologies into an array of clean skill strings.
    """
    technologies = list(technologies or [])
    highlights = list(highlights or [])
    clean_name = (name or "").strip()
    clean_desc = (desc or "").strip()
    clean_gh = clean_raw_url(github_url or "")
    clean_live = clean_raw_url(live_url or "")

    # Search for all URLs in name, description, and highlights
    combined_content = f"{clean_name} {clean_desc} " + " ".join(highlights)
    all_urls = [clean_raw_url(u) for u in URL_REGEX.findall(combined_content)]

    for u_clean in all_urls:
        if "github.com" in u_clean.lower():
            if not clean_gh:
                clean_gh = u_clean
        else:
            if not clean_live:
                clean_live = u_clean

    # Parse pipe-delimited title lines: e.g. "AI Agent | Python, Generative AI, LLMs, Render | Live Demo"
    if "|" in clean_name:
        parts = [p.strip() for p in clean_name.split("|") if p.strip()]
        if parts:
            # First segment is the real project name
            clean_name = parts[0]
            # Inspect remaining segments for technologies or link text
            for seg in parts[1:]:
                # If segment contains link or URL
                if any(kw in seg.lower() for kw in ["live", "demo", "github", "repo", "http"]):
                    # URLs already captured in all_urls
                    continue
                # If segment contains tech stack keywords
                matched_tech = [t.strip() for t in re.split(r'[,/]', seg) if t.strip()]
                for mt in matched_tech:
                    if mt and mt not in technologies and len(mt) < 30:
                        technologies.append(mt)

    # Strip URLs and noise from clean_name
    for u in all_urls:
        clean_name = clean_name.replace(u, "")
    clean_name = re.sub(r'https?://\S+', '', clean_name)
    clean_name = re.sub(r'\[(?:demo|live(?:\s+demo)?|github|code|repo|preview)\]', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'\((?:demo|live(?:\s+demo)?|github|code|repo|preview)\)', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'\b(?:live\s+demo|live|demo|github|repo|repository|link|website|url)[\s:]*$', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[\(\)\[\]]+', '', clean_name)
    clean_name = re.sub(r'[|•–—:\s]+$', '', clean_name).strip()

    # Strip URLs and noise from clean_desc
    for u in all_urls:
        clean_desc = clean_desc.replace(u, "")
    clean_desc = re.sub(r'https?://\S+', '', clean_desc)
    clean_desc = re.sub(r'\b(?:live\s+demo|live|demo|github|repo|repository|link|website|url)[\s:]*(?:[|•–—\s]|$)', ' ', clean_desc, flags=re.IGNORECASE)
    clean_desc = re.sub(r'\[(?:demo|live(?:\s+demo)?|github|code|repo|preview)\]', '', clean_desc, flags=re.IGNORECASE)
    clean_desc = re.sub(r'\(\s*\)', '', clean_desc)
    clean_desc = re.sub(r'\s{2,}', ' ', clean_desc).strip()
    clean_desc = re.sub(r'[:|•–—\s]+$', '', clean_desc).strip()

    # Clean highlights
    cleaned_highlights = []
    for h in highlights:
        h_str = str(h).strip()
        # If the bullet is ONLY a link announcement, skip it as a bullet point since it's captured in liveUrl/githubUrl
        if URL_REGEX.search(h_str) and len(re.sub(r'https?://\S+', '', h_str).strip()) < 15:
            continue
        # Otherwise strip the URL out of the bullet
        for u in all_urls:
            h_str = h_str.replace(u, "")
        h_str = re.sub(r'https?://\S+', '', h_str)
        h_str = re.sub(r'\b(?:live\s+demo|live|demo|github|repo|repository|link|website|url)[\s:]*$', '', h_str, flags=re.IGNORECASE)
        h_str = re.sub(r'\[(?:demo|live(?:\s+demo)?|github|code|repo|preview)\]', '', h_str, flags=re.IGNORECASE)
        h_str = re.sub(r'\(\s*\)', '', h_str)
        h_str = re.sub(r'\s{2,}', ' ', h_str).strip()
        h_str = re.sub(r'[:|•–—\s]+$', '', h_str).strip()
        if len(h_str) > 5:
            cleaned_highlights.append(h_str)

    # Clean technologies (filter duplicates preserving case)
    seen_tech = set()
    cleaned_techs = []
    for t in technologies:
        t_clean = re.sub(r'^[#*\-•\s]+', '', str(t)).strip()
        if t_clean and t_clean.lower() not in seen_tech and len(t_clean) < 35:
            seen_tech.add(t_clean.lower())
            cleaned_techs.append(t_clean)

    return {
        "name": clean_name,
        "description": clean_desc,
        "technologies": cleaned_techs,
        "githubUrl": clean_gh,
        "liveUrl": clean_live,
        "highlights": cleaned_highlights
    }

    # Extract technologies from description/highlights if empty
    if not technologies:
        technologies = extract_matching_skills(f"{clean_name} {clean_desc} " + " ".join(cleaned_highlights))

    return {
        "name": clean_name or "Project",
        "description": clean_desc,
        "technologies": technologies,
        "githubUrl": clean_gh,
        "liveUrl": clean_live,
        "highlights": cleaned_highlights
    }

STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't",
    "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
    "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its",
    "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
    "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they",
    "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's",
    "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves", "will", "shall", "work", "experience", "role", "including", "across", "must", "years", "candidate"
}

KNOWN_SKILLS = {
    # Programming
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala",
    # Web & Frontend
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "html", "html5", "css", "css3", "tailwind", "tailwind css", "bootstrap", "sass", "redux", "zustand", "graphql", "rest api", "webpack", "vite",
    # Backend & Frameworks
    "fastapi", "django", "flask", "node.js", "express", "express.js", "spring boot", "asp.net", "laravel", "ruby on rails", "nestjs",
    # Databases & Storage
    "sql", "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "elasticsearch", "cassandra", "dynamodb", "supabase", "firebase",
    # Cloud, DevOps & Tools
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "ci/cd", "git", "github", "gitlab", "terraform", "ansible", "linux", "nginx", "jenkins",
    # AI & Data
    "machine learning", "deep learning", "ai", "artificial intelligence", "nlp", "computer vision", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "llm", "rag", "langchain",
    # Soft skills
    "leadership", "communication", "teamwork", "problem solving", "critical thinking", "agile", "scrum", "project management", "collaboration", "adaptability", "mentorship"
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'[\r\n]+', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def extract_tokens(text: str) -> List[str]:
    cleaned = re.sub(r'[^\w\s+#.-]', ' ', text.lower())
    tokens = cleaned.split()
    return [t for t in tokens if len(t) > 1 and t not in STOPWORDS]

def extract_matching_skills(text: str) -> List[str]:
    text_lower = " " + text.lower() + " "
    matched = []
    for skill in KNOWN_SKILLS:
        pattern = r'(?:\b|[^\w])' + re.escape(skill) + r'(?:\b|[^\w])'
        if re.search(pattern, text_lower):
            matched.append(skill.title() if len(skill) > 3 and not skill.isupper() else skill.upper())
    return sorted(list(set(matched)))
