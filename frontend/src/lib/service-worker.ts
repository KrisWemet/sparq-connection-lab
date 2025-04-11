/**
 * Unregisters all service workers and clears the caches
 * @returns Promise that resolves when all service workers are unregistered
 */
export async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} service worker registrations`);
      
      // Unregister each service worker
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
      
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          console.log(`Deleting cache: ${name}`);
          return caches.delete(name);
        })
      );
      
      console.log('All service workers unregistered and caches cleared');
    } catch (error) {
      console.error('Failed to unregister service workers:', error);
      throw error;
    }
  }
}

/**
 * Registers the service worker
 * @returns Promise that resolves when the service worker is registered
 */
export async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered:', registration);
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }
} 