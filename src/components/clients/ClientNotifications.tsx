/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Notifications & Announcements
-- File: src/components/clients/ClientNotifications.tsx
-- ==============================================================================
*/

import React from 'react';
import { ClientAccount } from '../../types/clientPortal';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface ClientNotificationsProps {
  client: ClientAccount;
}

export const ClientNotifications: React.FC<ClientNotificationsProps> = ({ client }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Agency Announcements & Updates
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            System notices, delivery schedules, and priority alerts regarding your media pipeline.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">
        {client.announcement ? (
          <div className="p-6 rounded-3xl bg-[#090910] border border-blue-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                Broadcast Announcement
              </span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              {client.announcement}
            </p>
            <div className="text-[10px] text-zinc-500 font-mono">
              Managed from Footazix Command Center
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-2">
            <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">No active announcements</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              You are completely up to date with your editing and delivery schedules.
            </p>
          </div>
        )}

        {/* System Status Record */}
        <div className="p-5 rounded-2xl bg-[#0e0e18] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">Footazix Cloud Render Pipeline</span>
            <span className="text-blue-400 font-mono font-bold flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Operational (100% Uptime)
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            All render nodes, color grading engines, and direct video cloud storage buckets are online and synchronized.
          </p>
        </div>
      </div>
    </div>
  );
};
