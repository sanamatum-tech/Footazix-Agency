/**
-- ==============================================================================
-- FOOTAZIX — Client Portal Root Component
-- File: src/components/clients/ClientPortalRoot.tsx
-- ==============================================================================
*/

import React, { useState, useEffect } from 'react';
import { ClientAccount } from '../../types/clientPortal';
import { clientAuthService } from '../../services/clientAuthService';
import { ClientLogin } from './ClientLogin';
import { ClientPortalLayout } from './ClientPortalLayout';
import { Loader2 } from 'lucide-react';
import { FootazixLogo } from '../FootazixLogo';

interface ClientPortalRootProps {
  onNavigateHome: () => void;
}

export const ClientPortalRoot: React.FC<ClientPortalRootProps> = ({ onNavigateHome }) => {
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active client session
    clientAuthService
      .initClientAuth()
      .then((active) => {
        if (mounted) {
          setClient(active);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    // Subscribe to auth state changes
    const unsubscribe = clientAuthService.subscribe((updated) => {
      if (mounted) setClient(updated);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    await clientAuthService.logout();
    setClient(null);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center space-y-4">
        <FootazixLogo className="h-8 w-auto text-white animate-pulse" />
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Verifying encrypted client session...</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <ClientLogin
        onSuccess={(authenticatedClient) => setClient(authenticatedClient)}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  return (
    <ClientPortalLayout
      initialClient={client}
      onLogout={handleLogout}
      onNavigateHome={onNavigateHome}
    />
  );
};
