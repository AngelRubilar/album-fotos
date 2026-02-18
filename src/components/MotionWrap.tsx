'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface MotionWrapProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
}

export function FadeUp({ children, delay = 0, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: MotionWrapProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
