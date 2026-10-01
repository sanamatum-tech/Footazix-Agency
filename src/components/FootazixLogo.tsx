import React from 'react';

interface FootazixLogoProps {
  className?: string;
  variant?: 'full' | 'mark';
  showSubtitle?: boolean;
}

export const FootazixLogo: React.FC<FootazixLogoProps> = ({
  className = 'h-8 w-auto',
  variant = 'full',
  showSubtitle = true,
}) => {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 160 175"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Top swoosh */}
        <path d="M 10 92 C 4 72 12 50 30 34 C 48 18 76 10 106 -2 L 156 -24 C 160 -26 163 -21 161 -17 L 148 14 C 146 19 142 22 137 24 L 92 46 C 64 58 48 74 44 92 C 37 86 26 82 17 84 C 14 86 11 88 10 92 Z" />
        {/* Middle swoosh */}
        <path d="M 10 160 C 4 140 12 118 30 102 C 48 86 76 78 106 66 L 156 44 C 160 42 163 47 161 51 L 148 82 C 146 87 142 90 137 92 L 92 114 C 64 126 48 142 44 160 C 37 154 26 150 17 152 C 14 154 11 156 10 160 Z" />
        {/* Bottom playhead wedge with cobalt accent */}
        <path
          d="M 96 164 L 158 132 C 162 130 165 134 164 138 L 152 174 C 150 178 145 180 141 178 L 94 154 C 89 152 91 146 96 144 Z"
          className="text-blue-500 fill-current"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Mark */}
      <svg
        viewBox="0 0 160 175"
        className="h-full w-auto aspect-[160/175] shrink-0 fill-white"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Top swoosh */}
        <path d="M 10 92 C 4 72 12 50 30 34 C 48 18 76 10 106 -2 L 156 -24 C 160 -26 163 -21 161 -17 L 148 14 C 146 19 142 22 137 24 L 92 46 C 64 58 48 74 44 92 C 37 86 26 82 17 84 C 14 86 11 88 10 92 Z" />
        {/* Middle swoosh */}
        <path d="M 10 160 C 4 140 12 118 30 102 C 48 86 76 78 106 66 L 156 44 C 160 42 163 47 161 51 L 148 82 C 146 87 142 90 137 92 L 92 114 C 64 126 48 142 44 160 C 37 154 26 150 17 152 C 14 154 11 156 10 160 Z" />
        {/* Bottom playhead wedge with cobalt accent */}
        <path
          d="M 96 164 L 158 132 C 162 130 165 134 164 138 L 152 174 C 150 178 145 180 141 178 L 94 154 C 89 152 91 146 96 144 Z"
          fill="#2563eb"
        />
      </svg>

      {/* Official Typographic Lockup */}
      <div className="flex flex-col justify-center leading-none">
        <span className="text-[19px] sm:text-[21px] font-extrabold tracking-[-0.03em] text-white font-display">
          Footazix
        </span>
        {showSubtitle && (
          <span className="text-[7.5px] sm:text-[8.5px] font-semibold tracking-[0.28em] text-zinc-400 uppercase mt-0.5 font-sans">
            Creative Agency
          </span>
        )}
      </div>
    </div>
  );
};
