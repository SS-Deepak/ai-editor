# 📝 Project Brief - AI Website Editor

## What is this project? (Simple Explanation)

This is a **drag-and-drop website builder** - similar to Wix, Webflow, or Squarespace. Users can create beautiful websites without writing any code.

Think of it like building with LEGO blocks:
- You pick a block (element like button, text, image)
- You drop it where you want on the page
- You customize how it looks (colors, size, fonts)
- You save and publish your website

---

## 🎯 Who is it for?

1. **Normal Users** - People who want to build their own websites
2. **Admin Users** - You (the owner) who manages the element library

---

## 🧩 Key Concepts (In Simple Terms)

### 1. Elements = Building Blocks
Elements are the pieces users drag onto their page:
- **Text** - For writing content
- **Image** - For pictures
- **Button** - For clickable actions
- **Container** - A box to hold other elements

### 2. Color Palette = Paint Set
Instead of picking random colors, users choose a "palette" (set of matching colors).
When they add a button, it automatically uses colors from their palette.

Example Palette:
```
Primary:    🔵 Blue (for important buttons)
Secondary:  🟢 Green (for less important things)
Accent:     🟡 Yellow (for highlights)
Background: ⚪ White (page background)
Text:       ⚫ Black (for reading)
```

### 3. Project Settings = Default Rules
These are global settings that apply to the whole website:
- Default font (what text looks like)
- Default colors (from the palette)
- Default spacing (gaps between things)

When you add a new element, it automatically follows these rules.

### 4. Layouts = Pre-made Templates
Instead of building a header from scratch every time:
- Admin creates a nice header layout
- Users just pick it and use it
- It automatically adjusts to their color palette

### 5. Page Layouts = Page Templates
A reusable page structure:
```
┌─────────────────────┐
│      Header         │  ← Same on every page
├─────────────────────┤
│                     │
│   [Page Content]    │  ← Different for each page
│    (Placeholder)    │
│                     │
├─────────────────────┤
│      Footer         │  ← Same on every page
└─────────────────────┘
```

Users create this once, then reuse it for all pages.

---

## 👥 User Types

### Admin (You)
- Create and manage the element library
- Create pre-built layouts (headers, footers, buttons)
- Publish elements for all users to use
- Manage the platform

### Normal User
- Create their own website projects
- Use admin's published elements
- Create their own custom elements (only for their projects)
- Set their own color palettes and settings

---

## 📁 How Data is Stored (File-Based)

Since we're starting without a database, everything is stored in JSON files:

```
data/
├── users/
│   └── user_123.json          ← User profile & settings
├── projects/
│   └── project_456.json       ← Website project data
├── pages/
│   └── page_789.json          ← Individual page content
├── elements/
│   ├── admin/                 ← Admin-created elements
│   │   └── button_primary.json
│   └── user_123/              ← User's custom elements
│       └── my_custom_card.json
├── layouts/
│   ├── components/            ← Pre-built component layouts
│   │   ├── header_1.json
│   │   └── footer_1.json
│   └── pages/                 ← Page layout templates
│       └── standard_page.json
└── palettes/
    └── palette_default.json   ← Color palette definitions
```

---

## 🔄 How It Works (Step by Step)

### Creating a Website:

1. **User logs in** → System loads their data from files

2. **User creates new project**
   - Picks a name
   - Chooses a color palette
   - Sets default font
   - System creates `project_xxx.json`

3. **User adds a page**
   - Picks "Home" or any name
   - Optionally uses a page layout template
   - System creates `page_xxx.json`

4. **User drags elements**
   - Opens Elements panel
   - Sees admin elements + their custom elements
   - Drags "Button" to page
   - Button automatically uses project's color palette

5. **User customizes**
   - Clicks the button
   - Changes text, size, colors (within palette)
   - System updates `page_xxx.json`

6. **User saves**
   - Clicks Save button
   - All changes written to JSON files

7. **User previews/publishes**
   - System generates HTML from JSON
   - User sees their live website

---

## 🎨 Color Palette System

### How it works:

1. **Admin defines palettes:**
```json
{
  "name": "Ocean Blue",
  "colors": {
    "primary": "#0066CC",
    "secondary": "#004499",
    "accent": "#FF6600",
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "text": "#333333",
    "textLight": "#666666"
  }
}
```

2. **User picks a palette** when creating project

3. **Elements use palette variables:**
   - Button background = `primary`
   - Button text = `background` (white on blue)
   - Page background = `background`

4. **User changes palette** → All elements update automatically!

---

## 🏗️ Project Structure Simplified

```
ai-editor/
│
├── src/
│   ├── app/                    ← Next.js pages
│   │   ├── page.tsx            ← Home/Dashboard
│   │   └── editor/             ← The actual editor
│   │
│   ├── components/             ← UI pieces
│   │   ├── editor/             ← Editor-specific components
│   │   ├── sidebar/            ← Left panel components
│   │   └── panels/             ← Right panel (styles)
│   │
│   ├── data/                   ← JSON file storage
│   │   ├── mock/               ← Demo/test data
│   │   ├── elements/           ← Element definitions
│   │   └── palettes/           ← Color palettes
│   │
│   └── lib/                    ← Helper functions
│       ├── fileStorage.ts      ← Read/write JSON files
│       └── paletteUtils.ts     ← Color palette helpers
│
└── public/                     ← Static files (images, etc.)
```

---

## 🚀 Future Plans

### Phase 1 (Now): Basic Editor
- Drag & drop elements
- Color palette system
- File-based storage
- Basic styling

### Phase 2: Layouts & Templates
- Pre-built component layouts
- Page layout templates
- User custom elements

### Phase 3: Advanced Features
- Animations
- Responsive design
- More element types

### Phase 4: AI Features
- "Create a landing page for my bakery"
- AI generates the page automatically
- User can then customize it

---

## 💰 Budget-Friendly Approach

This project is designed to start **without expensive infrastructure**:

| What | Free Option |
|------|-------------|
| Database | JSON files (local) |
| Hosting | Vercel free tier |
| Images | Local files or free CDN |
| Auth | Simple JSON-based (or NextAuth later) |

As you grow, you can upgrade to:
- PostgreSQL database
- Cloud storage (AWS S3)
- Full authentication system

---

## 📋 Summary

**You're building:** A website builder like Wix

**Main features:**
- Drag and drop elements
- Color palettes that auto-apply
- Global project settings
- Pre-made layouts
- No database needed (files only)

**User types:**
- Admin (you) - manages elements and layouts
- Users - build their websites

**Data storage:**
- Everything in JSON files
- Easy to understand and modify
- Can upgrade to database later

---

## 🎯 Next Steps

1. ✅ Documentation created
2. ⬜ Set up Next.js project
3. ⬜ Create basic editor UI
4. ⬜ Implement file storage
5. ⬜ Add drag & drop
6. ⬜ Build style panel
7. ⬜ Add color palette system

Ready to start building? Just say the word!

