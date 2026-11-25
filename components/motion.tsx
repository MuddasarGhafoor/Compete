"use client";

import { MotionConfig, motion, type Variants } from "motion/react";

/*
 * Small animation helpers built on Motion (motion.dev, formerly Framer Motion).
 * Use them from server components: they only wrap the children you pass in.
 * Animations respect the visitor's "reduce motion" setting via MotionProvider.
 */

const ease = [0.21, 0.47, 0.32, 0.98] as const;
const viewport = { once: true, margin: "0px 0px -80px 0px" } as const;

/** Wrap an animated page in this so "reduce motion" turns movement off. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** How far it rises while fading in (px). */
  y?: number;
};

/** Fades and lifts its content in when it scrolls into view. */
export function FadeIn({ children, className, delay = 0, y = 20 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const containers = {
  div: motion.div,
  ol: motion.ol,
  ul: motion.ul,
};

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof containers;
};

/** Reveals its <StaggerItem> children one after another when it scrolls into view. */
export function Stagger({ children, className, as = "div" }: StaggerProps) {
  const Component = containers[as] as typeof motion.div;
  return (
    <Component
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </Component>
  );
}

const items = {
  div: motion.div,
  li: motion.li,
};

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof items;
};

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const Component = items[as] as typeof motion.div;
  return (
    <Component className={className} variants={staggerItem}>
      {children}
    </Component>
  );
}
