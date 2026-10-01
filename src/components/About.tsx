import React from 'react';
import { useApp } from '../context/AppContext';

export const About: React.FC = () => {
  const { content, team } = useApp();

  const visibleTeam = team.filter((m) => m.visible !== false);

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#08080c] border-t border-b border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span>TEAM & PHILOSOPHY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight mb-4">
            {content.sectionHeadings.teamHeading || 'BUILT AROUND CONTENT.'}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            {content.sectionHeadings.teamCopy ||
              'Footazix is a creator-focused content growth agency helping creators, brands and businesses turn raw footage into stronger content.'}
          </p>
        </div>

        {/* Dynamic Team Members Grid */}
        {visibleTeam.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm rounded-xl border border-white/10 bg-zinc-950">
            No team members published yet. Add team members in the Admin CMS.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTeam.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl p-6 bg-zinc-950 border border-white/10 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Role Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-blue-500/30 shrink-0">
                      <img
                        src={member.photo || '/assets/founder.jpg'}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale contrast-110"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-white tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-400">
                        {member.role}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                        {content.brand.name}
                      </p>
                    </div>
                  </div>

                  {/* Bio / Description */}
                  {member.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {member.description}
                    </p>
                  )}
                </div>

                {/* Optional Social Link / Email footer */}
                {(member.socialLink || member.email) && (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                    {member.socialLink ? (
                      <a
                        href={member.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>Profile</span>
                      </a>
                    ) : (
                      <span />
                    )}

                    {member.email && (
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {member.email}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
