'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';

// Define libraries to load once
const libraries: Libraries = ['places', 'geometry'];

interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

interface GoogleMapsProviderProps {
    children: ReactNode;
}

/**
 * GoogleMapsProvider - Loads Google Maps API once for the entire application
 * This prevents the "google api is already presented" error that occurs
 * when LoadScript or useLoadScript is called multiple times
 */
export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </GoogleMapsContext.Provider>
    );
}

/**
 * Hook to access Google Maps loading state
 * Use this in components that need to render maps
 */
export function useGoogleMaps() {
    const context = useContext(GoogleMapsContext);

    if (context === undefined) {
        throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
    }

    return context;
}

/**
 * Wrapper component for map content that shows loading/error states
 */
export function GoogleMapsWrapper({
    children,
    loadingComponent,
    errorComponent
}: {
    children: ReactNode;
    loadingComponent?: ReactNode;
    errorComponent?: ReactNode;
}) {
    const { isLoaded, loadError } = useGoogleMaps();

    if (loadError) {
        return errorComponent || (
            <div style={{
                padding: '20px',
                backgroundColor: '#fee2e2',
                borderRadius: '8px',
                color: '#dc2626',
                fontWeight: '500'
            }}>
                ❌ Error al cargar Google Maps. Verifica tu API key.
            </div>
        );
    }

    if (!isLoaded) {
        return loadingComponent || (
            <div style={{
                padding: '20px',
                color: '#6b7280'
            }}>
                Cargando mapa...
            </div>
        );
    }

    return <>{children}</>;
}
