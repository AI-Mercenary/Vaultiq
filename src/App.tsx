import { useState } from 'react'

type Page = 'home' | 'results' | 'agents' | 'observability'
type Status = 'complete' | 'processing' | 'waiting' | 'slow' | 'error'

// ── Icons ─────────────────────────────────────────────────────────────────

function IconSearch({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="4.25" stroke={color} strokeWidth="1.5" />
      <path d="M10.5 10.5L13 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconDocument({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 2h6l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke={color} strokeWidth="1.5" />
      <path d="M10 2v3h3" stroke={color} strokeWidth="1.5" />
      <path d="M6 8h4M6 10.5h2.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function IconAgent({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="4" cy="8" r="1.75" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="8" r="1.75" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="4" r="1.75" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="12" r="1.75" stroke={color} strokeWidth="1.5" />
      <path d="M5.75 8h2.5M9.5 4h1.75M5.75 8H4" stroke={color} strokeWidth="1.25" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function IconChart({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 12.5l3.5-4.5 3 2.5 3.5-6 3 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconGear({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.5" />
      <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function IconBell({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2a5 5 0 00-5 5v2L2 11h12l-1-2V7a5 5 0 00-5-5z" stroke={color} strokeWidth="1.5" />
      <path d="M6.5 11.5a1.5 1.5 0 003 0" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function IconChevron({ size = 10, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M3.5 2.5l3 2.5-3 2.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrow({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 9.5l7-7M9.5 9V2.5H3" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconX({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconFilter({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
      <path d="M1.5 3h10M3.5 6.5h6M5.5 10h2" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

// ── Vaultiq Logo Mark ──────────────────────────────────────────────────────

function VaultLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2" y="4" width="17" height="17" rx="3.5" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="5" y="7" width="11" height="11" rx="2" stroke="#818cf8" strokeWidth="1" opacity="0.4" />
      <circle cx="10.5" cy="12.5" r="3" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M12.6 14.6L15 17" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 8h5M21 12h5M21 16h5" stroke="#818cf8" strokeWidth="1.25" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────

const DOCS = [
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

const PIPELINE = [
  {
    id: 'tag',
    name: 'Tag Generator Agent',
    status: 'complete' as Status,
    task: 'Classified 1,248 documents',
    processed: '1,248',
    confidence: '96.4%',
    latency: '420ms',
  },
  {
    id: 'search',
    name: 'Search Agent',
    status: 'processing' as Status,
    task: 'Retrieving semantic matches',
    processed: '1,248',
    confidence: '93.8%',
    latency: '1.2s',
  },
  {
    id: 'critique',
    name: 'Critique Agent',
    status: 'waiting' as Status,
    task: 'Awaiting search results',
    processed: '1,247',
    confidence: '—',
    latency: '—',
  },
]

const TRACES = [
  { id: 'tr-4829', agent: 'Search Agent', model: 'claude-sonnet-5', latency: '820ms', tokens: '1,240', cost: '$0.004', status: 'complete' as Status, ts: '14:32:01' },
  { id: 'tr-4828', agent: 'Critique Agent', model: 'claude-sonnet-5', latency: '1.1s', tokens: '1,840', cost: '$0.007', status: 'complete' as Status, ts: '14:32:02' },
  { id: 'tr-4827', agent: 'Tag Generator', model: 'claude-haiku-4-5', latency: '340ms', tokens: '820', cost: '$0.001', status: 'complete' as Status, ts: '14:31:58' },
  { id: 'tr-4826', agent: 'Search Agent', model: 'claude-sonnet-5', latency: '2.3s', tokens: '2,100', cost: '$0.008', status: 'slow' as Status, ts: '14:31:44' },
  { id: 'tr-4825', agent: 'Critique Agent', model: 'claude-sonnet-5', latency: '—', tokens: '—', cost: '—', status: 'error' as Status, ts: '14:31:30' },
]

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg: '#09090b',
  bg2: '#0d0d10',
  surface: '#111113',
  surface2: '#18181b',
  border: '#1f1f23',
  border2: '#27272a',
  indigo: '#6366f1',
  indigoDim: '#4f46e5',
  indigoGlow: 'rgba(99,102,241,0.12)',
  indigoRing: 'rgba(99,102,241,0.08)',
  indigoBorder: 'rgba(99,102,241,0.35)',
  text: '#f4f4f5',
  text2: '#e4e4e7',
  muted: '#a1a1aa',
  dim: '#71717a',
  faint: '#52525b',
  vfaint: '#3f3f46',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  mono: "'JetBrains Mono', monospace",
}

// ── Atoms ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    complete: C.green,
    processing: C.indigo,
    waiting: C.vfaint,
    slow: C.amber,
    error: C.red,
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: map[status],
        flexShrink: 0,
        animation: status === 'processing' ? 'pulse-dot 1.6s ease-in-out infinite' : 'none',
      }}
    />
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 4,
        border: `1px solid ${C.border2}`,
        color: C.dim,
        letterSpacing: '0.01em',
      }}
    >
      {label}
    </span>
  )
}

function RelevanceBadge({ score }: { score: number }) {
  const color = score >= 90 ? C.green : score >= 75 ? C.amber : C.muted
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 4,
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}30`,
        letterSpacing: '0.02em',
        fontFamily: C.mono,
      }}
    >
      {score}%
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 3,
        backgroundColor: C.surface2,
        color: C.faint,
        border: `1px solid ${C.border2}`,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
      }}
    >
      {type}
    </span>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────

const NAV: { id: Page; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
  { id: 'home', label: 'Search', Icon: IconSearch },
  { id: 'results', label: 'Documents', Icon: IconDocument },
  { id: 'agents', label: 'Agents', Icon: IconAgent },
  { id: 'observability', label: 'Observability', Icon: IconChart },
]

function Sidebar({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 56,
        backgroundColor: C.bg2,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 14,
        paddingBottom: 16,
        zIndex: 100,
      }}
    >
      <button
        onClick={() => onNav('home')}
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          marginBottom: 20,
        }}
        title="Vaultiq"
      >
        <VaultLogo size={26} />
      </button>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        {NAV.map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={label}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: active ? `1px solid ${C.indigoBorder}` : '1px solid transparent',
                backgroundColor: active ? C.indigoGlow : 'transparent',
                color: active ? '#818cf8' : C.faint,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: active ? '0 0 14px rgba(99,102,241,0.18)' : 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = C.surface2
                  el.style.color = C.muted
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = 'transparent'
                  el.style.color = C.faint
                }
              }}
            >
              <Icon size={16} color="currentColor" />
            </button>
          )
        })}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <button
          title="Settings"
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: C.faint,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = C.surface2
            el.style.color = C.muted
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = 'transparent'
            el.style.color = C.faint
          }}
        >
          <IconGear size={15} color="currentColor" />
        </button>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            border: `1.5px solid ${C.border2}`,
            letterSpacing: '0.02em',
          }}
        >
          JD
        </div>
      </div>
    </aside>
  )
}

// ── Top Bar ────────────────────────────────────────────────────────────────

const CRUMBS: Record<Page, string[]> = {
  home: ['Vaultiq'],
  results: ['Vaultiq', 'Search Results'],
  agents: ['Vaultiq', 'Agents'],
  observability: ['Vaultiq', 'Observability'],
}

function TopBar({ page }: { page: Page }) {
  const crumbs = CRUMBS[page]
  return (
    <header
      style={{
        height: 48,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 20,
        backgroundColor: C.bg,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {i > 0 && (
              <span style={{ color: C.vfaint, display: 'flex' }}>
                <IconChevron size={9} color={C.vfaint} />
              </span>
            )}
            <span
              style={{
                fontSize: 13,
                fontWeight: i === crumbs.length - 1 ? 500 : 400,
                color: i === crumbs.length - 1 ? C.text2 : C.faint,
              }}
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <kbd
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 9px',
            borderRadius: 5,
            border: `1px solid ${C.border2}`,
            backgroundColor: C.surface,
            fontSize: 11,
            color: C.faint,
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          <span>⌘</span>
          <span>K</span>
        </kbd>
        <button
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: `1px solid ${C.border2}`,
            backgroundColor: 'transparent',
            color: C.faint,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = C.surface2
            el.style.color = C.muted
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = 'transparent'
            el.style.color = C.faint
          }}
        >
          <IconBell size={14} color="currentColor" />
        </button>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          JD
        </div>
      </div>
    </header>
  )
}

// ── Home Page ──────────────────────────────────────────────────────────────

const RECENT = ['Q4 financial report', 'Security architecture', 'Employee onboarding', 'API documentation']
const SUGGESTED = [
  'Zero trust network policy',
  'Incident response playbook',
  'Data retention guidelines',
  'Engineering RFC template',
]

function HomePage({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)

  const submit = (val: string) => {
    if (val.trim()) onSearch(val.trim())
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 48px)',
        padding: '0 24px 80px',
      }}
    >
      {/* Identity */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <VaultLogo size={38} />
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: C.text,
            }}
          >
            Vaultiq
          </span>
        </div>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 600,
            letterSpacing: '-0.035em',
            color: C.text,
            margin: '0 0 14px',
            lineHeight: 1.12,
          }}
        >
          Search your enterprise knowledge.
        </h1>
        <p style={{ fontSize: 15, color: C.faint, margin: 0, fontWeight: 400 }}>
          Intelligent Enterprise Search — powered by multi-agent AI
        </p>
      </div>

      {/* Search */}
      <div style={{ width: '100%', maxWidth: 680, marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 16px',
            height: 54,
            borderRadius: 10,
            border: focused ? `1px solid ${C.indigoBorder}` : `1px solid ${C.border2}`,
            backgroundColor: C.surface,
            boxShadow: focused
              ? `0 0 0 3px ${C.indigoRing}, 0 2px 8px rgba(0,0,0,0.4)`
              : '0 1px 4px rgba(0,0,0,0.3)',
            transition: 'all 200ms ease',
          }}
        >
          <IconSearch size={17} color={focused ? C.indigo : C.faint} />
          <input
            type="text"
            placeholder="Search across your documents..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === 'Enter' && submit(q)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: C.text2,
              fontFamily: 'inherit',
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              color: C.faint,
              border: `1px solid ${C.border2}`,
              borderRadius: 4,
              padding: '2px 7px',
              fontFamily: 'inherit',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Recent */}
      <div style={{ width: '100%', maxWidth: 680, marginBottom: 28 }}>
        <p
          style={{
            fontSize: 11,
            color: C.faint,
            margin: '0 0 12px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Recent searches
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
          {RECENT.map(s => (
            <button
              key={s}
              onClick={() => submit(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface,
                color: C.muted,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = C.indigoBorder
                el.style.color = '#c4b5fd'
                el.style.backgroundColor = C.indigoGlow
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = C.border2
                el.style.color = C.muted
                el.style.backgroundColor = C.surface
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested */}
      <div style={{ width: '100%', maxWidth: 680 }}>
        <p
          style={{
            fontSize: 11,
            color: C.faint,
            margin: '0 0 8px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Suggested
        </p>
        {SUGGESTED.map((s, i) => (
          <button
            key={i}
            onClick={() => submit(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid transparent',
              backgroundColor: 'transparent',
              color: C.dim,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left' as const,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = C.surface
              el.style.color = C.muted
              el.style.borderColor = C.border
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = 'transparent'
              el.style.color = C.dim
              el.style.borderColor = 'transparent'
            }}
          >
            <IconSearch size={13} color="currentColor" />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Document Card ──────────────────────────────────────────────────────────

function DocCard({ doc, onOpen }: { doc: (typeof DOCS)[0]; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 20px',
        borderRadius: 8,
        border: `1px solid ${hovered ? C.indigoBorder : C.border}`,
        backgroundColor: hovered ? C.surface : '#0f0f12',
        cursor: 'pointer',
        transition: 'all 180ms ease',
        boxShadow: hovered ? `0 0 0 1px rgba(99,102,241,0.08), 0 4px 20px rgba(0,0,0,0.35)` : 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: C.surface2,
              border: `1px solid ${C.border2}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hovered ? C.indigo : C.faint,
              flexShrink: 0,
              transition: 'color 150ms',
            }}
          >
            <IconDocument size={15} color="currentColor" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.text2,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {doc.title}
              </span>
              <TypeBadge type={doc.type} />
            </div>
            <span style={{ fontSize: 12, color: C.faint }}>
              {doc.source} · Updated {doc.updated}
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 150ms',
          }}
        >
          <RelevanceBadge score={doc.relevance} />
          <span style={{ color: C.indigo, display: 'flex' }}>
            <IconArrow size={13} color="currentColor" />
          </span>
        </div>
      </div>

      {/* Summary */}
      <p
        style={{
          fontSize: 13,
          color: C.dim,
          lineHeight: 1.65,
          margin: '0 0 12px',
          paddingLeft: 42,
        }}
      >
        {doc.summary}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 42, flexWrap: 'wrap' as const }}>
        {doc.tags.map(t => (
          <Tag key={t} label={t} />
        ))}
        <span style={{ flex: 1 }} />
        {!hovered && <RelevanceBadge score={doc.relevance} />}
        <span style={{ fontSize: 11, color: C.vfaint }}>via {doc.agent}</span>
      </div>
    </div>
  )
}

// ── Document Drawer ────────────────────────────────────────────────────────

function DocDrawer({ doc, onClose }: { doc: (typeof DOCS)[0]; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.45)',
          animation: 'fade-in 150ms ease',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          backgroundColor: '#0f0f12',
          borderLeft: `1px solid ${C.border}`,
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 220ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' as const }}>
            {['Engineering', 'Security', 'Architecture', `${doc.title.toLowerCase().replace(/ /g, '-')}.pdf`].map(
              (crumb, i, arr) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: C.vfaint, fontSize: 11 }}>/</span>}
                  <span
                    style={{
                      fontSize: 11,
                      color: i === arr.length - 1 ? C.muted : C.faint,
                    }}
                  >
                    {crumb}
                  </span>
                </span>
              ),
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.text,
                  letterSpacing: '-0.015em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {doc.title}
              </span>
              <TypeBadge type={doc.type} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 5,
                  border: `1px solid ${C.border2}`,
                  backgroundColor: 'transparent',
                  color: C.muted,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = C.surface2
                  el.style.color = C.text2
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = 'transparent'
                  el.style.color = C.muted
                }}
              >
                <IconArrow size={11} color="currentColor" /> Open
              </button>
              <button
                onClick={onClose}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 5,
                  border: `1px solid ${C.border2}`,
                  backgroundColor: 'transparent',
                  color: C.faint,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = C.surface2
                  el.style.color = C.muted
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = 'transparent'
                  el.style.color = C.faint
                }}
              >
                <IconX size={12} color="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: C.text,
              margin: '0 0 14px',
              letterSpacing: '-0.02em',
            }}
          >
            {doc.title}
          </h2>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24, fontSize: 12, color: C.faint }}>
            <span>Last updated {doc.updated}</span>
            <span>Source: {doc.source}</span>
          </div>

          <section style={{ marginBottom: 22 }}>
            <h3
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.faint,
                margin: '0 0 10px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
              }}
            >
              Executive Summary
            </h3>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, margin: 0 }}>
              This document provides a comprehensive overview of the organization&apos;s security
              architecture, detailing the current zero-trust model, identity and access management
              strategy, and service mesh configuration across all production environments.
            </p>
          </section>

          <section style={{ marginBottom: 22 }}>
            <h3
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.faint,
                margin: '0 0 10px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
              }}
            >
              Zero-Trust Architecture
            </h3>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 6,
                backgroundColor: 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.22)',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#818cf8',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  Relevant passage · {doc.relevance}% match
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#c4b5fd', lineHeight: 1.75, margin: 0 }}>
                The zero-trust architecture enforces strict identity verification for every user and device
                attempting to access resources. Authentication flows through a centralized identity provider
                with mTLS for service-to-service communication and JWT tokens for API authorization.
              </p>
            </div>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, margin: 0 }}>
              Service boundaries are enforced through an Envoy-based service mesh with automatic
              certificate rotation every 24 hours. Network segmentation isolates production, staging, and
              development environments across separate VPCs with no direct cross-environment access.
            </p>
          </section>

          <section style={{ marginBottom: 22 }}>
            <h3
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.faint,
                margin: '0 0 10px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
              }}
            >
              Access Control Policies
            </h3>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              {[
                'Role-based access control with principle of least privilege',
                'Multi-factor authentication required for all administrative access',
                'Session tokens expire after 8 hours of inactivity',
                'All access events logged to immutable audit trail',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer metadata */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: `1px solid ${C.border}`,
            backgroundColor: C.bg2,
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: 18,
          }}
        >
          {[
            { label: 'Relevance', content: <RelevanceBadge score={doc.relevance} /> },
            { label: 'Source', content: <span style={{ fontSize: 12, color: C.muted }}>{doc.source}</span> },
            {
              label: 'Tags',
              content: (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                  {doc.tags.map(t => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
              ),
            },
            { label: 'Agent', content: <span style={{ fontSize: 12, color: C.muted }}>{doc.agent}</span> },
          ].map(({ label, content }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: C.faint,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase' as const,
                }}
              >
                {label}
              </span>
              {content}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Filter Sidebar ─────────────────────────────────────────────────────────

const FILTER_GROUPS: Record<string, string[]> = {
  'Document type': ['PDF', 'DOCX', 'PPTX', 'Spreadsheet', 'Web page'],
  Date: ['Today', 'Last 7 days', 'Last 30 days', 'Custom range'],
  Tags: ['Engineering', 'Security', 'Finance', 'HR', 'Product'],
  Source: ['Google Drive', 'Notion', 'SharePoint', 'Confluence', 'Internal Wiki'],
}

function FilterSidebar({
  active,
  onToggle,
}: {
  active: Set<string>
  onToggle: (f: string) => void
}) {
  const [open, setOpen] = useState(new Set(Object.keys(FILTER_GROUPS)))

  const toggle = (k: string) => {
    setOpen(prev => {
      const n = new Set(prev)
      n.has(k) ? n.delete(k) : n.add(k)
      return n
    })
  }

  return (
    <aside style={{ width: 196, padding: '20px 0', flexShrink: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 18,
          paddingLeft: 2,
        }}
      >
        <IconFilter size={12} color={C.faint} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: C.faint,
            letterSpacing: '0.07em',
            textTransform: 'uppercase' as const,
          }}
        >
          Filters
        </span>
      </div>

      {Object.entries(FILTER_GROUPS).map(([section, opts]) => (
        <div key={section} style={{ marginBottom: 2 }}>
          <button
            onClick={() => toggle(section)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 4px',
              border: 'none',
              background: 'transparent',
              color: C.muted,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {section}
            <span
              style={{
                display: 'inline-flex',
                transition: 'transform 150ms',
                transform: open.has(section) ? 'rotate(90deg)' : 'none',
                color: C.vfaint,
              }}
            >
              <IconChevron size={9} color="currentColor" />
            </span>
          </button>

          {open.has(section) && (
            <div style={{ paddingBottom: 8 }}>
              {opts.map(opt => (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 4px',
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active.has(opt)}
                    onChange={() => onToggle(opt)}
                    style={{ accentColor: C.indigo, width: 12, height: 12, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: active.has(opt) ? '#818cf8' : C.dim,
                      transition: 'color 120ms',
                    }}
                  >
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}

// ── Search Results Page ────────────────────────────────────────────────────

function ResultsPage({ query }: { query: string }) {
  const [filters, setFilters] = useState(new Set<string>())
  const [drawer, setDrawer] = useState<(typeof DOCS)[0] | null>(null)
  const [localQ, setLocalQ] = useState(query)
  const [focused, setFocused] = useState(false)

  const toggle = (f: string) => {
    setFilters(prev => {
      const n = new Set(prev)
      n.has(f) ? n.delete(f) : n.add(f)
      return n
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 48px)' }}>
      {/* Search header */}
      <div style={{ padding: '20px 28px 18px', borderBottom: `1px solid ${C.border}` }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: C.text,
            margin: '0 0 14px',
            letterSpacing: '-0.02em',
          }}
        >
          Search results
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 14px',
            height: 40,
            maxWidth: 600,
            borderRadius: 8,
            border: focused ? `1px solid ${C.indigoBorder}` : `1px solid ${C.border2}`,
            backgroundColor: C.surface,
            boxShadow: focused ? `0 0 0 3px ${C.indigoRing}` : 'none',
            transition: 'all 200ms ease',
            marginBottom: 10,
          }}
        >
          <IconSearch size={15} color={focused ? C.indigo : C.faint} />
          <input
            type="text"
            value={localQ}
            onChange={e => setLocalQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: C.text2,
              fontFamily: 'inherit',
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: C.faint, margin: 0 }}>
          <span style={{ color: C.muted, fontWeight: 500 }}>128 results</span>
          {' · Search completed in 1.8s'}
        </p>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ padding: '0 0 0 28px', borderRight: `1px solid ${C.border}` }}>
          <FilterSidebar active={filters} onToggle={toggle} />
        </div>
        <div style={{ flex: 1, padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DOCS.map(doc => (
            <DocCard key={doc.id} doc={doc} onOpen={() => setDrawer(doc)} />
          ))}
        </div>
      </div>

      {drawer && <DocDrawer doc={drawer} onClose={() => setDrawer(null)} />}
    </div>
  )
}

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent, index }: { agent: (typeof PIPELINE)[0]; index: number }) {
  const accent =
    agent.status === 'complete' ? C.green : agent.status === 'processing' ? C.indigo : C.vfaint
  const borderColor =
    agent.status === 'processing' ? C.indigoBorder : agent.status === 'complete' ? `${C.green}30` : C.border

  return (
    <div
      style={{
        flex: 1,
        padding: '22px',
        borderRadius: 10,
        border: `1px solid ${borderColor}`,
        backgroundColor: C.surface,
        boxShadow:
          agent.status === 'processing'
            ? '0 0 28px rgba(99,102,241,0.1)'
            : agent.status === 'complete'
              ? '0 0 16px rgba(34,197,94,0.04)'
              : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {agent.status === 'processing' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            right: '-100%',
            height: 1,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.7) 50%, transparent 100%)',
            animation: 'shimmer 2.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: C.surface2,
            border: `1px solid ${C.border2}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
          }}
        >
          <IconAgent size={16} color="currentColor" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={agent.status} />
          <span style={{ fontSize: 12, color: accent, fontWeight: 500 }}>
            {agent.status === 'complete' ? 'Complete' : agent.status === 'processing' ? 'Processing' : 'Waiting'}
          </span>
        </div>
      </div>

      {/* Name */}
      <div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
            margin: '0 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          {agent.name}
        </p>
        <p style={{ fontSize: 12, color: C.faint, margin: 0 }}>{agent.task}</p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { label: 'Processed', value: agent.processed },
          { label: 'Confidence', value: agent.confidence },
          { label: 'Latency', value: agent.latency },
          { label: 'Model', value: 'Sonnet 5' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p
              style={{
                fontSize: 9,
                color: C.faint,
                margin: '0 0 4px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                margin: 0,
                color: value === '—' ? C.vfaint : C.text2,
                fontFamily: C.mono,
                letterSpacing: '-0.02em',
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Agents Page ────────────────────────────────────────────────────────────

const ACTIVITY = [
  { ts: '14:32:01', agent: 'Search Agent', event: 'Retrieved 128 documents for query "security architecture"', status: 'complete' as Status },
  { ts: '14:31:58', agent: 'Tag Generator', event: 'Classified 24 new documents with taxonomy tags', status: 'complete' as Status },
  { ts: '14:31:44', agent: 'Search Agent', event: 'Semantic embedding generation for batch #48', status: 'processing' as Status },
  { ts: '14:31:30', agent: 'Critique Agent', event: 'Validation pass on search results batch #47', status: 'complete' as Status },
  { ts: '14:31:12', agent: 'Tag Generator', event: 'Processed quarterly-report-2025.pdf', status: 'complete' as Status },
]

function AgentsPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: C.text,
            margin: '0 0 6px',
            letterSpacing: '-0.025em',
          }}
        >
          AI Processing Pipeline
        </h1>
        <p style={{ fontSize: 14, color: C.dim, margin: 0 }}>
          Real-time document processing and retrieval orchestration
        </p>
      </div>

      {/* Status strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          padding: '13px 20px',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          backgroundColor: C.surface,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Pipeline', value: 'Active', color: C.green },
          { label: 'Documents queued', value: '48', color: C.text2 },
          { label: 'Processed today', value: '3,741', color: C.text2 },
          { label: 'Avg confidence', value: '95.1%', color: '#818cf8' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p
              style={{
                fontSize: 10,
                color: C.faint,
                margin: '0 0 3px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}
            >
              {label}
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline cards */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 32 }}>
        {PIPELINE.map((agent, i) => (
          <div key={agent.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <AgentCard agent={agent} index={i} />
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                style={{
                  width: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 1,
                    background:
                      i === 0
                        ? 'linear-gradient(90deg, rgba(34,197,94,0.5), rgba(99,102,241,0.5))'
                        : 'linear-gradient(90deg, rgba(99,102,241,0.3), rgba(63,63,70,0.3))',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 2,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: i === 0 ? C.indigo : C.vfaint,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div>
        <h2
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.faint,
            margin: '0 0 12px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
          }}
        >
          Recent activity
        </h2>
        <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {ACTIVITY.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '11px 18px',
                borderBottom: i < ACTIVITY.length - 1 ? `1px solid #17171a` : 'none',
                backgroundColor: '#0f0f12',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.backgroundColor = C.surface)}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.backgroundColor = '#0f0f12')}
            >
              <StatusDot status={row.status} />
              <span
                style={{
                  fontSize: 11,
                  color: C.faint,
                  fontFamily: C.mono,
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {row.ts}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: '#818cf8',
                  fontWeight: 500,
                  flexShrink: 0,
                  minWidth: 130,
                }}
              >
                {row.agent}
              </span>
              <span style={{ fontSize: 12, color: C.dim }}>{row.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Observability Page ─────────────────────────────────────────────────────

const TRACE_STEPS = [
  { label: 'User Query', duration: '12ms', tokens: null, cost: null },
  { label: 'Search Agent', duration: '820ms', tokens: '1,240', cost: '$0.004' },
  { label: 'Retriever', duration: '220ms', tokens: null, cost: null },
  { label: 'LLM Call', duration: '640ms', tokens: '2,480', cost: '$0.009' },
  { label: 'Critique Agent', duration: '1.1s', tokens: '1,840', cost: '$0.007' },
  { label: 'Final Response', duration: '18ms', tokens: null, cost: null },
]

function ObservabilityPage() {
  const [filter, setFilter] = useState('All')

  return (
    <div style={{ padding: '32px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: C.text,
            margin: '0 0 6px',
            letterSpacing: '-0.025em',
          }}
        >
          LLM Observability
        </h1>
        <p style={{ fontSize: 14, color: C.dim, margin: 0 }}>
          Monitor AI agent performance, latency, cost, and reliability.
        </p>
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Total LLM Calls', value: '12,482', delta: '+4.2% vs yesterday', up: true },
          { label: 'Avg Latency', value: '1.42s', delta: '−8ms vs yesterday', up: false },
          { label: 'Tokens Used', value: '2.8M', delta: '+12% vs yesterday', up: true },
          { label: 'Estimated Cost', value: '$18.42', delta: '+$1.20 vs yesterday', up: true },
        ].map(({ label, value, delta, up }) => (
          <div
            key={label}
            style={{
              padding: '18px 20px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              backgroundColor: C.surface,
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: C.faint,
                margin: '0 0 10px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: 27,
                fontWeight: 600,
                color: C.text,
                margin: '0 0 6px',
                letterSpacing: '-0.035em',
                fontFamily: C.mono,
              }}
            >
              {value}
            </p>
            <p style={{ fontSize: 11, margin: 0, color: up ? '#4ade80' : C.muted }}>{delta}</p>
          </div>
        ))}
      </div>

      {/* Trace + Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '268px 1fr', gap: 16 }}>
        {/* Trace timeline */}
        <div
          style={{
            padding: '20px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            backgroundColor: C.surface,
          }}
        >
          <h3
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: C.faint,
              margin: '0 0 22px',
              letterSpacing: '0.07em',
              textTransform: 'uppercase' as const,
            }}
          >
            Trace Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TRACE_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: C.indigo,
                      boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                    }}
                  />
                  {i < TRACE_STEPS.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        flex: 1,
                        minHeight: 28,
                        backgroundColor: C.border2,
                        marginTop: 2,
                      }}
                    />
                  )}
                </div>
                <div style={{ paddingBottom: i < TRACE_STEPS.length - 1 ? 18 : 0 }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: C.text2,
                      margin: '0 0 4px',
                    }}
                  >
                    {step.label}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                    <span
                      style={{ fontSize: 11, color: C.faint, fontFamily: C.mono }}
                    >
                      {step.duration}
                    </span>
                    {step.tokens && (
                      <span style={{ fontSize: 11, color: C.vfaint }}>{step.tokens} tok</span>
                    )}
                    {step.cost && (
                      <span style={{ fontSize: 11, color: C.vfaint }}>{step.cost}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trace table */}
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            backgroundColor: C.surface,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <h3
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.faint,
                margin: 0,
                letterSpacing: '0.07em',
                textTransform: 'uppercase' as const,
              }}
            >
              Trace Log
            </h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Complete', 'Slow', 'Errors'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: `1px solid ${filter === f ? C.border2 : 'transparent'}`,
                    backgroundColor: filter === f ? C.surface2 : 'transparent',
                    color: filter === f ? C.text2 : C.faint,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Trace ID', 'Agent', 'Model', 'Latency', 'Tokens', 'Cost', 'Status'].map(col => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left' as const,
                        color: C.faint,
                        fontWeight: 500,
                        fontSize: 10,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase' as const,
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRACES.filter(t => {
                  if (filter === 'Complete') return t.status === 'complete'
                  if (filter === 'Slow') return t.status === 'slow'
                  if (filter === 'Errors') return t.status === 'error'
                  return true
                }).map((trace, i, arr) => (
                  <tr
                    key={trace.id}
                    style={{
                      borderBottom: i < arr.length - 1 ? `1px solid #17171a` : 'none',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#141416')
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')
                    }
                  >
                    <td
                      style={{
                        padding: '11px 16px',
                        color: C.vfaint,
                        fontFamily: C.mono,
                        fontSize: 11,
                      }}
                    >
                      {trace.id}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.muted, fontWeight: 500 }}>
                      {trace.agent}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        color: C.faint,
                        fontFamily: C.mono,
                        fontSize: 11,
                      }}
                    >
                      {trace.model}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.text2, fontFamily: C.mono }}>
                      {trace.latency}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.dim, fontFamily: C.mono }}>
                      {trace.tokens}
                    </td>
                    <td style={{ padding: '11px 16px', color: C.dim, fontFamily: C.mono }}>
                      {trace.cost}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusDot status={trace.status} />
                        <span
                          style={{
                            fontSize: 11,
                            color:
                              trace.status === 'complete'
                                ? C.green
                                : trace.status === 'slow'
                                  ? C.amber
                                  : C.red,
                            fontWeight: 500,
                          }}
                        >
                          {trace.status === 'complete'
                            ? 'Complete'
                            : trace.status === 'slow'
                              ? 'Slow'
                              : 'Error'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [query, setQuery] = useState('')

  const handleSearch = (q: string) => {
    setQuery(q)
    setPage('results')
  }

  const handleNav = (p: Page) => {
    setPage(p)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      <Sidebar page={page} onNav={handleNav} />
      <div style={{ marginLeft: 56, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar page={page} />
        <main style={{ flex: 1 }}>
          {page === 'home' && <HomePage onSearch={handleSearch} />}
          {page === 'results' && <ResultsPage query={query} />}
          {page === 'agents' && <AgentsPage />}
          {page === 'observability' && <ObservabilityPage />}
        </main>
      </div>
    </div>
  )
}
