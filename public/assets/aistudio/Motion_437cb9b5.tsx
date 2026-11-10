import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  animate,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "motion/react";

/**
 * Reusable animation helpers for Right Minds Africa.
 * All of them respect the visitor's "reduce motion" setting.
 */

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSETS: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 40 },
  right: { x: -40 },
  none: {},
};

const EASE = [0.16, 1, 0.3, 1] as const;

/* 1. Reveal: fades + slides content in when it scrolls into view */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...OFFSETS[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* 2. Stagger: children appear one after another (cards, lists, grids) */
const staggerParent = (gap: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
});

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

export function Stagger({
  children,
  gap = 0.1,
  className,
}: {
  children: ReactNode;
  gap?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerParent(gap)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/* 3. HoverLift: card lifts on hover, presses on tap */
export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

/* 4. CountUp: numbers count up when scrolled into view (e.g. "500+ Members") */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    if (reduce) {
      node.textContent = `${prefix}${to.toLocaleString()}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix, suffix, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}0${suffix}`}
    </span>
  );
}

/* 5. ScrollProgress: thin orange bar at the top showing how far you've scrolled */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 origin-left bg-brand-orange z-[70] pointer-events-none"
      style={{ scaleX }}
    />
  );
}
