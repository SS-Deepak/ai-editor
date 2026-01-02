'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useEditorStore } from '@/store/editor-store';
import { EditorLayout } from '@/components/editor/editor-layout';
import type { ElementNode } from '@/types';

// Mock page data - will be loaded from files
const mockElements: ElementNode[] = [
  {
    id: 'elem_nav_1',
    type: 'navbar',
    parentId: null,
    order: 0,
    children: [],
    props: {
      logoText: 'My Brand',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
      ctaText: 'Get Started',
    },
    styles: {
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
    isLocked: false,
    isHidden: false,
  },
  {
    id: 'elem_hero_1',
    type: 'hero',
    parentId: null,
    order: 1,
    children: [],
    props: {
      title: 'Build Amazing Websites',
      subtitle: 'Create beautiful, responsive websites with our intuitive drag-and-drop editor. No coding required.',
      ctaText: 'Get Started Free',
      ctaHref: '/signup',
    },
    styles: {
      base: {
        padding: '80px 24px',
        backgroundColor: { $palette: 'surface' },
      },
    },
    isLocked: false,
    isHidden: false,
  },
  {
    id: 'elem_footer_1',
    type: 'footer',
    parentId: null,
    order: 2,
    children: [],
    props: {
      companyName: 'My Brand',
      copyright: '© 2024 My Brand. All rights reserved.',
    },
    styles: {
      base: {
        padding: '48px 24px',
        backgroundColor: { $palette: 'surface' },
        textAlign: 'center',
      },
    },
    isLocked: false,
    isHidden: false,
  },
];

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const hasLoaded = useRef(false);
  const { setProject, setPage, setElements } = useEditorStore();

  useEffect(() => {
    // Prevent double loading in React Strict Mode
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // Set project
    setProject(projectId);
    setPage('page_home');

    // Load elements directly (for now, no streaming simulation)
    setElements(mockElements);
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <EditorLayout />;
}

