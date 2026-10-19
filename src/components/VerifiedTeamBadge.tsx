import React from 'react';

interface VerifiedTeamBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * FOOTAZIX — Official Team Member Verification Badge
 * 
 * Elegant creator-profile verified seal with signature lime rosette and dark contrast checkmark.
 * Identifies official Footazix team members with an accessible tooltip and subtle hover elevation.
 */
export const VerifiedTeamBadge: React.FC<VerifiedTeamBadgeProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClass =
    size === 'sm'
      ? 'w-3.5 h-3.5'
      : size === 'lg'
      ? 'w-5 h-5'
      : 'w-4 h-4 sm:w-[17px] sm:h-[17px]';

  return (
    <span
      className={`inline-flex items-center justify-center relative group/vbadge select-none align-middle cursor-default ${className}`}
      title="Verified Team Member"
      aria-label="Verified Team Member"
    >
      <svg
        className={`${sizeClass} text-[#B1FF00] fill-current drop-shadow-[0_0_6px_rgba(177,255,0,0.45)] transition-transform duration-200 group-hover/vbadge:scale-110 shrink-0`}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Authentic creator verified rosette seal in signature lime */}
        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.97-.81-3.98s-2.59-1.27-3.98-.81c-.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.97-.2-3.98.81s-1.27 2.59-.81 3.98C2.49 9.33 1.61 10.57 1.61 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.97.81 3.98s2.59 1.27 3.98.81c.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.97.2 3.98-.81s1.27-2.59.81-3.98c1.31-.67 2.19-1.91 2.19-3.34z" />
        {/* Crisp dark checkmark on lime */}
        <path
          fill="none"
          stroke="#070809"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 12.5l3.2 3.3 6.8-7.3"
        />
      </svg>

      {/* Accessible Micro-Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md bg-[#0D0F10] border border-[#B1FF00]/30 text-[#F5F7F2] font-mono text-[10px] tracking-wide whitespace-nowrap shadow-xl opacity-0 scale-95 group-hover/vbadge:opacity-100 group-hover/vbadge:scale-100 transition-all duration-150 z-30 flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#B1FF00] shadow-[0_0_4px_rgba(177,255,0,0.8)]" />
        <span>Verified Team Member</span>
      </span>
    </span>
  );
};
