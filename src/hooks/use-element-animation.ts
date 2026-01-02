'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { Animation, AnimationTrigger } from '@/types';

interface ParallaxSettings {
  enabled: boolean;
  speed: number;
}

interface UseElementAnimationOptions {
  animations: Animation[];
  parallax?: ParallaxSettings;
  isEnabled?: boolean;
}

interface UseElementAnimationReturn {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  handlers: {
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
  };
  triggerAnimation: (animationId: string) => void;
  isAnimating: boolean;
}

// Convert keyframes to CSS keyframe format
function keyframesToCSS(keyframes: Animation['keyframes']): Keyframe[] {
  return keyframes.map((kf) => {
    const styles: Record<string, string | number> = {};
    
    for (const [key, value] of Object.entries(kf.styles)) {
      // Convert camelCase to kebab-case for CSS
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      styles[cssKey] = value as string | number;
    }
    
    return {
      ...styles,
      offset: kf.offset / 100, // Convert 0-100 to 0-1
    };
  });
}

export function useElementAnimation({ 
  animations, 
  parallax,
  isEnabled = true 
}: UseElementAnimationOptions): UseElementAnimationReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const animationRefs = useRef<Map<string, globalThis.Animation>>(new Map());
  const hasPlayedLoad = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  // Play a specific animation
  const playAnimation = useCallback((animation: Animation) => {
    if (!ref.current || !isEnabled) return;

    const keyframes = keyframesToCSS(animation.keyframes);
    
    const options: KeyframeAnimationOptions = {
      duration: animation.duration,
      delay: animation.delay,
      easing: animation.easing,
      iterations: animation.iterations === 'infinite' ? Infinity : animation.iterations,
      direction: animation.direction as PlaybackDirection,
      fill: animation.fillMode as FillMode,
    };

    try {
      // Cancel any existing animation with this ID
      const existing = animationRefs.current.get(animation.id);
      if (existing) {
        existing.cancel();
      }

      const anim = ref.current.animate(keyframes, options);
      animationRefs.current.set(animation.id, anim);
      
      setIsAnimating(true);
      
      anim.onfinish = () => {
        setIsAnimating(false);
        animationRefs.current.delete(animation.id);
      };

      anim.oncancel = () => {
        setIsAnimating(false);
        animationRefs.current.delete(animation.id);
      };
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, [isEnabled]);

  // Trigger animation by ID
  const triggerAnimation = useCallback((animationId: string) => {
    const animation = animations.find(a => a.id === animationId);
    if (animation) {
      playAnimation(animation);
    }
  }, [animations, playAnimation]);

  // Handle load animations
  useEffect(() => {
    if (!isEnabled || hasPlayedLoad.current) return;

    const loadAnimations = animations.filter(a => a.trigger.type === 'load');
    
    if (loadAnimations.length > 0) {
      hasPlayedLoad.current = true;
      // Small delay to ensure element is mounted
      const timer = setTimeout(() => {
        loadAnimations.forEach(playAnimation);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [animations, isEnabled, playAnimation]);

  // Handle scroll animations with Intersection Observer
  useEffect(() => {
    if (!isEnabled || !ref.current) return;

    const scrollAnimations = animations.filter(a => a.trigger.type === 'scroll');
    if (scrollAnimations.length === 0) return;

    const playedScrollAnimations = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scrollAnimations.forEach((animation) => {
              if (!playedScrollAnimations.has(animation.id)) {
                const threshold = (animation.trigger as { type: 'scroll'; threshold: number }).threshold || 0.2;
                if (entry.intersectionRatio >= threshold) {
                  playedScrollAnimations.add(animation.id);
                  playAnimation(animation);
                }
              }
            });
          }
        });
      },
      {
        threshold: scrollAnimations.map(a => 
          (a.trigger as { type: 'scroll'; threshold: number }).threshold || 0.2
        ),
        rootMargin: '0px',
      }
    );

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [animations, isEnabled, playAnimation]);

  // Click handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEnabled) return;
    
    const clickAnimations = animations.filter(a => a.trigger.type === 'click');
    clickAnimations.forEach(playAnimation);
  }, [animations, isEnabled, playAnimation]);

  // Hover handlers
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (!isEnabled) return;
    
    const hoverAnimations = animations.filter(a => a.trigger.type === 'hover');
    hoverAnimations.forEach(playAnimation);
  }, [animations, isEnabled, playAnimation]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    // Could add reverse animation here if needed
  }, []);

  // Build handlers object
  const handlers: UseElementAnimationReturn['handlers'] = {};
  
  if (animations.some(a => a.trigger.type === 'click')) {
    handlers.onClick = handleClick;
  }
  
  if (animations.some(a => a.trigger.type === 'hover')) {
    handlers.onMouseEnter = handleMouseEnter;
    handlers.onMouseLeave = handleMouseLeave;
  }

  // Parallax scroll effect
  useEffect(() => {
    if (!parallax?.enabled || !isEnabled || !ref.current) return;

    const speed = parallax.speed || 0.5;
    
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;
        
        const rect = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how far through the viewport the element is
        // 0 = element just entered bottom, 1 = element just left top
        const elementCenter = rect.top + rect.height / 2;
        const viewportProgress = 1 - (elementCenter / windowHeight);
        
        // Calculate parallax offset based on speed
        // Negative speed = moves slower (background effect)
        // Positive speed = moves faster (foreground effect)
        const offset = viewportProgress * speed * 100;
        
        setParallaxOffset(offset);
      });
    };

    // Find the scrollable container (canvas scroll container)
    const scrollContainer = ref.current.closest('[class*="overflow"]') || window;
    
    // Initial calculation
    handleScroll();
    
    // Add scroll listener
    if (scrollContainer === window) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      (scrollContainer as HTMLElement).addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollContainer === window) {
        window.removeEventListener('scroll', handleScroll);
      } else {
        (scrollContainer as HTMLElement)?.removeEventListener('scroll', handleScroll);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [parallax?.enabled, parallax?.speed, isEnabled]);

  // Parallax style
  const style: React.CSSProperties = parallax?.enabled ? {
    transform: `translateY(${parallaxOffset}px)`,
    willChange: 'transform',
  } : {};

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRefs.current.forEach(anim => anim.cancel());
      animationRefs.current.clear();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    ref,
    style,
    handlers,
    triggerAnimation,
    isAnimating,
  };
}

