import React, { useMemo, useState, useEffect, useRef, useContext } from 'react'
import AuthPage from './AuthPage'
import { useAuth } from './lib/AuthContext'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { DOCUMENTS, type VaultiqDocument } from './data/documents'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const WS_BASE = API_BASE.replace(/^http/, 'ws')

type Page = 'home' | 'results' | 'agents' | 'observability' | 'profile'
type Status = 'complete' | 'processing' | 'waiting' | 'slow' | 'error'

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 1024 * 10 ? 1 : 0)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// Scores how well a document matches a lowercased search query so the most
// accurate result sorts to the top instead of every doc showing a flat 100%.
function computeRelevance(doc: VaultiqDocument, q: string): number {
  if (!q) return 100
  const title = doc.title.toLowerCase()
  const summary = doc.summary.toLowerCase()
  let score = 0

  if (title === q) score += 55
  else if (title.startsWith(q)) score += 42
  else if (title.includes(q)) score += 28

  const tagMatches = doc.tags.filter(t => t.toLowerCase().includes(q)).length
  score += Math.min(30, tagMatches * 10)

  if (doc.department && doc.department.toLowerCase().includes(q)) score += 15
  if (summary.includes(q)) score += 12

  return Math.max(0, Math.min(100, score))
}

// ── Icons ─────────────────────────────────────────────────────────────────

function IconSearch({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <SearchRoundedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconDocument({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <DescriptionOutlinedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconAgent({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <HubOutlinedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconChart({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <InsightsOutlinedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconGear({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <SettingsOutlinedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconBell({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <NotificationsNoneOutlinedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconChevron({ size = 10, color = 'currentColor' }: { size?: number; color?: string }) {
  return <ChevronRightRoundedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconArrow({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return <NorthEastRoundedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconX({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return <CloseRoundedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconFilter({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <FilterListRoundedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
}

function IconUpload({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <CloudUploadOutlinedIcon sx={{ fontSize: size, color, flexShrink: 0 }} />
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

const PIPELINE = [
  {
    id: 'router',
    name: 'Intent Router',
    status: 'complete' as Status,
    task: 'Classified intent for 1,248 queries',
    processed: '1,248',
    confidence: '98.4%',
    latency: '310ms',
  },
  {
    id: 'rag',
    name: 'Document RAG Agent',
    status: 'processing' as Status,
    task: 'Retrieving semantic chunks',
    processed: '1,024',
    confidence: '94.2%',
    latency: '820ms',
  },
  {
    id: 'location',
    name: 'Location Agent',
    status: 'waiting' as Status,
    task: 'Awaiting routing',
    processed: '224',
    confidence: '—',
    latency: '—',
  },
]

const TRACES = [
  { id: 'tr-4829', agent: 'RAG Agent', model: 'llama-3.3-70b-versatile', latency: '820ms', tokens: '1,240', cost: '$0.001', status: 'complete' as Status, ts: '14:32:01' },
  { id: 'tr-4828', agent: 'Intent Router', model: 'llama3-8b-8192', latency: '310ms', tokens: '124', cost: '$0.000', status: 'complete' as Status, ts: '14:32:00' },
  { id: 'tr-4827', agent: 'Location Agent', model: 'llama-3.3-70b-versatile', latency: '1.2s', tokens: '820', cost: '$0.001', status: 'complete' as Status, ts: '14:31:58' },
  { id: 'tr-4826', agent: 'Research Agent', model: 'llama-3.3-70b-versatile', latency: '2.3s', tokens: '2,100', cost: '$0.002', status: 'slow' as Status, ts: '14:31:44' },
  { id: 'tr-4825', agent: 'Extraction Agent', model: 'llama-3.3-70b-versatile', latency: '—', tokens: '—', cost: '—', status: 'error' as Status, ts: '14:31:30' },
]

// ── Design tokens ──────────────────────────────────────────────────────────
// These reference CSS custom properties (defined in index.css for both
// [data-theme="dark"] and [data-theme="light"]) rather than literal hex
// values. Switching the theme just flips the root `data-theme` attribute —
// the browser's CSS cascade updates every element that uses these tokens
// instantly, which is robust regardless of React's render/memoization
// behavior (a plain JS-object-mutation approach was tried first and silently
// missed components React chose not to re-render).
const C = {
  bg: 'var(--c-bg)',
  bg2: 'var(--c-bg2)',
  surface: 'var(--c-surface)',
  surface2: 'var(--c-surface2)',
  border: 'var(--c-border)',
  border2: 'var(--c-border2)',
  indigo: 'var(--c-indigo)',
  indigoDim: 'var(--c-indigo-dim)',
  indigoGlow: 'var(--c-indigo-glow)',
  indigoRing: 'var(--c-indigo-ring)',
  indigoBorder: 'var(--c-indigo-border)',
  text: 'var(--c-text)',
  text2: 'var(--c-text2)',
  muted: 'var(--c-muted)',
  dim: 'var(--c-dim)',
  faint: 'var(--c-faint)',
  vfaint: 'var(--c-vfaint)',
  green: 'var(--c-green)',
  amber: 'var(--c-amber)',
  red: 'var(--c-red)',
  mono: "'JetBrains Mono', monospace",
}

const THEME_KEY = 'vaultiq_theme'
type ThemeMode = 'dark' | 'light'

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
}

const ThemeContext = React.createContext<{ theme: ThemeMode; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = (localStorage.getItem(THEME_KEY) as ThemeMode | null)
    const initial = stored === 'light' ? 'light' : 'dark'
    applyTheme(initial)
    return initial
  })

  const toggleTheme = () => {
    setTheme(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try { localStorage.setItem(THEME_KEY, next) } catch {}
      return next
    })
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

const useTheme = () => useContext(ThemeContext)

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

const SOURCE_OPTIONS = ['upload', 'Google Drive', 'GitHub', 'Jira', 'Confluence', 'SharePoint', 'Notion', 'Slack']

// Simplified, recognizable glyphs — not pixel-exact brand logos, just enough
// shape language (octocat silhouette, Drive triangle, Jira chevrons, the
// Confluence/Atlassian interlocking marks, Slack's four lozenges, ...) to
// tell sources apart at a glance without pulling in an icon-library dependency.
function GithubGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="#fff">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.72-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.72 1.23 1.87.87 2.33.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.14-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.55.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function DriveGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11">
      <path d="M5.5 1.5 0 10.8l1.9 3.3L7.4 4.8Z" fill="#00AC47" />
      <path d="M8.6 4.8 14.1 14.1H16l-1.9-3.3L10 1.5Z" fill="#EA4335" />
      <path d="M1.9 14.1h10.2L14.1 10.8H0Z" fill="#FFBA00" />
    </svg>
  )
}

function JiraGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10">
      <path d="M8 1 3 6h5v5l5-5Z" fill="#2684FF" />
      <path d="M8 6 3 11h5v-5Z" fill="#2684FF" opacity="0.65" />
    </svg>
  )
}

function ConfluenceGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="#fff">
      <path d="M1 11.5c2.7-4.8 5.4-6.3 8.7-4.4 1.7 1 2.7 2.4 3.3 3.6.2.4-.3.8-.6.5-1.8-1.8-4-2.7-6.3-1.6-1.6.8-2.7 2-3.5 3.2-.3.4-1-.4-.6-1.3Z" />
      <path d="M15 4.5C12.3 9.3 9.6 10.8 6.3 8.9 4.6 7.9 3.6 6.5 3 5.3c-.2-.4.3-.8.6-.5 1.8 1.8 4 2.7 6.3 1.6 1.6-.8 2.7-2 3.5-3.2.3-.4 1 .4.6 1.3Z" />
    </svg>
  )
}

function SlackGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10">
      <rect x="1" y="6" width="4" height="4" rx="1" fill="#36C5F0" />
      <rect x="6" y="1" width="4" height="4" rx="1" fill="#2EB67D" />
      <rect x="11" y="6" width="4" height="4" rx="1" fill="#ECB22E" />
      <rect x="6" y="11" width="4" height="4" rx="1" fill="#E01E5A" />
    </svg>
  )
}

function NotionGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="#fff">
      <path d="M3 2h8l2 2v10H5V4Z" opacity="0.15" />
      <path d="M4.5 3.5v9l1.3-.9V4.9L10 10l1.5-.9V3.1L10.2 4v5L5.8 3Z" />
    </svg>
  )
}

function SharepointGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10">
      <circle cx="6" cy="5" r="3.2" fill="#036C70" />
      <circle cx="10.5" cy="6.5" r="2.6" fill="#1A9BA1" />
      <circle cx="7.5" cy="10.5" r="2.2" fill="#37C6D0" />
    </svg>
  )
}

const SOURCE_STYLES: Record<string, { bg: string; label: string; Glyph?: React.FC }> = {
  github: { bg: '#24292e', label: 'GH', Glyph: GithubGlyph },
  jira: { bg: '#e9f2ff', label: 'JI', Glyph: JiraGlyph },
  atlassian: { bg: '#e9f2ff', label: 'AT', Glyph: JiraGlyph },
  confluence: { bg: '#1868DB', label: 'CO', Glyph: ConfluenceGlyph },
  'google drive': { bg: '#fff', label: 'GD', Glyph: DriveGlyph },
  gdrive: { bg: '#fff', label: 'GD', Glyph: DriveGlyph },
  notion: { bg: '#000000', label: 'NO', Glyph: NotionGlyph },
  sharepoint: { bg: '#fff', label: 'SP', Glyph: SharepointGlyph },
  slack: { bg: '#fff', label: 'SL', Glyph: SlackGlyph },
}

function SourceBadge({ source }: { source: string }) {
  const key = (source || '').toLowerCase().trim()
  const style = SOURCE_STYLES[key]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 17,
          height: 17,
          borderRadius: 4,
          backgroundColor: style ? style.bg : C.surface2,
          color: '#fff',
          fontSize: 8,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          letterSpacing: '-0.02em',
          border: `1px solid ${C.border2}`,
        }}
      >
        {style?.Glyph ? <style.Glyph /> : <span style={{ color: C.muted }}>{(source || '?').slice(0, 2).toUpperCase()}</span>}
      </span>
      <span>{source}</span>
    </span>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────

const NAV: { id: Page; label: string; Icon: React.FC<{ size?: number; color?: string }>; accent: string }[] = [
  { id: 'home', label: 'Search', Icon: IconSearch, accent: '#818cf8' },
  { id: 'results', label: 'Documents', Icon: IconDocument, accent: '#38bdf8' },
  { id: 'agents', label: 'Agents', Icon: IconAgent, accent: '#c084fc' },
  { id: 'observability', label: 'Observability', Icon: IconChart, accent: '#34d399' },
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

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        {NAV.map(({ id, label, Icon, accent }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={label}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                border: active ? `1px solid ${accent}55` : '1px solid transparent',
                backgroundColor: active ? `${accent}1f` : 'transparent',
                color: active ? accent : C.faint,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: active ? `0 0 14px ${accent}30` : 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.backgroundColor = C.surface2
                  el.style.color = accent
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
              <Icon size={20} color="currentColor" />
            </button>
          )
        })}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => onNav('profile')}
          title="Settings & Profile"
          style={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            border: page === 'profile' ? `1px solid ${C.indigoBorder}` : '1px solid transparent',
            backgroundColor: page === 'profile' ? C.indigoGlow : 'transparent',
            color: page === 'profile' ? '#818cf8' : C.faint,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            boxShadow: page === 'profile' ? '0 0 14px rgba(99,102,241,0.18)' : 'none',
          }}
          onMouseEnter={e => {
            if (page !== 'profile') {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = C.surface2
              el.style.color = '#818cf8'
            }
          }}
          onMouseLeave={e => {
            if (page !== 'profile') {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = 'transparent'
              el.style.color = C.faint
            }
          }}
        >
          <IconGear size={19} color="currentColor" />
        </button>
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
  profile: ['Vaultiq', 'Profile & Settings'],
}

function TopBar({ page, onNav }: { page: Page, onNav: (p: Page) => void }) {
  const crumbs = CRUMBS[page]
  const { user, signOut } = useAuth()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progressMap, setProgressMap] = useState<Record<string, { status: string; progress: number; message?: string }>>({})
  const [sourceOption, setSourceOption] = useState(SOURCE_OPTIONS[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const newFiles = Array.from(list)
    setFiles(prev => [...prev, ...newFiles])
  }

  const uploadOne = (file: File) =>
    new Promise<void>((resolve) => {
      const clientId = Math.random().toString(36).substring(7)
      const ws = new WebSocket(`${WS_BASE}/api/ws/progress/${clientId}`)

      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        try { ws.close() } catch {}
        resolve()
      }

      const timeoutId = setTimeout(() => {
        setProgressMap(prev => ({
          ...prev,
          [file.name]: prev[file.name]?.status === 'completed'
            ? prev[file.name]
            : { status: 'error', progress: 0, message: 'Timed out waiting for the server.' },
        }))
        finish()
      }, 60000)

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setProgressMap(prev => ({ ...prev, [file.name]: data }))
        if (data.status === 'completed' || data.status === 'error') {
          finish()
        }
      }
      ws.onerror = () => {
        if (settled) return
        // Socket never connected — upload without live progress rather than hanging.
        startUpload()
      }

      const startUpload = async () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('client_id', clientId)
        formData.append('source', sourceOption)
        try {
          const res = await fetch(`${API_BASE}/api/documents/upload`, {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) {
            setProgressMap(prev => ({ ...prev, [file.name]: { status: 'error', progress: 0, message: `Upload failed (${res.status}).` } }))
            finish()
          } else if (ws.readyState !== WebSocket.OPEN) {
            // No live progress channel — treat the successful HTTP response as done.
            setProgressMap(prev => ({ ...prev, [file.name]: { status: 'completed', progress: 100 } }))
            finish()
          }
        } catch (err) {
          setProgressMap(prev => ({ ...prev, [file.name]: { status: 'error', progress: 0, message: 'Network error while uploading.' } }))
          finish()
        }
      }

      // Wait for the WebSocket to open so the server can register this client_id
      // before the background task starts sending progress — otherwise early
      // progress messages are sent to nobody and the client waits until timeout.
      if (ws.readyState === WebSocket.OPEN) {
        startUpload()
      } else {
        ws.onopen = () => startUpload()
      }
    })

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setProgressMap({})

    await Promise.all(files.map(f => uploadOne(f)))

    setTimeout(() => {
      setUploadOpen(false)
      setUploading(false)
      setFiles([])
      setProgressMap({})
    }, 1200)
  }

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.substring(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'JD'
  }

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
              <span style={{ color: C.vfaint, display: 'flex', marginLeft: 4, marginRight: 4 }}>
                <IconChevron size={11} color={C.vfaint} />
              </span>
            )}
            {crumb === 'Vaultiq' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <VaultLogo size={22} />
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: '-0.02em' }}>
                  Vaultiq
                </span>
              </div>
            ) : (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: i === crumbs.length - 1 ? 500 : 400,
                  color: i === crumbs.length - 1 ? C.text2 : C.faint,
                }}
              >
                {crumb}
              </span>
            )}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setUploadOpen(true)}
          style={{
            height: 32,
            padding: '0 12px',
            borderRadius: 6,
            border: `1px solid ${C.indigoBorder}`,
            backgroundColor: C.indigoGlow,
            color: '#818cf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 150ms',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = 'rgba(99,102,241,0.2)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = C.indigoGlow
          }}
        >
          <IconUpload size={14} color="currentColor" />
          <span>Upload</span>
        </button>
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
          onClick={() => onNav('profile')}
          title="Profile & Settings"
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
          {getInitials()}
        </div>
      </div>

      {uploadOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setUploadOpen(false)}
        >
          <div
            style={{
              width: 480,
              backgroundColor: C.surface,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              padding: 24,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>Upload Document</h2>
              <button
                onClick={() => setUploadOpen(false)}
                style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer' }}
              >
                <IconX size={16} />
              </button>
            </div>

            <label style={{ display: 'block', fontSize: 12, color: C.dim, marginBottom: 6 }}>
              Source
            </label>
            <select
              value={sourceOption}
              onChange={e => setSourceOption(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface2,
                color: C.text,
                fontSize: 13,
                fontFamily: 'inherit',
                marginBottom: 16,
              }}
            >
              {SOURCE_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'upload' ? 'Direct upload' : s}</option>
              ))}
            </select>

            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                addFiles(e.dataTransfer.files)
              }}
              style={{
                border: `2px dashed ${dragActive ? C.indigo : C.border2}`,
                borderRadius: 8,
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: C.surface2,
                cursor: 'pointer',
                transition: 'border-color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.indigo)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = dragActive ? C.indigo : C.border2)}
            >
              <div style={{ color: C.indigo, marginBottom: 12 }}>
                <IconUpload size={28} />
              </div>
              <p style={{ fontSize: 14, color: C.text2, margin: '0 0 4px', fontWeight: 500 }}>
                {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Click or drag files to this area to upload'}
              </p>
              <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>
                Supports PDF, DOCX, XLSX, PPTX, PNG, JPG up to 50MB each. You can select or drop multiple files.
              </p>
            </div>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: 6 }}>
              <span style={{ fontSize: 11, color: C.faint }}>Coming soon:</span>
              {['TXT', 'CSV', 'HTML', 'Markdown', 'Email'].map(f => (
                <span
                  key={f}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 3,
                    backgroundColor: C.surface2,
                    color: C.vfaint,
                    border: `1px solid ${C.border2}`,
                    letterSpacing: '0.04em',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
                {files.map((f, i) => {
                  const p = progressMap[f.name]
                  return (
                    <div key={`${f.name}-${i}`} style={{ padding: '10px 12px', borderRadius: 6, backgroundColor: C.surface2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: C.dim }}>{formatFileSize(f.size)}</span>
                          {!uploading && (
                            <button
                              onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                              style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                              <IconX size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {p && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: C.text2 }}>
                            <span style={{ textTransform: 'capitalize' }}>{p.status}...</span>
                            <span>{p.progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${p.progress}%`, height: '100%', backgroundColor: p.status === 'error' ? 'red' : C.indigo, transition: 'width 300ms ease' }} />
                          </div>
                          {p.status === 'error' && p.message && (
                            <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11, color: '#f87171' }}>{p.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => { setUploadOpen(false); setFiles([]); setProgressMap({}) }}
                disabled={uploading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: `1px solid ${C.border2}`,
                  backgroundColor: 'transparent',
                  color: C.text2,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: C.indigo,
                  color: '#fff',
                  cursor: files.length > 0 && !uploading ? 'pointer' : 'default',
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: files.length > 0 && !uploading ? 1 : 0.5,
                }}
                disabled={files.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : `Upload${files.length > 1 ? ` (${files.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// ── Home Page ──────────────────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = 'vaultiq_recent_searches'

function HomePage({ onSearch, onRecordSearch, recentSearches }: { onSearch: (q: string) => void; onRecordSearch: (q: string) => void; recentSearches: string[] }) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggested, setSuggested] = useState<string[]>([])
  const [docs, setDocs] = useState<VaultiqDocument[]>([])
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [drawer, setDrawer] = useState<VaultiqDocument | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/documents`)
      .then(r => r.json())
      .then(data => {
        const mapped: VaultiqDocument[] = (data.documents || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          type: d.type ? d.type.toUpperCase() : 'PDF',
          source: d.source || 'upload',
          summary: d.summary || 'No summary available.',
          tags: d.keywords ? d.keywords.split(',').map((s: string) => s.trim()) : [],
          department: d.department || undefined,
          updated: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : 'Today',
          fileSize: d.file_size ?? undefined,
          relevance: 100,
        }))
        setDocs(mapped)
        const titles = mapped
          .slice()
          .sort((a, b) => b.id > a.id ? 1 : -1)
          .map(d => d.title)
        setSuggested(Array.from(new Set(titles)).slice(0, 4))
      })
      .catch(() => setSuggested([]))
  }, [])

  const submit = (val: string) => {
    if (val.trim()) {
      setLoading(true)
      setTimeout(() => {
        onRecordSearch(val.trim())
        setSubmittedQuery(val.trim())
        setLoading(false)
      }, 300)
    }
  }

  const inlineResults = useMemo(() => {
    const query = submittedQuery.trim().toLowerCase()
    if (!query) return []
    return docs
      .map(doc => ({ ...doc, relevance: computeRelevance(doc, query) }))
      .filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.tags.some(t => t.toLowerCase().includes(query)) ||
        (doc.department || '').toLowerCase().includes(query)
      )
      .sort((a, b) => b.relevance - a.relevance)
  }, [docs, submittedQuery])

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
            id="main-search-input"
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
          {loading ? (
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${C.border2}`, borderTopColor: C.indigo, animation: 'pulse-dot 0.8s linear infinite' }} />
          ) : (
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
          )}
        </div>
      </div>

      {submittedQuery ? (
        /* Inline results — shown right here instead of navigating away */
        <div style={{ width: '100%', maxWidth: 780 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: C.faint, margin: 0 }}>
              {inlineResults.length} result{inlineResults.length === 1 ? '' : 's'} for "{submittedQuery}"
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => onSearch(submittedQuery)}
                style={{ background: 'none', border: 'none', color: C.indigo, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Open in Documents →
              </button>
              <button
                onClick={() => { setSubmittedQuery(''); setQ('') }}
                style={{ background: 'none', border: 'none', color: C.faint, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Clear
              </button>
            </div>
          </div>
          {inlineResults.length === 0 ? (
            <p style={{ fontSize: 13, color: C.dim }}>No documents match "{submittedQuery}".</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' as const }}>
              {inlineResults.map(doc => (
                <DocCard key={doc.id} doc={doc} onOpen={() => setDrawer(doc)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Recent */}
          {recentSearches.length > 0 && (
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
              {recentSearches.map(s => (
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
          )}

          {/* Suggested */}
          {suggested.length > 0 && (
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
            {suggested.map((s, i) => (
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
          )}
        </>
      )}

      {drawer && <DocDrawer doc={drawer} onClose={() => setDrawer(null)} />}
    </div>
  )
}

// ── Document Card ──────────────────────────────────────────────────────────

function DocCard({ doc, onOpen }: { doc: VaultiqDocument; onOpen: () => void }) {
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
        backgroundColor: hovered ? C.surface2 : C.surface,
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
            <span style={{ fontSize: 12, color: C.faint, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <SourceBadge source={doc.source} /> · Updated {doc.updated}
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

// ── Document Chat ────────────────────────────────────────────────────────────

function DocumentChat({ doc }: { doc: VaultiqDocument }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hello! I'm ready to answer any questions you have about "${doc.title}".` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const payloadMessage = messages.length === 1 
        ? `[Context: I am viewing the document "${doc.title}". Please answer based on this document.]\n\n${userMsg}`
        : userMsg;

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: payloadMessage,
          conversation_id: conversationId,
          document_id: String(doc.id)
        })
      })
      const data = await res.json()
      if (!res.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
        throw new Error(detail || `Request failed with status ${res.status}`)
      }
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${detail}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: m.role === 'user' ? C.indigo : C.surface2,
                color: m.role === 'user' ? '#fff' : C.text2,
                fontSize: 13,
                lineHeight: 1.6,
                borderBottomRightRadius: m.role === 'user' ? 2 : 12,
                borderBottomLeftRadius: m.role === 'assistant' ? 2 : 12,
                border: m.role === 'assistant' ? `1px solid ${C.border2}` : 'none',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, backgroundColor: C.surface2, borderBottomLeftRadius: 2, display: 'flex', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.dim, animation: 'pulse-dot 1s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.dim, animation: 'pulse-dot 1s infinite 200ms' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.dim, animation: 'pulse-dot 1s infinite 400ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      
      <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, backgroundColor: C.bg, borderRadius: 8, border: `1px solid ${C.border2}` }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask a question about this document..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: 13, padding: '4px 8px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 32, height: 32, borderRadius: 6, backgroundColor: input.trim() && !loading ? C.indigo : C.surface2,
              border: 'none', color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms'
            }}
          >
            <IconArrow size={14} color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Document Drawer ────────────────────────────────────────────────────────

function DocDrawer({ doc, onClose }: { doc: VaultiqDocument; onClose: () => void }) {
  const [tab, setTab] = useState<'content' | 'chat'>('content')
  
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
          backgroundColor: C.surface,
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
                onClick={() => window.open(`${API_BASE}/api/documents/${doc.id}/view`, '_blank', 'noopener,noreferrer')}
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
          
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {(['content', 'chat'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 0',
                  color: tab === t ? C.indigo : C.faint,
                  fontWeight: tab === t ? 600 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  borderBottom: `2px solid ${tab === t ? C.indigo : 'transparent'}`,
                  textTransform: 'capitalize',
                  transition: 'all 150ms'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content / Chat */}
        {tab === 'content' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: C.indigo,
              margin: '0 0 14px',
              letterSpacing: '-0.02em',
            }}
          >
            <a 
              href={`${API_BASE}/api/documents/${doc.id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              title="Click to view full document"
            >
              {doc.title} <IconArrow size={14} />
            </a>
          </h2>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24, fontSize: 12, color: C.faint }}>
            <span>Last updated {doc.updated}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Source: <SourceBadge source={doc.source} /></span>
            {typeof doc.fileSize === 'number' && (
              <span>{formatFileSize(doc.fileSize)}</span>
            )}
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
              {doc.summary || 'No summary available.'}
            </p>
          </section>

          {/* Placeholder for dynamic passages once real data is integrated */}
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
              Top Passages
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
                {doc.summary}
              </p>
            </div>
            <p style={{ fontSize: 12, color: C.faint, fontStyle: 'italic' }}>
              Note: Additional document content and sections will render here when real data is integrated.
            </p>
          </section>
        </div>
        ) : (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <DocumentChat doc={doc} />
          </div>
        )}

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
            { label: 'Source', content: <span style={{ fontSize: 12, color: C.muted }}><SourceBadge source={doc.source} /></span> },
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

// Date is a relative time-range picker, not document data, so it's the only
// fixed set of options here — everything else is derived from the actual
// loaded documents (see ResultsPage).
const DATE_RANGE_OPTIONS = ['Today', 'Last 7 days', 'Last 30 days', 'Custom range']

function FilterSidebar({
  active,
  onToggle,
  availableTypes,
  availableSources,
  availableDepartments,
}: {
  active: Set<string>
  onToggle: (f: string) => void
  availableTypes: string[]
  availableSources: string[]
  availableDepartments: string[]
}) {
  const FILTER_GROUPS: Record<string, string[]> = {
    ...(availableTypes.length > 0 ? { 'Document type': availableTypes } : {}),
    Date: DATE_RANGE_OPTIONS,
    ...(availableDepartments.length > 0 ? { Department: availableDepartments } : {}),
    ...(availableSources.length > 0 ? { Source: availableSources } : {}),
  }
  const [open, setOpen] = useState(new Set(['Document type', 'Date', 'Department', 'Source']))

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
                    style={{ accentColor: C.indigo, width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: active.has(opt) ? '#818cf8' : C.dim,
                      transition: 'color 120ms',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {section === 'Source' ? <SourceBadge source={opt} /> : opt}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Date Range Calendar Filter */}
      <div style={{ marginBottom: 2, marginTop: 16 }}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 4px',
            color: C.muted,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          Date Range
        </div>
        <div style={{ padding: '4px 4px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: C.dim }}>From:</span>
            <input 
              type="date" 
              style={{ 
                padding: '4px 8px', 
                borderRadius: 4, 
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface,
                color: C.text2,
                fontSize: 12,
                fontFamily: 'inherit',
                colorScheme: 'dark'
              }} 
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: C.dim }}>To:</span>
            <input 
              type="date" 
              style={{ 
                padding: '4px 8px', 
                borderRadius: 4, 
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface,
                color: C.text2,
                fontSize: 12,
                fontFamily: 'inherit',
                colorScheme: 'dark'
              }} 
            />
          </label>
        </div>
      </div>
    </aside>
  )
}

// ── Search Results Page ────────────────────────────────────────────────────

function ResultsPage({ query }: { query: string }) {
  const [filters, setFilters] = useState(new Set<string>())
  const [drawer, setDrawer] = useState<VaultiqDocument | null>(null)
  const [localQ, setLocalQ] = useState(query)
  const [focused, setFocused] = useState(false)
  const [docs, setDocs] = useState<VaultiqDocument[]>([])
  const [fetchingDocs, setFetchingDocs] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/documents`)
      .then(r => r.json())
      .then(data => {
        const mapped = data.documents.map((d: any) => ({
          id: d.id,
          title: d.title,
          type: d.type ? d.type.toUpperCase() : 'PDF',
          source: d.source || 'upload',
          summary: d.summary || 'No summary available.',
          tags: d.keywords ? d.keywords.split(',').map((s: string) => s.trim()) : [],
          department: d.department || undefined,
          updated: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : 'Today',
          fileSize: d.file_size ?? undefined,
          relevance: 100
        }))
        setDocs(mapped)
        setFetchingDocs(false)
      })
      .catch(e => {
        console.error('Failed to fetch docs:', e)
        setDocs(DOCUMENTS) // fallback to mock
        setFetchingDocs(false)
      })
  }, [])

  const toggle = (f: string) => {
    setFilters(prev => {
      const n = new Set(prev)
      n.has(f) ? n.delete(f) : n.add(f)
      return n
    })
  }

  const availableTypes = useMemo(
    () => Array.from(new Set(docs.map(d => d.type).filter(Boolean))).sort(),
    [docs]
  )
  const availableSources = useMemo(
    () => Array.from(new Set(docs.map(d => d.source).filter(Boolean))).sort(),
    [docs]
  )
  const availableDepartments = useMemo(
    () => Array.from(new Set(docs.map(d => d.department).filter((d): d is string => Boolean(d)))).sort(),
    [docs]
  )

  const results = useMemo(() => {
    const q = localQ.trim().toLowerCase()
    return docs
      .map(doc => ({ ...doc, relevance: q === '' ? 100 : computeRelevance(doc, q) }))
      .filter(doc => {
        const matchesQuery =
          q === '' ||
          doc.title.toLowerCase().includes(q) ||
          doc.summary.toLowerCase().includes(q) ||
          doc.tags.some(t => t.toLowerCase().includes(q)) ||
          (doc.department || '').toLowerCase().includes(q)

        if (filters.size === 0) return matchesQuery

        const filterArray = Array.from(filters)

        // Date logic helper for mock data ("2 days ago", "3 weeks ago")
        const matchesDate = (f: string) => {
          if (f === 'Today') return doc.updated.toLowerCase().includes('today') || doc.updated.toLowerCase().includes('hour')
          if (f === 'Last 7 days') return doc.updated.includes('day')
          if (f === 'Last 30 days') return doc.updated.includes('day') || doc.updated.includes('week')
          return false
        }

        const matchesFilters = filterArray.some(f =>
          doc.type === f || doc.source === f || doc.department === f || matchesDate(f)
        )

        return matchesQuery && matchesFilters
      })
      .sort((a, b) => b.relevance - a.relevance)
  }, [localQ, filters, docs])
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
          <span style={{ color: C.muted, fontWeight: 500 }}>
            {results.length} result{results.length === 1 ? '' : 's'}
          </span>
        </p>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ padding: '0 0 0 28px', borderRight: `1px solid ${C.border}` }}>
          <FilterSidebar
            active={filters}
            onToggle={toggle}
            availableTypes={availableTypes}
            availableSources={availableSources}
            availableDepartments={availableDepartments}
          />
        </div>
        <div style={{ flex: 1, padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fetchingDocs ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 40 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.indigo, animation: 'pulse-dot 1s linear infinite', marginBottom: 20 }} />
              <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text2, margin: '0 0 8px' }}>Loading documents...</h3>
            </div>
          ) : results.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: C.dim }}>
                <IconSearch size={28} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text2, margin: '0 0 8px' }}>No documents found</h3>
              <p style={{ fontSize: 13, color: C.dim, margin: 0 }}>
                We couldn't find anything matching "{localQ}" or your selected filters.
              </p>
            </div>
          ) : (
            results.map(doc => <DocCard key={doc.id} doc={doc} onOpen={() => setDrawer(doc)} />)
          )}
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
    <div style={{ padding: '32px 32px', width: '100%' }}>
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
                borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none',
                backgroundColor: C.surface,
                transition: 'background 150ms',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.backgroundColor = C.surface2)}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.backgroundColor = C.surface)}
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
                      borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = C.surface2)
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

// ── Profile & Dashboard Page ────────────────────────────────────────────────

const JOB_ROLE_OPTIONS = ['Employee', 'Engineer', 'Manager', 'Team Lead', 'Director', 'Executive']
const SENIORITY_OPTIONS = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal']

const PREFERENCES_KEY = 'vaultiq_preferences'
const PREFERENCE_ITEMS: { id: string; label: string; desc: string; defaultOn: boolean }[] = [
  { id: 'notify', label: 'Email Notifications', desc: 'Receive weekly digest of agent insights', defaultOn: true },
  { id: 'agents', label: 'Background Agents', desc: 'Allow AI agents to index documents in background', defaultOn: true },
  { id: 'traces', label: 'Detailed Tracing', desc: 'Log full observability traces for LLM calls', defaultOn: false },
]

function ProfilePage() {
  const { user, signOut, updateDisplayName, changePassword } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      const parsed = stored ? JSON.parse(stored) : {}
      const defaults = Object.fromEntries(PREFERENCE_ITEMS.map(p => [p.id, p.defaultOn]))
      return { ...defaults, ...parsed }
    } catch {
      return Object.fromEntries(PREFERENCE_ITEMS.map(p => [p.id, p.defaultOn]))
    }
  })

  const togglePreference = (id: string) => {
    setPreferences(prev => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }
  const [editOpen, setEditOpen] = useState(false)
  const [nameInput, setNameInput] = useState(user?.displayName || '')
  const [roleInput, setRoleInput] = useState('Employee')
  const [seniorityInput, setSeniorityInput] = useState('Junior')
  const [role, setRole] = useState('Employee')
  const [seniority, setSeniority] = useState('Junior')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [pwOpen, setPwOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API_BASE}/api/users/profile?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        setRole(data.role || 'Employee')
        setSeniority(data.seniority || 'Junior')
      })
      .catch(() => {})
  }, [user?.email])

  const openEdit = () => {
    setNameInput(user?.displayName || '')
    setRoleInput(role)
    setSeniorityInput(seniority)
    setSaveError(null)
    setEditOpen(true)
  }

  const saveProfile = async () => {
    if (!nameInput.trim() || !user?.email) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateDisplayName(nameInput.trim())
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          display_name: nameInput.trim(),
          role: roleInput,
          seniority: seniorityInput,
        }),
      })
      if (!res.ok) throw new Error(`Failed to save (${res.status}).`)
      setRole(roleInput)
      setSeniority(seniorityInput)
      setEditOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const openPasswordChange = () => {
    setCurrentPassword('')
    setNewPassword('')
    setPwError(null)
    setPwSuccess(false)
    setPwOpen(true)
  }

  const savePassword = async () => {
    if (!currentPassword || newPassword.length < 6) return
    setPwSaving(true)
    setPwError(null)
    try {
      await changePassword(currentPassword, newPassword)
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Profile Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '32px',
          borderRadius: 16,
          background: `linear-gradient(135deg, ${C.surface} 0%, rgba(99,102,241,0.05) 100%)`,
          border: `1px solid ${C.indigoBorder}`,
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}
        />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
            border: `2px solid ${C.surface}`,
          }}
        >
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {user?.displayName || 'Vaultiq User'}
          </h2>
          <p style={{ fontSize: 14, color: C.dim, margin: '0 0 12px' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, backgroundColor: C.surface2, color: C.muted, fontWeight: 500, border: `1px solid ${C.border2}` }}>
              Role: {role}
            </span>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, backgroundColor: C.surface2, color: C.muted, fontWeight: 500, border: `1px solid ${C.border2}` }}>
              Seniority: {seniority}
            </span>
          </div>
        </div>
        <button
          onClick={openPasswordChange}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${C.border2}`,
            backgroundColor: C.surface,
            color: C.text2,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            zIndex: 1,
            transition: 'all 150ms',
          }}
        >
          Change Password
        </button>
        <button
          onClick={openEdit}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${C.indigoBorder}`,
            backgroundColor: C.indigoGlow,
            color: '#818cf8',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            zIndex: 1,
            transition: 'all 150ms',
          }}
        >
          Edit Profile
        </button>
        <button
          onClick={signOut}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${C.border2}`,
            backgroundColor: C.surface,
            color: C.text2,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            zIndex: 1,
            transition: 'all 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.surface2)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.surface)}
        >
          Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Dashboard Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text2, margin: '0 0 4px' }}>Dashboard Activity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Documents Processed', value: '1,248', inc: '+12% this week', icon: <IconDocument size={18} color={C.indigo} /> },
              { label: 'Total Searches', value: '8,432', inc: '+5% this week', icon: <IconSearch size={18} color={C.indigo} /> },
              { label: 'Agent Runs', value: '3,190', inc: '+22% this week', icon: <IconAgent size={18} color={C.indigo} /> },
              { label: 'Storage Used', value: '4.2 GB', inc: '15 GB Limit', icon: <IconChart size={18} color={C.indigo} /> },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 200ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.indigoGlow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                  <span style={{ fontSize: 11, color: stat.inc.includes('+') ? C.green : C.faint, fontWeight: 500 }}>{stat.inc}</span>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: C.mono, letterSpacing: '-0.03em' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: C.faint }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text2, margin: '0 0 4px' }}>Preferences</h3>
          <div style={{ padding: 8, borderRadius: 12, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: `1px solid ${C.border2}`,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text2, marginBottom: 4 }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: C.dim }}>Use dark theme universally across app</div>
              </div>
              <div
                role="switch"
                aria-checked={theme === 'dark'}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: theme === 'dark' ? C.indigo : C.surface2,
                  border: `1px solid ${theme === 'dark' ? C.indigo : C.border2}`,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
                onClick={toggleTheme}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: 2,
                    left: 0,
                    transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(2px)',
                    transition: 'transform 200ms',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            </div>
            {PREFERENCE_ITEMS.map((pref, i, arr) => (
              <div
                key={pref.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border2}` : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text2, marginBottom: 4 }}>{pref.label}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{pref.desc}</div>
                </div>
                <div
                  role="switch"
                  aria-checked={preferences[pref.id]}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: preferences[pref.id] ? C.indigo : C.surface2,
                    border: `1px solid ${preferences[pref.id] ? C.indigo : C.border2}`,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                  onClick={() => togglePreference(pref.id)}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: 2,
                      left: 0,
                      transform: preferences[pref.id] ? 'translateX(18px)' : 'translateX(2px)',
                      transition: 'transform 200ms',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editOpen && (
        <div
          onClick={() => !saving && setEditOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 380,
              backgroundColor: C.surface,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 16px' }}>Edit Profile</h2>
            <label style={{ fontSize: 12, color: C.dim, display: 'block', marginBottom: 6 }}>Display name</label>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveProfile()}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface2,
                color: C.text,
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            <label style={{ fontSize: 12, color: C.dim, display: 'block', margin: '16px 0 6px' }}>Job role</label>
            <select
              value={roleInput}
              onChange={e => setRoleInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface2,
                color: C.text,
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              {JOB_ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <label style={{ fontSize: 12, color: C.dim, display: 'block', margin: '16px 0 6px' }}>Seniority</label>
            <select
              value={seniorityInput}
              onChange={e => setSeniorityInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface2,
                color: C.text,
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              {SENIORITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {saveError && (
              <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{saveError}</p>
            )}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setEditOpen(false)}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: `1px solid ${C.border2}`,
                  backgroundColor: 'transparent',
                  color: C.text2,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={!nameInput.trim() || saving}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: C.indigo,
                  color: '#fff',
                  cursor: nameInput.trim() && !saving ? 'pointer' : 'default',
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: nameInput.trim() && !saving ? 1 : 0.5,
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pwOpen && (
        <div
          onClick={() => !pwSaving && setPwOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 380,
              backgroundColor: C.surface,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 16px' }}>Change Password</h2>

            <label style={{ fontSize: 12, color: C.dim, display: 'block', marginBottom: 6 }}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface2,
                color: C.text,
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            <label style={{ fontSize: 12, color: C.dim, display: 'block', margin: '16px 0 6px' }}>New password (min 6 characters)</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && savePassword()}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: `1px solid ${C.border2}`,
                backgroundColor: C.surface2,
                color: C.text,
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            {pwError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{pwError}</p>}
            {pwSuccess && <p style={{ color: C.green, fontSize: 12, marginTop: 8 }}>Password updated.</p>}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setPwOpen(false)}
                disabled={pwSaving}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: `1px solid ${C.border2}`,
                  backgroundColor: 'transparent',
                  color: C.text2,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Close
              </button>
              <button
                onClick={savePassword}
                disabled={!currentPassword || newPassword.length < 6 || pwSaving}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: C.indigo,
                  color: '#fff',
                  cursor: currentPassword && newPassword.length >= 6 && !pwSaving ? 'pointer' : 'default',
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: currentPassword && newPassword.length >= 6 && !pwSaving ? 1 : 0.5,
                }}
              >
                {pwSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}

function AppShell() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>('home')
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const recordSearch = (q: string) => {
    setRecentSearches(prev => {
      const next = [q, ...prev.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 4)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const handleSearch = (q: string) => {
    recordSearch(q)
    setQuery(q)
    setPage('results')
  }

  const handleNav = (p: Page) => {
    setPage(p)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPage('home')
        setTimeout(() => {
          document.getElementById('main-search-input')?.focus()
        }, 50)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border2}`, borderTopColor: C.indigo, animation: 'pulse-dot 1s linear infinite' }} />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      <Sidebar page={page} onNav={handleNav} />
      <div style={{ marginLeft: 56, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar page={page} onNav={setPage} />
        <main style={{ flex: 1 }}>
          {page === 'home' && <HomePage onSearch={handleSearch} onRecordSearch={recordSearch} recentSearches={recentSearches} />}
          {page === 'results' && <ResultsPage query={query} />}
          {page === 'agents' && <AgentsPage />}
          {page === 'observability' && <ObservabilityPage />}
          {page === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  )
}
