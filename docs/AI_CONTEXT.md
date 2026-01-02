# 🤖 AI Agent Context - Website Editor Project

> **Copy this entire file to any AI agent to brief them on the project.**
> Last Updated: January 2, 2026

---

## 📋 PROJECT SUMMARY (TL;DR)

Building a **drag-and-drop website editor** like Webflow/Wix using:
- **Tech**: Next.js 14 + Tailwind CSS + TypeScript
- **Storage**: JSON files (no database)
- **Design**: Material Design 3, Light/Dark mode
- **Primary Color**: `linear-gradient(to right, #492cddff, #ad38e2ff)` (Purple gradient)

---

## 🎨 BRAND & DESIGN SYSTEM

### Primary Colors
```css
--gradient-primary: linear-gradient(to right, #492cdd, #ad38e2);
--color-primary: #492cdd;
--color-primary-light: #ad38e2;
--color-primary-dark: #3720a8;
```

### Design Style
- **Material Design 3** (Google's latest design system)
- Elevated surfaces with subtle shadows
- Rounded corners (12-16px for cards)
- Smooth transitions (200-300ms)
- Light AND Dark mode support

### UI Characteristics
```
✓ Elevated cards with shadows
✓ Ripple effects on buttons
✓ Smooth state transitions
✓ Backdrop blur for overlays
✓ Subtle gradients
✓ Icon + text buttons
✓ Floating action buttons
✓ Bottom sheets (mobile)
✓ Snackbar notifications
```

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        EDITOR LAYOUT                             │
├──────────────┬──────────────────────────────────────────────────┤
│   SIDEBAR    │            MAIN AREA                              │
│   (280px)    │  ┌────────────────────────────────────────────┐  │
│              │  │  TOOLBAR (Save, Undo, Device, Zoom)        │  │
│  ┌────────┐  │  ├────────────────────────────────────────────┤  │
│  │ Pages  │  │  │                                            │  │
│  │Elements│  │  │              CANVAS                        │  │
│  │ Layers │  │  │         (Device Frame)                     │  │
│  │ Assets │  │  │                                            │  │
│  │Settings│  │  │                                            │  │
│  └────────┘  │  └────────────────────────────────────────────┘  │
│              │                                                   │
├──────────────┴───────────────────────────────┬───────────────────┤
│                                              │  STYLE PANEL      │
│                                              │  (320px, right)   │
└──────────────────────────────────────────────┴───────────────────┘
```

---

## 📁 FILE STRUCTURE

```
ai-editor/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard
│   │   ├── editor/[id]/        # Editor page
│   │   └── api/                # API routes (file operations)
│   │
│   ├── components/
│   │   ├── editor/             # Editor components
│   │   ├── sidebar/            # Left panel
│   │   ├── panels/             # Right panel (styles)
│   │   ├── elements/           # Draggable elements
│   │   └── ui/                 # Material UI components
│   │
│   ├── lib/
│   │   ├── storage/            # JSON file operations
│   │   └── utils/              # Helpers (palette, styles)
│   │
│   ├── store/                  # Zustand state
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global CSS + themes
│
├── data/                       # JSON data storage
│   ├── users/                  # User profiles
│   ├── projects/               # Projects & pages
│   ├── elements/admin/         # Element definitions
│   ├── layouts/                # Component & page layouts
│   └── palettes/               # Color palettes
│
└── docs/                       # Documentation
```

---

## 🔑 KEY CONCEPTS

### 1. Color Palette System
Elements use references, not hardcoded colors:
```json
{
  "backgroundColor": { "$palette": "primary" }
}
```
When palette changes, ALL elements update automatically.

### 2. Project Settings
Global defaults (fonts, spacing, borders) that apply everywhere:
```json
{
  "fontSize": { "$settings": "typography.baseFontSize" }
}
```

### 3. User Roles
- **Admin**: Manages element library, layouts, palettes
- **User**: Creates projects, uses admin elements, custom elements

### 4. File-Based Storage
All data in JSON files under `/data/` folder. No database needed.

---

## 🛠️ TECH STACK

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | Zustand |
| Drag & Drop | @dnd-kit/core |
| Icons | Lucide React |
| Animations | Framer Motion |
| Theme | next-themes (dark mode) |
| Virtual List | @tanstack/react-virtual |

---

## 🌊 STREAMING & PROGRESSIVE LOADING

**Critical**: Large pages must NOT freeze the UI. Use streaming:

```
Load Flow:
1. Metadata first (instant)     → Show skeleton
2. Elements in chunks (10/batch) → Progressive render
3. Heavy assets last (deferred)  → Lazy load
```

### Implementation Pattern

```typescript
// Stream elements in chunks to prevent freezing
async function* streamElements(elements: Element[]) {
  const chunks = chunkArray(elements, 10);  // 10 per batch
  for (const chunk of chunks) {
    yield chunk;
    await new Promise(r => setTimeout(r, 16));  // 1 frame delay
  }
}

// Use in component
function Canvas({ pageId }) {
  const [elements, setElements] = useState([]);
  
  useEffect(() => {
    loadPageStreaming(pageId, (chunk) => {
      setElements(prev => [...prev, ...chunk]);
    });
  }, [pageId]);
  
  return <>{elements.map(el => <Element key={el.id} {...el} />)}</>;
}
```

### Suspense Boundaries
```tsx
<Suspense fallback={<CanvasSkeleton />}>
  <Canvas />  {/* Streams content */}
</Suspense>
```

### Virtual Scrolling (Layers Panel)
```tsx
// Only render visible items - critical for 100+ elements
<VirtualList items={elements} itemHeight={40} overscan={5} />
```

---

## 📐 COMPONENT SPECIFICATIONS

### Material Design Tokens (Tailwind)
```javascript
// tailwind.config.js
{
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#492cdd',
          light: '#ad38e2',
          dark: '#3720a8',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e1e1e',
        },
        'surface-variant': {
          light: '#f5f5f5',
          dark: '#2d2d2d',
        }
      },
      borderRadius: {
        'material': '12px',
        'material-lg': '16px',
        'material-xl': '28px',
      },
      boxShadow: {
        'material-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'material-2': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'material-3': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
      }
    }
  }
}
```

### Button Styles
```jsx
// Primary Button (gradient)
<button className="
  bg-gradient-to-r from-[#492cdd] to-[#ad38e2]
  text-white font-medium px-6 py-3
  rounded-material shadow-material-1
  hover:shadow-material-2 hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-200
">
  Button
</button>
```

### Card Styles
```jsx
// Material Card
<div className="
  bg-white dark:bg-surface-dark
  rounded-material-lg shadow-material-2
  p-6 transition-shadow duration-200
  hover:shadow-material-3
">
  Content
</div>
```

---

## 🎯 CURRENT PRIORITIES

### Must Have (Phase 1)
1. ✅ Project structure & documentation
2. ⬜ Initialize Next.js with Tailwind
3. ⬜ Material Design theme (light/dark)
4. ⬜ Editor layout (sidebar, canvas, panels)
5. ⬜ File storage utilities
6. ⬜ **Streaming page loader** (prevent UI freeze)
7. ⬜ Element drag & drop
8. ⬜ Style panel basics

### Nice to Have (Phase 2)
- Virtual scrolling for layers
- Responsive breakpoints
- Undo/redo
- Custom elements
- Page layouts

### Future (Phase 3+)
- Animations
- AI page generation
- Export/publish

---

## 📝 CODING CONVENTIONS

### File Naming
- Components: `PascalCase.tsx` (e.g., `EditorCanvas.tsx`)
- Utilities: `camelCase.ts` (e.g., `paletteUtils.ts`)
- Types: `types.ts` or `index.ts` in `/types`

### Component Structure
```tsx
// Standard component template
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export function Component({ className, children }: ComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

### State Management
```typescript
// Zustand store pattern
import { create } from 'zustand';

interface EditorState {
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedElement: null,
  setSelectedElement: (id) => set({ selectedElement: id }),
}));
```

---

## 🚫 DO NOT

- ❌ Use database (files only for now)
- ❌ Add authentication (mock users)
- ❌ Over-engineer (keep it simple)
- ❌ Use complex CSS frameworks
- ❌ Add features not in current phase

---

## ✅ DO

- ✓ Use TypeScript strictly
- ✓ Follow Material Design 3
- ✓ Support dark mode
- ✓ Use the purple gradient for CTAs
- ✓ Keep components small & focused
- ✓ Use Tailwind utilities
- ✓ Read existing files before editing

---

## 📚 REFERENCE FILES

When working on this project, read these files:
1. `/README.md` - Setup instructions
2. `/ARCHITECTURE.md` - Data structures + **streaming strategy**
3. `/WORKFLOW.md` - Editor workflows
4. `/data/palettes/system.json` - Color palettes
5. `/data/elements/admin/*.json` - Element definitions
6. `/data/settings/loading-strategy.json` - **Streaming config**

---

## 💬 QUICK PROMPTS FOR AGENTS

### Starting Fresh
```
Read AI_CONTEXT.md first, then help me [task].
```

### Specific Tasks
```
# Create component
"Create a Material Design [component] with dark mode support using the purple gradient."

# Fix styling
"Update [component] to follow Material Design 3 with proper shadows and transitions."

# Add feature
"Add [feature] following the existing architecture in ARCHITECTURE.md."
```

---

## 🔗 EXTERNAL REFERENCES

- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [@dnd-kit](https://dndkit.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Copy this file to any AI agent to get started immediately!**

