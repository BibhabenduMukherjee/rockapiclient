import { useState, useEffect } from 'react';

export function useFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if this is the first launch or if 24 hours have passed
    const lastLaunchTime = localStorage.getItem('rock-api-last-launch');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (!lastLaunchTime || (now - parseInt(lastLaunchTime)) > twentyFourHours) {
      setIsFirstLaunch(true);
      // Mark the current launch time
      localStorage.setItem('rock-api-last-launch', now.toString());
    }
    
    setIsChecking(false);
  }, []);

  const markAsLaunched = () => {
    setIsFirstLaunch(false);
    // Update the last launch time
    localStorage.setItem('rock-api-last-launch', Date.now().toString());
  };

  return {
    isFirstLaunch,
    isChecking,
    markAsLaunched
  };
}
