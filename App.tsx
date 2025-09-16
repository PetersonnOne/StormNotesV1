'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import TopNavBar from '@/components/TopNavBar';
import HomePage from '@/components/HomePage';
import GetStartedModal from '@/components/GetStartedModal';
import ProductivityApp from '@/components/ProductivityApp';
import ContentModule from '@/components/ContentModule';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';
import Footer from '@/components/Footer';

type View = 'home' | 'productivity' | 'content';

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasShownModalAfterAuth, setHasShownModalAfterAuth] = useState(false);
    const { isSignedIn, isLoaded } = useUser();

    const navigateTo = (newView: View) => {
        setView(newView);
        setIsModalOpen(false);
    }
    
    const goHome = useCallback(() => {
        setView('home');
    }, []);

    const goBackToSelection = useCallback(() => {
        setView('home');
        setIsModalOpen(true);
    }, []);

    // Show Get Started modal after successful authentication
    useEffect(() => {
        if (isLoaded && isSignedIn && !hasShownModalAfterAuth) {
            setIsModalOpen(true);
            setHasShownModalAfterAuth(true);
        }
    }, [isSignedIn, isLoaded, hasShownModalAfterAuth]);

    const renderView = () => {
        switch (view) {
            case 'productivity':
                return (
                    <ProtectedRoute>
                        <ProductivityApp onBack={goBackToSelection} />
                    </ProtectedRoute>
                );
            case 'content':
                return (
                    <ProtectedRoute>
                        <ContentModule onBack={goBackToSelection} />
                    </ProtectedRoute>
                );
            case 'home':
            default:
                return <HomePage onGetStarted={() => setIsModalOpen(true)} />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
            <TopNavBar onGetStarted={() => setIsModalOpen(true)} onLogoClick={goHome} />
            <main className="flex-grow">
                {renderView()}
            </main>
            {isModalOpen && (
                <GetStartedModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSelect={navigateTo}
                />
            )}
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ClerkProviderWrapper>
            <AppContent />
        </ClerkProviderWrapper>
    );
};

export default App;