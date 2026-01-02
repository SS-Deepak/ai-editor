// ============================================
// Element Types
// ============================================

export type ElementType =
  | 'container'
  | 'section'
  | 'wrapper'
  | 'flexbox'
  | 'grid'
  | 'columns'
  | 'stack'
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'button'
  | 'link'
  | 'icon'
  | 'divider'
  | 'spacer'
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'label'
  | 'submit'
  | 'navbar'
  | 'hero'
  | 'footer'
  | 'card'
  | 'testimonial'
  | 'feature'
  | 'cta'
  | 'pricing';

export interface ElementNode {
  id: string;
  type: ElementType;
  parentId: string | null;
  order: number;
  children: ElementNode[];
  props: Record<string, any>;
  styles: ResponsiveStyles;
  // Tailwind responsive classes (e.g., "flex flex-col md:flex-row lg:gap-8")
  className?: string;
  // Device-specific Tailwind classes
  responsiveClasses?: {
    base?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  animations?: Animation[];
  interactions?: Interaction[];
  isLocked: boolean;
  isHidden: boolean;
  customId?: string;
  customClasses?: string[];
}

// ============================================
// Style Types
// ============================================

export interface ResponsiveStyles {
  base: StyleDefinition;
  tablet?: Partial<StyleDefinition>;
  desktop?: Partial<StyleDefinition>;
  wide?: Partial<StyleDefinition>;
}

export interface StyleDefinition {
  // Layout
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;

  // Flexbox
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  gap?: string;

  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;

  // Size
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;

  // Spacing
  padding?: string | SpacingValue;
  margin?: string | SpacingValue;

  // Typography
  fontFamily?: string | PaletteRef;
  fontSize?: string | SettingsRef;
  fontWeight?: string | number;
  lineHeight?: string | number;
  textAlign?: string;
  color?: string | PaletteRef;

  // Background
  backgroundColor?: string | PaletteRef;
  backgroundImage?: string;

  // Border
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string | PaletteRef;
  borderRadius?: string | SettingsRef;

  // Effects
  boxShadow?: string | SettingsRef;
  opacity?: number;
  transform?: string;
  transition?: string | SettingsRef;

  // Overflow
  overflow?: string;

  // Custom
  cursor?: string;
  [key: string]: any;
}

export interface SpacingValue {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface PaletteRef {
  $palette: string;
}

export interface SettingsRef {
  $settings: string;
}

// ============================================
// Animation Types
// ============================================

export interface Animation {
  id: string;
  name: string;
  trigger: AnimationTrigger;
  keyframes: Keyframe[];
  duration: number;
  delay: number;
  easing: string;
  iterations: number | 'infinite';
  direction: string;
  fillMode: string;
}

export type AnimationTrigger =
  | { type: 'load' }
  | { type: 'scroll'; threshold: number }
  | { type: 'hover' }
  | { type: 'click' };

export interface Keyframe {
  offset: number;
  styles: Partial<StyleDefinition>;
}

// ============================================
// Interaction Types
// ============================================

export interface Interaction {
  id: string;
  trigger: 'click' | 'hover' | 'focus';
  action: InteractionAction;
}

export type InteractionAction =
  | { type: 'navigate'; url: string; target?: string }
  | { type: 'scroll-to'; elementId: string }
  | { type: 'open-modal'; modalId: string }
  | { type: 'toggle-class'; className: string };

// ============================================
// Page Types
// ============================================

export interface Page {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  elements: ElementNode[];
  settings?: Partial<ProjectSettings>;
  seo?: PageSeo;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  userId: string;
  settings: ProjectSettings;
  pages: PageReference[];
  assets: Asset[];
  seo: ProjectSeo;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface PageReference {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  order: number;
}

export interface ProjectSettings {
  palette: {
    id: string;
    customOverrides?: Record<string, string>;
  };
  typography: TypographySettings;
  spacing: SpacingSettings;
  layout: LayoutSettings;
  borders: BorderSettings;
  shadows: ShadowSettings;
  transitions: TransitionSettings;
}

export interface TypographySettings {
  fontFamily: {
    primary: string;
    heading: string;
    mono: string;
  };
  baseFontSize: string;
  lineHeight: number;
  headingSizes: Record<string, string>;
  fontWeights: Record<string, number>;
}

export interface SpacingSettings {
  unit: number;
  scale: number[];
  containerPadding: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  sectionGap: string;
  elementGap: string;
}

export interface LayoutSettings {
  maxWidth: string;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
  defaultAlignment: string;
}

export interface BorderSettings {
  radius: Record<string, string>;
  width: Record<string, string>;
}

export interface ShadowSettings {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface TransitionSettings {
  fast: string;
  normal: string;
  slow: string;
}

export interface ProjectSeo {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
}

// ============================================
// Palette Types
// ============================================

export interface ColorPalette {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  isPublished: boolean;
  isDefault?: boolean;
  colors: PaletteColors;
}

export interface PaletteColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGradient: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentHover: string;
  background: string;
  backgroundDark: string;
  surface: string;
  surfaceDark: string;
  surfaceVariant: string;
  surfaceVariantDark: string;
  surfaceHover: string;
  surfaceHoverDark: string;
  text: string;
  textDark: string;
  textMuted: string;
  textMutedDark: string;
  textInverse: string;
  border: string;
  borderDark: string;
  divider: string;
  dividerDark: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  preferences: UserPreferences;
  projects: string[];
  createdAt: string;
}

export interface UserPreferences {
  defaultPalette?: string;
  theme: 'light' | 'dark' | 'system';
  editorSettings: {
    showGrid: boolean;
    snapToGrid: boolean;
    autoSave: boolean;
  };
}

// ============================================
// Component Layout Types
// ============================================

export type ComponentLayoutCategory = 
  | 'buttons'
  | 'heroes'
  | 'cards'
  | 'sections'
  | 'navigation'
  | 'footers'
  | 'headers'
  | 'forms'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta';

export interface ComponentLayout {
  id: string;
  name: string;
  description?: string;
  category: ComponentLayoutCategory;
  thumbnail?: string;
  createdBy: 'admin' | string;
  createdByUserId?: string; // User ID for custom layouts
  isPublished: boolean;
  isCustom?: boolean; // True if created by a regular user
  elements: ElementNode[];
  exposedProps: ExposedProp[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExposedProp {
  elementId: string;
  propPath: string;
  label: string;
  type: 'text' | 'textarea' | 'color' | 'image' | 'link' | 'select';
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

// Category metadata interface (used in LAYOUT_CATEGORIES array)
export interface LayoutCategoryInfo {
  id: ComponentLayoutCategory;
  name: string;
  description?: string;
  icon: string;
}

// ============================================
// UI Types
// ============================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wide';

export type SidebarPanel = 'pages' | 'elements' | 'layouts' | 'layers' | 'assets' | 'settings';

export interface EditorState {
  // Selection
  selectedElementId: string | null;
  hoveredElementId: string | null;
  
  // View
  device: DeviceType;
  zoom: number;
  showGrid: boolean;
  
  // Panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activePanel: SidebarPanel;
  
  // History
  canUndo: boolean;
  canRedo: boolean;
}

