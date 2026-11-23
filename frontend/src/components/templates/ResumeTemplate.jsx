import React from 'react';
import {
  ATS01, ATS02, ATS03, ATS04, ATS05, ATS06, ATS07, ATS08, ATS09, ATS10
} from './ATSTemplates';
import {
  Modern01, Modern02, Modern03, Modern04, Modern05, Modern06, Modern07, Modern08, Modern09, Modern10
} from './ModernTemplates';
import {
  Minimalist01, Minimalist02, Minimalist03, Minimalist04, Minimalist05,
  Minimalist06, Minimalist07, Minimalist08, Minimalist09, Minimalist10
} from './MinimalistTemplates';
import {
  StudentTemplate, DeveloperTemplate, DataScienceTemplate, AIMLTemplate,
  ExecutiveTemplate, CreativeTemplate, BusinessTemplate
} from './SpecializedTemplates';

export function ResumeTemplate({ templateId = "ats-01", resumeData }) {
  if (!resumeData) return null;

  // 1. ATS Category (10 templates)
  if (templateId === "ats-01") return <ATS01 resumeData={resumeData} />;
  if (templateId === "ats-02") return <ATS02 resumeData={resumeData} />;
  if (templateId === "ats-03") return <ATS03 resumeData={resumeData} />;
  if (templateId === "ats-04") return <ATS04 resumeData={resumeData} />;
  if (templateId === "ats-05") return <ATS05 resumeData={resumeData} />;
  if (templateId === "ats-06") return <ATS06 resumeData={resumeData} />;
  if (templateId === "ats-07") return <ATS07 resumeData={resumeData} />;
  if (templateId === "ats-08") return <ATS08 resumeData={resumeData} />;
  if (templateId === "ats-09") return <ATS09 resumeData={resumeData} />;
  if (templateId === "ats-10") return <ATS10 resumeData={resumeData} />;

  // 2. Modern Category (10 templates)
  if (templateId === "modern-01") return <Modern01 resumeData={resumeData} />;
  if (templateId === "modern-02") return <Modern02 resumeData={resumeData} />;
  if (templateId === "modern-03") return <Modern03 resumeData={resumeData} />;
  if (templateId === "modern-04") return <Modern04 resumeData={resumeData} />;
  if (templateId === "modern-05") return <Modern05 resumeData={resumeData} />;
  if (templateId === "modern-06") return <Modern06 resumeData={resumeData} />;
  if (templateId === "modern-07") return <Modern07 resumeData={resumeData} />;
  if (templateId === "modern-08") return <Modern08 resumeData={resumeData} />;
  if (templateId === "modern-09") return <Modern09 resumeData={resumeData} />;
  if (templateId === "modern-10") return <Modern10 resumeData={resumeData} />;

  // 3. Minimalist Category (10 templates)
  if (templateId === "minimalist-01") return <Minimalist01 resumeData={resumeData} />;
  if (templateId === "minimalist-02") return <Minimalist02 resumeData={resumeData} />;
  if (templateId === "minimalist-03") return <Minimalist03 resumeData={resumeData} />;
  if (templateId === "minimalist-04") return <Minimalist04 resumeData={resumeData} />;
  if (templateId === "minimalist-05") return <Minimalist05 resumeData={resumeData} />;
  if (templateId === "minimalist-06") return <Minimalist06 resumeData={resumeData} />;
  if (templateId === "minimalist-07") return <Minimalist07 resumeData={resumeData} />;
  if (templateId === "minimalist-08") return <Minimalist08 resumeData={resumeData} />;
  if (templateId === "minimalist-09") return <Minimalist09 resumeData={resumeData} />;
  if (templateId === "minimalist-10") return <Minimalist10 resumeData={resumeData} />;

  const userColor = resumeData?.preferences?.themeColor;

  // 4. Student Category (5 templates)
  if (templateId.startsWith("student-")) {
    const colors = {
      "student-01": "#2563eb", "student-02": "#0891b2", "student-03": "#4f46e5",
      "student-04": "#059669", "student-05": "#0284c7"
    };
    return <StudentTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#2563eb"} />;
  }

  // 5. Developer Category (5 templates)
  if (templateId.startsWith("developer-")) {
    const colors = {
      "developer-01": "#0284c7", "developer-02": "#0d9488", "developer-03": "#7c3aed",
      "developer-04": "#1e293b", "developer-05": "#4338ca"
    };
    return <DeveloperTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#0284c7"} />;
  }

  // 6. Data Analyst & Data Scientist Category (5 templates)
  if (templateId.startsWith("data-")) {
    const colors = {
      "data-01": "#0284c7", "data-02": "#0f766e", "data-03": "#d97706",
      "data-04": "#2563eb", "data-05": "#475569"
    };
    return <DataScienceTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#0284c7"} />;
  }

  // 7. AI/ML & GenAI Category (5 templates)
  if (templateId.startsWith("aiml-")) {
    const colors = {
      "aiml-01": "#7c3aed", "aiml-02": "#9333ea", "aiml-03": "#0891b2",
      "aiml-04": "#4f46e5", "aiml-05": "#059669"
    };
    return <AIMLTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#7c3aed"} />;
  }

  // 8. Executive Category (5 templates)
  if (templateId.startsWith("executive-")) {
    const colors = {
      "executive-01": "#0f172a", "executive-02": "#1e3a8a", "executive-03": "#1e293b",
      "executive-04": "#334155", "executive-05": "#064e3b"
    };
    return <ExecutiveTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#0f172a"} />;
  }

  // 9. Creative Category (5 templates)
  if (templateId.startsWith("creative-")) {
    const colors = {
      "creative-01": "#ec4899", "creative-02": "#8b5cf6", "creative-03": "#f59e0b",
      "creative-04": "#06b6d4", "creative-05": "#0f766e"
    };
    return <CreativeTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#ec4899"} />;
  }

  // 10. Business Category (5 templates)
  if (templateId.startsWith("business-")) {
    const colors = {
      "business-01": "#1e3a8a", "business-02": "#047857", "business-03": "#0f172a",
      "business-04": "#c026d3", "business-05": "#0284c7"
    };
    return <BusinessTemplate resumeData={resumeData} themeColor={userColor || colors[templateId] || "#1e3a8a"} />;
  }

  // Default fallback
  return <ATS01 resumeData={resumeData} />;
}
