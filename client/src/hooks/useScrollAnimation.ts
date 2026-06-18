import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface UseScrollAnimationOptions {
  direction?: AnimationDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  triggerStart?: string;
  once?: boolean;
}

/**
 * Hook to apply GSAP ScrollTrigger animations to child elements.
 * Attach the returned ref to the container, and add `.scroll-anim` class to child targets.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null);

  const {
    direction = 'up',
    distance = 40,
    duration = 0.8,
    delay = 0,
    stagger = 0.12,
    ease = 'power3.out',
    triggerStart = 'top 85%',
    once = true,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const targets = ref.current.querySelectorAll('.scroll-anim');
    if (targets.length === 0) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (direction === 'up') fromVars.y = distance;
    if (direction === 'down') fromVars.y = -distance;
    if (direction === 'left') fromVars.x = distance;
    if (direction === 'right') fromVars.x = -distance;

    const toVars: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      stagger,
      ease,
      scrollTrigger: {
        trigger: ref.current,
        start: triggerStart,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
      },
    };

    gsap.fromTo(targets, fromVars, toVars);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [direction, distance, duration, delay, stagger, ease, triggerStart, once]);

  return ref;
}
