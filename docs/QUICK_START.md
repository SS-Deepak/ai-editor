# ⚡ Quick Start for AI Agents

> **One-minute briefing for any AI agent**

---

## 🎯 What Is This?

A **drag-and-drop website editor** (like Webflow) using Next.js + Tailwind.

---

## 🎨 Design Requirements

```
Style:     Material Design 3
Theme:     Light + Dark mode
Primary:   linear-gradient(to right, #492cdd, #ad38e2)
Storage:   JSON files (no database)
```

---

## 📁 Key Files

| File | What It Contains |
|------|------------------|
| `AI_CONTEXT.md` | Full project details |
| `ARCHITECTURE.md` | Data structures |
| `data/settings/design-tokens.json` | Material Design tokens |
| `data/palettes/system.json` | Color palettes |

---

## 🔧 Tech Stack

```
Next.js 14 + TypeScript + Tailwind CSS + Zustand + @dnd-kit + @tanstack/react-virtual
```

---

## 🌊 Streaming Loading (CRITICAL)

**Never freeze UI!** Load large pages progressively:

```typescript
// Stream elements in chunks of 10
for (const chunk of chunks) {
  yield chunk;
  await delay(16); // 1 frame - keeps UI responsive
}
```

```tsx
// Use Suspense boundaries
<Suspense fallback={<Skeleton />}>
  <Canvas />  {/* Streams content */}
</Suspense>

// Use virtual scrolling for 100+ items
<VirtualList items={elements} itemHeight={40} />
```

---

## 🎨 Button Example

```jsx
<button className="
  bg-gradient-to-r from-[#492cdd] to-[#ad38e2]
  text-white font-medium px-6 py-3
  rounded-xl shadow-md
  hover:shadow-lg hover:scale-[1.02]
  transition-all duration-200
">
  Primary Button
</button>
```

---

## 📂 Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # UI components
├── lib/           # Utilities
├── store/         # Zustand state
└── types/         # TypeScript

data/              # JSON storage
├── elements/      # Element definitions
├── palettes/      # Color palettes
└── projects/      # User projects
```

---

## ✅ DOs

- Use Material Design 3 style
- Support dark mode (use `dark:` prefix)
- Use the purple gradient for CTAs
- Keep components simple

## ❌ DON'Ts

- Don't use database
- Don't over-engineer
- Don't add unused features

---

## 🚀 Quick Prompts

```
"Read AI_CONTEXT.md, then create [component] with Material Design"

"Add dark mode to [component] using the design tokens"

"Create a [feature] following ARCHITECTURE.md"
```

---

**For full details → Read `AI_CONTEXT.md`**

