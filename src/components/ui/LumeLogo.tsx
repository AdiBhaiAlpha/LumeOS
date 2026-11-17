/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LumeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Official LumeOS Brand Crest Icon
 * Two overlapping sky-400 & indigo-400 rings above a luminous white horizon arc.
 */
export const LumeLogo: React.FC<LumeLogoProps> = ({ size = 'sm', className = '' }) => {
  const sizeStyles: Record<NonNullable<LumeLogoProps['size']>, {
    box: string;
    circle: string;
    arc: string;
    leftOffset: string;
    rightOffset: string;
    arcBottom: string;
  }> = {
    xs: {
      box: 'w-4 h-4',
      circle: 'w-2 h-2 border-[1.5px]',
      arc: 'w-3 h-1.5 border-b-[1.5px]',
      leftOffset: 'left-[1px]',
      rightOffset: 'right-[1px]',
      arcBottom: '-bottom-[1px]',
    },
    sm: {
      box: 'w-5 h-5',
      circle: 'w-2.5 h-2.5 border-2',
      arc: 'w-4 h-2 border-b-2',
      leftOffset: 'left-0.5',
      rightOffset: 'right-0.5',
      arcBottom: '-bottom-0.5',
    },
    md: {
      box: 'w-6 h-6',
      circle: 'w-3 h-3 border-2',
      arc: 'w-5 h-2.5 border-b-2',
      leftOffset: 'left-0.5',
      rightOffset: 'right-0.5',
      arcBottom: '-bottom-0.5',
    },
    lg: {
      box: 'w-8 h-8',
      circle: 'w-4 h-4 border-[2.5px]',
      arc: 'w-6 h-3 border-b-[2.5px]',
      leftOffset: 'left-0.5',
      rightOffset: 'right-0.5',
      arcBottom: '-bottom-0.5',
    },
    xl: {
      box: 'w-12 h-12',
      circle: 'w-6 h-6 border-[3px]',
      arc: 'w-9 h-4 border-b-[3px]',
      leftOffset: 'left-1',
      rightOffset: 'right-1',
      arcBottom: '-bottom-0.5',
    },
  };

  const s = sizeStyles[size];

  return (
    <div className={`relative ${s.box} flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`absolute ${s.leftOffset} ${s.circle} rounded-full border-sky-400 group-hover:border-sky-300 transition-colors`}
      />
      <div
        className={`absolute ${s.rightOffset} ${s.circle} rounded-full border-indigo-400 group-hover:border-indigo-300 transition-colors`}
      />
      <div
        className={`absolute ${s.arcBottom} ${s.arc} border-white/95 rounded-b-full`}
      />
    </div>
  );
};
