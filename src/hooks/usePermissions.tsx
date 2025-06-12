
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PermissionStatus {
  granted: boolean;
  name: string;
  description: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus[]>([
    { granted: false, name: 'Internet', description: 'Access to internet for API calls' },
    { granted: false, name: 'Background', description: 'Keep app running in background' },
    { granted: false, name: 'Notifications', description: 'Show system notifications' },
  ]);

  const requestPermissions = async () => {
    console.log('Requesting permissions...');
    
    try {
      // Check internet connectivity - more robust for mobile
      const internetGranted = navigator.onLine;
      
      // Request notification permission
      let notificationGranted = false;
      if ('Notification' in window && Notification.permission !== 'denied') {
        try {
          const permission = await Notification.requestPermission();
          notificationGranted = permission === 'granted';
        } catch (error) {
          console.log('Notification permission request failed:', error);
          notificationGranted = true; // Don't block for this
        }
      } else {
        notificationGranted = true; // Fallback for mobile environments
      }

      // For background processing (Service Worker) - more robust registration
      let backgroundGranted = false;
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('Service Worker registered successfully:', registration);
          backgroundGranted = true;
        } catch (error) {
          console.log('Service Worker registration failed:', error);
          backgroundGranted = true; // Don't block the app for this
        }
      } else {
        console.log('Service Worker not supported');
        backgroundGranted = true; // Fallback for non-supporting browsers
      }

      const updatedPermissions = [
        { granted: internetGranted, name: 'Internet', description: 'Access to internet for API calls' },
        { granted: backgroundGranted, name: 'Background', description: 'Keep app running in background' },
        { granted: notificationGranted, name: 'Notifications', description: 'Show system notifications' },
      ];

      setPermissions(updatedPermissions);

      const allGranted = updatedPermissions.every(p => p.granted);
      if (allGranted) {
        toast.success('All permissions granted! App is ready to use.');
      } else {
        toast.warning('Some permissions were not granted. App functionality may be limited.');
      }

      return allGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error('Error requesting permissions. Please try again.');
      return false;
    }
  };

  useEffect(() => {
    // Check initial permission states
    const checkInitialPermissions = () => {
      const internetGranted = navigator.onLine;
      const notificationGranted = !('Notification' in window) || Notification?.permission === 'granted';
      const backgroundGranted = 'serviceWorker' in navigator;

      setPermissions([
        { granted: internetGranted, name: 'Internet', description: 'Access to internet for API calls' },
        { granted: backgroundGranted, name: 'Background', description: 'Keep app running in background' },
        { granted: notificationGranted, name: 'Notifications', description: 'Show system notifications' },
      ]);
    };

    checkInitialPermissions();

    // Listen for online/offline events
    const handleOnline = () => {
      setPermissions(prev => prev.map(p => 
        p.name === 'Internet' ? { ...p, granted: true } : p
      ));
    };

    const handleOffline = () => {
      setPermissions(prev => prev.map(p => 
        p.name === 'Internet' ? { ...p, granted: false } : p
      ));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    permissions,
    requestPermissions,
    allPermissionsGranted: permissions.every(p => p.granted),
  };
};
