# Design a High-Fidelity Enterprise AI Document Search Platform — “Vaultiq”

Design a polished, production-ready **enterprise SaaS web application** called **Vaultiq** — an intelligent document search and retrieval platform powered by multi-agent AI.

The design should feel like a premium developer/enterprise product inspired by **Linear, Vercel, Raycast, and modern AI infrastructure dashboards**.

The UI must be **dark-first, minimal, technical, sophisticated, spacious, and highly usable**. Avoid consumer-app aesthetics, excessive gradients, oversized illustrations, or unnecessary decoration.

---

## 1. Overall Design Direction

### Brand

* Product name: **Vaultiq**
* Logo: minimalist geometric mark combining a **vault/safe + magnifying glass/search symbol**
* Wordmark: “Vaultiq”
* Brand personality: secure, intelligent, precise, technical, trustworthy
* Primary accent: **Electric Indigo**
* Supporting status colors:

  * Green = success / completed
  * Amber = processing / warning
  * Red = error / failed
  * Neutral gray = inactive / secondary

### Visual Style

* Dark enterprise interface
* Background: near-black / charcoal
* Elevated surfaces slightly lighter than the background
* Thin 1px borders with low contrast
* Subtle indigo glow on active/hovered elements
* Large amounts of whitespace
* Rounded corners, but not overly rounded
* No excessive glassmorphism
* No heavy shadows
* No visual clutter

### Typography

Use **Inter** throughout.

Hierarchy:

* Large page headings: 32–40px, semibold
* Section headings: 18–22px, semibold
* Body: 14–16px
* Metadata: 12–13px
* Labels / badges: 11–12px, medium
* Tight but readable line heights

---

# 2. Create a Consistent Design System

Create reusable Figma components and variants for:

* Buttons
* Search input
* Navigation items
* Cards
* Document cards
* Tags
* Status badges
* Relevance score badges
* Agent status indicators
* Dropdowns
* Filter controls
* Breadcrumbs
* Tooltips
* Tabs
* Avatars / agent icons
* Progress indicators
* Toast notifications
* Side drawers
* Bottom drawers
* Data tables
* Empty states
* Loading states

Use **8px spacing increments** throughout the system.

Use consistent:

* Border radius
* Border color
* Text hierarchy
* Icon sizing
* Component padding
* Hover states
* Focus states
* Active states
* Disabled states

All components should feel like they belong to one cohesive enterprise design system.

---

# 3. Global Application Shell

Create a desktop-first SaaS application shell.

### Left Navigation

Persistent narrow sidebar:

* Vaultiq logo at top
* Search
* Documents
* Agents
* Observability
* Settings
* User/profile section at bottom

Active navigation item should use a subtle electric-indigo background and icon glow.

### Top Bar

Minimal top navigation:

* Breadcrumb/page title
* Global search shortcut indicator: `⌘ K`
* Notification icon
* User avatar

Do not make the top bar visually heavy.

---

# 4. Landing / Home Page

Create a centered, extremely clean home/search experience.

### Layout

* Vaultiq logo centered near the top
* Large headline:
  **“Search your enterprise knowledge.”**
* Supporting tagline:
  **“Intelligent Enterprise Search”**
* Large primary search bar centered below

Search placeholder:

**“Search across your documents...”**

Search bar should:

* Be approximately 640–760px wide
* Have a search icon
* Have subtle indigo focus glow
* Include keyboard shortcut `⌘ K`
* Feel like the primary interaction on the page

### Recent Searches

Below the search bar:

**Recent searches**

Show compact pill/chip components such as:

* “Q4 financial report”
* “Security architecture”
* “Employee onboarding”
* “API documentation”

Each chip should have subtle hover interaction.

### Supporting Content

Below recent searches, optionally show a minimal “Suggested searches” section with 3–4 suggestions.

Keep the page extremely minimal and spacious.

---

# 5. Search Results Page

Create the primary search results experience.

### Layout

Three-zone desktop layout:

**Left:** filter sidebar
**Center:** search results
**Right:** document preview drawer when activated

### Header

Show:

**Search results**

Search input remains visible at the top.

Example query:

> “security architecture”

Below it show:

**128 results · Search completed in 1.8s**

### Left Filter Sidebar

Title:

**Filters**

Sections:

**Document type**

* PDF
* DOCX
* PPTX
* Spreadsheet
* Web page

**Date**

* Today
* Last 7 days
* Last 30 days
* Custom range

**Tags**

* Engineering
* Security
* Finance
* HR
* Product

**Source**

* Google Drive
* Notion
* SharePoint
* Confluence
* Internal Wiki

Use collapsible filter groups.

Selected filters should use electric-indigo accents.

---

# 6. Search Result Cards

Create highly polished document result cards.

Each card contains:

### Header

* File/document icon
* Document title
* File type
* Last modified date

Example:

**Security Architecture Overview**
PDF · Updated 2 days ago

### AI Summary

Show a 2–3 line AI-generated excerpt:

> “The document describes the current zero-trust architecture, authentication flow, service boundaries, and internal security controls...”

Highlight relevant search terms subtly.

### Metadata

Show:

* Relevance score: **94%**
* Source: **Confluence**
* Tags: `Security`, `Engineering`
* Agent: **Search Agent**

### Interaction

Hover state:

* Slight surface elevation
* Subtle indigo border/glow
* Arrow/action icon appears

Clicking the card opens the document preview drawer.

---

# 7. Document Preview Drawer

Create a right-side document preview panel approximately 420–520px wide.

The drawer should slide in smoothly from the right.

### Header

Show breadcrumb:

**Engineering / Security / Architecture / security-overview.pdf**

Then:

* Document title
* File type
* Close button
* Open full document button

### Document Content

Display a realistic document preview.

Include:

* Document title
* Headings
* Paragraphs
* Lists
* Metadata

The section most relevant to the query should be highlighted with a **subtle electric-indigo background**.

Add a small contextual indicator:

**Relevant passage · 94% match**

### Bottom Metadata

Sticky bottom section containing:

* Tags
* Source
* Last updated
* Processed by agent
* Relevance score

---

# 8. Multi-Agent Pipeline View

Create a dedicated **Agents** dashboard.

Page title:

**AI Processing Pipeline**

Subtitle:

**Real-time document processing and retrieval orchestration**

### Pipeline

Display a horizontal visual pipeline:

**Tag Generator Agent → Search Agent → Critique Agent**

Each agent should be represented as a premium card/node.

### Agent Card

Each card includes:

* Agent icon
* Agent name
* Status
* Current task
* Documents processed
* Confidence score
* Processing time

Example:

**Tag Generator Agent**

Status:
● Complete

Documents processed:
**1,248**

Confidence:
**96.4%**

Latency:
**420ms**

Second example:

**Search Agent**

Status:
● Processing

Documents processed:
**1,248**

Confidence:
**93.8%**

Latency:
**1.2s**

Third:

**Critique Agent**

Status:
○ Waiting

Documents processed:
**1,247**

Confidence:
**—**

### Real-Time Feel

Use subtle animations:

* Pulsing status indicator
* Animated connection line between agents
* Progress indicator
* Small activity updates
* Smooth number transitions

Animations should be restrained and enterprise-grade, never distracting.

---

# 9. Langfuse Observability Panel

Create a dedicated **Observability** page inspired by modern infrastructure monitoring tools.

Header:

**LLM Observability**

Subtitle:

**Monitor AI agent performance, latency, cost, and reliability.**

### Top Metrics

Create four compact metric cards:

**Total LLM Calls**
12,482

**Avg Latency**
1.42s

**Tokens Used**
2.8M

**Estimated Cost**
$18.42

### Trace Timeline

Create a trace visualization showing:

**User Query**
↓
**Search Agent**
↓
**Retriever**
↓
**LLM Call**
↓
**Critique Agent**
↓
**Final Response**

Each step displays:

* Duration
* Status
* Token count
* Model
* Cost

### Trace Table

Dark table with columns:

| Trace | Agent | Model | Latency | Tokens | Cost | Status |
| ----- | ----- | ----- | ------- | ------ | ---- | ------ |

Example rows:

Search Agent | Search Agent | Claude | 820ms | 1,240 | $0.004 | Complete

Critique Agent | Critique Agent | Claude | 1.1s | 1,840 | $0.007 | Complete

Use:

* Green indicators for successful calls
* Red indicators for failures
* Amber for slow/warning calls

Include filtering and sorting controls.

---

# 10. Search + Agent + Observability Relationship

Make the product feel like one connected system.

The user journey should visually communicate:

**Search query**
→ **AI agents process documents**
→ **Relevant documents retrieved**
→ **Critique validates results**
→ **User receives trustworthy answer**
→ **Langfuse traces the entire process**

Use subtle connections between these experiences.

---

# 11. Interaction & Motion Design

Use smooth micro-interactions throughout.

### Search

* Focus glow
* Search suggestions
* Keyboard shortcut feedback
* Loading state

### Cards

* Hover elevation
* Border glow
* Smooth transitions

### Drawer

* Smooth slide-in/out
* Backdrop fade
* Preserve underlying page state

### Agents

* Pulsing status indicators
* Animated processing state
* Smooth progress updates

### Tables

* Row hover
* Expandable trace details
* Status transitions

Keep all animation subtle and fast:
**150–250ms transitions**

---

# 12. Responsive Behavior

Primary target:

**1440 × 1024 desktop**

Also design responsive behavior for:

* 1280px desktop
* 1024px tablet
* 768px tablet/mobile transition

On smaller screens:

* Collapse filter sidebar
* Convert document preview to full-screen modal
* Stack agent pipeline vertically
* Make tables horizontally scrollable
* Preserve search as the primary interaction

---

# 13. Accessibility

Ensure:

* Strong text/background contrast
* Visible keyboard focus states
* Minimum 44px interactive touch targets
* Icons accompanied by accessible labels
* Do not rely solely on color to communicate status

---

# 14. Figma File Structure

Organize the Figma file into pages:

1. **Cover**
2. **Design System**
3. **Components**
4. **Home**
5. **Search Results**
6. **Document Preview**
7. **AI Agents**
8. **Observability**
9. **Responsive States**

Create reusable components and variants wherever possible.

---

# 15. Final Visual Goal

The finished design should look like a **real enterprise AI product that could be shipped**, not a generic AI dashboard.

Think:

**Linear's precision + Vercel's minimalism + modern AI observability tooling + enterprise document intelligence.**

Prioritize:

* Information hierarchy
* Usability
* Technical credibility
* Consistency
* Spacious layouts
* Subtle visual depth
* Excellent typography
* High-quality interaction states

Avoid:

* Excessive gradients
* Neon cyberpunk aesthetics
* Giant decorative illustrations
* Excessive rounded cards
* Consumer-style onboarding
* Cluttered dashboards
* Excessive shadows
* Generic AI sparkle icons

The final result should feel **premium, secure, intelligent, technical, and enterprise-grade**.
