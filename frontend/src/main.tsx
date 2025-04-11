import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import SimpleTest from './SimpleTest.tsx'  // Keep this for reference
import './index.css'
import { Toaster } from './components/ui/toaster.tsx'
import { Toaster as SonnerToaster } from 'sonner'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './lib/auth-provider.tsx'

// PWA feature detection and initialization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates to the service worker
      registration.addEventListener('updatefound', () => {
        // A new service worker is being installed
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available and will be used when all tabs for this page are closed
              console.log('New content is available and will be used when all tabs for this page are closed.');
              
              // Show update notification to the user
              const updateNotification = confirm('New version of the app is available. Reload to update?');
              if (updateNotification) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Handle service worker updates on page load
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
  
  // Register for push notifications if supported
  if ('PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      // Check if we already have permission
      if (Notification.permission === 'granted') {
        console.log('Push notification permission already granted');
      } else if (Notification.permission !== 'denied') {
        // Request permission
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Push notification permission granted');
          } else {
            console.log('Push notification permission denied');
          }
        });
      }
    });
  }
  
  // Register for background sync if supported
  if ('SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      console.log('Background sync is supported');
      // Background sync will be registered when needed
    });
  }
}

console.log("Application starting...");

// Debug information
console.log("Browser information:", {
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  vendor: navigator.vendor
});

// Check if the DOM is ready
if (document.readyState === 'loading') {
  console.log("DOM is still loading...");
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM is now ready (via event listener)");
  });
} else {
  console.log("DOM is already ready");
}

// Check for root element
const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Root element found, rendering app...");
  
  try {
    // Try creating the root but don't render yet
    const root = ReactDOM.createRoot(rootElement);
    console.log("React root created successfully");
    
    // Try rendering the App component
    try {
      console.log("About to render App component...");
      root.render(
        <React.StrictMode>
          <Router>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Router>
        </React.StrictMode>
      );
      console.log("App rendered successfully");
    } catch (renderError) {
      console.error("Error rendering App component:", renderError);
      console.error("Error details:", {
        name: renderError instanceof Error ? renderError.name : 'Unknown',
        message: renderError instanceof Error ? renderError.message : String(renderError),
        stack: renderError instanceof Error ? renderError.stack : 'No stack trace'
      });
      
      // Display more detailed error UI
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: system-ui;">
          <h1 style="color: #e11d48;">React Rendering Error</h1>
          <p>The application failed to render. Please check the console for more information.</p>
          <div style="text-align: left; background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 20px; overflow: auto; max-height: 300px;">
            <h3>Error Details:</h3>
            <p><strong>Name:</strong> ${renderError instanceof Error ? renderError.name : 'Unknown'}</p>
            <p><strong>Message:</strong> ${renderError instanceof Error ? renderError.message : String(renderError)}</p>
            <pre style="white-space: pre-wrap;">${renderError instanceof Error && renderError.stack ? renderError.stack : 'No stack trace available'}</pre>
          </div>
        </div>
      `;
    }
  } catch (rootError) {
    console.error("Error creating React root:", rootError);
    
    // Display fallback error UI
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui;">
        <h1 style="color: #e11d48;">Failed to Initialize React</h1>
        <p>The application failed to create a React root. Please check the console for more information.</p>
        <pre style="text-align: left; background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 20px;">${rootError instanceof Error ? rootError.message : String(rootError)}</pre>
      </div>
    `;
  }
} else {
  console.error("Root element not found. Cannot render the app!");
  // Try to create a root element as a fallback
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'fallback-root';
  document.body.appendChild(fallbackRoot);
  
  fallbackRoot.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui;">
      <h1 style="color: #e11d48;">Root Element Missing</h1>
      <p>The application couldn't find the root element with id "root".</p>
      <div style="margin-top: 20px; padding: 10px; background: #f1f5f9; border-radius: 4px; text-align: left;">
        <h2 style="margin-top: 0;">HTML Structure:</h2>
        <pre>${document.documentElement.outerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
    </div>
  `;
  
  console.log("Created fallback root element and displayed error message");
}
