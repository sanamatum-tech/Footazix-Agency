import React from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const { content, team } = useApp();

  const visibleTeam = team.filter((m) => m.visible !== false);

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#07070b] border-t border-b border-white/5 relative font-sans">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <span className="font-mono text-[11px]">TEAM & PHILOSOPHY</span>
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
          <div className="p-8 text-center text-zinc-400 text-sm rounded-xl border border-white/10 bg-[#090910]">
            No team members published yet. Add team members in the Admin CMS.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTeam.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-6 bg-[#090910] border border-white/10 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Role Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-blue-500/30 shrink-0">
                      <img
                        src={member.photo || '/assets/founder.jpg'}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-extrabold text-white tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-400">
                        {member.role}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                        {content.brand.name || 'Footazix'}
                      </p>
                    </div>
                  </div>

                  {/* Bio / Description */}
                  {member.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-normal">
                      {member.description}
                    </p>
                  )}
                </div>

                {/* Social Link / Email footer */}
                {(member.socialLink || member.email) && (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                    {member.socialLink ? (
                      <a
                        href={member.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        <span>Profile</span>
                      </a>
                    ) : (
                      <span />
                    )}

                    {member.email && (
                      <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                        <Mail className="w-3 h-3 text-zinc-400" />
                        <span>{member.email}</span>
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
