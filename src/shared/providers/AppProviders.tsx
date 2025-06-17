import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains'; // add baseSepolia for testing
import { type ReactNode, useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';
import { ProductProvider } from './ProductProvider';
import { CarritoProvider } from './CarritoProvider';
import { UserProvider } from './UserProvider';
import { EmpleadoProvider } from './EmpleadoProvider';
import NotificacionWrapper from '../components/utils/NotificacionWrapper';
import { ActivityTracker } from '../components/ActivityTracker';
import { InactivityWarning } from '../components/InactivityWarning';

import { getConfig } from '../../wagmi'; // your import path may vary
import { Auth0ProviderWithNavigate } from './auth/Auth0ProviderWithNavigate';

export function AppProviders(props: { children: ReactNode; initialState?: State }) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Auth0ProviderWithNavigate>
      <WagmiProvider config={config} initialState={props.initialState}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base} // add baseSepolia for testing
          >
            <UserProvider>
              <ProductProvider>
                <EmpleadoProvider>
                  <CarritoProvider>
                    <ActivityTracker>
                      {props.children}
                      <NotificacionWrapper />
                      <InactivityWarning />
                    </ActivityTracker>
                  </CarritoProvider>
                </EmpleadoProvider>
              </ProductProvider>
            </UserProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Auth0ProviderWithNavigate>
  );
}
