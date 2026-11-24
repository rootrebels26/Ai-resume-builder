import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  AlignmentType,
  BorderStyle
} from 'docx';

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Creates standard ATS-optimized section heading in Word.
 */
function createSectionHeader(title) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    border: {
      bottom: {
        color: '94A3B8',
        space: 4,
        style: BorderStyle.SINGLE,
        size: 8
      }
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22, // 11pt
        font: 'Calibri',
        color: '0F172A'
      })
    ]
  });
}

/**
 * Service to export resume data as an authentic, ATS-compliant Microsoft Word (.docx) document.
 */
export const docxService = {
  async exportToDocx(resumeData, filename = 'resume.docx') {
    if (!resumeData) throw new Error('No resume data provided for DOCX export.');

    const {
      personalInfo = {},
      professionalSummary = '',
      skills = [],
      experience = [],
      projects = [],
      education = [],
      certifications = []
    } = resumeData;

    const children = [];

    // 1. CANDIDATE HEADER
    // Full Name
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: (personalInfo.fullName || 'RESUME').toUpperCase(),
            bold: true,
            size: 36, // 18pt
            font: 'Calibri',
            color: '0F172A'
          })
        ]
      })
    );

    // Professional Title
    if (personalInfo.professionalTitle) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({
              text: personalInfo.professionalTitle.toUpperCase(),
              bold: true,
              size: 20, // 10pt
              font: 'Calibri',
              color: '334155'
            })
          ]
        })
      );
    }

    // Contact Information with Live Hyperlinks
    const contactRuns = [];
    const contactItems = [
      personalInfo.phone && { text: personalInfo.phone, url: `tel:${personalInfo.phone}` },
      personalInfo.email && { text: personalInfo.email, url: `mailto:${personalInfo.email}` },
      personalInfo.location && { text: personalInfo.location },
      personalInfo.website && { text: personalInfo.website.replace(/^https?:\/\//, ''), url: normalizeUrl(personalInfo.website) },
      personalInfo.linkedin && { text: 'LinkedIn', url: normalizeUrl(personalInfo.linkedin) },
      personalInfo.github && { text: 'GitHub', url: normalizeUrl(personalInfo.github) },
      personalInfo.portfolio && { text: 'Portfolio', url: normalizeUrl(personalInfo.portfolio) }
    ].filter(Boolean);

    contactItems.forEach((item, idx) => {
      if (idx > 0) {
        contactRuns.push(
          new TextRun({
            text: '  |  ',
            font: 'Calibri',
            size: 19,
            color: '94A3B8'
          })
        );
      }

      if (item.url) {
        contactRuns.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: item.text,
                font: 'Calibri',
                size: 19,
                color: '0284C7',
                underline: {}
              })
            ],
            link: item.url
          })
        );
      } else {
        contactRuns.push(
          new TextRun({
            text: item.text,
            font: 'Calibri',
            size: 19,
            color: '475569'
          })
        );
      }
    });

    if (contactRuns.length > 0) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 160 },
          children: contactRuns
        })
      );
    }

    // 2. PROFESSIONAL SUMMARY / FOCUS
    if (professionalSummary) {
      children.push(createSectionHeader('Professional Summary'));
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({
              text: professionalSummary,
              font: 'Calibri',
              size: 20, // 10pt
              color: '1E293B'
            })
          ]
        })
      );
    }

    // 3. CORE PROFICIENCIES & SKILLS
    if (skills && skills.length > 0) {
      children.push(createSectionHeader('Technical Skills & Competencies'));
      skills.forEach((cat) => {
        const catName = typeof cat === 'string' ? 'Skills' : (cat.category || 'Competencies');
        const items = Array.isArray(cat?.items)
          ? cat.items.join(', ')
          : typeof cat?.items === 'string'
          ? cat.items
          : typeof cat === 'string'
          ? cat
          : '';

        if (items) {
          children.push(
            new Paragraph({
              spacing: { before: 30, after: 40 },
              children: [
                new TextRun({
                  text: `${catName}: `,
                  bold: true,
                  font: 'Calibri',
                  size: 20,
                  color: '0F172A'
                }),
                new TextRun({
                  text: items,
                  font: 'Calibri',
                  size: 20,
                  color: '334155'
                })
              ]
            })
          );
        }
      });
    }

    // 4. PROFESSIONAL EXPERIENCE
    if (experience && experience.length > 0) {
      children.push(createSectionHeader('Professional Experience'));
      experience.forEach((exp) => {
        const dateRange = `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || 'Present'}`;
        const locationStr = exp.location ? ` | ${exp.location}` : '';

        // Role & Company Header
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 30 },
            children: [
              new TextRun({
                text: exp.position || 'Software Engineer',
                bold: true,
                font: 'Calibri',
                size: 21,
                color: '0F172A'
              }),
              new TextRun({
                text: ` — ${exp.company || 'Company'}`,
                font: 'Calibri',
                size: 21,
                color: '334155'
              }),
              new TextRun({
                text: `    (${dateRange}${locationStr})`,
                font: 'Calibri',
                size: 19,
                color: '64748B'
              })
            ]
          })
        );

        // Responsibilities & Achievements (Bullets)
        const resps = exp.responsibilities || [];
        resps.forEach((resp) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: resp,
                  font: 'Calibri',
                  size: 20,
                  color: '1E293B'
                })
              ]
            })
          );
        });
      });
    }

    // 5. PROJECTS & ARCHITECTURES
    if (projects && projects.length > 0) {
      children.push(createSectionHeader('Key Projects & Architectures'));
      projects.forEach((proj) => {
        const projectChildren = [
          new TextRun({
            text: proj.name || 'Project',
            bold: true,
            font: 'Calibri',
            size: 21,
            color: '0F172A'
          })
        ];

        if (proj.liveUrl) {
          projectChildren.push(
            new TextRun({ text: '  ' }),
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: '[Live Demo]',
                  font: 'Calibri',
                  size: 19,
                  color: '0284C7',
                  underline: {}
                })
              ],
              link: normalizeUrl(proj.liveUrl)
            })
          );
        }

        if (proj.githubUrl) {
          projectChildren.push(
            new TextRun({ text: '  ' }),
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: '[GitHub]',
                  font: 'Calibri',
                  size: 19,
                  color: '475569',
                  underline: {}
                })
              ],
              link: normalizeUrl(proj.githubUrl)
            })
          );
        }

        if (proj.startDate) {
          projectChildren.push(
            new TextRun({
              text: `    (${proj.startDate} – ${proj.endDate || 'Present'})`,
              font: 'Calibri',
              size: 19,
              color: '64748B'
            })
          );
        }

        children.push(
          new Paragraph({
            spacing: { before: 100, after: 30 },
            children: projectChildren
          })
        );

        if (proj.description) {
          children.push(
            new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: proj.description,
                  font: 'Calibri',
                  size: 20,
                  color: '334155'
                })
              ]
            })
          );
        }

        if (proj.technologies && proj.technologies.length > 0) {
          children.push(
            new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: `Technologies: ${proj.technologies.join(', ')}`,
                  font: 'Calibri',
                  size: 19,
                  color: '475569',
                  italics: true
                })
              ]
            })
          );
        }

        const highlights = proj.highlights || [];
        highlights.forEach((h) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: h,
                  font: 'Calibri',
                  size: 20,
                  color: '1E293B'
                })
              ]
            })
          );
        });
      });
    }

    // 6. EDUCATION
    if (education && education.length > 0) {
      children.push(createSectionHeader('Education'));
      education.forEach((edu) => {
        const eduRuns = [
          new TextRun({
            text: edu.degree || 'Degree',
            bold: true,
            font: 'Calibri',
            size: 21,
            color: '0F172A'
          }),
          new TextRun({
            text: ` — ${edu.institution || 'University'}`,
            font: 'Calibri',
            size: 21,
            color: '334155'
          })
        ];

        if (edu.startDate || edu.endDate) {
          eduRuns.push(
            new TextRun({
              text: `    (${edu.startDate || ''} – ${edu.endDate || 'Present'})`,
              font: 'Calibri',
              size: 19,
              color: '64748B'
            })
          );
        }

        children.push(
          new Paragraph({
            spacing: { before: 80, after: 20 },
            children: eduRuns
          })
        );

        if (edu.gpa) {
          children.push(
            new Paragraph({
              spacing: { before: 10, after: 10 },
              children: [
                new TextRun({
                  text: `GPA: ${edu.gpa}`,
                  font: 'Calibri',
                  size: 19,
                  color: '475569'
                })
              ]
            })
          );
        }

        if (edu.coursework) {
          children.push(
            new Paragraph({
              spacing: { before: 10, after: 10 },
              children: [
                new TextRun({
                  text: `Core Coursework: ${edu.coursework}`,
                  font: 'Calibri',
                  size: 19,
                  color: '475569'
                })
              ]
            })
          );
        }
      });
    }

    // 7. CERTIFICATIONS
    if (certifications && certifications.length > 0) {
      children.push(createSectionHeader('Certifications & Honors'));
      certifications.forEach((cert) => {
        const name = typeof cert === 'string' ? cert : cert.name;
        const issuer = cert.issuer ? ` — ${cert.issuer}` : '';
        const date = cert.date ? ` (${cert.date})` : '';

        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: `${name}${issuer}${date}`,
                font: 'Calibri',
                size: 20,
                color: '1E293B'
              })
            ]
          })
        );
      });
    }

    // Build Word Document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children
        }
      ]
    });

    // Generate Blob and trigger download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  }
};
