# Editor Workflow Guide

Complete workflow documentation for the AI Website Editor with color palette system, project settings, and user/admin roles.

---

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ADMIN                              USER                                    │
│   ┌─────────────┐                   ┌─────────────┐                         │
│   │ • Elements  │                   │ • Projects  │                         │
│   │ • Layouts   │──── publishes ───▶│ • Pages     │                         │
│   │ • Palettes  │                   │ • Custom    │                         │
│   └─────────────┘                   └─────────────┘                         │
│          │                                 │                                 │
│          └────────────────┬────────────────┘                                │
│                           ▼                                                  │
│                  ┌─────────────────┐                                        │
│                  │   JSON FILES    │                                        │
│                  │   (/data/)      │                                        │
│                  └─────────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette System Workflow

### How Palettes Work

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COLOR PALETTE FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER SELECTS PALETTE                                                     │
│     ┌──────────────────────────────────────────────────────────────────┐    │
│     │  Available Palettes:                                              │    │
│     │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │    │
│     │  │ Ocean   │  │ Forest  │  │ Sunset  │  │ Custom  │             │    │
│     │  │ Blue    │  │ Green   │  │ Orange  │  │ [+]     │             │    │
│     │  │ ███████ │  │ ███████ │  │ ███████ │  │ Create  │             │    │
│     │  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │    │
│     └──────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  2. PALETTE APPLIED TO PROJECT                                               │
│     ┌──────────────────────────────────────────────────────────────────┐    │
│     │  project.settings.palette = {                                     │    │
│     │    id: "palette_ocean_blue",                                      │    │
│     │    customOverrides: null  // User can override specific colors    │    │
│     │  }                                                                │    │
│     └──────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  3. ELEMENTS USE PALETTE REFERENCES                                          │
│     ┌──────────────────────────────────────────────────────────────────┐    │
│     │  Button Style:                                                    │    │
│     │  {                                                                │    │
│     │    backgroundColor: { "$palette": "primary" },   // Not #3B82F6   │    │
│     │    color: { "$palette": "textInverse" }          // Not #FFFFFF   │    │
│     │  }                                                                │    │
│     └──────────────────────────────────────────────────────────────────┘    │
│                              │                                               │
│                              ▼                                               │
│  4. RENDERING: PALETTE RESOLVED TO ACTUAL COLORS                             │
│     ┌──────────────────────────────────────────────────────────────────┐    │
│     │  Resolved Style:                                                  │    │
│     │  {                                                                │    │
│     │    backgroundColor: "#3B82F6",  // From palette.colors.primary    │    │
│     │    color: "#FFFFFF"             // From palette.colors.textInverse│    │
│     │  }                                                                │    │
│     └──────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  5. USER CHANGES PALETTE → ALL ELEMENTS UPDATE AUTOMATICALLY!                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Palette Colors Reference

| Color Key | Purpose | Example Use |
|-----------|---------|-------------|
| `primary` | Main brand color | Buttons, links, highlights |
| `primaryHover` | Primary hover state | Button hover |
| `primaryLight` | Light primary | Backgrounds, badges |
| `secondary` | Secondary brand color | Secondary buttons |
| `accent` | Attention color | Alerts, notifications |
| `background` | Page background | Body, main areas |
| `surface` | Card/section background | Cards, modals |
| `text` | Primary text | Headings, body text |
| `textMuted` | Secondary text | Descriptions, captions |
| `textInverse` | Text on dark backgrounds | Button text |
| `border` | Border color | Input borders, dividers |
| `success/warning/error` | Status colors | Form validation, alerts |

---

## ⚙️ Project Settings Workflow

### Settings Panel UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT SETTINGS PANEL                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [⚙️ Settings]                                                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🎨 Color Palette                                          [Change]  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Current: Ocean Blue                                                │    │
│  │  ████ ████ ████ ████ ████ ████                                     │    │
│  │  Primary  Secondary  Accent  BG  Surface  Text                      │    │
│  │                                                                     │    │
│  │  [Override Colors ▼]                                                │    │
│  │  Primary: [#3B82F6] 🎨  (reset to palette default)                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🔤 Typography                                                  [▼]  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Primary Font:    [Inter              ▼]                            │    │
│  │  Heading Font:    [Inter              ▼]                            │    │
│  │  Base Size:       [16px     ]                                       │    │
│  │  Line Height:     [1.6      ]                                       │    │
│  │                                                                     │    │
│  │  Heading Sizes:                                                     │    │
│  │  H1: [3rem]  H2: [2.25rem]  H3: [1.875rem]                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 📏 Spacing                                                     [▼]  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Base Unit:       [4px]                                             │    │
│  │  Container Padding:                                                 │    │
│  │    Mobile: [16px]  Tablet: [24px]  Desktop: [32px]                 │    │
│  │  Section Gap:     [64px]                                            │    │
│  │  Element Gap:     [16px]                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 📐 Layout                                                      [▼]  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Max Content Width:  [1200px]                                       │    │
│  │  Default Alignment:  [● Left] [○ Center] [○ Right]                 │    │
│  │                                                                     │    │
│  │  Breakpoints:                                                       │    │
│  │  Mobile: [375px]  Tablet: [768px]  Desktop: [1024px]               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 🔲 Borders & Effects                                           [▼]  │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Border Radius:                                                     │    │
│  │  None: [0]  SM: [4px]  MD: [8px]  LG: [12px]  Full: [9999px]       │    │
│  │                                                                     │    │
│  │  Default Shadow:  [None ▼]                                          │    │
│  │  Transition Speed: [● Fast] [○ Normal] [○ Slow]                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                              [Save Settings]                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Settings Resolution

Elements can reference project settings:

```json
{
  "styles": {
    "base": {
      "fontSize": { "$settings": "typography.baseFontSize" },
      "fontFamily": { "$settings": "typography.fontFamily.primary" },
      "borderRadius": { "$settings": "borders.radius.md" },
      "maxWidth": { "$settings": "layout.maxWidth" }
    }
  }
}
```

---

## 👥 User Roles Workflow

### Admin Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADMIN WORKFLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ADMIN PANEL (/admin)                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  [Elements]  [Layouts]  [Palettes]  [Users]                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  1. MANAGE ELEMENTS                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Element Library                                                    │    │
│  │  ┌──────────┬──────────┬──────────┬──────────┐                     │    │
│  │  │ Basic    │ Layout   │ Forms    │ Blocks   │                     │    │
│  │  └──────────┴──────────┴──────────┴──────────┘                     │    │
│  │                                                                     │    │
│  │  📝 Text       [Edit] [Published ✓]                                │    │
│  │  🔤 Heading    [Edit] [Published ✓]                                │    │
│  │  🔘 Button     [Edit] [Published ✓]                                │    │
│  │  🖼️ Image      [Edit] [Published ✓]                                │    │
│  │  ...                                                                │    │
│  │                                                                     │    │
│  │  [+ Add New Element]                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  2. MANAGE COMPONENT LAYOUTS                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Component Layouts                                                  │    │
│  │                                                                     │    │
│  │  Headers:                                                           │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                             │    │
│  │  │ Simple  │  │ Centered│  │ [+ New] │                             │    │
│  │  └─────────┘  └─────────┘  └─────────┘                             │    │
│  │                                                                     │    │
│  │  Footers:                                                           │    │
│  │  ┌─────────┐  ┌─────────┐                                          │    │
│  │  │ Simple  │  │ Columns │                                          │    │
│  │  └─────────┘  └─────────┘                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  3. MANAGE PALETTES                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Color Palettes                                                     │    │
│  │                                                                     │    │
│  │  Ocean Blue    [Edit] [Published ✓]                                │    │
│  │  Forest Green  [Edit] [Published ✓]                                │    │
│  │  Sunset Orange [Edit] [Published ✓]                                │    │
│  │  Midnight      [Edit] [Published ✓]                                │    │
│  │                                                                     │    │
│  │  [+ Create New Palette]                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER WORKFLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DASHBOARD (/)                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  My Projects                                              [+ New]   │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │    │
│  │  │ My Demo Site  │  │ Portfolio     │  │ Blog          │          │    │
│  │  │ 3 pages       │  │ 5 pages       │  │ 2 pages       │          │    │
│  │  │ [Edit]        │  │ [Edit]        │  │ [Edit]        │          │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  CREATE PROJECT FLOW:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. Enter Project Name                                              │    │
│  │     [My New Website                    ]                            │    │
│  │                                                                     │    │
│  │  2. Choose Color Palette                                            │    │
│  │     [Ocean Blue ▼]  or  [Create Custom]                            │    │
│  │     ████ ████ ████ ████ (preview)                                  │    │
│  │                                                                     │    │
│  │  3. Choose Typography                                               │    │
│  │     Primary Font: [Inter ▼]                                        │    │
│  │     Heading Font: [Inter ▼]                                        │    │
│  │                                                                     │    │
│  │  4. Choose Starting Template (optional)                             │    │
│  │     [Blank] [Landing] [Portfolio] [Blog]                           │    │
│  │                                                                     │    │
│  │                                    [Cancel]  [Create Project]       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Layout System Workflow

### Component Layouts (Admin Creates, Users Use)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT LAYOUT FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ADMIN: Creates Header Layout                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Layout: "Simple Header"                                            │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │  Logo Text        Nav Links        CTA Button               │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                     │    │
│  │  Exposed Props (user can customize):                                │    │
│  │  • Logo Text                                                        │    │
│  │  • CTA Button Text                                                  │    │
│  │  • CTA Button Link                                                  │    │
│  │                                                                     │    │
│  │  [✓ Published]                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                           ↓ (user sees)                                      │
│                                                                              │
│  USER: Uses Header Layout                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Layouts Panel                                                      │    │
│  │  ┌─────────┐  ┌─────────┐                                          │    │
│  │  │ Simple  │  │ Centered│                                          │    │
│  │  │ Header  │  │ Header  │  ← Click to use                          │    │
│  │  └─────────┘  └─────────┘                                          │    │
│  │                                                                     │    │
│  │  Customize:                                                         │    │
│  │  Logo Text:     [My Brand        ]                                  │    │
│  │  CTA Text:      [Get Started     ]                                  │    │
│  │  CTA Link:      [/signup         ]                                  │    │
│  │                                                                     │    │
│  │  ✨ Colors automatically match project palette!                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page Layouts (Templates with Placeholders)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PAGE LAYOUT FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Available Page Layouts:                                                     │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌───┬─────┐ │        │
│  │ │         │ │  │ │ Header  │ │  │ │ Header  │ │  │ │   │     │ │        │
│  │ │         │ │  │ ├─────────┤ │  │ ├─────────┤ │  │ │ S │     │ │        │
│  │ │  Blank  │ │  │ │         │ │  │ │  Hero   │ │  │ │ i │     │ │        │
│  │ │         │ │  │ │ Content │ │  │ ├─────────┤ │  │ │ d │ Con │ │        │
│  │ │         │ │  │ │         │ │  │ │ Content │ │  │ │ e │ tent│ │        │
│  │ │         │ │  │ ├─────────┤ │  │ ├─────────┤ │  │ │   │     │ │        │
│  │ └─────────┘ │  │ │ Footer  │ │  │ │ Footer  │ │  │ └───┴─────┘ │        │
│  │   Blank     │  │  Standard   │  │   Landing   │  │   Sidebar    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  User selects "Standard" layout:                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  FIXED: Header (from component layout)                              │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  SLOT: "Main Content"                                               │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │                                                             │   │    │
│  │  │        [Drag elements here]                                 │   │    │
│  │  │                                                             │   │    │
│  │  │        User can add any elements to this slot               │   │    │
│  │  │                                                             │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │                                                                     │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  FIXED: Footer (from component layout)                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Benefits:                                                                   │
│  • Header/Footer consistent across pages                                     │
│  • Update header once → all pages update                                     │
│  • Faster page creation                                                      │
│  • Consistent look and feel                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Custom Elements Workflow (User)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOM ELEMENTS (USER)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Users can create their OWN reusable elements (private to their account)    │
│                                                                              │
│  CREATE CUSTOM ELEMENT:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. Select elements on canvas                                       │    │
│  │  2. Right-click → "Save as Custom Element"                          │    │
│  │  3. Enter name: "My Special Card"                                   │    │
│  │  4. Choose which props to expose                                    │    │
│  │  5. Save                                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ELEMENTS PANEL (for user):                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  [Basic] [Layout] [Forms] [Blocks] [★ My Elements]                  │    │
│  │                                                                     │    │
│  │  Admin Elements (read-only, published):                             │    │
│  │  • Text                                                             │    │
│  │  • Button                                                           │    │
│  │  • Image                                                            │    │
│  │  • ...                                                              │    │
│  │                                                                     │    │
│  │  ★ My Custom Elements:                                              │    │
│  │  • My Special Card        [Edit] [Delete]                           │    │
│  │  • Pricing Table          [Edit] [Delete]                           │    │
│  │  • Contact Form           [Edit] [Delete]                           │    │
│  │  [+ Create New]                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  NOTE: User custom elements are stored in:                                   │
│  /data/elements/custom/[userId]/elements.json                               │
│                                                                              │
│  They automatically use the project's palette and settings!                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌊 Streaming Page Load Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     STREAMING PAGE LOAD (Prevents UI Freeze)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User clicks page "Home"                                                     │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PHASE 1: INSTANT (0-50ms)                                          │    │
│  │  • Show skeleton UI immediately                                     │    │
│  │  • Load page metadata (title, settings)                             │    │
│  │  • Canvas frame renders                                             │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────┐                           │    │
│  │  │  ████████████████  Loading...       │  ← Skeleton               │    │
│  │  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                   │                           │    │
│  │  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                   │                           │    │
│  │  └─────────────────────────────────────┘                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PHASE 2: STREAMING (50ms - 2s)                                     │    │
│  │  • Load elements in chunks of 10                                    │    │
│  │  • 16ms delay between chunks (1 frame)                              │    │
│  │  • UI stays responsive during load                                  │    │
│  │                                                                     │    │
│  │  Chunk 1 (visible):     [████████░░░░░░░░] Elements 1-10            │    │
│  │       ↓ 16ms                                                        │    │
│  │  Chunk 2:               [████████████░░░░] Elements 11-20           │    │
│  │       ↓ 16ms                                                        │    │
│  │  Chunk 3:               [████████████████] Elements 21-30           │    │
│  │       ↓ ...                                                         │    │
│  │  Complete!              [████████████████] All elements             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PHASE 3: DEFERRED (Background)                                     │    │
│  │  • Lazy load images                                                 │    │
│  │  • Load animation data                                              │    │
│  │  • Preload adjacent pages                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Streaming Implementation

```typescript
// API Route: /api/pages/[id]/stream
export async function GET(request: Request, { params }) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send metadata immediately
      const metadata = await getPageMetadata(params.id);
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'metadata', data: metadata })}\n\n`
      ));
      
      // 2. Stream elements in chunks
      const elements = await getPageElements(params.id);
      const chunks = chunkArray(elements, 10);
      
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: 'elements', data: chunk })}\n\n`
        ));
        await delay(16); // 1 frame
      }
      
      // 3. Signal completion
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'complete' })}\n\n`
      ));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Client-Side Consumption

```typescript
// Hook for streaming page load
function useStreamingPage(pageId: string) {
  const [state, setState] = useState({
    metadata: null,
    elements: [],
    status: 'loading', // 'loading' | 'streaming' | 'complete' | 'error'
    progress: 0,
  });
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/pages/${pageId}/stream`);
    
    eventSource.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      switch (type) {
        case 'metadata':
          setState(prev => ({ ...prev, metadata: data, status: 'streaming' }));
          break;
        case 'elements':
          setState(prev => ({
            ...prev,
            elements: [...prev.elements, ...data],
            progress: prev.progress + data.length,
          }));
          break;
        case 'complete':
          setState(prev => ({ ...prev, status: 'complete' }));
          eventSource.close();
          break;
      }
    };
    
    eventSource.onerror = () => {
      setState(prev => ({ ...prev, status: 'error' }));
      eventSource.close();
    };
    
    return () => eventSource.close();
  }, [pageId]);
  
  return state;
}
```

### Virtual Scrolling (Layers Panel)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     VIRTUAL SCROLLING FOR LAYERS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Problem: 500 elements = 500 DOM nodes = SLOW                                │
│  Solution: Only render visible items + buffer                                │
│                                                                              │
│  ┌─────────────────────────┐                                                │
│  │   (not rendered)        │  ← Above viewport                              │
│  │   ...                   │                                                 │
│  ├─────────────────────────┤                                                │
│  │ ▶ Header               │  ← Buffer (5 items)                             │
│  │ ▶ Hero Section         │                                                 │
│  ├═════════════════════════┤  ═══ VIEWPORT START ═══                        │
│  │ ▶ Features Grid        │                                                 │
│  │   ├─ Feature 1         │  ← Visible items                                │
│  │   ├─ Feature 2         │                                                 │
│  │   └─ Feature 3         │                                                 │
│  │ ▶ Testimonials         │                                                 │
│  │ ▶ CTA Section          │                                                 │
│  ├═════════════════════════┤  ═══ VIEWPORT END ═══                          │
│  │ ▶ Footer               │                                                 │
│  │ ▶ ...                  │  ← Buffer (5 items)                             │
│  ├─────────────────────────┤                                                │
│  │   (not rendered)        │  ← Below viewport                              │
│  │   ...                   │                                                 │
│  └─────────────────────────┘                                                │
│                                                                              │
│  Result: 500 elements but only ~15 DOM nodes!                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Flow (File-Based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FILE-BASED DATA FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  READ FLOW (Page Load):                                                      │
│                                                                              │
│  Browser                Next.js API            File System                   │
│  ───────                ───────────            ───────────                   │
│     │                       │                       │                        │
│     │──── GET /api/project ──▶│                       │                        │
│     │                       │──── readFile() ────────▶│                        │
│     │                       │◀──── JSON data ─────────│                        │
│     │◀──── project data ────│                       │                        │
│     │                       │                       │                        │
│                                                                              │
│  WRITE FLOW (Save):                                                          │
│                                                                              │
│  Browser                Next.js API            File System                   │
│  ───────                ───────────            ───────────                   │
│     │                       │                       │                        │
│     │── PUT /api/project ───▶│                       │                        │
│     │     (JSON body)       │                       │                        │
│     │                       │──── writeFile() ───────▶│                        │
│     │                       │◀──── success ──────────│                        │
│     │◀──── 200 OK ──────────│                       │                        │
│     │                       │                       │                        │
│                                                                              │
│  FILE STRUCTURE:                                                             │
│  /data/                                                                      │
│  ├── users/                                                                  │
│  │   ├── admin.json                                                          │
│  │   └── user_demo.json                                                      │
│  ├── projects/                                                               │
│  │   └── project_demo/                                                       │
│  │       ├── project.json                                                    │
│  │       └── pages/                                                          │
│  │           ├── home.json                                                   │
│  │           ├── about.json                                                  │
│  │           └── contact.json                                                │
│  ├── elements/                                                               │
│  │   ├── admin/                                                              │
│  │   │   ├── basic.json                                                      │
│  │   │   ├── layout.json                                                     │
│  │   │   ├── forms.json                                                      │
│  │   │   └── blocks.json                                                     │
│  │   └── custom/                                                             │
│  │       └── user_demo/                                                      │
│  │           └── elements.json                                               │
│  ├── layouts/                                                                │
│  │   ├── components/                                                         │
│  │   │   ├── headers.json                                                    │
│  │   │   └── footers.json                                                    │
│  │   └── pages/                                                              │
│  │       └── standard.json                                                   │
│  ├── palettes/                                                               │
│  │   └── system.json                                                         │
│  └── settings/                                                               │
│      └── default.json                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Auto-Apply Workflow

When user drops an element:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTO-APPLY FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User drags "Button" from elements panel                                  │
│                                                                              │
│  2. System loads element definition:                                         │
│     {                                                                        │
│       type: "button",                                                        │
│       defaultStyles: {                                                       │
│         backgroundColor: { "$palette": "primary" },                          │
│         color: { "$palette": "textInverse" },                                │
│         borderRadius: { "$settings": "borders.radius.md" }                   │
│       }                                                                      │
│     }                                                                        │
│                                                                              │
│  3. System resolves against project settings:                                │
│     Project palette: "Ocean Blue"                                            │
│     → primary = "#3B82F6"                                                    │
│     → textInverse = "#FFFFFF"                                                │
│                                                                              │
│     Project settings: borders.radius.md = "8px"                              │
│                                                                              │
│  4. Rendered button automatically has:                                       │
│     • Blue background (#3B82F6)                                              │
│     • White text (#FFFFFF)                                                   │
│     • 8px border radius                                                      │
│                                                                              │
│  5. If user changes project palette to "Sunset Orange":                      │
│     → Button automatically becomes orange!                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔮 Future: AI Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FUTURE: AI FEATURES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USER INPUT:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  "Create a landing page for my bakery called Sweet Dreams.          │    │
│  │   It should have a hero section with an image of cupcakes,          │    │
│  │   a menu section, testimonials, and a contact form."                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  AI GENERATES:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Complete page structure with:                                      │    │
│  │  • Header with "Sweet Dreams" branding                              │    │
│  │  • Hero section with cupcake placeholder image                      │    │
│  │  • Menu grid with sample items                                      │    │
│  │  • Testimonials section                                             │    │
│  │  • Contact form                                                     │    │
│  │  • Footer                                                           │    │
│  │                                                                     │    │
│  │  All using the project's color palette and settings!                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  USER CAN THEN:                                                              │
│  • Accept the generated page                                                 │
│  • Modify elements                                                           │
│  • Regenerate specific sections                                              │
│  • Ask AI for changes: "Make the hero section bigger"                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Phase 1: Core Setup
- [ ] Initialize Next.js + Tailwind project
- [ ] Create file storage utilities
- [ ] Set up mock data loading
- [ ] Create basic editor layout

### Phase 2: Palette & Settings
- [ ] Implement palette loading
- [ ] Create palette picker UI
- [ ] Implement settings panel
- [ ] Create palette resolution function

### Phase 3: Elements
- [ ] Load admin elements from JSON
- [ ] Create elements panel UI
- [ ] Implement drag & drop
- [ ] Auto-apply palette/settings to elements

### Phase 4: Layouts
- [ ] Load component layouts
- [ ] Create layout picker UI
- [ ] Implement page layouts with slots
- [ ] Allow layout customization

### Phase 5: User Features
- [ ] User custom elements
- [ ] Save/load projects
- [ ] Page management
- [ ] Preview & export

### Phase 6: Polish
- [ ] Responsive design
- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Animation support

---

Ready to start building? Let's go! 🚀
