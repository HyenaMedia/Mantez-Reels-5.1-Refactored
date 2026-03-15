import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* -- Framer Motion animation variant maps -- */
const ENTRANCE_VARIANTS = {
  none:       { initial: false,                                     animate: {} },
  fade:       { initial: { opacity: 0 },                            animate: { opacity: 1 } },
  slideUp:    { initial: { opacity: 0, y: 40 },                     animate: { opacity: 1, y: 0 } },
  slideDown:  { initial: { opacity: 0, y: -40 },                    animate: { opacity: 1, y: 0 } },
  slideLeft:  { initial: { opacity: 0, x: 40 },                     animate: { opacity: 1, x: 0 } },
  slideRight: { initial: { opacity: 0, x: -40 },                    animate: { opacity: 1, x: 0 } },
  zoom:       { initial: { opacity: 0, scale: 0.8 },                animate: { opacity: 1, scale: 1 } },
  bounce:     { initial: { opacity: 0, y: 40 },                     animate: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.5 } } },
  flip:       { initial: { opacity: 0, rotateX: 90 },               animate: { opacity: 1, rotateX: 0 } },
  rotate:     { initial: { opacity: 0, rotate: -20 },               animate: { opacity: 1, rotate: 0 } },
};

const HOVER_VARIANTS = {
  none:   {},
  lift:   { y: -4 },
  scale:  { scale: 1.05 },
  glow:   { boxShadow: '0 0 20px rgba(139,92,246,0.5)' },
  rotate: { rotate: 5 },
  pulse:  { scale: 1.04 },
  shake:  { x: [0, -6, 6, -6, 6, 0] },
};

/**
 * MotionWrapper - applies entrance + hover animations from element.motion config.
 * Reads the same shape that Inspector's MotionTab writes:
 *   { entrance, duration(ms), delay(ms), easing, scrollTrigger, hover, hoverDuration(ms) }
 */
const MotionWrapper = ({ element, children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  const mot = element.motion || {};
  const entranceKey = mot.entrance    || 'none';
  const hoverKey    = mot.hover       || 'none';
  // Inspector stores ms; Framer Motion uses seconds
  const durationSec = (mot.duration  ?? 400) / 1000;
  const delaySec    = (mot.delay     ?? 0)   / 1000;
  const hoverSec    = (mot.hoverDuration ?? 200) / 1000;
  const ease        = mot.easing      || 'easeOut';

  const variant   = ENTRANCE_VARIANTS[entranceKey] || ENTRANCE_VARIANTS.none;
  const hoverAnim = HOVER_VARIANTS[hoverKey]       || {};

  // Scroll-triggered: only animate once element enters viewport
  const shouldAnimate = mot.scrollTrigger ? inView : true;
  const hasEntrance   = entranceKey !== 'none';
  const hasHover      = hoverKey    !== 'none';

  const transition = {
    duration: durationSec,
    delay:    delaySec,
    ease:     ease === 'spring' ? undefined : ease,
    type:     ease === 'spring' ? 'spring'  : 'tween',
    ...(ease === 'spring' ? { bounce: 0.4 } : {}),
    // preserve any variant-level overrides (e.g. bounce entrance)
    ...(variant.animate?.transition || {}),
  };

  const hoverTransition = { duration: hoverSec, ease: 'easeOut' };

  if (!hasEntrance && !hasHover) {
    // No motion config -> skip motion.div overhead entirely
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={hasEntrance ? variant.initial : false}
      animate={hasEntrance && shouldAnimate ? { ...variant.animate, transition } : undefined}
      whileHover={hasHover ? { ...hoverAnim, transition: hoverTransition } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrapper;
