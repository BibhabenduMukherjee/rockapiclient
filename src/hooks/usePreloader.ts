import { useState, useEffect } from 'react';

interface PreloaderState {
  isLoading: boolean;
  message: string;
  progress: number;
}

export function usePreloader() {
  const [preloaderState, setPreloaderState] = useState<PreloaderState>({
    isLoading: true,
    message: 'Loading Rock API Client...',
    progress: 0
  });

  // Simulate loading steps
  useEffect(() => {
    const loadingSteps = [
      { message: 'Initializing application...', progress: 20 },
      { message: 'Loading components...', progress: 40 },
      { message: 'Setting up API client...', progress: 60 },
      { message: 'Preparing environment...', progress: 80 },
      { message: 'Almost ready...', progress: 95 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setPreloaderState({
          isLoading: true,
          message: loadingSteps[currentStep]?.message || 'Loading...',
          progress: loadingSteps[currentStep]?.progress || 0
        });
        currentStep++;
      } else {
        // Complete loading
        setPreloaderState({
          isLoading: true,
          message: 'Ready!',
          progress: 100
        });
        
        // Hide preloader after a short delay
        setTimeout(() => {
          setPreloaderState({
            isLoading: false,
            message: 'Loading Rock API Client...',
            progress: 0
          });
        }, 800);
        
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const hidePreloader = () => {
    setPreloaderState({
      isLoading: false,
      message: 'Loading Rock API Client...',
      progress: 0
    });
  };

  const showPreloader = (message?: string) => {
    setPreloaderState({
      isLoading: true,
      message: message || 'Loading...',
      progress: 0
    });
  };

  return {
    isLoading: preloaderState.isLoading,
    message: preloaderState.message,
    progress: preloaderState.progress,
    hidePreloader,
    showPreloader
  };
}
