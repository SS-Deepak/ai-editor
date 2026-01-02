# 🏗️ Architecture & Data Models

Complete data architecture for the AI Website Editor with file-based storage.

---

## 🌊 Streaming & Progressive Loading

To prevent UI freezing with large pages, we use **streaming/progressive loading**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STREAMING LOAD FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. INITIAL LOAD (Instant - <100ms)                                          │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │ • Page metadata (title, settings)                              │      │
│     │ • Skeleton UI renders immediately                              │      │
│     │ • Canvas frame appears                                          │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                              ↓                                               │
│  2. CHUNKED ELEMENT LOADING (Progressive)                                    │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │ Chunk 1: First 10 elements (visible in viewport)    [████░░░░] │      │
│     │ Chunk 2: Next 10 elements                           [██████░░] │      │
│     │ Chunk 3: Remaining elements                         [████████] │      │
│     │                                                                │      │
│     │ Each chunk: 16ms delay (1 frame) to keep UI responsive        │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                              ↓                                               │
│  3. DEFERRED LOADING (Background)                                            │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │ • Heavy images (lazy load)                                     │      │
│     │ • Animation data                                               │      │
│     │ • Interaction handlers                                         │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation Strategy

```typescript
// 1. Stream page data with React Suspense
async function* streamPageElements(pageId: string) {
  const page = await getPageMetadata(pageId);  // Fast - just metadata
  yield { type: 'metadata', data: page };
  
  const elements = await getPageElements(pageId);
  const chunks = chunkArray(elements, 10);  // 10 elements per chunk
  
  for (const chunk of chunks) {
    yield { type: 'elements', data: chunk };
    await delay(16);  // 1 frame - keeps UI responsive
  }
}

// 2. Progressive element rendering
function useStreamedElements(pageId: string) {
  const [elements, setElements] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const stream = streamPageElements(pageId);
    
    (async () => {
      for await (const chunk of stream) {
        if (chunk.type === 'elements') {
          setElements(prev => [...prev, ...chunk.data]);
        }
      }
      setIsLoading(false);
    })();
  }, [pageId]);
  
  return { elements, isLoading };
}

// 3. Virtual scrolling for layers panel
function LayersPanel({ elements }: { elements: Element[] }) {
  return (
    <VirtualList
      items={elements}
      itemHeight={40}
      overscan={5}  // Render 5 extra items above/below viewport
      renderItem={(element) => <LayerItem element={element} />}
    />
  );
}
```

### Suspense Boundaries

```tsx
// Editor layout with suspense boundaries
function EditorLayout() {
  return (
    <div className="editor-layout">
      {/* Sidebar loads independently */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      
      {/* Canvas streams content progressively */}
      <Suspense fallback={<CanvasSkeleton />}>
        <Canvas />
      </Suspense>
      
      {/* Style panel loads on element selection */}
      <Suspense fallback={<PanelSkeleton />}>
        <StylePanel />
      </Suspense>
    </div>
  );
}
```

### Loading States

| State | UI Display | Duration |
|-------|-----------|----------|
| `initial` | Skeleton + spinner | 0-100ms |
| `streaming` | Progressive content appear | 100ms-2s |
| `complete` | Full content | - |
| `error` | Error message + retry | - |

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI WEBSITE EDITOR                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │    ADMIN     │    │    USER      │    │   STORAGE    │                   │
│  │              │    │              │    │   (JSON)     │                   │
│  │ • Elements   │    │ • Projects   │    │              │                   │
│  │ • Layouts    │    │ • Pages      │◄──►│ • /data/     │                   │
│  │ • Palettes   │    │ • Custom     │    │              │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                                                │
│         └───────────────────┴──────────────────┐                            │
│                                                ▼                             │
│                              ┌──────────────────────────┐                   │
│                              │     EDITOR ENGINE        │                   │
│                              │                          │                   │
│                              │ • Drag & Drop            │                   │
│                              │ • Palette Resolution     │                   │
│                              │ • Settings Application   │                   │
│                              │ • HTML Generation        │                   │
│                              └──────────────────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Storage Structure

```
data/
├── users/
│   ├── admin.json              # Admin user profile
│   └── user_[id].json          # Regular user profiles
│
├── projects/
│   └── [projectId]/
│       ├── project.json        # Project metadata & settings
│       └── pages/
│           ├── home.json       # Homepage
│           └── [slug].json     # Other pages
│
├── elements/
│   ├── admin/                  # Admin-managed elements (global)
│   │   ├── basic.json          # Text, Image, Button, etc.
│   │   ├── layout.json         # Container, Grid, Flex, etc.
│   │   ├── forms.json          # Form elements
│   │   └── blocks.json         # Pre-built blocks
│   │
│   └── custom/
│       └── [userId]/           # User's custom elements
│           └── elements.json
│
├── layouts/
│   ├── components/             # Reusable component layouts
│   │   ├── headers.json        # Header variations
│   │   ├── footers.json        # Footer variations
│   │   ├── buttons.json        # Button styles
│   │   ├── cards.json          # Card layouts
│   │   └── navigation.json     # Nav menu styles
│   │
│   └── pages/                  # Page layout templates
│       ├── blank.json          # Empty page
│       ├── standard.json       # Header + Content + Footer
│       └── landing.json        # Landing page layout
│
└── palettes/
    ├── system.json             # System palettes (admin)
    └── custom/
        └── [userId].json       # User's custom palettes
```

---

## 🎨 Color Palette Schema

### Palette Definition

```typescript
interface ColorPalette {
  id: string;
  name: string;
  description?: string;
  createdBy: 'admin' | string;  // 'admin' or userId
  isPublished: boolean;         // Visible to all users
  
  colors: {
    // Primary colors
    primary: string;            // Main brand color
    primaryHover: string;       // Hover state
    primaryLight: string;       // Light variant
    primaryDark: string;        // Dark variant
    
    // Secondary colors
    secondary: string;
    secondaryHover: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    
    // Backgrounds
    background: string;         // Page background
    surface: string;            // Card/section background
    surfaceHover: string;
    
    // Text colors
    text: string;               // Primary text
    textMuted: string;          // Secondary text
    textInverse: string;        // Text on dark backgrounds
    
    // Utility colors
    border: string;
    divider: string;
    
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
```

### Example Palette (JSON)

```json
{
  "id": "palette_ocean_blue",
  "name": "Ocean Blue",
  "description": "Professional blue palette",
  "createdBy": "admin",
  "isPublished": true,
  "colors": {
    "primary": "#3B82F6",
    "primaryHover": "#2563EB",
    "primaryLight": "#DBEAFE",
    "primaryDark": "#1E40AF",
    
    "secondary": "#10B981",
    "secondaryHover": "#059669",
    "secondaryLight": "#D1FAE5",
    "secondaryDark": "#047857",
    
    "accent": "#F59E0B",
    "accentHover": "#D97706",
    
    "background": "#FFFFFF",
    "surface": "#F9FAFB",
    "surfaceHover": "#F3F4F6",
    
    "text": "#1F2937",
    "textMuted": "#6B7280",
    "textInverse": "#FFFFFF",
    
    "border": "#E5E7EB",
    "divider": "#E5E7EB",
    
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "info": "#3B82F6"
  }
}
```

---

## ⚙️ Project Settings Schema

### Complete Settings Definition

```typescript
interface ProjectSettings {
  // Palette reference
  palette: {
    id: string;                 // Reference to palette
    customOverrides?: Partial<ColorPalette['colors']>;
  };
  
  // Typography
  typography: {
    fontFamily: {
      primary: string;          // Body text font
      heading: string;          // Heading font
      mono: string;             // Code font
    };
    
    baseFontSize: string;       // e.g., "16px"
    lineHeight: number;         // e.g., 1.6
    
    headingSizes: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      h6: string;
    };
    
    fontWeights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  
  // Spacing
  spacing: {
    unit: number;               // Base unit in px (e.g., 4)
    scale: number[];            // Multipliers [0, 1, 2, 4, 6, 8, 12, 16, 24, 32]
    
    containerPadding: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    
    sectionGap: string;         // Gap between sections
    elementGap: string;         // Default gap between elements
  };
  
  // Layout
  layout: {
    maxWidth: string;           // Container max width
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
      wide: number;
    };
    
    defaultAlignment: 'left' | 'center' | 'right';
  };
  
  // Borders
  borders: {
    radius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    
    width: {
      thin: string;
      medium: string;
      thick: string;
    };
  };
  
  // Shadows
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Transitions
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}
```

### Example Settings (JSON)

```json
{
  "palette": {
    "id": "palette_ocean_blue",
    "customOverrides": null
  },
  
  "typography": {
    "fontFamily": {
      "primary": "Inter, system-ui, sans-serif",
      "heading": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "baseFontSize": "16px",
    "lineHeight": 1.6,
    "headingSizes": {
      "h1": "3rem",
      "h2": "2.25rem",
      "h3": "1.875rem",
      "h4": "1.5rem",
      "h5": "1.25rem",
      "h6": "1rem"
    },
    "fontWeights": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  
  "spacing": {
    "unit": 4,
    "scale": [0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64],
    "containerPadding": {
      "mobile": "16px",
      "tablet": "24px",
      "desktop": "32px"
    },
    "sectionGap": "64px",
    "elementGap": "16px"
  },
  
  "layout": {
    "maxWidth": "1200px",
    "breakpoints": {
      "mobile": 375,
      "tablet": 768,
      "desktop": 1024,
      "wide": 1440
    },
    "defaultAlignment": "left"
  },
  
  "borders": {
    "radius": {
      "none": "0",
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "full": "9999px"
    },
    "width": {
      "thin": "1px",
      "medium": "2px",
      "thick": "4px"
    }
  },
  
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
  },
  
  "transitions": {
    "fast": "150ms ease",
    "normal": "200ms ease",
    "slow": "300ms ease"
  }
}
```

---

## 👤 User Schema

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  
  // User preferences
  preferences: {
    defaultPalette?: string;
    theme: 'light' | 'dark' | 'system';
    editorSettings: {
      showGrid: boolean;
      snapToGrid: boolean;
      autoSave: boolean;
    };
  };
  
  // User's projects
  projects: string[];           // Array of project IDs
  
  // User's custom elements
  customElements: string[];     // Array of element IDs
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}
```

### Example User (JSON)

```json
{
  "id": "user_demo_123",
  "email": "demo@example.com",
  "name": "Demo User",
  "avatar": null,
  "role": "user",
  
  "preferences": {
    "defaultPalette": "palette_ocean_blue",
    "theme": "light",
    "editorSettings": {
      "showGrid": true,
      "snapToGrid": true,
      "autoSave": true
    }
  },
  
  "projects": ["project_demo_1"],
  "customElements": [],
  
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-15T10:30:00Z"
}
```

---

## 📄 Project Schema

```typescript
interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  
  // Owner
  userId: string;
  
  // Settings (using ProjectSettings schema)
  settings: ProjectSettings;
  
  // Page references
  pages: PageReference[];
  
  // Global assets
  assets: Asset[];
  
  // Custom code
  customCode: {
    head?: string;              // Inject in <head>
    bodyStart?: string;         // After <body>
    bodyEnd?: string;           // Before </body>
    css?: string;               // Custom CSS
  };
  
  // SEO defaults
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  
  // Status
  status: 'draft' | 'published';
  publishedUrl?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PageReference {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  order: number;
}

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'font';
  url: string;
  size: number;
  mimeType: string;
}
```

### Example Project (JSON)

```json
{
  "id": "project_demo_1",
  "name": "My First Website",
  "slug": "my-first-website",
  "description": "A demo website project",
  "userId": "user_demo_123",
  
  "settings": {
    "palette": {
      "id": "palette_ocean_blue"
    },
    "typography": {
      "fontFamily": {
        "primary": "Inter, sans-serif",
        "heading": "Inter, sans-serif",
        "mono": "monospace"
      },
      "baseFontSize": "16px",
      "lineHeight": 1.6
    }
  },
  
  "pages": [
    {
      "id": "page_home",
      "name": "Home",
      "slug": "",
      "isHome": true,
      "order": 0
    },
    {
      "id": "page_about",
      "name": "About",
      "slug": "about",
      "isHome": false,
      "order": 1
    }
  ],
  
  "assets": [],
  
  "customCode": {
    "head": "",
    "css": ""
  },
  
  "seo": {
    "title": "My First Website",
    "description": "Welcome to my website",
    "keywords": ["website", "demo"]
  },
  
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 📃 Page Schema

```typescript
interface Page {
  id: string;
  projectId: string;
  
  // Basic info
  name: string;
  slug: string;
  
  // Page layout (optional template)
  layout?: {
    id: string;                 // Reference to page layout
    slots: {                    // Filled slots
      [slotName: string]: ElementNode[];
    };
  };
  
  // Direct elements (if no layout)
  elements: ElementNode[];
  
  // Page-specific settings (override project)
  settings?: Partial<ProjectSettings>;
  
  // SEO (override project)
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    noIndex?: boolean;
  };
  
  // Status
  status: 'draft' | 'published';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

---

## 🧱 Element Schema

### Element Definition (Admin Library)

```typescript
interface ElementDefinition {
  id: string;
  type: string;                 // Unique type identifier
  name: string;                 // Display name
  description?: string;
  icon: string;                 // Icon name (lucide)
  category: 'basic' | 'layout' | 'forms' | 'blocks' | 'custom';
  
  // Who created it
  createdBy: 'admin' | string;
  isPublished: boolean;
  
  // Default props
  defaultProps: Record<string, any>;
  
  // Default styles (using palette references)
  defaultStyles: ResponsiveStyles;
  
  // Allowed children
  allowChildren: boolean;
  allowedChildTypes?: string[];
  
  // Props configuration (for settings panel)
  propsConfig: PropConfig[];
  
  // Style presets
  presets?: ElementPreset[];
}

interface PropConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'link';
  defaultValue?: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  placeholder?: string;
}

interface ElementPreset {
  id: string;
  name: string;
  thumbnail?: string;
  props: Record<string, any>;
  styles: ResponsiveStyles;
}
```

### Element Instance (On Page)

```typescript
interface ElementNode {
  id: string;
  type: string;                 // Reference to ElementDefinition.type
  
  // Hierarchy
  parentId: string | null;
  order: number;
  children: ElementNode[];
  
  // Instance props
  props: Record<string, any>;
  
  // Instance styles (can use palette references)
  styles: ResponsiveStyles;
  
  // Animations
  animations?: Animation[];
  
  // Interactions
  interactions?: Interaction[];
  
  // State
  isLocked: boolean;
  isHidden: boolean;
  
  // Custom attributes
  customId?: string;
  customClasses?: string[];
  dataAttributes?: Record<string, string>;
}
```

### Style with Palette References

```typescript
interface ResponsiveStyles {
  base: StyleDefinition;
  tablet?: Partial<StyleDefinition>;
  desktop?: Partial<StyleDefinition>;
  wide?: Partial<StyleDefinition>;
}

interface StyleDefinition {
  // Layout
  display?: string;
  position?: string;
  // ... other CSS properties
  
  // Colors can reference palette
  color?: string | PaletteRef;
  backgroundColor?: string | PaletteRef;
  borderColor?: string | PaletteRef;
  
  // Typography can reference settings
  fontFamily?: string | SettingsRef;
  fontSize?: string | SettingsRef;
}

// Palette reference format
interface PaletteRef {
  $palette: string;             // e.g., "primary", "text", "background"
}

// Settings reference format
interface SettingsRef {
  $settings: string;            // e.g., "typography.fontFamily.primary"
}
```

### Example Element Definition (Button)

```json
{
  "id": "elem_button",
  "type": "button",
  "name": "Button",
  "description": "Clickable button element",
  "icon": "MousePointer2",
  "category": "basic",
  "createdBy": "admin",
  "isPublished": true,
  
  "defaultProps": {
    "text": "Click me",
    "href": "",
    "target": "_self",
    "variant": "primary"
  },
  
  "defaultStyles": {
    "base": {
      "display": "inline-flex",
      "alignItems": "center",
      "justifyContent": "center",
      "padding": "12px 24px",
      "backgroundColor": { "$palette": "primary" },
      "color": { "$palette": "textInverse" },
      "fontSize": { "$settings": "typography.baseFontSize" },
      "fontWeight": 600,
      "borderRadius": { "$settings": "borders.radius.md" },
      "cursor": "pointer",
      "transition": { "$settings": "transitions.normal" }
    }
  },
  
  "allowChildren": false,
  
  "propsConfig": [
    {
      "name": "text",
      "label": "Button Text",
      "type": "text",
      "required": true,
      "placeholder": "Enter button text"
    },
    {
      "name": "href",
      "label": "Link URL",
      "type": "link",
      "placeholder": "https://..."
    },
    {
      "name": "target",
      "label": "Open in",
      "type": "select",
      "options": [
        { "label": "Same window", "value": "_self" },
        { "label": "New tab", "value": "_blank" }
      ]
    },
    {
      "name": "variant",
      "label": "Style",
      "type": "select",
      "options": [
        { "label": "Primary", "value": "primary" },
        { "label": "Secondary", "value": "secondary" },
        { "label": "Outline", "value": "outline" },
        { "label": "Ghost", "value": "ghost" }
      ]
    }
  ],
  
  "presets": [
    {
      "id": "preset_primary",
      "name": "Primary Button",
      "props": { "variant": "primary" },
      "styles": {
        "base": {
          "backgroundColor": { "$palette": "primary" },
          "color": { "$palette": "textInverse" }
        }
      }
    },
    {
      "id": "preset_secondary",
      "name": "Secondary Button",
      "props": { "variant": "secondary" },
      "styles": {
        "base": {
          "backgroundColor": { "$palette": "secondary" },
          "color": { "$palette": "textInverse" }
        }
      }
    },
    {
      "id": "preset_outline",
      "name": "Outline Button",
      "props": { "variant": "outline" },
      "styles": {
        "base": {
          "backgroundColor": "transparent",
          "color": { "$palette": "primary" },
          "borderWidth": "2px",
          "borderStyle": "solid",
          "borderColor": { "$palette": "primary" }
        }
      }
    }
  ]
}
```

---

## 📐 Layout Schemas

### Component Layout

```typescript
interface ComponentLayout {
  id: string;
  name: string;
  description?: string;
  category: 'header' | 'footer' | 'navigation' | 'hero' | 'card' | 'button' | 'other';
  thumbnail?: string;
  
  createdBy: 'admin' | string;
  isPublished: boolean;
  
  // Element tree for this component
  elements: ElementNode[];
  
  // Customizable props exposed to user
  exposedProps: ExposedProp[];
}

interface ExposedProp {
  elementId: string;            // Which element this affects
  propPath: string;             // e.g., "props.text" or "styles.base.backgroundColor"
  label: string;                // UI label
  type: 'text' | 'color' | 'image' | 'link';
}
```

### Page Layout

```typescript
interface PageLayout {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  
  createdBy: 'admin' | string;
  isPublished: boolean;
  
  // Slots where user can add content
  slots: PageSlot[];
  
  // Fixed elements (header, footer, etc.)
  fixedElements: {
    before: ElementNode[];      // Elements before first slot
    after: ElementNode[];       // Elements after last slot
  };
}

interface PageSlot {
  id: string;
  name: string;                 // e.g., "content", "sidebar"
  description?: string;
  
  // Slot constraints
  minElements?: number;
  maxElements?: number;
  allowedElementTypes?: string[];
  
  // Default content (optional)
  defaultElements?: ElementNode[];
}
```

### Example Page Layout (Standard)

```json
{
  "id": "layout_standard",
  "name": "Standard Page",
  "description": "Header, content area, and footer",
  "thumbnail": "/layouts/standard.png",
  "createdBy": "admin",
  "isPublished": true,
  
  "slots": [
    {
      "id": "slot_content",
      "name": "Page Content",
      "description": "Main content area",
      "allowedElementTypes": null
    }
  ],
  
  "fixedElements": {
    "before": [
      {
        "id": "fixed_header",
        "type": "component",
        "props": {
          "componentId": "component_header_1"
        }
      }
    ],
    "after": [
      {
        "id": "fixed_footer",
        "type": "component",
        "props": {
          "componentId": "component_footer_1"
        }
      }
    ]
  }
}
```

---

## 🔄 Palette Resolution Flow

When rendering an element, palette references are resolved:

```typescript
// 1. Element has style with palette reference
const elementStyle = {
  backgroundColor: { $palette: "primary" }
};

// 2. Get project's current palette
const palette = project.settings.palette;

// 3. Resolve the reference
const resolvedStyle = {
  backgroundColor: palette.colors.primary  // "#3B82F6"
};
```

### Resolution Function

```typescript
function resolveStyles(
  styles: StyleDefinition,
  palette: ColorPalette,
  settings: ProjectSettings
): ResolvedStyles {
  const resolved: ResolvedStyles = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (isPaletteRef(value)) {
      // Resolve palette reference
      resolved[key] = palette.colors[value.$palette];
    } else if (isSettingsRef(value)) {
      // Resolve settings reference
      resolved[key] = getNestedValue(settings, value.$settings);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

function isPaletteRef(value: any): value is PaletteRef {
  return typeof value === 'object' && '$palette' in value;
}

function isSettingsRef(value: any): value is SettingsRef {
  return typeof value === 'object' && '$settings' in value;
}
```

---

## 📊 Mock Data Files

### `/data/palettes/system.json`

```json
{
  "palettes": [
    {
      "id": "palette_ocean_blue",
      "name": "Ocean Blue",
      "isPublished": true,
      "colors": { ... }
    },
    {
      "id": "palette_forest_green",
      "name": "Forest Green",
      "isPublished": true,
      "colors": { ... }
    }
  ]
}
```

### `/data/elements/admin/basic.json`

```json
{
  "elements": [
    {
      "id": "elem_text",
      "type": "text",
      "name": "Text",
      "category": "basic",
      ...
    },
    {
      "id": "elem_heading",
      "type": "heading",
      "name": "Heading",
      "category": "basic",
      ...
    },
    {
      "id": "elem_button",
      "type": "button",
      "name": "Button",
      "category": "basic",
      ...
    }
  ]
}
```

---

## 🔌 API Endpoints

### File-Based API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/palettes` | GET | Get all published palettes |
| `GET /api/elements` | GET | Get element library |
| `GET /api/layouts/components` | GET | Get component layouts |
| `GET /api/layouts/pages` | GET | Get page layouts |
| `GET /api/projects/[id]` | GET | Get project data |
| `PUT /api/projects/[id]` | PUT | Update project |
| `GET /api/pages/[id]` | GET | Get page data |
| `PUT /api/pages/[id]` | PUT | Update page |

### API Implementation (File-Based)

```typescript
// /src/lib/storage/fileStorage.ts

import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const fullPath = path.join(DATA_DIR, filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(content);
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const fullPath = path.join(DATA_DIR, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2));
}

// Example usage
export async function getProject(projectId: string) {
  return readJsonFile(`projects/${projectId}/project.json`);
}

export async function saveProject(projectId: string, project: Project) {
  return writeJsonFile(`projects/${projectId}/project.json`, project);
}
```

---

## 🔮 Future Considerations

### Database Migration
When ready to scale, migrate from JSON files to PostgreSQL:

```sql
-- Convert JSON structure to relational tables
CREATE TABLE users (...);
CREATE TABLE projects (...);
CREATE TABLE pages (...);
CREATE TABLE elements (content JSONB);  -- Keep flexibility with JSONB
```

### Real-time Collaboration
Add WebSocket support for live editing:

```typescript
// Future: Socket.io or Pusher integration
socket.on('element:update', (data) => {
  updateElement(data.elementId, data.changes);
});
```

### AI Integration
Natural language page generation:

```typescript
// Future: OpenAI integration
const page = await generatePageFromPrompt(
  "Create a landing page for a bakery with a hero section and menu"
);
```

---

This architecture provides a solid foundation that can grow with your business!
