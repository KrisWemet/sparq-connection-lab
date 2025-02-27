import React from 'react';

export default function TestPage() {
  React.useEffect(() => {
    console.log('TestPage component mounted');
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'system-ui' 
    }}>
      <h1 style={{ color: '#333' }}>Test Page</h1>
      <p>If you can see this text, basic rendering is working.</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <p><strong>Troubleshooting information:</strong></p>
        <p>Current URL: <span id="current-url"></span></p>
        <p>Window size: <span id="window-size"></span></p>
        <p>User Agent: <span id="user-agent"></span></p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('current-url').textContent = window.location.href;
        document.getElementById('window-size').textContent = window.innerWidth + 'x' + window.innerHeight;
        document.getElementById('user-agent').textContent = navigator.userAgent;
      `}} />
    </div>
  );
} 