# 🎨 AI Website Editor

A modern, Material Design drag-and-drop website builder.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

## 📁 Project Structure

```
ai-editor/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx            # Dashboard
│   │   └── editor/[id]/        # Editor page
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── editor/             # Editor components
│   │   ├── sidebar/            # Left sidebar
│   │   ├── panels/             # Right panels
│   │   └── elements/           # Element renderers
│   ├── store/                  # Zustand stores
│   ├── lib/                    # Utilities
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global CSS
├── data/                       # JSON data storage
│   ├── elements/               # Element definitions
│   ├── palettes/               # Color palettes
│   └── projects/               # User projects
└── docs/                       # Documentation
```

## 🎨 Design System

- **Primary Color**: `linear-gradient(to right, #492cdd, #ad38e2)`
- **Style**: Material Design 3
- **Theme**: Light + Dark mode

## 📚 Documentation

See `docs/` folder:
- `AI_CONTEXT.md` - Full project context
- `QUICK_START.md` - Quick reference
- `ARCHITECTURE.md` - Data structures

## ⚡ Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- @dnd-kit
- Framer Motion

---

Built with ❤️ using AI Editor

