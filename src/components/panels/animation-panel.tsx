'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  Plus,
  Trash2,
  Sparkles,
  MousePointer2,
  Scroll,
  Eye,
  Zap,
  Move,
  RotateCcw,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  Layers,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  BookOpen,
  X,
  Info,
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { UnitInput, Button } from '../ui';
import { cn } from '@/lib/utils';
import type { ElementNode, Animation, AnimationTrigger } from '@/types';

// Animation presets
const ANIMATION_PRESETS = [
  {
    id: 'fade-in',
    name: 'Fade In',
    icon: Eye,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0 } },
      { offset: 100, styles: { opacity: 1 } },
    ],
  },
  {
    id: 'fade-in-up',
    name: 'Fade In Up',
    icon: ArrowUp,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'translateY(30px)' } },
      { offset: 100, styles: { opacity: 1, transform: 'translateY(0)' } },
    ],
  },
  {
    id: 'fade-in-down',
    name: 'Fade In Down',
    icon: ArrowDown,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'translateY(-30px)' } },
      { offset: 100, styles: { opacity: 1, transform: 'translateY(0)' } },
    ],
  },
  {
    id: 'fade-in-left',
    name: 'Fade In Left',
    icon: ArrowLeft,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'translateX(-30px)' } },
      { offset: 100, styles: { opacity: 1, transform: 'translateX(0)' } },
    ],
  },
  {
    id: 'fade-in-right',
    name: 'Fade In Right',
    icon: ArrowRight,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'translateX(30px)' } },
      { offset: 100, styles: { opacity: 1, transform: 'translateX(0)' } },
    ],
  },
  {
    id: 'scale-in',
    name: 'Scale In',
    icon: Maximize2,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'scale(0.8)' } },
      { offset: 100, styles: { opacity: 1, transform: 'scale(1)' } },
    ],
  },
  {
    id: 'scale-out',
    name: 'Scale Out',
    icon: Minimize2,
    category: 'exit',
    keyframes: [
      { offset: 0, styles: { opacity: 1, transform: 'scale(1)' } },
      { offset: 100, styles: { opacity: 0, transform: 'scale(0.8)' } },
    ],
  },
  {
    id: 'slide-in-up',
    name: 'Slide In Up',
    icon: ArrowUp,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { transform: 'translateY(100%)' } },
      { offset: 100, styles: { transform: 'translateY(0)' } },
    ],
  },
  {
    id: 'bounce',
    name: 'Bounce',
    icon: Zap,
    category: 'attention',
    keyframes: [
      { offset: 0, styles: { transform: 'translateY(0)' } },
      { offset: 50, styles: { transform: 'translateY(-15px)' } },
      { offset: 100, styles: { transform: 'translateY(0)' } },
    ],
  },
  {
    id: 'pulse',
    name: 'Pulse',
    icon: Zap,
    category: 'attention',
    keyframes: [
      { offset: 0, styles: { transform: 'scale(1)' } },
      { offset: 50, styles: { transform: 'scale(1.05)' } },
      { offset: 100, styles: { transform: 'scale(1)' } },
    ],
  },
  {
    id: 'shake',
    name: 'Shake',
    icon: Move,
    category: 'attention',
    keyframes: [
      { offset: 0, styles: { transform: 'translateX(0)' } },
      { offset: 25, styles: { transform: 'translateX(-5px)' } },
      { offset: 50, styles: { transform: 'translateX(5px)' } },
      { offset: 75, styles: { transform: 'translateX(-5px)' } },
      { offset: 100, styles: { transform: 'translateX(0)' } },
    ],
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    icon: RotateCcw,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'rotate(-180deg)' } },
      { offset: 100, styles: { opacity: 1, transform: 'rotate(0)' } },
    ],
  },
  {
    id: 'flip-in',
    name: 'Flip In',
    icon: FlipHorizontal,
    category: 'entrance',
    keyframes: [
      { offset: 0, styles: { opacity: 0, transform: 'perspective(400px) rotateY(90deg)' } },
      { offset: 100, styles: { opacity: 1, transform: 'perspective(400px) rotateY(0)' } },
    ],
  },
];

// Trigger options
const TRIGGER_OPTIONS = [
  { id: 'load', label: 'On Load', icon: Eye, description: 'Plays when page loads' },
  { id: 'scroll', label: 'On Scroll', icon: Scroll, description: 'Plays when scrolled into view' },
  { id: 'hover', label: 'On Hover', icon: MousePointer2, description: 'Plays when mouse hovers' },
  { id: 'click', label: 'On Click', icon: MousePointer2, description: 'Plays when clicked' },
];

// Easing options
const EASING_OPTIONS = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
  { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: 'Back' },
];

interface AnimationSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

function AnimationSection({ title, icon, children, defaultOpen = true, badge }: AnimationSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-outline-light dark:border-outline-dark">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-gray-500">{icon}</span>
        <span className="flex-1 text-left text-label-lg text-on-surface-light dark:text-on-surface-dark">
          {title}
        </span>
        {badge !== undefined && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
            {badge}
          </span>
        )}
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function AnimationPanel() {
  const { selectedElementId, elements, updateElement, saveHistory } = useEditorStore();
  const { showToast } = useUIStore();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Find selected element
  const findElement = (els: typeof elements, id: string): ElementNode | null => {
    for (const el of els) {
      if (el.id === id) return el;
      const found = findElement(el.children, id);
      if (found) return found;
    }
    return null;
  };

  const element = selectedElementId ? findElement(elements, selectedElementId) : null;

  // Get current animations
  const animations = element?.animations || [];

  // Add animation
  const addAnimation = useCallback((presetId: string, trigger: AnimationTrigger['type']) => {
    if (!element) return;

    const preset = ANIMATION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newAnimation: Animation = {
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: preset.name,
      trigger: trigger === 'scroll' 
        ? { type: 'scroll', threshold: 0.2 }
        : { type: trigger as 'load' | 'hover' | 'click' },
      keyframes: preset.keyframes,
      duration: 600,
      delay: 0,
      easing: 'ease-out',
      iterations: trigger === 'hover' ? 1 : 1,
      direction: 'normal',
      fillMode: 'forwards',
    };

    updateElement(element.id, {
      animations: [...animations, newAnimation],
    });
    saveHistory();
    showToast({ type: 'success', message: `Added "${preset.name}" animation` });
  }, [element, animations, updateElement, saveHistory, showToast]);

  // Update animation
  const updateAnimation = useCallback((animationId: string, updates: Partial<Animation>) => {
    if (!element) return;

    const updatedAnimations = animations.map(anim =>
      anim.id === animationId ? { ...anim, ...updates } : anim
    );

    updateElement(element.id, { animations: updatedAnimations });
  }, [element, animations, updateElement]);

  // Remove animation
  const removeAnimation = useCallback((animationId: string) => {
    if (!element) return;

    updateElement(element.id, {
      animations: animations.filter(a => a.id !== animationId),
    });
    saveHistory();
    showToast({ type: 'success', message: 'Animation removed' });
  }, [element, animations, updateElement, saveHistory, showToast]);

  // Update parallax settings
  const updateParallax = useCallback((enabled: boolean, speed?: number) => {
    if (!element) return;

    updateElement(element.id, {
      props: {
        ...element.props,
        parallax: enabled ? { enabled: true, speed: speed || 0.5 } : undefined,
      },
    });
    saveHistory();
  }, [element, updateElement, saveHistory]);

  if (!element) return null;

  const parallaxSettings = element.props?.parallax;
  const hasParallax = parallaxSettings?.enabled;

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
      {/* Help Button */}
      <div className="px-4 py-2 border-b border-outline-light dark:border-outline-dark bg-gray-50 dark:bg-gray-900/50">
        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors w-full justify-center',
            showTutorial 
              ? 'bg-primary text-white' 
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:border-primary hover:text-primary'
          )}
        >
          {showTutorial ? <X size={12} /> : <BookOpen size={12} />}
          {showTutorial ? 'Close Guide' : 'How to Use Animations'}
        </button>
      </div>

      {/* Tutorial Section */}
      {showTutorial && (
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-outline-light dark:border-outline-dark">
          <div className="space-y-4">
            {/* Quick Start */}
            <div>
              <h4 className="text-label-md font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Zap size={14} />
                Quick Start
              </h4>
              <ol className="text-[11px] text-gray-700 dark:text-gray-300 space-y-1.5 list-decimal list-inside">
                <li>Select an element on the canvas</li>
                <li>Choose a <strong>trigger</strong> (when to play)</li>
                <li>Click an <strong>animation preset</strong> to add it</li>
                <li>Adjust timing in the Active Animations section</li>
              </ol>
            </div>

            {/* Triggers Explained */}
            <div>
              <h4 className="text-label-md font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <MousePointer2 size={14} />
                Animation Triggers
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-gray-200">On Load</div>
                  <div className="text-[9px] text-gray-500">Plays once when page loads. Great for hero sections.</div>
                </div>
                <div className="p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-gray-200">On Scroll</div>
                  <div className="text-[9px] text-gray-500">Plays when element enters viewport. Best for content reveal.</div>
                </div>
                <div className="p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-gray-200">On Hover</div>
                  <div className="text-[9px] text-gray-500">Plays on mouse over. Perfect for buttons & cards.</div>
                </div>
                <div className="p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="text-[10px] font-semibold text-gray-800 dark:text-gray-200">On Click</div>
                  <div className="text-[9px] text-gray-500">Plays when clicked. Use for interactive feedback.</div>
                </div>
              </div>
            </div>

            {/* Parallax Guide */}
            <div>
              <h4 className="text-label-md font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Layers size={14} />
                Parallax Effect
              </h4>
              <div className="text-[11px] text-gray-700 dark:text-gray-300 space-y-1.5">
                <p>Parallax creates depth by moving elements at different speeds when scrolling:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Negative speed</strong> (-50%): Element moves slower → background effect</li>
                  <li><strong>Zero</strong> (0%): Normal scroll behavior</li>
                  <li><strong>Positive speed</strong> (+50%): Element moves faster → foreground effect</li>
                </ul>
                <p className="text-[10px] text-gray-500 italic mt-2">
                  💡 Best used on images, backgrounds, and decorative elements.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="p-2.5 bg-amber-100/60 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <Info size={12} />
                Pro Tips
              </h4>
              <ul className="text-[10px] text-amber-700 dark:text-amber-400 space-y-1">
                <li>• Use <strong>delays</strong> to stagger animations for a polished look</li>
                <li>• Keep durations between <strong>300-800ms</strong> for smooth UX</li>
                <li>• Combine scroll animations with parallax for depth</li>
                <li>• Use <strong>ease-out</strong> for entrances, <strong>ease-in</strong> for exits</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Active Animations */}
      <AnimationSection 
        title="Active Animations" 
        icon={<Sparkles size={16} />}
        badge={animations.length || undefined}
      >
        {animations.length > 0 ? (
          <div className="space-y-2">
            {animations.map((anim) => (
              <div
                key={anim.id}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-md font-medium">{anim.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removeAnimation(anim.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Trigger */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Trigger</label>
                    <select
                      value={anim.trigger.type}
                      onChange={(e) => {
                        const type = e.target.value as AnimationTrigger['type'];
                        updateAnimation(anim.id, {
                          trigger: type === 'scroll' 
                            ? { type: 'scroll', threshold: 0.2 }
                            : { type }
                        });
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      {TRIGGER_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Easing</label>
                    <select
                      value={anim.easing}
                      onChange={(e) => updateAnimation(anim.id, { easing: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      {EASING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Duration</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={anim.duration}
                        onChange={(e) => updateAnimation(anim.id, { duration: parseInt(e.target.value) || 0 })}
                        onBlur={saveHistory}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                      />
                      <span className="text-[10px] text-gray-400">ms</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Delay</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={anim.delay}
                        onChange={(e) => updateAnimation(anim.id, { delay: parseInt(e.target.value) || 0 })}
                        onBlur={saveHistory}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                      />
                      <span className="text-[10px] text-gray-400">ms</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Repeat</label>
                    <select
                      value={anim.iterations === 'infinite' ? 'infinite' : anim.iterations}
                      onChange={(e) => updateAnimation(anim.id, { 
                        iterations: e.target.value === 'infinite' ? 'infinite' : parseInt(e.target.value) 
                      })}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      <option value={1}>Once</option>
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                      <option value="infinite">Loop</option>
                    </select>
                  </div>
                </div>

                {/* Scroll threshold */}
                {anim.trigger.type === 'scroll' && (
                  <div className="mt-2">
                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">
                      Scroll Threshold ({Math.round(((anim.trigger as any).threshold || 0.2) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={((anim.trigger as any).threshold || 0.2) * 100}
                      onChange={(e) => updateAnimation(anim.id, { 
                        trigger: { type: 'scroll', threshold: parseInt(e.target.value) / 100 } 
                      })}
                      onMouseUp={saveHistory}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-body-sm">No animations added</p>
            <p className="text-[11px] text-gray-400 mt-1">Select a preset below to add</p>
          </div>
        )}
      </AnimationSection>

      {/* Animation Presets */}
      <AnimationSection title="Add Animation" icon={<Plus size={16} />}>
        <div className="space-y-3">
          {/* Trigger Selection */}
          <div>
            <label className="text-label-sm text-gray-500 mb-2 block">Select Trigger</label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGER_OPTIONS.map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <button
                    key={trigger.id}
                    onClick={() => setSelectedPreset(selectedPreset ? null : `trigger:${trigger.id}`)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border text-left transition-all',
                      selectedPreset?.startsWith(`trigger:${trigger.id}`)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon size={14} />
                    <div>
                      <div className="text-[11px] font-medium">{trigger.label}</div>
                      <div className="text-[9px] text-gray-400">{trigger.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets Grid */}
          <div>
            <label className="text-label-sm text-gray-500 mb-2 block">Animation Presets</label>
            
            {/* Entrance Animations */}
            <div className="mb-3">
              <div className="text-[10px] text-gray-400 uppercase mb-1.5">Entrance</div>
              <div className="grid grid-cols-3 gap-1.5">
                {ANIMATION_PRESETS.filter(p => p.category === 'entrance').map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const triggerId = selectedPreset?.replace('trigger:', '') || 'scroll';
                        addAnimation(preset.id, triggerId as AnimationTrigger['type']);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all',
                        'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                      )}
                    >
                      <Icon size={14} className="text-gray-500" />
                      <span className="text-[10px]">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attention Animations */}
            <div className="mb-3">
              <div className="text-[10px] text-gray-400 uppercase mb-1.5">Attention</div>
              <div className="grid grid-cols-3 gap-1.5">
                {ANIMATION_PRESETS.filter(p => p.category === 'attention').map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const triggerId = selectedPreset?.replace('trigger:', '') || 'hover';
                        addAnimation(preset.id, triggerId as AnimationTrigger['type']);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all',
                        'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                      )}
                    >
                      <Icon size={14} className="text-gray-500" />
                      <span className="text-[10px]">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exit Animations */}
            <div>
              <div className="text-[10px] text-gray-400 uppercase mb-1.5">Exit</div>
              <div className="grid grid-cols-3 gap-1.5">
                {ANIMATION_PRESETS.filter(p => p.category === 'exit').map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const triggerId = selectedPreset?.replace('trigger:', '') || 'scroll';
                        addAnimation(preset.id, triggerId as AnimationTrigger['type']);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all',
                        'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                      )}
                    >
                      <Icon size={14} className="text-gray-500" />
                      <span className="text-[10px]">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AnimationSection>

      {/* Parallax Effect */}
      <AnimationSection title="Parallax Effect" icon={<Layers size={16} />} defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                hasParallax ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              )}>
                <Layers size={20} />
              </div>
              <div>
                <div className="text-label-md font-medium">
                  {hasParallax ? 'Parallax Enabled' : 'Enable Parallax'}
                </div>
                <div className="text-[11px] text-gray-500">
                  Create depth with scroll-based movement
                </div>
              </div>
            </div>
            <button
              onClick={() => updateParallax(!hasParallax)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                hasParallax ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                hasParallax ? 'translate-x-7' : 'translate-x-1'
              )} />
            </button>
          </div>

          {hasParallax && (
            <div className="space-y-3">
              <div>
                <label className="text-label-sm text-gray-500 mb-2 block">
                  Speed ({((parallaxSettings?.speed || 0.5) * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={(parallaxSettings?.speed || 0.5) * 100}
                  onChange={(e) => updateParallax(true, parseInt(e.target.value) / 100)}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Layers size={14} className="text-blue-500 mt-0.5" />
                  <div className="text-[11px] text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> Negative values make elements move slower than scroll, 
                    positive values make them move faster. Use for backgrounds and images.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AnimationSection>

      {/* Scroll Effects */}
      <AnimationSection title="Scroll Effects" icon={<Scroll size={16} />} defaultOpen={false}>
        <div className="space-y-3">
          {/* Reveal on Scroll */}
          <button
            onClick={() => addAnimation('fade-in-up', 'scroll')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
              <ArrowUp size={18} />
            </div>
            <div>
              <div className="text-label-md font-medium">Reveal on Scroll</div>
              <div className="text-[11px] text-gray-500">Fade in when scrolled into view</div>
            </div>
          </button>

          {/* Sticky Scroll */}
          <button
            onClick={() => {
              if (!element) return;
              updateElement(element.id, {
                styles: {
                  ...element.styles,
                  base: { ...element.styles.base, position: 'sticky', top: '0' }
                }
              });
              saveHistory();
              showToast({ type: 'success', message: 'Made element sticky' });
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
              <Scroll size={18} />
            </div>
            <div>
              <div className="text-label-md font-medium">Sticky on Scroll</div>
              <div className="text-[11px] text-gray-500">Pin element when scrolled past</div>
            </div>
          </button>

          {/* Scale on Scroll */}
          <button
            onClick={() => addAnimation('scale-in', 'scroll')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
              <Maximize2 size={18} />
            </div>
            <div>
              <div className="text-label-md font-medium">Scale on Scroll</div>
              <div className="text-[11px] text-gray-500">Grow element when scrolled into view</div>
            </div>
          </button>
        </div>
      </AnimationSection>
    </div>
  );
}
