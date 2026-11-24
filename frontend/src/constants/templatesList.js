export const isFullBleedTemplate = (templateId) => {
  return typeof templateId === 'string' && templateId.startsWith('modern-');
};

export const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates" },
  { id: "maang", name: "FAANG / MAANG Tier (25)" },
  { id: "ats", name: "ATS-Friendly (10)" },
  { id: "modern", name: "Modern Professional (10)" },
  { id: "minimalist", name: "Minimalist (10)" },
  { id: "infra", name: "Cloud, DevOps & SRE (15)" },
  { id: "lead", name: "Staff & Principal Leadership (10)" },
  { id: "developer", name: "Software Developer (10)" },
  { id: "aiml", name: "AI/ML & GenAI Engineer (10)" },
  { id: "data", name: "Data Analyst & Data Scientist (10)" },
  { id: "student", name: "Student & Fresher (5)" },
  { id: "executive", name: "Executive & Leadership (5)" },
  { id: "creative", name: "Creative & Designer (5)" },
  { id: "business", name: "Business Professional (5)" }
];

export const TEMPLATES = [

  // ==========================================
  // FAANG / MAANG Tier (25 Templates)
  // Calibrated for Google, Meta, Amazon, Apple, Netflix, Microsoft, Nvidia, Stripe, OpenAI
  // ==========================================
  {
    id: "maang-01",
    name: "Google L5 Senior SWE",
    category: "maang",
    layout: "Google XYZ Metric Linear",
    description: "Strictly calibrated to Google hiring committee standards: XYZ impact metrics, clean single-column hierarchy, and zero parsing noise.",
    accentColor: "#1a73e8",
    badge: "Google L5",
    rating: 4.9
  },
  {
    id: "maang-02",
    name: "Meta E5 Production Lead",
    category: "maang",
    layout: "Meta Fast-Paced Impact",
    description: "Optimized for Meta fast-paced engineering culture: high-concurrency systems, GraphQL/React ecosystem, and hack-a-month delivery.",
    accentColor: "#0668e1",
    badge: "Meta E5",
    rating: 4.9
  },
  {
    id: "maang-03",
    name: "Amazon Bar-Raiser SDE",
    category: "maang",
    layout: "Leadership Principles Bar-Raiser",
    description: "Incorporates Amazon 16 Leadership Principles: Customer Obsession, Ownership, Bias for Action, Frugality, and Deliver Results.",
    accentColor: "#ff9900",
    badge: "Bar-Raiser",
    rating: 4.9
  },
  {
    id: "maang-04",
    name: "Apple CoreOS & Performance",
    category: "maang",
    layout: "Hardware-Software Co-Design",
    description: "Ultra-clean Apple engineering aesthetic emphasizing low-level C++/Swift systems, memory safety, and battery efficiency.",
    accentColor: "#333333",
    badge: "Apple Core",
    rating: 4.9
  },
  {
    id: "maang-05",
    name: "Netflix Chaos Microservices",
    category: "maang",
    layout: "High Density Resilience",
    description: "High information density format highlighting distributed microservices, Chaos Monkey resilience, and context-not-control impact.",
    accentColor: "#e50914",
    badge: "Netflix Tier",
    rating: 4.9
  },
  {
    id: "maang-06",
    name: "Microsoft Enterprise Architect",
    category: "maang",
    layout: "Azure Systems & Governance",
    description: "Engineered for Microsoft Azure architects and Principal SWEs: multi-region governance, security boundaries, and hybrid scale.",
    accentColor: "#0078d4",
    badge: "Azure Architect",
    rating: 4.8
  },
  {
    id: "maang-07",
    name: "Nvidia CUDA & GPU Systems",
    category: "maang",
    layout: "Accelerated Parallel Computing",
    description: "Focused on TensorRT, CUDA C++, parallel kernel optimizations, high FLOP utilization, and distributed GPU clusters.",
    accentColor: "#76b900",
    badge: "Nvidia CUDA",
    rating: 5.0
  },
  {
    id: "maang-08",
    name: "Stripe Five-Nines FinTech",
    category: "maang",
    layout: "Idempotent Transaction Ledger",
    description: "Tailored for Stripe, Adyen, and high-stakes FinTech: 99.999% availability, immutable ledger pipelines, and zero data loss.",
    accentColor: "#635bff",
    badge: "Stripe 99.999%",
    rating: 5.0
  },
  {
    id: "maang-09",
    name: "OpenAI / Anthropic LLM Infra",
    category: "maang",
    layout: "Distributed Training Clusters",
    description: "Targeted for frontier AI research labs: Slurm cluster scheduling, Megatron-LM, vLLM, FlashAttention, and RLHF pipelines.",
    accentColor: "#10a37f",
    badge: "OpenAI Cluster",
    rating: 5.0
  },
  {
    id: "maang-10",
    name: "Uber Real-Time Geo Dispatch",
    category: "maang",
    layout: "Low-Latency Geospatial H3",
    description: "Built for Uber and real-time logistics: hexagonal spatial indexing, sub-50ms dispatch latency, and high-throughput event queues.",
    accentColor: "#000000",
    badge: "Uber Scale",
    rating: 4.9
  },
  {
    id: "maang-11",
    name: "Databricks Lakehouse Lead",
    category: "maang",
    layout: "Distributed Query & Delta ACID",
    description: "Specialized in Apache Spark, Delta Lake, petabyte-scale streaming, query optimization, and MLflow pipeline architectures.",
    accentColor: "#ff3621",
    badge: "Lakehouse",
    rating: 4.8
  },
  {
    id: "maang-12",
    name: "Airbnb High-Fidelity Web",
    category: "maang",
    layout: "Design Systems & Web Vitals",
    description: "For frontend architects: accessible design tokens, micro-frontend federation, sub-second LCP/INP web vitals, and SSR performance.",
    accentColor: "#ff5a5f",
    badge: "Airbnb UX",
    rating: 4.9
  },
  {
    id: "maang-13",
    name: "FAANG Site Reliability (SRE)",
    category: "maang",
    layout: "Google SRE Error Budgets",
    description: "Formatted around the Google SRE handbook: SLI/SLO tracking, error budget governance, and automated incident mitigation.",
    accentColor: "#0284c7",
    badge: "Google SRE",
    rating: 5.0
  },
  {
    id: "maang-14",
    name: "FAANG Production Engineer",
    category: "maang",
    layout: "Kernel & Edge Observability",
    description: "Focuses on Linux kernel tuning, eBPF telemetry, edge CDN traffic routing, and massive hardware fleet reliability.",
    accentColor: "#0d9488",
    badge: "Production Eng",
    rating: 4.8
  },
  {
    id: "maang-15",
    name: "FAANG Staff Engineer (L6+)",
    category: "maang",
    layout: "Cross-Org Architectural RFCs",
    description: "Designed for Staff SWEs leading 30+ engineers: organization-wide RFC architecture, cross-team alignment, and multi-year roadmaps.",
    accentColor: "#0f172a",
    badge: "Staff L6+",
    rating: 5.0
  },
  {
    id: "maang-16",
    name: "FAANG Principal Architect (L7+)",
    category: "maang",
    layout: "Corporate Strategy & Fault-Tolerance",
    description: "Highlights enterprise-defining system design, multi-datacenter active-active replication, patent portfolios, and technical governance.",
    accentColor: "#1e1b4b",
    badge: "Principal L7+",
    rating: 5.0
  },
  {
    id: "maang-17",
    name: "FAANG Technical Program Manager",
    category: "maang",
    layout: "Silicon-to-Software Execution",
    description: "Calibrated for FAANG TPMs: critical path dependency mapping, silicon tape-out alignment, and cross-functional delivery.",
    accentColor: "#4f46e5",
    badge: "FAANG TPM",
    rating: 4.8
  },
  {
    id: "maang-18",
    name: "FAANG Group Product Manager",
    category: "maang",
    layout: "North Star & PR/FAQ Strategy",
    description: "Structures product narratives with Amazon-style PR/FAQ documents, North Star user metric gains, and 0-to-1 product bets.",
    accentColor: "#7c3aed",
    badge: "FAANG GPM",
    rating: 4.9
  },
  {
    id: "maang-19",
    name: "FAANG Applied ML Scientist",
    category: "maang",
    layout: "NeurIPS/ICML Vector Retrieval",
    description: "Dedicated to AI researchers: peer-reviewed publications, semantic vector embeddings, and billion-parameter recommender models.",
    accentColor: "#9333ea",
    badge: "FAANG Research",
    rating: 5.0
  },
  {
    id: "maang-20",
    name: "FAANG Zero-Trust Security Lead",
    category: "maang",
    layout: "Hardware Enclave & Red Team",
    description: "Threat modeling, confidential computing, hardware security modules (HSM), automated red-teaming, and zero-CVE enforcement.",
    accentColor: "#dc2626",
    badge: "SecOps Lead",
    rating: 4.9
  },
  {
    id: "maang-21",
    name: "FAANG DevSecOps & Platform",
    category: "maang",
    layout: "Kubernetes Operator GitOps",
    description: "Custom Kubernetes CRDs, internal developer platforms (IDP), ephemeral staging environments, and progressive delivery.",
    accentColor: "#2563eb",
    badge: "Platform Eng",
    rating: 4.8
  },
  {
    id: "maang-22",
    name: "FAANG Low-Latency C++ Systems",
    category: "maang",
    layout: "Lock-Free & DPDK Networking",
    description: "Zero-copy networking, memory cache-line optimization, lock-free ring buffers, and microsecond latency financial systems.",
    accentColor: "#374151",
    badge: "Low Latency C++",
    rating: 4.9
  },
  {
    id: "maang-23",
    name: "FAANG New Grad Fast-Track",
    category: "maang",
    layout: "ICPC Finalist & Top 1% LeetCode",
    description: "Structured for university students targeting FAANG new grad programs: highlights competitive programming, open source PRs, and core CS.",
    accentColor: "#059669",
    badge: "Fast-Track",
    rating: 4.9
  },
  {
    id: "maang-24",
    name: "FAANG Quantitative Engineer",
    category: "maang",
    layout: "Algorithmic Trading & High-Throughput",
    description: "High-frequency algorithmic trade execution, stochastic risk models, Monte Carlo simulations, and real-time market data feeds.",
    accentColor: "#047857",
    badge: "Quant Lead",
    rating: 4.9
  },
  {
    id: "maang-25",
    name: "FAANG AI Systems Architect",
    category: "maang",
    layout: "vLLM & FlashAttention Acceleration",
    description: "Dedicated to inference cluster economics: KV-cache compression, continuous batching, speculative decoding, and model distillation.",
    accentColor: "#8b5cf6",
    badge: "AI Architect",
    rating: 5.0
  },

  // ==========================================
  // Cloud, DevOps & SRE (15 Templates)
  // ==========================================
  {
    id: "infra-01",
    name: "Kubernetes Cluster Operator",
    category: "infra",
    layout: "Kube-Native Controller",
    description: "Specialized in multi-cluster Kubernetes operations, custom resource controllers, Helm charts, and service mesh governance.",
    accentColor: "#326ce5",
    badge: "K8s Master",
    rating: 4.9
  },
  {
    id: "infra-02",
    name: "Terraform Cloud Platform",
    category: "infra",
    layout: "Infrastructure as Code",
    description: "Automated multi-account cloud provisioning with Terraform modules, Terragrunt, policy-as-code (OPA), and drift detection.",
    accentColor: "#7b42bc",
    badge: "IaC Lead",
    rating: 4.8
  },
  {
    id: "infra-03",
    name: "Multi-Region AWS Solutions",
    category: "infra",
    layout: "Cloud Landing Zone",
    description: "Architecting active-active multi-region AWS footprints with Route 53 latency routing, DynamoDB Global Tables, and Aurora Multi-Master.",
    accentColor: "#ff9900",
    badge: "AWS Solutions",
    rating: 4.9
  },
  {
    id: "infra-04",
    name: "Kafka Event Streaming Lead",
    category: "infra",
    layout: "High-Throughput Partitioning",
    description: "Event-driven backbone architectures: Schema Registry, tiered storage, mirror maker replication, and billion-message daily volumes.",
    accentColor: "#231f20",
    badge: "Kafka Core",
    rating: 4.9
  },
  {
    id: "infra-05",
    name: "Datadog Observability Architect",
    category: "infra",
    layout: "Distributed Tracing & APM",
    description: "Full-stack observability with OpenTelemetry, APM flame graphs, synthetic monitors, and SLO dashboards.",
    accentColor: "#632ca6",
    badge: "Observability",
    rating: 4.8
  },
  {
    id: "infra-06",
    name: "Database Reliability Engineer",
    category: "infra",
    layout: "PostgreSQL High Availability",
    description: "Dedicated to database clustering (Patroni/pgBouncer), automated failover, partition pruning, and zero data loss point-in-time recovery.",
    accentColor: "#336791",
    badge: "DBRE Lead",
    rating: 4.9
  },
  {
    id: "infra-07",
    name: "Linux Kernel & Systems Tuner",
    category: "infra",
    layout: "eBPF Probing & TCP Stack",
    description: "System call analysis, memory cgroups, interrupt handling, BPF observability tools, and low-level Linux performance tuning.",
    accentColor: "#e95420",
    badge: "Kernel Pro",
    rating: 4.9
  },
  {
    id: "infra-08",
    name: "Service Mesh & Istio Specialist",
    category: "infra",
    layout: "mTLS Zero-Trust Envoy",
    description: "Envoy sidecar injection, progressive traffic shifting (canary/mirroring), circuit breaking, and strict mTLS encryption.",
    accentColor: "#466bb0",
    badge: "Service Mesh",
    rating: 4.8
  },
  {
    id: "infra-09",
    name: "Cloudflare Workers & Edge Lead",
    category: "infra",
    layout: "Sub-10ms Edge Compute",
    description: "Global edge logic, KV caching, Durable Objects, WebAssembly edge transforms, and hyper-localized API responses.",
    accentColor: "#f38020",
    badge: "Edge Compute",
    rating: 4.8
  },
  {
    id: "infra-10",
    name: "FinOps Cloud Cost Architect",
    category: "infra",
    layout: "Cloud Spend Stewardship",
    description: "Optimizing cloud infrastructure unit economics: spot instance fleets, right-sizing algorithms, and multi-million cloud budget cuts.",
    accentColor: "#10b981",
    badge: "FinOps Lead",
    rating: 4.9
  },
  {
    id: "infra-11",
    name: "Chaos Engineering Resiliency",
    category: "infra",
    layout: "Fault Injection Testing",
    description: "Proactive reliability verification: network partition injection, regional failover drills, and automated resilience verification.",
    accentColor: "#ef4444",
    badge: "Chaos Eng",
    rating: 4.8
  },
  {
    id: "infra-12",
    name: "Zero-Downtime Migration Lead",
    category: "infra",
    layout: "Strangler Fig Transition",
    description: "Migrating mission-critical legacy monoliths to modern cloud microservices using CDC replication and shadow traffic verification.",
    accentColor: "#3b82f6",
    badge: "Migration Pro",
    rating: 4.8
  },
  {
    id: "infra-13",
    name: "Network Engineer L4/L7",
    category: "infra",
    layout: "BGP Anycast & Hardware Load Balancing",
    description: "BGP route optimization, Anycast routing, global DNS failover, hardware load balancing, and high-throughput network firewalls.",
    accentColor: "#0284c7",
    badge: "Network Lead",
    rating: 4.7
  },
  {
    id: "infra-14",
    name: "Distributed Cache Architect",
    category: "infra",
    layout: "Redis Cluster & In-Memory Bandwidth",
    description: "In-memory caching architectures: cache-aside, write-through, cluster sharding, hotkey mitigation, and sub-millisecond retrieval.",
    accentColor: "#dc2626",
    badge: "Cache Systems",
    rating: 4.8
  },
  {
    id: "infra-15",
    name: "Automated CI/CD Pipeline Master",
    category: "infra",
    layout: "Trunk-Based Canary Rollouts",
    description: "High-velocity developer workflows: automated semantic versioning, hermetic container builds, and blue-green zero-downtime releases.",
    accentColor: "#16a34a",
    badge: "CI/CD Master",
    rating: 4.9
  },

  // ==========================================
  // Staff & Principal Leadership (10 Templates)
  // ==========================================
  {
    id: "lead-01",
    name: "Staff Software Engineer (L6)",
    category: "lead",
    layout: "Multi-Team Alignment",
    description: "Balances hands-on core system contributions with architectural direction and engineering culture leadership.",
    accentColor: "#0f172a",
    badge: "Staff L6",
    rating: 4.9
  },
  {
    id: "lead-02",
    name: "Senior Staff Engineer (L6.5)",
    category: "lead",
    layout: "Org-Wide Technical Strategy",
    description: "Architects technical foundations impacting 100+ developers, authoring corporate RFC standards and driving modernization pivots.",
    accentColor: "#1e293b",
    badge: "Senior Staff",
    rating: 5.0
  },
  {
    id: "lead-03",
    name: "Principal Software Engineer (L7)",
    category: "lead",
    layout: "Enterprise Architecture & Patents",
    description: "Guides multi-year architectural roadmaps, evaluates acquisitions, files foundational technology patents, and sets security policies.",
    accentColor: "#1e1b4b",
    badge: "Principal L7",
    rating: 5.0
  },
  {
    id: "lead-04",
    name: "Distinguished Engineer (L8)",
    category: "lead",
    layout: "Company-Defining Vision",
    description: "Industry-recognized thought leader steering company-level innovation, external technical partnerships, and high-impact breakthroughs.",
    accentColor: "#312e81",
    badge: "Distinguished",
    rating: 5.0
  },
  {
    id: "lead-05",
    name: "VP of Engineering & Architecture",
    category: "lead",
    layout: "Engineering Excellence & Scaling",
    description: "Executive leader running high-performing distributed engineering organizations across multiple time zones and business units.",
    accentColor: "#172554",
    badge: "VP Engineering",
    rating: 4.9
  },
  {
    id: "lead-06",
    name: "Director of Platform Engineering",
    category: "lead",
    layout: "Developer Velocity Foundations",
    description: "Focuses on internal platform adoption, developer productivity metrics (DORA), developer ergonomics, and cloud foundations.",
    accentColor: "#0c4a6e",
    badge: "Director Eng",
    rating: 4.8
  },
  {
    id: "lead-07",
    name: "Head of Infrastructure & Cloud",
    category: "lead",
    layout: "Global Datacenter Footprint",
    description: "Directs cloud infrastructure investments, vendor negotiations, disaster recovery governance, and 24/7/365 operational excellence.",
    accentColor: "#064e3b",
    badge: "Head of Infra",
    rating: 4.9
  },
  {
    id: "lead-08",
    name: "Chief Technology Architect",
    category: "lead",
    layout: "Digital Transformation & Future-Tech",
    description: "Bridges executive business goals with deep tech implementations, leading AI integration and legacy modernization roadmaps.",
    accentColor: "#451a03",
    badge: "Chief Architect",
    rating: 4.9
  },
  {
    id: "lead-09",
    name: "Tech Lead Manager (TLM)",
    category: "lead",
    layout: "Hybrid Technical & People Leadership",
    description: "Combines technical vision and sprint architecture with career coaching, performance management, and team retention.",
    accentColor: "#365314",
    badge: "TLM Lead",
    rating: 4.8
  },
  {
    id: "lead-10",
    name: "Fellow / Systems Pioneer",
    category: "lead",
    layout: "Foundational Standards & Protocols",
    description: "For technical fellows and standard committee authors who shaped modern protocols, distributed consensus, or operating systems.",
    accentColor: "#022c22",
    badge: "Tech Fellow",
    rating: 5.0
  },
// 1. ATS-Friendly (10)
  {
    id: "ats-01",
    name: "Classic ATS Standard",
    category: "ats",
    layout: "Single Column Linear",
    description: "Standard single column hierarchy optimized for machine parsers and enterprise ATS gates.",
    accentColor: "#1e293b",
    badge: "Most Popular",
    rating: 4.9
  },
  {
    id: "ats-02",
    name: "ATS Executive Corporate",
    category: "ats",
    layout: "Linear Bordered",
    description: "Refined linear structure with formal borders and clear section dividers.",
    accentColor: "#0f172a",
    badge: "ATS Gold",
    rating: 4.8
  },
  {
    id: "ats-03",
    name: "ATS Clean Compact",
    category: "ats",
    layout: "High Density Linear",
    description: "Dense information density designed for experienced professionals with long project histories.",
    accentColor: "#334155",
    badge: "High Density",
    rating: 4.7
  },
  {
    id: "ats-04",
    name: "ATS Harvard Standard",
    category: "ats",
    layout: "Academic Ivy League",
    description: "Academic and traditional layout inspired by Ivy League career services guidelines.",
    accentColor: "#475569",
    badge: "Academic",
    rating: 4.9
  },
  {
    id: "ats-05",
    name: "ATS Simple Elegant",
    category: "ats",
    layout: "Streamlined Linear",
    description: "Uncluttered layout with bold headers and streamlined bullet points.",
    accentColor: "#0284c7",
    badge: "Clean",
    rating: 4.7
  },
  {
    id: "ats-06",
    name: "ATS Monochrome Precision",
    category: "ats",
    layout: "Pure Black & White",
    description: "Strict black & white formatting guaranteed 100% parse-rate across legacy HR systems.",
    accentColor: "#000000",
    badge: "100% Parsing",
    rating: 4.8
  },
  {
    id: "ats-07",
    name: "ATS Skyline Corporate",
    category: "ats",
    layout: "Horizontal Divider",
    description: "Sleek horizontal divider bands with strong date and location alignment.",
    accentColor: "#1d4ed8",
    badge: "Corporate",
    rating: 4.7
  },
  {
    id: "ats-08",
    name: "ATS Oxford Classic",
    category: "ats",
    layout: "Classic Serif Linear",
    description: "Serif-accented traditional format ideal for finance, legal, and consulting sectors.",
    accentColor: "#1e3a8a",
    badge: "Finance/Legal",
    rating: 4.8
  },
  {
    id: "ats-09",
    name: "ATS Prime Hybrid",
    category: "ats",
    layout: "Modernized Linear",
    description: "Subtle modern touches while strictly adhering to flat DOM hierarchy for screen readers.",
    accentColor: "#0369a1",
    badge: "Verified",
    rating: 4.9
  },
  {
    id: "ats-10",
    name: "ATS Metro Linear",
    category: "ats",
    layout: "Left-Aligned Structured",
    description: "Clean left-aligned metadata with bulleted achievements and distinct skill pills.",
    accentColor: "#0f766e",
    badge: "Streamlined",
    rating: 4.6
  },

  // 2. Modern Professional (10)
  {
    id: "modern-01",
    name: "Apex Modern Blue",
    category: "modern",
    layout: "Header Banner + Grid",
    description: "Dynamic two-column header with polished contact chips and dual-tone skill badges.",
    accentColor: "#0284c7",
    badge: "Featured",
    rating: 5.0
  },
  {
    id: "modern-02",
    name: "Emerald Horizon",
    category: "modern",
    layout: "Contemporary Grid",
    description: "Rich emerald styling paired with contemporary grid structure and clean timelines.",
    accentColor: "#059669",
    badge: "Modern",
    rating: 4.8
  },
  {
    id: "modern-03",
    name: "Slate Prestige",
    category: "modern",
    layout: "Two-Column Sidebar",
    description: "Balanced two-column layout featuring a left sidebar for skills, education, and credentials.",
    accentColor: "#334155",
    badge: "Sidebar Grid",
    rating: 4.9
  },
  {
    id: "modern-04",
    name: "Violet Vanguard",
    category: "modern",
    layout: "Accent Border",
    description: "Contemporary violet accents with crisp typography and subtle badge borders.",
    accentColor: "#7c3aed",
    badge: "Tech Pro",
    rating: 4.7
  },
  {
    id: "modern-05",
    name: "Indigo Executive",
    category: "modern",
    layout: "Two-Column Split",
    description: "Sophisticated deep indigo theme with structured sections and highlighted milestones.",
    accentColor: "#4338ca",
    badge: "Popular",
    rating: 4.9
  },
  {
    id: "modern-06",
    name: "Teal Matrix",
    category: "modern",
    layout: "Linear Accent Bar",
    description: "Refreshing teal accenting with compact section chips and clean line breaks.",
    accentColor: "#0d9488",
    badge: "Fresh",
    rating: 4.6
  },
  {
    id: "modern-07",
    name: "Charcoal Horizon",
    category: "modern",
    layout: "Bold Dark Header",
    description: "Bold dark title band with light body background for maximum contrast.",
    accentColor: "#18181b",
    badge: "Bold Header",
    rating: 4.8
  },
  {
    id: "modern-08",
    name: "Cobalt Impact",
    category: "modern",
    layout: "Structured Cards",
    description: "Energetic cobalt blue markers and structured two-tone experience cards.",
    accentColor: "#2563eb",
    badge: "Impact",
    rating: 4.7
  },
  {
    id: "modern-09",
    name: "Nordic Minimal",
    category: "modern",
    layout: "Spacious Two-Column",
    description: "Scandinavian-inspired layout with generous whitespace and understated elegance.",
    accentColor: "#4b5563",
    badge: "Nordic",
    rating: 4.8
  },
  {
    id: "modern-10",
    name: "Sapphire Edge",
    category: "modern",
    layout: "Vertical Timeline Rule",
    description: "Sharp vertical accent line tying together chronological milestones seamlessly.",
    accentColor: "#1d4ed8",
    badge: "Timeline",
    rating: 4.9
  },

  // 3. Minimalist (10)
  {
    id: "minimalist-01",
    name: "Pure White Clean",
    category: "minimalist",
    layout: "Uncluttered Sans",
    description: "Maximum readability, disciplined margins, and understated typography.",
    accentColor: "#18181b",
    badge: "Minimalist",
    rating: 4.9
  },
  {
    id: "minimalist-02",
    name: "Monotype Swiss",
    category: "minimalist",
    layout: "Swiss Typographic Style",
    description: "Inspired by the International Typographic Style with strict grid alignment.",
    accentColor: "#27272a",
    badge: "Swiss Style",
    rating: 4.8
  },
  {
    id: "minimalist-03",
    name: "Soft Graphite",
    category: "minimalist",
    layout: "Warm Neutral",
    description: "Warm neutral graphite palette that is effortless to read on both screen and paper.",
    accentColor: "#3f3f46",
    badge: "Warm Grey",
    rating: 4.7
  },
  {
    id: "minimalist-04",
    name: "Airy Horizon",
    category: "minimalist",
    layout: "Generous Line-Height",
    description: "Generous line heights and subtle divider rules for effortless scanning.",
    accentColor: "#52525b",
    badge: "Airy",
    rating: 4.7
  },
  {
    id: "minimalist-05",
    name: "Zenith Mono",
    category: "minimalist",
    layout: "Technical Compact",
    description: "Focused header with compact metadata, ideal for technical and analytical fields.",
    accentColor: "#18181b",
    badge: "Compact",
    rating: 4.8
  },
  {
    id: "minimalist-06",
    name: "Linear Ghost",
    category: "minimalist",
    layout: "Hairline Guides",
    description: "Faint horizontal hairline guides separating distinct career stages.",
    accentColor: "#71717a",
    badge: "Subtle",
    rating: 4.6
  },
  {
    id: "minimalist-07",
    name: "Paper Craft",
    category: "minimalist",
    layout: "Editorial Serif/Sans",
    description: "Tactile editorial styling featuring classic serifs for names and modern sans for body text.",
    accentColor: "#262626",
    badge: "Editorial",
    rating: 4.8
  },
  {
    id: "minimalist-08",
    name: "Essential Light",
    category: "minimalist",
    layout: "Distraction Free",
    description: "No distractions, strictly content-focused layout that recruiters love for quick audits.",
    accentColor: "#171717",
    badge: "Essential",
    rating: 4.9
  },
  {
    id: "minimalist-09",
    name: "Quiet Echo",
    category: "minimalist",
    layout: "Indented Bullet Blocks",
    description: "Calm grey tones with indented bullet blocks for clear visual hierarchy.",
    accentColor: "#525252",
    badge: "Clean",
    rating: 4.7
  },
  {
    id: "minimalist-10",
    name: "Crisp Monochrome",
    category: "minimalist",
    layout: "High-Contrast Linear",
    description: "High contrast pure black and white without any decorative fluff.",
    accentColor: "#000000",
    badge: "High Contrast",
    rating: 4.9
  },

  // 4. Student / Fresher (5)
  {
    id: "student-01",
    name: "Campus Starter",
    category: "student",
    layout: "Academics-First",
    description: "Prioritizes Education, Projects, and Internships above work experience.",
    accentColor: "#2563eb",
    badge: "Entry Level",
    rating: 4.8
  },
  {
    id: "student-02",
    name: "Scholar Academy",
    category: "student",
    layout: "GPA & Honors Focus",
    description: "Academic layout highlighting GPA, coursework, honors, and club leadership.",
    accentColor: "#0891b2",
    badge: "Academics",
    rating: 4.7
  },
  {
    id: "student-03",
    name: "Graduate Launchpad",
    category: "student",
    layout: "Skills & Bootcamp",
    description: "Dynamic skills-forward format designed to showcase technical self-learning and bootcamps.",
    accentColor: "#4f46e5",
    badge: "Bootcamp",
    rating: 4.9
  },
  {
    id: "student-04",
    name: "Internship Pro",
    category: "student",
    layout: "Co-op & Internships",
    description: "Balanced split showing coursework alongside summer internships and project deliverables.",
    accentColor: "#059669",
    badge: "Internship",
    rating: 4.7
  },
  {
    id: "student-05",
    name: "Fellowship Scholar",
    category: "student",
    layout: "Research & Grants",
    description: "Polished design for fellowships, research grants, and university degree programs.",
    accentColor: "#0284c7",
    badge: "Scholar",
    rating: 4.8
  },

  // 5. Software Developer (5)
  {
    id: "developer-01",
    name: "Full Stack Terminal",
    category: "developer",
    layout: "Terminal & Repos",
    description: "Code-inspired typography with explicit GitHub/Live links and categorized tech stacks.",
    accentColor: "#0284c7",
    badge: "Full Stack",
    rating: 5.0
  },
  {
    id: "developer-02",
    name: "DevOps & Cloud Engineer",
    category: "developer",
    layout: "Infrastructure Stack",
    description: "Structured architecture layout with dedicated sections for cloud tools, CI/CD, and metrics.",
    accentColor: "#0d9488",
    badge: "Cloud/DevOps",
    rating: 4.8
  },
  {
    id: "developer-03",
    name: "Frontend Specialist",
    category: "developer",
    layout: "Component View",
    description: "Modern component-oriented layout highlighting UI frameworks and interactive live demos.",
    accentColor: "#7c3aed",
    badge: "Frontend",
    rating: 4.9
  },
  {
    id: "developer-04",
    name: "Backend Architect",
    category: "developer",
    layout: "System Throughput",
    description: "System design oriented structure highlighting throughput, database scaling, and APIs.",
    accentColor: "#1e293b",
    badge: "Backend",
    rating: 4.8
  },
  {
    id: "developer-05",
    name: "Systems & Embedded Tech",
    category: "developer",
    layout: "Low-Level Performance",
    description: "Highlights hardware interfaces, C/C++/Rust benchmarks, memory optimization, and RTOS.",
    accentColor: "#4338ca",
    badge: "Systems",
    rating: 4.9
  },
  {
    id: "developer-06",
    name: "Full-Stack Microservices Lead",
    category: "developer",
    layout: "NestJS & React Server Components",
    description: "Modern JavaScript/TypeScript stack showcasing Next.js App Router, React Server Components, tRPC, and GraphQL APIs.",
    accentColor: "#0ea5e9",
    badge: "Full Stack Lead",
    rating: 4.8
  },
  {
    id: "developer-07",
    name: "iOS / Swift Core Specialist",
    category: "developer",
    layout: "SwiftUI & Metal Native",
    description: "Dedicated to iOS ecosystems: SwiftUI, Combine, Swift Concurrency, Core Data, App Clip optimizations, and Metal shaders.",
    accentColor: "#f97316",
    badge: "iOS Specialist",
    rating: 4.8
  },
  {
    id: "developer-08",
    name: "Android / Kotlin Systems Lead",
    category: "developer",
    layout: "Jetpack Compose & NDK Native",
    description: "Android platform excellence: Jetpack Compose, Kotlin Coroutines, Flow, Hilt dependency injection, and Android NDK performance.",
    accentColor: "#22c55e",
    badge: "Android Lead",
    rating: 4.8
  },
  {
    id: "developer-09",
    name: "Web3 & Smart Contract Auditor",
    category: "developer",
    layout: "Solidity & Rust Zero-Knowledge",
    description: "High-security smart contracts, formal verification, gas optimization, ERC standards, and zero-knowledge proof verification.",
    accentColor: "#6366f1",
    badge: "Web3 Auditor",
    rating: 4.9
  },
  {
    id: "developer-10",
    name: "Embedded Firmware & IoT Engineer",
    category: "developer",
    layout: "FreeRTOS & ARM Cortex",
    description: "Low-power microcontrollers (STM32/ESP32), I2C/SPI/CAN protocols, hardware abstraction layers (HAL), and secure bootloaders.",
    accentColor: "#64748b",
    badge: "Embedded Lead",
    rating: 4.8
  },


  // 6. Data Analyst & Data Scientist (5)
  {
    id: "data-01",
    name: "Data Analyst Insights",
    category: "data",
    layout: "Metrics & Dashboards",
    description: "Puts SQL, Tableau, PowerBI, and quantitative business metrics front and center.",
    accentColor: "#0284c7",
    badge: "Data Analyst",
    rating: 4.9
  },
  {
    id: "data-02",
    name: "Quantitative Scientist",
    category: "data",
    layout: "Statistical Modeling",
    description: "Highlights statistical tests, Python/R predictive models, and experimental design.",
    accentColor: "#0f766e",
    badge: "Data Scientist",
    rating: 4.8
  },
  {
    id: "data-03",
    name: "Analytics Engineer",
    category: "data",
    layout: "ETL & Warehousing",
    description: "Focuses on dbt, Snowflake, BigQuery, Airflow, and reliable data pipelines.",
    accentColor: "#d97706",
    badge: "Analytics Eng",
    rating: 4.9
  },
  {
    id: "data-04",
    name: "Business Intelligence Pro",
    category: "data",
    layout: "KPI Scorecards",
    description: "Tailored for executive reporting, cross-functional analytics, and strategic ROI.",
    accentColor: "#2563eb",
    badge: "BI Pro",
    rating: 4.7
  },
  {
    id: "data-05",
    name: "Data Governance & Insights",
    category: "data",
    layout: "Compliance & Lineage",
    description: "Structured design for data stewards, pipeline architects, and quality assurance.",
    accentColor: "#475569",
    badge: "Data Quality",
    rating: 4.8
  },
  {
    id: "data-06",
    name: "Data Platform Architect",
    category: "data",
    layout: "Snowflake & dbt Pipelines",
    description: "Modern data stack: cloud data warehousing (Snowflake/BigQuery), modular dbt transformation models, and data observability.",
    accentColor: "#2563eb",
    badge: "Data Platform",
    rating: 4.9
  },
  {
    id: "data-07",
    name: "Business Intelligence & Tableau Lead",
    category: "data",
    layout: "Executive KPI Dashboards",
    description: "Executive reporting, semantic layer definitions, complex DAX calculations, and interactive decision-making dashboards.",
    accentColor: "#7c3aed",
    badge: "BI Lead",
    rating: 4.8
  },
  {
    id: "data-08",
    name: "Quantitative Risk & Fraud Analyst",
    category: "data",
    layout: "Anomaly Detection & Statistical Auditing",
    description: "Statistical anomaly detection, credit risk scorecards, AML compliance monitoring, and financial loss prevention algorithms.",
    accentColor: "#059669",
    badge: "Fraud Analyst",
    rating: 4.8
  },
  {
    id: "data-09",
    name: "Product Analytics & Growth Scientist",
    category: "data",
    layout: "A/B Experimentation & Funnels",
    description: "Designing rigorous randomized controlled trials (A/B tests), user cohort retention analysis, and product activation funnels.",
    accentColor: "#d97706",
    badge: "Growth Scientist",
    rating: 4.9
  },
  {
    id: "data-10",
    name: "Data Governance & Compliance Lead",
    category: "data",
    layout: "Data Mesh & Lineage Catalog",
    description: "Data mesh implementation, automated data lineage catalogs (Atlan/DataHub), GDPR/CCPA compliance, and access policies.",
    accentColor: "#475569",
    badge: "Governance",
    rating: 4.7
  },


  // 7. AI/ML Engineer (5)
  {
    id: "aiml-01",
    name: "Machine Learning Engineer",
    category: "aiml",
    layout: "Model Benchmarks",
    description: "Highlights PyTorch, TensorFlow models, training loss benchmarks, and inference latency.",
    accentColor: "#7c3aed",
    badge: "ML Engineer",
    rating: 5.0
  },
  {
    id: "aiml-02",
    name: "Generative AI Specialist",
    category: "aiml",
    layout: "LLMs & RAG Architectures",
    description: "Designed for prompt engineering, LangChain, vector DBs (Pinecone, Chroma), and agentic workflows.",
    accentColor: "#9333ea",
    badge: "GenAI Expert",
    rating: 4.9
  },
  {
    id: "aiml-03",
    name: "Computer Vision Researcher",
    category: "aiml",
    layout: "CV & Object Detection",
    description: "Showcases OpenCV, YOLO, diffusion models, and real-time video processing pipelines.",
    accentColor: "#0891b2",
    badge: "Vision AI",
    rating: 4.8
  },
  {
    id: "aiml-04",
    name: "NLP & Speech Architect",
    category: "aiml",
    layout: "Transformers & Acoustic",
    description: "Focuses on BERT, Whisper, fine-tuning techniques, tokenizers, and multilingual NLP.",
    accentColor: "#4f46e5",
    badge: "NLP Specialist",
    rating: 4.9
  },
  {
    id: "aiml-05",
    name: "MLOps Production Lead",
    category: "aiml",
    layout: "Kubeflow & Registry",
    description: "Highlights MLflow, Triton, model registries, drift monitoring, and Dockerized inference.",
    accentColor: "#059669",
    badge: "MLOps Lead",
    rating: 4.8
  },
  {
    id: "aiml-06",
    name: "Multimodal GenAI Engineer",
    category: "aiml",
    layout: "Vision-Language Models & Diffusion",
    description: "Generative image/video synthesis, stable diffusion pipelines, cross-attention conditioning, and CLIP embedding alignment.",
    accentColor: "#8b5cf6",
    badge: "Multimodal",
    rating: 4.9
  },
  {
    id: "aiml-07",
    name: "LLM Fine-Tuning & Alignment Specialist",
    category: "aiml",
    layout: "LoRA, DPO & Quantization AWQ",
    description: "Domain adaptation of open-source LLMs: parameter-efficient fine-tuning (PEFT/LoRA), Direct Preference Optimization (DPO), and 4-bit AWQ.",
    accentColor: "#ec4899",
    badge: "LLM Alignment",
    rating: 5.0
  },
  {
    id: "aiml-08",
    name: "Computer Vision & Autonomous Systems",
    category: "aiml",
    layout: "Real-Time Object Detection & NeRFs",
    description: "Real-time perception algorithms: YOLOv10/RT-DETR, semantic 3D point cloud segmentation, sensor fusion (LiDAR/Radar), and NeRFs.",
    accentColor: "#06b6d4",
    badge: "Vision Specialist",
    rating: 4.8
  },
  {
    id: "aiml-09",
    name: "Robotics & Embodied AI Engineer",
    category: "aiml",
    layout: "ROS2, PyBullet & Imitation Learning",
    description: "Physical AI and robotic manipulation: ROS2 navigation stacks, imitation learning from human demonstration, and sim-to-real transfer.",
    accentColor: "#f59e0b",
    badge: "Robotics AI",
    rating: 4.9
  },
  {
    id: "aiml-10",
    name: "Edge AI & Mobile Inference Lead",
    category: "aiml",
    layout: "ONNX Runtime & CoreML",
    description: "On-device AI deployment: neural network pruning, INT8 quantization, Apple Neural Engine (ANE) acceleration, and ONNX pipelines.",
    accentColor: "#10b981",
    badge: "Edge AI",
    rating: 4.8
  },


  // 8. Executive & Leadership (5)
  {
    id: "executive-01",
    name: "Chief Executive",
    category: "executive",
    layout: "Authoritative Header",
    description: "Authoritative header, executive summary prominence, and corporate governance focus.",
    accentColor: "#0f172a",
    badge: "C-Level",
    rating: 4.9
  },
  {
    id: "executive-02",
    name: "Director of Product",
    category: "executive",
    layout: "Product Roadmap Focus",
    description: "Highlights roadmap execution, cross-functional squad leadership, and ARR growth.",
    accentColor: "#1e3a8a",
    badge: "Product Lead",
    rating: 4.8
  },
  {
    id: "executive-03",
    name: "VP of Engineering",
    category: "executive",
    layout: "Engineering Leadership",
    description: "Strategic engineering management, organizational scaling, and budget management.",
    accentColor: "#1e293b",
    badge: "VP Level",
    rating: 4.9
  },
  {
    id: "executive-04",
    name: "Strategic Consultant",
    category: "executive",
    layout: "Case Engagement",
    description: "Consulting pedigree format with case engagement highlights and client impact metrics.",
    accentColor: "#334155",
    badge: "Consulting",
    rating: 4.7
  },
  {
    id: "executive-05",
    name: "Operations Leader",
    category: "executive",
    layout: "Operational Velocity",
    description: "Operational velocity, global team management, and fiscal efficiency tracking.",
    accentColor: "#064e3b",
    badge: "Operations",
    rating: 4.8
  },

  // 9. Creative & Designer (5)
  {
    id: "creative-01",
    name: "Product Designer UI/UX",
    category: "creative",
    layout: "Design Portfolio Chips",
    description: "Sleek typography, portfolio links, and design system proficiencies front and center.",
    accentColor: "#ec4899",
    badge: "Design Pro",
    rating: 4.9
  },
  {
    id: "creative-02",
    name: "Creative Director",
    category: "creative",
    layout: "Bold Visual Hierarchy",
    description: "Striking visual hierarchy with bold header typography and awards showcase.",
    accentColor: "#8b5cf6",
    badge: "Creative",
    rating: 4.8
  },
  {
    id: "creative-03",
    name: "Brand Strategist",
    category: "creative",
    layout: "Editorial Palette",
    description: "Warm modern aesthetics crafted for marketers, copywriters, and branding specialists.",
    accentColor: "#f59e0b",
    badge: "Branding",
    rating: 4.7
  },
  {
    id: "creative-04",
    name: "Multimedia Producer",
    category: "creative",
    layout: "Studio Grid",
    description: "Displays production tools, studio campaigns, and client collaborations cleanly.",
    accentColor: "#06b6d4",
    badge: "Multimedia",
    rating: 4.8
  },
  {
    id: "creative-05",
    name: "Architectural Studio",
    category: "creative",
    layout: "Spatial Balance",
    description: "Geometric precision, balanced proportioning, and spatial harmony in typography.",
    accentColor: "#0f766e",
    badge: "Studio",
    rating: 4.9
  },

  // 10. Business Professional (5)
  {
    id: "business-01",
    name: "Corporate Strategist",
    category: "business",
    layout: "Executive Brief",
    description: "Polished structure ideal for finance, operations, business development, and strategy.",
    accentColor: "#1e3a8a",
    badge: "Strategy",
    rating: 4.9
  },
  {
    id: "business-02",
    name: "Project & Program Lead",
    category: "business",
    layout: "PMP & Agile Delivery",
    description: "Highlights milestone delivery, stakeholder management, Gantt timelines, and budget stewardship.",
    accentColor: "#047857",
    badge: "Project Lead",
    rating: 4.8
  },
  {
    id: "business-03",
    name: "Financial Analyst",
    category: "business",
    layout: "Fiscal Modeling",
    description: "Dedicated to financial modeling, forecasting, risk management, and SEC compliance.",
    accentColor: "#0f172a",
    badge: "Finance Pro",
    rating: 4.9
  },
  {
    id: "business-04",
    name: "Marketing & Growth Director",
    category: "business",
    layout: "Customer Acquisition",
    description: "Emphasizes CAC, LTV, multi-channel campaigns, SEO/SEM, and product-led growth.",
    accentColor: "#c026d3",
    badge: "Growth Lead",
    rating: 4.8
  },
  {
    id: "business-05",
    name: "Human Capital & Talent",
    category: "business",
    layout: "HR & Culture",
    description: "Structured for talent acquisition, culture development, onboarding, and employee retention.",
    accentColor: "#0284c7",
    badge: "Talent Pro",
    rating: 4.7
  }
];

export const TOTAL_TEMPLATES_COUNT = TEMPLATES.length; // 120 genuinely distinct templates!
