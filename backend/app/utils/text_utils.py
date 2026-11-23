import re
from typing import List, Set, Dict

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
URL_REGEX = re.compile(r'https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*')
LINKEDIN_REGEX = re.compile(r'linkedin\.com/in/([a-zA-Z0-9_-]+)', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'github\.com/([a-zA-Z0-9_-]+)', re.IGNORECASE)

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
