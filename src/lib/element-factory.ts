import type { ElementNode, ElementType, ResponsiveStyles } from '@/types';

// Generate unique ID
export function generateId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Alias for clarity
export const generateElementId = generateId;

// Deep clone an element tree with new IDs
export function cloneElementTree(element: ElementNode): ElementNode {
  const newId = generateId(element.type);
  
  const clonedElement: ElementNode = {
    ...element,
    id: newId,
    parentId: null, // Will be set by caller
    children: element.children.map((child) => {
      const clonedChild = cloneElementTree(child);
      clonedChild.parentId = newId;
      return clonedChild;
    }),
    // Deep clone styles
    styles: JSON.parse(JSON.stringify(element.styles)),
    // Deep clone props
    props: JSON.parse(JSON.stringify(element.props)),
  };
  
  return clonedElement;
}

// Default styles for each element type
const defaultStyles: Record<string, ResponsiveStyles> = {
  // Basic elements
  text: {
    base: {
      fontSize: '16px',
      lineHeight: 1.6,
      color: { $palette: 'text' },
    },
  },
  heading: {
    base: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.3,
      color: { $palette: 'text' },
      marginBottom: '16px',
    },
  },
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 24px',
      backgroundColor: { $palette: 'primary' },
      color: { $palette: 'textInverse' },
      fontSize: '16px',
      fontWeight: 600,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  },
  image: {
    base: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
    },
  },
  link: {
    base: {
      color: { $palette: 'primary' },
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  divider: {
    base: {
      width: '100%',
      height: '1px',
      backgroundColor: { $palette: 'border' },
      margin: '24px 0',
    },
  },
  spacer: {
    base: {
      height: '40px',
    },
  },

  // Layout elements
  container: {
    base: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
  },
  section: {
    base: {
      padding: '64px 24px',
      width: '100%',
    },
  },
  grid: {
    base: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
  },
  columns: {
    base: {
      display: 'flex',
      flexDirection: 'row',
      gap: '24px',
    },
  },
  flexbox: {
    base: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '16px',
    },
  },

  // Form elements
  form: {
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
  },
  input: {
    base: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '1px solid',
      borderColor: { $palette: 'border' },
      borderRadius: '8px',
      backgroundColor: { $palette: 'background' },
    },
  },
  textarea: {
    base: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '1px solid',
      borderColor: { $palette: 'border' },
      borderRadius: '8px',
      minHeight: '120px',
      resize: 'vertical',
    },
  },
  select: {
    base: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '1px solid',
      borderColor: { $palette: 'border' },
      borderRadius: '8px',
    },
  },

  // Block elements
  navbar: {
    base: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      backgroundColor: { $palette: 'background' },
      borderBottom: '1px solid',
      borderColor: { $palette: 'border' },
    },
  },
  hero: {
    base: {
      padding: '80px 24px',
      textAlign: 'center',
      backgroundColor: { $palette: 'surface' },
    },
  },
  footer: {
    base: {
      padding: '48px 24px',
      backgroundColor: { $palette: 'surface' },
      textAlign: 'center',
    },
  },
  card: {
    base: {
      padding: '24px',
      backgroundColor: { $palette: 'background' },
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
  },
};

// Default props for each element type
const defaultProps: Record<string, Record<string, any>> = {
  text: {
    content: 'Add your text here. Click to edit.',
  },
  heading: {
    content: 'Heading',
    tag: 'h2',
    level: 2,
  },
  button: {
    text: 'Click me',
    href: '',
    target: '_self',
    variant: 'primary',
  },
  image: {
    src: '',
    alt: 'Image description',
    width: 'auto',
    height: 'auto',
  },
  link: {
    text: 'Click here',
    href: '#',
    target: '_self',
  },
  divider: {},
  spacer: {
    height: '40px',
  },
  container: {},
  section: {},
  grid: {
    columns: 3,
    gap: '24px',
  },
  columns: {
    columns: 2,
    gap: '24px',
  },
  flexbox: {
    direction: 'row',
    align: 'center',
    justify: 'flex-start',
    gap: '16px',
  },
  form: {
    action: '',
    method: 'POST',
  },
  input: {
    type: 'text',
    placeholder: 'Enter text...',
    name: '',
    required: false,
  },
  textarea: {
    placeholder: 'Enter message...',
    name: '',
    rows: 4,
  },
  select: {
    placeholder: 'Select option',
    name: '',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
    ],
  },
  navbar: {
    logoText: 'Logo',
    links: [
      { label: 'Home', href: '#' },
      { label: 'About', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    ctaText: 'Get Started',
    ctaHref: '#',
  },
  hero: {
    title: 'Welcome to Our Website',
    subtitle: 'Build something amazing with our drag-and-drop editor.',
    ctaText: 'Get Started',
    ctaHref: '#',
    secondaryCtaText: 'Learn More',
    secondaryCtaHref: '#',
  },
  footer: {
    companyName: 'Your Company',
    copyright: '© 2024 All rights reserved.',
    links: [],
  },
  card: {
    title: 'Card Title',
    description: 'Card description goes here.',
  },
};

// Elements that can contain children
const containerElements: ElementType[] = [
  'container',
  'section',
  'grid',
  'columns',
  'flexbox',
  'wrapper',
  'stack',
  'form',
  'card',
  'navbar',
  'hero',
  'footer',
];

/**
 * Create a new element with default properties
 */
export function createElement(
  type: ElementType,
  overrideProps?: Partial<Record<string, any>>,
  overrideStyles?: Partial<ResponsiveStyles>
): ElementNode {
  const id = generateId(type);
  
  return {
    id,
    type,
    parentId: null,
    order: 0,
    children: [],
    props: {
      ...(defaultProps[type] || {}),
      ...overrideProps,
    },
    styles: {
      base: {
        ...(defaultStyles[type]?.base || {}),
        ...(overrideStyles?.base || {}),
      },
      tablet: overrideStyles?.tablet,
      desktop: overrideStyles?.desktop,
      wide: overrideStyles?.wide,
    },
    isLocked: false,
    isHidden: false,
  };
}

/**
 * Check if element type can contain children
 */
export function canHaveChildren(type: ElementType): boolean {
  return containerElements.includes(type);
}

/**
 * Get display name for element type
 */
export function getElementDisplayName(type: ElementType): string {
  const names: Record<string, string> = {
    text: 'Text',
    heading: 'Heading',
    button: 'Button',
    image: 'Image',
    link: 'Link',
    divider: 'Divider',
    spacer: 'Spacer',
    container: 'Container',
    section: 'Section',
    grid: 'Grid',
    columns: 'Columns',
    flexbox: 'Flexbox',
    form: 'Form',
    input: 'Input',
    textarea: 'Textarea',
    select: 'Select',
    navbar: 'Navigation Bar',
    hero: 'Hero Section',
    footer: 'Footer',
    card: 'Card',
  };
  return names[type] || type;
}

/**
 * Get default children for block elements
 */
export function getDefaultChildren(type: ElementType): ElementNode[] {
  switch (type) {
    case 'grid':
      return [
        createElement('container'),
        createElement('container'),
        createElement('container'),
      ];
    case 'columns':
      return [
        createElement('container'),
        createElement('container'),
      ];
    case 'card':
      return [
        createElement('heading', { content: 'Card Title', tag: 'h3', level: 3 }),
        createElement('text', { content: 'Card description goes here.' }),
      ];
    default:
      return [];
  }
}

