export type VaultiqDocument = {
  id: number
  title: string
  type: string
  source: string
  updated: string
  relevance: number
  tags: string[]
  agent: string
  summary: string
  fileSize?: number
  department?: string
}

// Placeholder dataset — swap this array for the real mock documents when provided.
export const DOCUMENTS: VaultiqDocument[] = [
  {
    id: 1,
    title: 'Security Architecture Overview',
    type: 'PDF',
    source: 'Confluence',
    updated: '2 days ago',
    relevance: 94,
    tags: ['Security', 'Engineering'],
    agent: 'Search Agent',
    summary:
      'The document describes the current zero-trust architecture, authentication flow, service boundaries, and internal security controls deployed across production environments.',
  },
  {
    id: 2,
    title: 'Infrastructure Security Guidelines',
    type: 'DOCX',
    source: 'SharePoint',
    updated: '5 days ago',
    relevance: 89,
    tags: ['Security', 'Infrastructure'],
    agent: 'Search Agent',
    summary:
      'Comprehensive guidelines for infrastructure security including network segmentation, access control policies, and vulnerability management procedures for cloud environments.',
  },
  {
    id: 3,
    title: 'Q4 Security Audit Report',
    type: 'PDF',
    source: 'Google Drive',
    updated: '2 weeks ago',
    relevance: 82,
    tags: ['Security', 'Finance', 'Compliance'],
    agent: 'Search Agent',
    summary:
      'Quarterly audit findings covering penetration testing results, remediation priorities, and compliance status against SOC2 and ISO 27001 frameworks.',
  },
  {
    id: 4,
    title: 'API Security Best Practices',
    type: 'Web page',
    source: 'Internal Wiki',
    updated: '1 month ago',
    relevance: 76,
    tags: ['Security', 'Engineering'],
    agent: 'Search Agent',
    summary:
      'Engineering reference covering OAuth 2.0 implementation, JWT validation, rate limiting strategies, and common API security vulnerabilities with mitigations.',
  },
  {
    id: 5,
    title: 'Zero Trust Network Policy',
    type: 'PPTX',
    source: 'Notion',
    updated: '3 weeks ago',
    relevance: 71,
    tags: ['Security', 'Product'],
    agent: 'Search Agent',
    summary:
      'Executive presentation outlining the zero trust network access strategy, implementation roadmap, vendor evaluation results, and projected security posture improvements.',
  },
]
