import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

// Hook to get animation settings
export const useAnimationSettings = () => {
  const { theme } = useContext(ThemeContext);
  const animations = theme?.animations || {};
  
  const speedMap = {
    slow: 0.8,
    medium: 0.5,
    fast: 0.3
  };
  
  const duration = speedMap[animations.speed] || 0.5;
  const enabled = animations.enabled !== false;
  
  return { animations, duration, enabled };
};

// Section entrance animation variants
export const getSectionVariants = (animationType = 'fadeIn', duration = 0.5) => {
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration } }
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration } }
    },
    slideLeft: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0, transition: { duration } }
    },
    slideRight: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0, transition: { duration } }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { duration } }
    },
    bounceIn: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        transition: { 
          type: 'spring',
          bounce: 0.5,
          duration 
        } 
      }
    },
    none: {
      hidden: {},
      visible: {}
    }
  };
  
  return variants[animationType] || variants.fadeIn;
};

// Hover effect variants
export const getHoverVariants = (hoverType = 'lift') => {
  const variants = {
    lift: {
      y: -8,
      transition: { duration: 0.3 }
    },
    glow: {
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
      transition: { duration: 0.3 }
    },
    tilt: {
      rotateX: 5,
      rotateY: 5,
      transition: { duration: 0.3 }
    },
    scale: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    none: {}
  };
  
  return variants[hoverType] || variants.lift;
};

// Animated Section Component
export const AnimatedSection = ({ children, className = '', ...props }) => {
  const { animations, duration, enabled } = useAnimationSettings();
  
  if (!enabled || animations.sectionEntrance === 'none') {
    return <section className={className} {...props}>{children}</section>;
  }
  
  const variants = getSectionVariants(animations.sectionEntrance, duration);
  
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.section>
  );
};

// Animated Card Component (with hover effects)
export const AnimatedCard = ({ children, className = '', ...props }) => {
  const { animations, enabled } = useAnimationSettings();
  
  if (!enabled || animations.hoverEffect === 'none') {
    return <div className={className} {...props}>{children}</div>;
  }
  
  const hoverVariant = getHoverVariants(animations.hoverEffect);
  
  return (
    <motion.div
      className={className}
      whileHover={hoverVariant}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Button Component
export const AnimatedButton = ({ children, className = '', onClick, ...props }) => {
  const { animations, enabled } = useAnimationSettings();
  
  if (!enabled || animations.buttonAnimation === 'none') {
    return (
      <button className={className} onClick={onClick} {...props}>
        {children}
      </button>
    );
  }
  
  const buttonVariants = {
    ripple: {
      scale: [1, 0.95, 1],
      transition: { duration: 0.2 }
    },
    magnetic: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    bounce: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3, type: 'spring' }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.6, repeat: Infinity }
    }
  };
  
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileTap={buttonVariants[animations.buttonAnimation] || buttonVariants.ripple}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Stagger Children Container
export const StaggerContainer = ({ children, className = '' }) => {
  const { animations, duration, enabled } = useAnimationSettings();
  
  if (!enabled || animations.scrollEffect !== 'stagger') {
    return <div className={className}>{children}</div>;
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: duration / 2,
        delayChildren: 0.1
      }
    }
  };
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  const { duration } = useAnimationSettings();
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration }
    }
  };
  
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
};
