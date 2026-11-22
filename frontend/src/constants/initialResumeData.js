export const INITIAL_RESUME_DATA = {
  schemaVersion: "1.0.0",
  templateId: "ats-01",
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    professionalTitle: "Senior Full Stack Engineer",
    website: "https://alexrivera.dev",
    linkedin: "https://linkedin.com/in/alex-rivera",
    github: "https://github.com/alexrivera",
    portfolio: "https://alexrivera.dev/portfolio"
  },
  professionalSummary: "Results-driven Senior Full Stack Engineer with 6+ years of experience architecting and delivering high-scale web platforms and cloud-native microservices. Proven track record in reducing system latency by 35% and mentoring engineering teams in modern React, Node.js, and distributed cloud systems.",
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2014-08",
      endDate: "2018-05",
      cgpa: "3.85 / 4.0",
      description: "Graduated with Honors. Core coursework: Distributed Systems, Operating Systems, Algorithms, Database Design."
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Apex Cloud Solutions",
      position: "Senior Full Stack Engineer",
      employmentType: "Full-time",
      location: "San Francisco, CA",
      startDate: "2021-06",
      endDate: "",
      current: true,
      responsibilities: [
        "Architected and deployed a multi-tenant telemetry dashboard serving 250,000+ daily active users with React, TypeScript, and FastAPI.",
        "Refactored legacy REST microservices into GraphQL and event-driven architectures, reducing API payload size by 40% and p95 latency by 120ms.",
        "Led a squad of 6 engineers across sprint planning, code reviews, and automated CI/CD pipeline modernization."
      ],
      achievements: [
        "Received Engineering Excellence Award for zero-downtime database migration."
      ]
    },
    {
      id: "exp-2",
      company: "NovaTech Innovations",
      position: "Software Engineer",
      employmentType: "Full-time",
      location: "San Jose, CA",
      startDate: "2018-07",
      endDate: "2021-05",
      current: false,
      responsibilities: [
        "Developed core billing and subscription management workflows with Node.js, Express, and PostgreSQL, processing $12M+ annually.",
        "Engineered responsive user interfaces with React and Tailwind CSS, increasing mobile checkout conversion by 18%.",
        "Wrote comprehensive unit and integration test suites achieving 88% code coverage."
      ],
      achievements: [
        "Promoted from Associate to Software Engineer within 14 months."
      ]
    }
  ],
  internships: [
    {
      id: "int-1",
      organization: "CloudScale Labs",
      role: "Software Engineering Intern",
      duration: "3 months",
      startDate: "2017-06",
      endDate: "2017-08",
      responsibilities: [
        "Automated regression testing workflows using Python and Selenium, saving 15 manual QA hours per sprint."
      ],
      technologies: ["Python", "Selenium", "Git", "Docker"]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "PulseQueue — Distributed Task Broker",
      description: "High-throughput asynchronous job processing engine with real-time analytics and dead-letter queue recovery.",
      technologies: ["Go", "Redis", "Docker", "gRPC", "React"],
      githubUrl: "https://github.com/alexrivera/pulsequeue",
      liveUrl: "https://pulsequeue.dev",
      startDate: "2023-01",
      endDate: "2023-05",
      highlights: [
        "Handled 15,000 msg/sec with sub-5ms queue dispatch latency.",
        "Open-sourced on GitHub with 1,200+ stars and 150+ forks."
      ]
    },
    {
      id: "proj-2",
      name: "NeuroDoc — AI Document Summarizer",
      description: "Privacy-first PDF and markdown analyzer providing semantic vector search and automated executive briefs.",
      technologies: ["Python", "FastAPI", "React", "Tailwind CSS", "LangChain"],
      githubUrl: "https://github.com/alexrivera/neurodoc",
      liveUrl: "https://neurodoc.app",
      startDate: "2022-08",
      endDate: "2022-11",
      highlights: [
        "Indexed over 50,000 pages with client-side caching.",
        "Featured on Product Hunt Top 5 Products of the Day."
      ]
    }
  ],
  skills: [
    {
      category: "Programming Languages",
      items: ["JavaScript (ES6+)", "TypeScript", "Python", "Go", "SQL", "HTML5/CSS3"]
    },
    {
      category: "Frameworks & Libraries",
      items: ["React.js", "Next.js", "Node.js", "FastAPI", "Express", "Tailwind CSS", "Redux Toolkit"]
    },
    {
      category: "Cloud, Databases & DevOps",
      items: ["AWS (ECS, S3, RDS)", "Docker", "PostgreSQL", "Redis", "Git", "CI/CD (GitHub Actions)"]
    },
    {
      category: "Practices & Soft Skills",
      items: ["Microservices", "RESTful APIs", "System Architecture", "Agile / Scrum", "Technical Mentorship"]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      issueDate: "2022-09",
      expiryDate: "2025-09",
      credentialUrl: "https://aws.amazon.com/verification"
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "First Place — CalHacks Open Track",
      description: "Built an accessibility tool for visually impaired programmers in 36 hours.",
      date: "2017-10"
    }
  ],
  languages: [
    { name: "English", proficiency: "Native / Bilingual" },
    { name: "Spanish", proficiency: "Professional Working" }
  ],
  publications: [],
  volunteerExperience: [
    {
      id: "vol-1",
      organization: "Code for Good Bay Area",
      role: "Volunteer Coding Instructor",
      duration: "2020 – Present",
      description: "Mentoring underrepresented high school students in introductory web programming."
    }
  ],
  customSections: [],
  preferences: {
    themeColor: "#0284c7",
    fontFamily: "Inter",
    fontSize: "medium",
    spacing: "normal",
    dateFormat: "MMM YYYY",
    showIcons: true
  }
};
