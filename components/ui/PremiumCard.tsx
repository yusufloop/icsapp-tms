import React from 'react';
import { View, ViewProps } from 'react-native';

interface PremiumCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass';
  /**
   * Tailwind CSS padding classes. Defaults to 'p-4'.
   * Provide an empty string ('') for no padding.
   */
  padding?: string;
  /**
   * Additional Tailwind CSS classes to apply to the card.
   */
  className?: string;
}

/**
 * A foundational card component based on the "Effortless Premium" design system.
 * It provides the core visual style (background, shadow, border radius)
 * and allows for flexible internal padding.
 */
export function PremiumCard({
  children,
  variant = 'default',
  padding = 'p-4', // -> Defaults to 'p-4' as per the design system
  className = '',   // -> Allows passing additional classes
  style,
  ...props
}: PremiumCardProps) {

  // Combines all classes in a predictable order
  const finalClasses = [
    // Core styles
    'rounded-xl',

    // Variant styles
    variant === 'default' && 'bg-bg-secondary',
    variant === 'glass' && 'bg-white/80 backdrop-blur-lg border border-white/20',

    // Layout styles
    padding,    // The padding prop, which can be overridden
    className,  // Any custom classes from the parent
  ]
  .filter(Boolean) // Removes any false/null/undefined values
  .join(' ');

  // Enhanced shadow styles based on design philosophy
  const shadowStyle = variant === 'default' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  } : {};

  return (
    <View 
      className={finalClasses} 
      style={[shadowStyle, style]} 
      {...props}
    >
      {children}
    </View>
  );
}
