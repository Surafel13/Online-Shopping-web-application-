import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
}

/**
 * Wrapper component that automatically animates its children on scroll.
 * Children with className `.anim-item` will be staggered individually.
 * If no `.anim-item` children exist, the entire container animates as one.
 */
export function AnimatedSection({
  children,
  className,
  direction = 'up',
  distance = 40,
  duration = 0.8,
  delay = 0,
  stagger = 0.1,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const items = ref.current.querySelectorAll('.anim-item');
    const targets = items.length > 0 ? items : [ref.current];

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (direction === 'up') fromVars.y = distance;
    if (direction === 'down') fromVars.y = -distance;
    if (direction === 'left') fromVars.x = distance;
    if (direction === 'right') fromVars.x = -distance;

    gsap.fromTo(targets, fromVars, {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [direction, distance, duration, delay, stagger]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
