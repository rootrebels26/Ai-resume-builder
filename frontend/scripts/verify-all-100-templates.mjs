import { TEMPLATE_REGISTRY as templates } from '../src/constants/templateRegistry.js';
import { paginateResume } from '../src/utils/resumePaginator.js';

console.log('====================================================');
console.log('RESUMESTUDIO: 100-TEMPLATE REGISTRY AUDIT & VERIFICATION');
console.log('====================================================');

// 1. Total Count Verification
console.log(`Total Templates Detected: ${templates.length}`);
if (templates.length !== 100) {
  console.error(`FAILED: Expected exactly 100 templates, found ${templates.length}`);
  process.exit(1);
}

// 2. Unique ID Verification
const ids = new Set();
const duplicateIds = [];
templates.forEach(t => {
  if (ids.has(t.id)) duplicateIds.push(t.id);
  ids.add(t.id);
});

if (duplicateIds.length > 0) {
  console.error(`FAILED: Duplicate template IDs found: ${duplicateIds.join(', ')}`);
  process.exit(1);
}
console.log('✓ Unique Template IDs: 100 / 100 unique IDs verified.');

// 3. Category Distribution (10 categories × 10 templates)
const expectedCategories = [
  'ATS-Friendly / Traditional',
  'Software Developer / IT',
  'Data Science / AI / ML',
  'Business / Management',
  'Finance / Accounting',
  'Marketing / Sales',
  'Engineering / Technical',
  'Student / Fresher / Internship',
  'Healthcare / Education / Research',
  'Creative / Designer / Media'
];

const categoryCounts = {};
templates.forEach(t => {
  categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
});

console.log('\nCategory Breakdown:');
let categoryErrors = 0;
expectedCategories.forEach(cat => {
  const count = categoryCounts[cat] || 0;
  console.log(`  - ${cat}: ${count} templates`);
  if (count !== 10) {
    console.error(`    ERROR: Expected 10 templates in "${cat}", got ${count}`);
    categoryErrors++;
  }
});

if (categoryErrors > 0) {
  process.exit(1);
}
console.log('✓ Category Distribution: Exactly 10 templates per category.');

// 4. Layout & Design Schema Verification
const validLayouts = ['single-column', 'two-column', 'sidebar-left', 'sidebar-right', 'header-card'];
const layoutCounts = {};
let schemaErrors = 0;

templates.forEach((t, index) => {
  if (!t.name || !t.id || !t.category) {
    console.error(`Template #${index} missing essential identification.`);
    schemaErrors++;
  }
  if (!validLayouts.includes(t.layout)) {
    console.error(`Template ${t.id} has invalid layout: "${t.layout}"`);
    schemaErrors++;
  }
  layoutCounts[t.layout] = (layoutCounts[t.layout] || 0) + 1;

  if (!t.colors?.primary || !t.colors?.text || !t.colors?.accent) {
    console.error(`Template ${t.id} missing color configuration.`);
    schemaErrors++;
  }
  if (!t.typography?.bodyFont || !t.typography?.headingFont) {
    console.error(`Template ${t.id} missing typography configuration.`);
    schemaErrors++;
  }
  if (!Array.isArray(t.sections) || t.sections.length === 0) {
    console.error(`Template ${t.id} missing sections array.`);
    schemaErrors++;
  }
});

if (schemaErrors > 0) {
  console.error(`FAILED: Found ${schemaErrors} schema validation errors.`);
  process.exit(1);
}

console.log('\nLayout Distribution:');
Object.entries(layoutCounts).forEach(([layout, count]) => {
  console.log(`  - ${layout}: ${count} templates`);
});
console.log('✓ All 100 templates conform to the Universal Resume Studio schema.');

// 5. Test pagination calculation with mock resume data across templates
const mockResumes = {
  onePage: {
    personalInfo: { fullName: 'Alex Rivera', professionalTitle: 'Senior Software Engineer', email: 'alex@example.com', phone: '555-0100', location: 'San Francisco, CA' },
    professionalSummary: 'Full-stack engineer with 6+ years designing distributed systems and cloud platforms.',
    skills: [{ category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'Rust'] }, { category: 'Cloud', items: ['AWS', 'Docker', 'Kubernetes'] }],
    experience: [
      { position: 'Lead Engineer', company: 'Acme Corp', startDate: '2021', endDate: 'Present', responsibilities: ['Architected core microservices handling 50k req/sec.', 'Reduced infrastructure latency by 35% through Redis caching.'] },
      { position: 'Software Engineer', company: 'TechWorks', startDate: '2018', endDate: '2021', responsibilities: ['Developed React dashboard used by 100k active users.', 'Built automated CI/CD deployment pipelines on AWS.'] }
    ],
    education: [{ degree: 'B.S. in Computer Science', institution: 'UC Berkeley', endDate: '2018' }],
    projects: [{ name: 'CloudScale', description: 'Open-source distributed scheduler for container clusters.' }]
  },
  multiPage: {
    personalInfo: { fullName: 'Dr. Marcus Vance', professionalTitle: 'Enterprise Architect & VP Technology', email: 'marcus@vance.io', phone: '555-0299', location: 'New York, NY', linkedin: 'linkedin.com/in/marcus-vance' },
    professionalSummary: 'Executive technology leader with 15+ years driving digital transformation, cloud migrations, and high-concurrency systems across Fortune 500 enterprises.',
    skills: [
      { category: 'Architecture', items: ['Microservices', 'Event-Driven', 'Domain-Driven Design', 'Zero Trust'] },
      { category: 'Cloud Platforms', items: ['AWS', 'Azure', 'GCP', 'OpenShift', 'Terraform'] },
      { category: 'Data & AI', items: ['Snowflake', 'Databricks', 'Kafka', 'PySpark', 'LLM Engineering'] }
    ],
    experience: [
      { position: 'VP of Technology', company: 'Global Capital Group', startDate: '2022', endDate: 'Present', responsibilities: ['Directed 85+ engineers delivering mission-critical financial trading platform.', 'Engineered sub-millisecond market data ingestion engine processing $12B daily.'] },
      { position: 'Principal Architect', company: 'FinTech Cloud', startDate: '2018', endDate: '2022', responsibilities: ['Led cloud migration of 140+ legacy services to Kubernetes and AWS.', 'Cut cloud operating costs by $2.4M annually through autoscaling and spot instances.'] },
      { position: 'Senior Architect', company: 'Datacore Systems', startDate: '2014', endDate: '2018', responsibilities: ['Designed scalable multi-tenant SaaS architecture supporting 2M businesses.', 'Established security compliance with SOC2 Type II, ISO 27001, and GDPR.'] },
      { position: 'Lead Software Engineer', company: 'NextGen Soft', startDate: '2010', endDate: '2014', responsibilities: ['Developed real-time distributed messaging framework in Go and C++.', 'Mentored engineering cohorts and standardized code review practices.'] }
    ],
    education: [
      { degree: 'Ph.D. in Computer Science', institution: 'MIT', endDate: '2010' },
      { degree: 'B.S. in Electrical Engineering', institution: 'Stanford University', endDate: '2005' }
    ],
    projects: [
      { name: 'VanceFlow Architecture', description: 'Resilient event bus architecture processing 1M events/sec with zero packet loss.' },
      { name: 'SecurShield Identity Engine', description: 'Enterprise OAuth2/OIDC identity gateway securing 450+ microservices.' }
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect - Professional', issuer: 'Amazon Web Services', date: '2023' },
      { name: 'Certified Information Systems Security Professional (CISSP)', issuer: 'ISC2', date: '2022' }
    ]
  }
};

console.log('\nRunning Pagination Stress Tests across Templates:');
let paginationPassed = 0;

const testConfigurations = [
  { name: 'Single Page A4', resume: mockResumes.onePage, options: { forceSinglePage: true, paperFormat: 'a4' } },
  { name: 'Single Page US Letter', resume: mockResumes.onePage, options: { forceSinglePage: true, paperFormat: 'letter' } },
  { name: 'Two Page Mode A4', resume: mockResumes.multiPage, options: { forceTwoPages: true, paperFormat: 'a4' } },
  { name: 'Natural Multi-Page A4', resume: mockResumes.multiPage, options: { paperFormat: 'a4' } },
];

testConfigurations.forEach(config => {
  const pages = paginateResume(config.resume, config.options);
  console.log(`  ✓ ${config.name}: Generated ${pages.length} page(s) cleanly.`);
  if (pages.length > 1) {
    for (let pIdx = 1; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];
      if (page.personalInfo?.phone || page.personalInfo?.email || page.professionalSummary) {
        console.error(`    FAILED: Page ${pIdx + 1} has leaked contact details or summary!`);
        process.exit(1);
      }
    }
  }
  paginationPassed++;
});

console.log(`\nAll ${paginationPassed} pagination stress tests passed with 0 header leakage on continuation pages.`);
console.log('\n====================================================');
console.log('✓ 100-TEMPLATE REGISTRY & RENDERING AUDIT SUCCESSFUL');
console.log('====================================================');
