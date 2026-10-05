export type MarketingCategory = 'platform' | 'solutions' | 'resources' | 'company';

export interface MarketingPageFeature {
  title: string;
  description: string;
}

export interface MarketingPageStat {
  value: string;
  label: string;
}

export interface MarketingPageContent {
  category: MarketingCategory;
  slug: string;
  title: string;
  eyebrow: string;
  tagline: string;
  intro: string;
  features: MarketingPageFeature[];
  highlights: string[];
  stats?: MarketingPageStat[];
}

const categoryLabels: Record<MarketingCategory, string> = {
  platform: 'Platform',
  solutions: 'Solutions',
  resources: 'Resources',
  company: 'Company',
};

export function getMarketingCategoryLabel(category: MarketingCategory): string {
  return categoryLabels[category];
}

export function marketingPagePath(category: MarketingCategory, slug: string): string {
  return `/${category}/${slug}`;
}

function page(
  data: Omit<MarketingPageContent, 'category'> & { category: MarketingCategory },
): MarketingPageContent {
  return data;
}

export const marketingPages: MarketingPageContent[] = [
  page({
    category: 'platform',
    slug: 'process-management',
    title: 'Process Management',
    eyebrow: 'Core Modules',
    tagline: 'Design, deploy, and improve processes with full traceability.',
    intro:
      'Daros gives teams a single place to map workflows, assign ownership, and measure how work actually flows—from intake to closure—without spreadsheets or disconnected tools.',
    features: [
      {
        title: 'Visual process maps',
        description: 'Document steps, roles, and handoffs so everyone shares the same operational picture.',
      },
      {
        title: 'Live status tracking',
        description: 'See bottlenecks and overdue stages before they become audit findings or customer issues.',
      },
      {
        title: 'Version-controlled SOPs',
        description: 'Link procedures to processes so updates roll out with approval and read-and-understand records.',
      },
    ],
    highlights: [
      'Align ISO clauses to process owners in minutes',
      'Trigger tasks when a stage changes or a KPI slips',
      'Export process registers for management review',
    ],
    stats: [
      { value: '40%', label: 'Faster process documentation' },
      { value: '1', label: 'Source of truth for workflows' },
    ],
  }),
  page({
    category: 'platform',
    slug: 'document-management',
    title: 'Document Management',
    eyebrow: 'Core Modules',
    tagline: 'Controlled documents, approvals, and distribution—built for audits.',
    intro:
      'Centralise policies, work instructions, and records with revision history, access rules, and automated reminders so your document register always matches what people use on the floor.',
    features: [
      {
        title: 'Structured document register',
        description: 'Filter by type, status, owner, and effective date in a register designed for assessors.',
      },
      {
        title: 'Approval workflows',
        description: 'Route drafts through review, approval, and publication with a complete audit trail.',
      },
      {
        title: 'Controlled distribution',
        description: 'Ensure the right version reaches the right sites and roles—with acknowledgement tracking.',
      },
    ],
    highlights: [
      'Word and PDF preview without leaving the platform',
      'Obsolescence and review cycles you can trust',
      'Integrates with nonconformities and CAPA',
    ],
    stats: [
      { value: '100%', label: 'Revision history retained' },
      { value: '24/7', label: 'Access to approved docs' },
    ],
  }),
  page({
    category: 'platform',
    slug: 'risk-management',
    title: 'Risk Management',
    eyebrow: 'Core Modules',
    tagline: 'Identify, score, and treat risks across the organisation.',
    intro:
      'Move from static risk registers to living risk data connected to processes, suppliers, and incidents—so leadership sees what matters before it escalates.',
    features: [
      {
        title: 'Risk registers & matrices',
        description: 'Use consistent likelihood and impact scales with heat maps your board will understand.',
      },
      {
        title: 'Treatment plans',
        description: 'Assign actions, due dates, and residual risk targets with automatic follow-up.',
      },
      {
        title: 'Context linking',
        description: 'Tie risks to assets, sites, and ISO requirements for clearer scope in audits.',
      },
    ],
    highlights: [
      'Reassess on a schedule or when context changes',
      'Export registers for insurance and certification bodies',
      'Connect risks to audits and NCs',
    ],
  }),
  page({
    category: 'platform',
    slug: 'audits',
    title: 'Audits',
    eyebrow: 'Core Modules',
    tagline: 'Plan internal audits, capture findings, and close the loop.',
    intro:
      'Schedule programmes by standard and site, assign auditors, record evidence on checklists, and raise nonconformities without re-keying data.',
    features: [
      {
        title: 'Audit programmes',
        description: 'Plan coverage across clauses, departments, and calendar years in one view.',
      },
      {
        title: 'Digital checklists',
        description: 'Standardise questions while allowing notes, photos, and linked documents.',
      },
      {
        title: 'Finding workflow',
        description: 'Promote observations to NCs with owners and due dates already attached.',
      },
    ],
    highlights: [
      'Track auditor competence and independence',
      'Management review packs in a few clicks',
      'Supports ISO 19011-style planning',
    ],
  }),
  page({
    category: 'platform',
    slug: 'nonconformities',
    title: 'Nonconformities',
    eyebrow: 'Compliance',
    tagline: 'Capture issues once and drive corrective action to closure.',
    intro:
      'From customer complaints to audit findings, manage nonconformities with root cause analysis, CAPA tasks, and effectiveness checks that auditors expect.',
    features: [
      {
        title: 'Structured NC records',
        description: 'Classify by source, severity, and standard clause with consistent coding.',
      },
      {
        title: 'CAPA tracking',
        description: 'Assign corrective and preventive actions with reminders and escalation.',
      },
      {
        title: 'Effectiveness verification',
        description: 'Document evidence that fixes worked before you close the record.',
      },
    ],
    highlights: [
      'Link NCs to documents, risks, and suppliers',
      'Trend analysis for recurring themes',
      'Ready for ISO corrective action clauses',
    ],
  }),
  page({
    category: 'platform',
    slug: 'supplier-management',
    title: 'Supplier Management',
    eyebrow: 'Compliance',
    tagline: 'Onboard, evaluate, and monitor third-party performance.',
    intro:
      'Maintain approved supplier lists, questionnaires, and scorecards so procurement and quality share one view of vendor compliance.',
    features: [
      {
        title: 'Supplier profiles',
        description: 'Store certifications, contacts, and scope of supply in searchable profiles.',
      },
      {
        title: 'Evaluation workflows',
        description: 'Run initial and periodic assessments with documented outcomes.',
      },
      {
        title: 'Performance monitoring',
        description: 'Track delivery, quality incidents, and audit results over time.',
      },
    ],
    highlights: [
      'Trigger re-approval when certificates expire',
      'Link supplier NCs to incoming inspection',
      'Supports ISO 9001 external provider controls',
    ],
  }),
  page({
    category: 'platform',
    slug: 'kpis-analytics',
    title: 'KPIs & Analytics',
    eyebrow: 'Compliance',
    tagline: 'Turn operational data into decisions leadership can act on.',
    intro:
      'Define KPIs aligned to objectives, capture data on a rhythm you choose, and visualise trends for management review—not just at certification time.',
    features: [
      {
        title: 'KPI library',
        description: 'Templates for quality, safety, environment, and custom business metrics.',
      },
      {
        title: 'Dashboards',
        description: 'Role-based views that highlight green, amber, and red performance.',
      },
      {
        title: 'Review-ready exports',
        description: 'Pull period summaries for meetings and ISO management review minutes.',
      },
    ],
    highlights: [
      'Connect KPIs to processes and objectives',
      'Automated reminders for data owners',
      'Spot drift before targets are missed',
    ],
  }),
  page({
    category: 'platform',
    slug: 'continual-improvement',
    title: 'Continual Improvement',
    eyebrow: 'Compliance',
    tagline: 'Capture ideas, prioritise initiatives, and prove progress.',
    intro:
      'Give every team a channel for improvement suggestions while leadership prioritises projects with clear benefits, owners, and measurable outcomes.',
    features: [
      {
        title: 'Improvement pipeline',
        description: 'Intake, triage, and approve ideas with transparent status.',
      },
      {
        title: 'Project tracking',
        description: 'Milestones, resources, and expected vs actual benefits in one place.',
      },
      {
        title: 'Lessons learned',
        description: 'Archive outcomes so good practices spread across sites.',
      },
    ],
    highlights: [
      'Supports ISO continual improvement clauses',
      'Link improvements to KPI movement',
      'Celebrate wins in management review',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'iso-9001',
    title: 'ISO 9001',
    eyebrow: 'By Standard',
    tagline: 'Quality management systems that stay audit-ready year-round.',
    intro:
      'Daros maps ISO 9001:2015 requirements to modules you already use—documents, risks, audits, and NCs—so certification supports daily work instead of slowing it down.',
    features: [
      {
        title: 'Clause-aligned structure',
        description: 'Navigate requirements with pre-built registers and evidence pointers.',
      },
      {
        title: 'Process approach',
        description: 'Connect customer focus, leadership, and performance evaluation in one system.',
      },
      {
        title: 'Certification support',
        description: 'Export packs that mirror what certification bodies ask for.',
      },
    ],
    highlights: [
      'Context of the organisation and interested parties',
      'Management review inputs built from live data',
      'Scales from SME to multi-site groups',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'iso-14001',
    title: 'ISO 14001',
    eyebrow: 'By Standard',
    tagline: 'Environmental management with measurable aspects and compliance.',
    intro:
      'Track environmental aspects, legal registers, objectives, and operational controls with the same rigour you apply to quality—without duplicate tools.',
    features: [
      {
        title: 'Aspects & impacts',
        description: 'Score significance and link controls to processes and documents.',
      },
      {
        title: 'Compliance obligations',
        description: 'Maintain legal and other requirements with review schedules.',
      },
      {
        title: 'Environmental KPIs',
        description: 'Monitor consumption, waste, and incident trends over time.',
      },
    ],
    highlights: [
      'Emergency preparedness linked to documents',
      'Life-cycle thinking in procurement workflows',
      'Integrated audits with QMS where needed',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'iso-45001',
    title: 'ISO 45001',
    eyebrow: 'By Standard',
    tagline: 'Occupational health and safety woven into operations.',
    intro:
      'Manage hazards, incidents, worker participation, and OH&S objectives alongside your existing compliance programme for a truly integrated IMS.',
    features: [
      {
        title: 'Hazard identification',
        description: 'Register hazards, controls, and residual risk at job and site level.',
      },
      {
        title: 'Incident management',
        description: 'Investigate events, track actions, and analyse trends.',
      },
      {
        title: 'Competence & awareness',
        description: 'Tie training records to roles and critical safety documents.',
      },
    ],
    highlights: [
      'Consultation and participation workflows',
      'Contractor and visitor safety alignment',
      'Ready for regulatory and ISO audits',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'iso-22000',
    title: 'ISO 22000',
    eyebrow: 'By Standard',
    tagline: 'Food safety management from hazard analysis to traceability.',
    intro:
      'Support HACCP plans, prerequisite programmes, and supplier controls with document control and NC workflows built for food and beverage operations.',
    features: [
      {
        title: 'HACCP documentation',
        description: 'Control plans, CCP monitoring, and verification records in one register.',
      },
      {
        title: 'Traceability support',
        description: 'Link batches, suppliers, and corrective actions when issues arise.',
      },
      {
        title: 'Allergen & labelling control',
        description: 'Keep specification documents under revision control.',
      },
    ],
    highlights: [
      'Aligns with Codex HACCP principles',
      'Works alongside ISO 9001 modules',
      'Audit trails for certification and customers',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'manufacturing',
    title: 'Manufacturing',
    eyebrow: 'By Industry',
    tagline: 'Quality and process control for production environments.',
    intro:
      'Daros helps manufacturers unify SOPs, calibration awareness, nonconforming product handling, and customer complaints—across lines and plants.',
    features: [
      {
        title: 'Shop-floor ready documents',
        description: 'Quick access to the latest work instructions at the point of use.',
      },
      {
        title: 'NC & scrap analysis',
        description: 'Trend defects by line, product, and root cause category.',
      },
      {
        title: 'Multi-site governance',
        description: 'Corporate standards with local adaptation where needed.',
      },
    ],
    highlights: [
      'PPAP and customer audit friendly exports',
      'Integrates with existing ERP data via API',
      'Supports IATF-aligned practices where applicable',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'food-beverage',
    title: 'Food & Beverage',
    eyebrow: 'By Industry',
    tagline: 'HACCP, hygiene, and supplier integrity in one platform.',
    intro:
      'From ingredient approval to release records, give quality and operations teams shared visibility for audits, customers, and regulators.',
    features: [
      {
        title: 'Sanitation & PRP docs',
        description: 'Controlled cleaning schedules and verification logs.',
      },
      {
        title: 'Supplier approval',
        description: 'Certificates, specs, and audit results on every vendor.',
      },
      {
        title: 'Recall readiness',
        description: 'Structured NC and traceability workflows when speed matters.',
      },
    ],
    highlights: [
      'Built for BRC, FSSC, and ISO 22000 programmes',
      'Mobile-friendly checklists on the floor',
      'Reduce paper during customer visits',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'professional-services',
    title: 'Professional Services',
    eyebrow: 'By Industry',
    tagline: 'Lightweight compliance for consultancies and service firms.',
    intro:
      'Implement ISO 9001 without enterprise overhead—document client deliverables, competence, and improvement in a system sized for SMEs.',
    features: [
      {
        title: 'Project-based workflows',
        description: 'Templates for proposals, delivery checklists, and sign-off.',
      },
      {
        title: 'Client feedback loops',
        description: 'Capture satisfaction and complaints as structured records.',
      },
      {
        title: 'Remote-friendly access',
        description: 'Cloud access for distributed teams and auditors.',
      },
    ],
    highlights: [
      'Fast onboarding for new consultants',
      'Clear evidence for ISO surveillance audits',
      'Affordable path to certification',
    ],
  }),
  page({
    category: 'solutions',
    slug: 'healthcare',
    title: 'Healthcare',
    eyebrow: 'By Industry',
    tagline: 'Safety and quality standards for care environments.',
    intro:
      'Support clinical and administrative processes with controlled policies, incident learning, and audit programmes tailored to healthcare governance.',
    features: [
      {
        title: 'Policy management',
        description: 'Ensure clinical and corporate policies stay current and acknowledged.',
      },
      {
        title: 'Incident & risk learning',
        description: 'Structured investigation with trend review for committees.',
      },
      {
        title: 'Accreditation prep',
        description: 'Evidence organised by standard and care pathway.',
      },
    ],
    highlights: [
      'Role-based access for sensitive records',
      'Supports CQC and ISO-aligned programmes',
      'Management review packs for boards',
    ],
  }),
  page({
    category: 'resources',
    slug: 'documentation',
    title: 'Documentation',
    eyebrow: 'Learn',
    tagline: 'Guides, playbooks, and API reference for your team.',
    intro:
      'Explore step-by-step guides for every module, administrator configuration notes, and developer documentation for integrations.',
    features: [
      {
        title: 'Module guides',
        description: 'Task-based articles from first login to advanced workflows.',
      },
      {
        title: 'Admin handbook',
        description: 'Users, permissions, branding, and backup best practices.',
      },
      {
        title: 'API reference',
        description: 'REST endpoints for documents, users, and webhooks.',
      },
    ],
    highlights: [
      'Searchable knowledge base structure',
      'Updated with each major release',
      'Sample payloads for faster integration',
    ],
  }),
  page({
    category: 'resources',
    slug: 'blog',
    title: 'Blog',
    eyebrow: 'Learn',
    tagline: 'Compliance insights, product news, and practitioner stories.',
    intro:
      'Read practical articles on ISO transitions, audit preparation, and how high-performing teams use integrated management systems.',
    features: [
      {
        title: 'Expert contributors',
        description: 'Quality managers, auditors, and Daros product specialists.',
      },
      {
        title: 'Topic deep dives',
        description: 'Risk-based thinking, document control myths, and KPI design.',
      },
      {
        title: 'Release notes in context',
        description: 'Understand why features ship and how to adopt them.',
      },
    ],
    highlights: [
      'Subscribe for monthly digest',
      'Shareable checklists and templates',
      'Comments open for community tips',
    ],
  }),
  page({
    category: 'resources',
    slug: 'webinars',
    title: 'Webinars',
    eyebrow: 'Learn',
    tagline: 'Live sessions and on-demand recordings.',
    intro:
      'Join product walkthroughs, ISO masterclasses, and customer panels—live or replay when it suits your schedule.',
    features: [
      {
        title: 'Live Q&A',
        description: 'Ask auditors and power users questions in real time.',
      },
      {
        title: 'Recording library',
        description: 'Filter by standard, module, and role.',
      },
      {
        title: 'Certificates of attendance',
        description: 'Document professional development for competence records.',
      },
    ],
    highlights: [
      'Monthly roadmap previews for customers',
      'Partner sessions on integrations',
      'Register once, join from any device',
    ],
  }),
  page({
    category: 'resources',
    slug: 'case-studies',
    title: 'Case Studies',
    eyebrow: 'Learn',
    tagline: 'How organisations achieve certification and scale with Daros.',
    intro:
      'See measurable outcomes—time saved on audits, reduced NC recurrence, and faster document cycles—from teams like yours.',
    features: [
      {
        title: 'Before & after metrics',
        description: 'Concrete numbers, not vague testimonials.',
      },
      {
        title: 'Implementation timelines',
        description: 'Learn realistic phases from kick-off to certification.',
      },
      {
        title: 'Role perspectives',
        description: 'Quality, operations, and IT views on the same project.',
      },
    ],
    highlights: [
      'Manufacturing, services, and food examples',
      'PDF summaries for internal buy-in',
      'Contact references for enterprise deals',
    ],
  }),
  page({
    category: 'resources',
    slug: 'help-centre',
    title: 'Help Centre',
    eyebrow: 'Support',
    tagline: 'Answers when you need them—searchable and up to date.',
    intro:
      'Find FAQs, troubleshooting steps, and configuration tips curated by our support team from real customer conversations.',
    features: [
      {
        title: 'Smart search',
        description: 'Jump straight to articles by error message or module name.',
      },
      {
        title: 'Guided fixes',
        description: 'Step-by-step flows for common setup and permission issues.',
      },
      {
        title: 'Contact options',
        description: 'Escalate to email or chat when you need a human.',
      },
    ],
    highlights: [
      'Available 24/7 for self-service',
      'Linked from in-app help menu',
      'SLA guidance for priority support tiers',
    ],
  }),
  page({
    category: 'resources',
    slug: 'community',
    title: 'Community',
    eyebrow: 'Support',
    tagline: 'Connect with practitioners implementing ISO in the real world.',
    intro:
      'Share templates, ask questions, and learn from other Daros users in a moderated space focused on compliance excellence.',
    features: [
      {
        title: 'Discussion forums',
        description: 'Topics by standard, industry, and module.',
      },
      {
        title: 'User groups',
        description: 'Regional meetups and virtual roundtables.',
      },
      {
        title: 'Champion programme',
        description: 'Recognise members who help others succeed.',
      },
    ],
    highlights: [
      'Staff moderators for accurate guidance',
      'Vote on feature ideas',
      'Networking for quality professionals',
    ],
  }),
  page({
    category: 'resources',
    slug: 'training',
    title: 'Training',
    eyebrow: 'Support',
    tagline: 'Onboarding paths and certification for administrators.',
    intro:
      'Structured learning tracks take new users from fundamentals to advanced configuration—with optional certification for system owners.',
    features: [
      {
        title: 'Role-based curricula',
        description: 'Paths for contributors, managers, and system administrators.',
      },
      {
        title: 'Interactive labs',
        description: 'Practice in a sandbox tenant without risking production data.',
      },
      {
        title: 'Daros certified admin',
        description: 'Badge and listing for partners and internal champions.',
      },
    ],
    highlights: [
      'Bulk enrolment for large rollouts',
      'Combine with live onboarding sessions',
      'Competence evidence for ISO training clauses',
    ],
  }),
  page({
    category: 'resources',
    slug: 'status',
    title: 'Status',
    eyebrow: 'Support',
    tagline: 'Real-time platform health and incident history.',
    intro:
      'Check uptime, subscribe to alerts, and review post-incident reports for transparency when systems matter to your audits and operations.',
    features: [
      {
        title: 'Service dashboard',
        description: 'Current status for app, API, and notifications.',
      },
      {
        title: 'Incident timeline',
        description: 'Root cause summaries and remediation steps.',
      },
      {
        title: 'Maintenance windows',
        description: 'Planned work announced in advance across regions.',
      },
    ],
    highlights: [
      'Email and webhook subscriptions',
      'Historical SLA reporting for enterprise',
      'Linked from admin notifications',
    ],
  }),
  page({
    category: 'company',
    slug: 'our-mission',
    title: 'Our Mission',
    eyebrow: 'About Daros',
    tagline: 'Make compliance a competitive advantage—not a paperwork tax.',
    intro:
      'We built Daros because quality and safety teams deserve software that matches the rigour they bring to their organisations every day.',
    features: [
      {
        title: 'Customer-first product',
        description: 'Roadmap decisions driven by practitioner feedback, not buzzwords.',
      },
      {
        title: 'Accessible IMS',
        description: 'Enterprise-grade control without enterprise complexity.',
      },
      {
        title: 'Long-term partnership',
        description: 'We grow when your certification and operations improve.',
      },
    ],
    highlights: [
      'Founded by compliance and software veterans',
      'HQ in Europe, customers worldwide',
      'Committed to data privacy and security',
    ],
  }),
  page({
    category: 'company',
    slug: 'core-values',
    title: 'Core Values',
    eyebrow: 'About Daros',
    tagline: 'Principles that guide how we build and support Daros.',
    intro:
      'Integrity, clarity, and respect for the auditor’s lens shape every feature we ship and every support conversation we have.',
    features: [
      {
        title: 'Integrity',
        description: 'Honest timelines, transparent pricing, and audit-ready product behaviour.',
      },
      {
        title: 'Clarity',
        description: 'Interfaces and language that busy operators understand instantly.',
      },
      {
        title: 'Continuous learning',
        description: 'We stay close to ISO evolution and customer industries.',
      },
    ],
    highlights: [
      'Diverse team across product, success, and compliance',
      'Open culture of feedback internally and externally',
      'Community contributions welcomed',
    ],
  }),
  page({
    category: 'company',
    slug: 'careers',
    title: 'Careers',
    eyebrow: 'About Daros',
    tagline: 'Help teams worldwide run better management systems.',
    intro:
      'Join a growing company where engineers, designers, and compliance specialists collaborate to simplify how organisations stay certified.',
    features: [
      {
        title: 'Remote-friendly roles',
        description: 'Work across Europe with periodic team gatherings.',
      },
      {
        title: 'Impact you can measure',
        description: 'See customers pass audits with software you helped build.',
      },
      {
        title: 'Learning budget',
        description: 'Courses, conferences, and certification for your growth.',
      },
    ],
    highlights: [
      'Open roles in engineering, design, and customer success',
      'Equity for early team members',
      'Inclusive hiring process',
    ],
  }),
  page({
    category: 'company',
    slug: 'contact',
    title: 'Contact',
    eyebrow: 'About Daros',
    tagline: 'Talk to sales, support, or partnerships.',
    intro:
      'Whether you are planning a demo, need help with your tenant, or want to explore integrations—we are ready to hear from you.',
    features: [
      {
        title: 'Sales enquiries',
        description: 'Demos, pricing, and multi-site deployments.',
      },
      {
        title: 'Customer support',
        description: 'Existing customers: priority channels in your admin panel.',
      },
      {
        title: 'Partnerships',
        description: 'Consultancies, auditors, and technology integrators.',
      },
    ],
    highlights: [
      'Response within one business day for sales',
      'Global time zone coverage expanding',
      'Visit our contact form on the home page',
    ],
  }),
  page({
    category: 'company',
    slug: 'product-updates',
    title: 'Product Updates',
    eyebrow: 'Roadmap',
    tagline: 'What shipped recently—and what is coming next.',
    intro:
      'Follow feature releases, improvements, and fixes so your administrators can plan training and change communication.',
    features: [
      {
        title: 'Release notes',
        description: 'Categorised by module with upgrade notes.',
      },
      {
        title: 'Preview features',
        description: 'Opt-in betas for selected tenants.',
      },
      {
        title: 'Deprecation notices',
        description: 'Advance warning for API and UI changes.',
      },
    ],
    highlights: [
      'Subscribe to changelog emails',
      'Quarterly roadmap webinars',
      'Customer advisory board input',
    ],
  }),
  page({
    category: 'company',
    slug: 'beta-programme',
    title: 'Beta Programme',
    eyebrow: 'Roadmap',
    tagline: 'Early access for teams who co-design the future of Daros.',
    intro:
      'Pilot customers test new modules and workflows before general availability—in exchange for direct influence on the roadmap.',
    features: [
      {
        title: 'Dedicated feedback channel',
        description: 'Weekly syncs with product during active pilots.',
      },
      {
        title: 'Sandbox tenants',
        description: 'Try features without impacting production registers.',
      },
      {
        title: 'Preferred pricing',
        description: 'Benefits for organisations that invest time in early testing.',
      },
    ],
    highlights: [
      'Limited slots per release cycle',
      'NDA available for sensitive industries',
      'Apply via Contact or your success manager',
    ],
  }),
  page({
    category: 'company',
    slug: 'partners',
    title: 'Partners',
    eyebrow: 'Roadmap',
    tagline: 'Consultancies, resellers, and technology alliances.',
    intro:
      'We work with ISO consultants and system integrators who implement Daros for their clients—with enablement, co-marketing, and deal support.',
    features: [
      {
        title: 'Partner portal',
        description: 'Assets, demo tenants, and registration flows.',
      },
      {
        title: 'Implementation kits',
        description: 'Templates that accelerate time-to-value.',
      },
      {
        title: 'Revenue share',
        description: 'Commercial models for referral and resale partners.',
      },
    ],
    highlights: [
      'Certified implementation partners listed publicly',
      'Joint customer success planning',
      'API partners for ERP and BI tools',
    ],
  }),
  page({
    category: 'company',
    slug: 'press',
    title: 'Press',
    eyebrow: 'Roadmap',
    tagline: 'News, brand assets, and media contacts.',
    intro:
      'Journalists and analysts can access logos, executive bios, and recent announcements about Daros and the compliance software market.',
    features: [
      {
        title: 'Media kit',
        description: 'Logos, colours, and product screenshots.',
      },
      {
        title: 'Press releases',
        description: 'Funding, partnerships, and major launches.',
      },
      {
        title: 'Spokesperson requests',
        description: 'Interviews on IMS trends and product direction.',
      },
    ],
    highlights: [
      'press@daros.example for enquiries',
      'Embargo-friendly briefings available',
      'Customer references by industry on request',
    ],
  }),
];

const pageMap = new Map<string, MarketingPageContent>(
  marketingPages.map((p) => [`${p.category}/${p.slug}`, p]),
);

export function getMarketingPage(
  category: string | undefined,
  slug: string | undefined,
): MarketingPageContent | undefined {
  if (!category || !slug) return undefined;
  return pageMap.get(`${category}/${slug}`);
}

export const marketingCategories: MarketingCategory[] = [
  'platform',
  'solutions',
  'resources',
  'company',
];

export function isMarketingCategory(value: string): value is MarketingCategory {
  return marketingCategories.includes(value as MarketingCategory);
}
